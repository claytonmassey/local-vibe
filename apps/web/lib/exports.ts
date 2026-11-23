import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ExcelJS from "exceljs";
import { formatCivilDate, formatClock } from "@marketmap/domain";
import { statusLabel } from "./labels";
import type { AssetRecord } from "./model";
import { sha256, type Actor } from "./services";
import { readStore, updateStore } from "./store";
import { ApiError } from "./errors";

const forest = rgb(0.12, 0.3, 0.22);
const ink = rgb(0.1, 0.16, 0.13);

export async function downloadAsset(actor: Actor | null, assetId: string): Promise<{ bytes: Uint8Array; contentType: string; filename: string }> {
  if (!actor) throw new ApiError(401, "unauthenticated", "Sign in to download edition files.");
  if (!actor.entitled) throw new ApiError(403, "not_entitled", "Downloads belong to the paid edition.");
  if (assetId !== "directory-pdf" && assetId !== "directory-xlsx" && assetId !== "calendar-pdf") {
    throw new ApiError(404, "not_found", "That file is not part of this edition.");
  }
  const store = readStore();
  const cached = store.edition.assets.find((asset) => asset.id === assetId);
  if (cached) {
    const bytes = Buffer.from(cached.bytesBase64, "base64");
    if (sha256(bytes) !== cached.checksum) throw new ApiError(409, "asset_mismatch", "The file no longer matches the published edition. Publish again.");
    return { bytes, contentType: cached.kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename: cached.filename };
  }
  const built = await buildAsset(assetId);
  updateStore((next) => {
    next.edition.assets = next.edition.assets.filter((asset) => asset.id !== built.id);
    next.edition.assets.push(built);
  });
  return {
    bytes: Buffer.from(built.bytesBase64, "base64"),
    contentType: built.kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: built.filename,
  };
}

async function buildAsset(id: AssetRecord["id"]): Promise<AssetRecord> {
  const store = readStore();
  const bytes = id === "directory-xlsx" ? await workbookBytes() : await pdfBytes(id === "calendar-pdf" ? "calendar" : "directory");
  const labels = {
    "directory-pdf": ["Directory PDF", "MarketMap-Greater-Magnolia-Directory.pdf"],
    "directory-xlsx": ["Directory spreadsheet", "MarketMap-Greater-Magnolia-Directory.xlsx"],
    "calendar-pdf": ["Weekly calendar", "MarketMap-Greater-Magnolia-Calendar.pdf"],
  } as const;
  return {
    id,
    label: labels[id][0],
    kind: id === "directory-xlsx" ? "xlsx" : "pdf",
    filename: labels[id][1],
    checksum: sha256(bytes),
    bytesBase64: Buffer.from(bytes).toString("base64"),
  };
}

async function pdfBytes(kind: "directory" | "calendar"): Promise<Uint8Array> {
  const store = readStore();
  const doc = await PDFDocument.create();
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const page = () => {
    const next = doc.addPage([612, 792]);
    next.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: forest });
    next.drawText("MarketMap  ·  Greater Magnolia  ·  Fixture edition", { x: 48, y: 762, size: 12, font: sans, color: rgb(0.96, 0.93, 0.86) });
    return next;
  };
  let current = page();
  let y = 700;
  const write = (text: string, size: number, font: typeof sans, gap = 16) => {
    const words = text.split(/\s+/);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > 500) {
        if (y < 72) {
          current = page();
          y = 700;
        }
        current.drawText(line, { x: 48, y, size, font, color: ink });
        y -= gap;
        line = word;
      } else line = next;
    }
    if (line) {
      if (y < 72) {
        current = page();
        y = 700;
      }
      current.drawText(line, { x: 48, y, size, font, color: ink });
      y -= gap;
    }
  };

  if (kind === "directory") {
    write(store.edition.name, 28, serifBold, 34);
    write(`Published ${formatCivilDate(store.edition.publishedOn)} · Version ${store.edition.version}`, 11, sans, 18);
    write(store.edition.summary, 12, serif, 18);
    write("Posting access and results depend on Facebook and other third parties. MarketMap does not post for you.", 11, sans, 20);
    write("Status definitions: Confirmed allowed and Restricted can become verified slots when the evidence is current. Not allowed and Unknown cannot.", 11, sans, 22);
    for (const group of store.groups.filter((item) => item.listingStatus === "published")) {
      write(group.name, 16, serifBold, 20);
      write(`${group.city}, ${group.county} · ${group.distanceMiles == null ? "Distance unknown" : `${group.distanceMiles.toFixed(1)} mi`} · ${statusLabel(group.promotionStatus)}`, 11, sans, 16);
      write(group.url, 10, sans, 14);
      write(group.ruleSummary, 11, serif, 16);
      const window = group.windows[0];
      write(window ? `Window: ${formatClock(window.startLocal, window.endLocal)} · ${window.conditions}` : "No verified window.", 11, sans, 16);
      write(`Evidence ${group.evidenceDate ?? "Unknown"} · Count ${group.memberCount ?? "Unknown"}${group.countCheckedOn ? ` on ${group.countCheckedOn}` : ""} · ${group.countProvenance ?? "Unknown"}`, 10, sans, 14);
      if (group.correction) write(`Correction: ${group.correction}`, 11, sans, 16);
      y -= 8;
    }
  } else {
    write("Weekly themes", 28, serifBold, 34);
    const themes = [
      ["Monday", "Marketing Monday", "Introduce the business, offer or service."],
      ["Tuesday", "Tip Tuesday", "Share practical advice or an educational tip."],
      ["Wednesday", "Work It Wednesday", "Show work, a product, service or recent project."],
      ["Thursday", "Thankful Thursday", "Share appreciation or an approved testimonial."],
      ["Friday", "Feature Friday", "Highlight a product, service or customer with consent."],
      ["Saturday", "Small Business Saturday", "Encourage shopping locally."],
      ["Sunday", "Setup Sunday", "Prepare the coming week."],
    ];
    for (const [day, name, prompt] of themes) {
      write(`${day}  ·  ${name}`, 14, serifBold, 18);
      write(prompt, 12, serif, 20);
    }
    write("Your personal plan stays in the app and can be printed from the week view. This calendar is the edition rhythm, not a promise that a group will accept a post.", 11, sans, 18);
  }
  write(`Questions: ${store.edition.supportEmail}. ${store.edition.refundSummary}`, 10, sans, 14);
  doc.setTitle(kind === "directory" ? "MarketMap directory" : "MarketMap weekly calendar");
  doc.setCreationDate(new Date(`${store.edition.publishedOn}T00:00:00.000Z`));
  return doc.save();
}

export function editionDateLabel(iso: string) {
  return formatCivilDate(iso);
}

async function workbookBytes(): Promise<Uint8Array> {
  const store = readStore();
  const book = new ExcelJS.Workbook();
  book.creator = "MarketMap";
  const directory = book.addWorksheet("Directory");
  directory.columns = [
    { header: "Name", key: "name", width: 36 },
    { header: "City", key: "city", width: 18 },
    { header: "URL", key: "url", width: 42 },
    { header: "Members", key: "members", width: 12 },
    { header: "Count date", key: "countDate", width: 14 },
    { header: "Provenance", key: "provenance", width: 14 },
    { header: "Privacy", key: "privacy", width: 12 },
    { header: "Join access", key: "join", width: 18 },
    { header: "Promotion", key: "promotion", width: 20 },
    { header: "Window", key: "window", width: 22 },
    { header: "Conditions", key: "conditions", width: 42 },
    { header: "Evidence date", key: "evidence", width: 16 },
    { header: "Distance", key: "distance", width: 16 },
    { header: "Locality", key: "locality", width: 12 },
  ];
  for (const group of store.groups.filter((item) => item.listingStatus === "published")) {
    const window = group.windows[0];
    directory.addRow({
      name: group.name,
      city: group.city,
      url: group.url,
      members: group.memberCount ?? "Unknown",
      countDate: group.countCheckedOn ?? "Unknown",
      provenance: group.countProvenance ?? "Unknown",
      privacy: statusLabel(group.privacy),
      join: statusLabel(group.joinAccess),
      promotion: statusLabel(group.promotionStatus),
      window: window ? formatClock(window.startLocal, window.endLocal) : "Unknown",
      conditions: window?.conditions || group.ruleSummary,
      evidence: group.evidenceDate ?? "Unknown",
      distance: group.distanceMiles == null ? "Unknown" : group.distanceMiles,
      locality: statusLabel(group.locality),
    });
  }
  directory.autoFilter = { from: "A1", to: "N1" };
  const calendar = book.addWorksheet("Weekly Calendar");
  calendar.addRow(["Day", "Theme", "Prompt"]);
  calendar.addRow(["Monday", "Marketing Monday", "Introduce the business, offer or service."]);
  calendar.addRow(["Tuesday", "Tip Tuesday", "Share practical advice or an educational tip."]);
  calendar.addRow(["Wednesday", "Work It Wednesday", "Show work, a product, service or recent project."]);
  calendar.addRow(["Thursday", "Thankful Thursday", "Share appreciation, an approved testimonial or community support."]);
  calendar.addRow(["Friday", "Feature Friday", "Highlight a product, service, offer or customer with consent."]);
  calendar.addRow(["Saturday", "Small Business Saturday", "Encourage shopping locally or spotlight a local business."]);
  calendar.addRow(["Sunday", "Setup Sunday", "Prepare and schedule the coming week’s marketing tasks."]);
  calendar.addRow([]);
  calendar.addRow(["Limitation", "Posting access and results depend on third parties. Unknown values are written as Unknown."]);
  const buffer = await book.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

