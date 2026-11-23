export type WorkbookRow = {
  rowNumber: number;
  name?: string;
  city?: string;
  urlText?: string;
  linkTarget?: string;
  memberCount?: string;
  countCheckedOn?: string;
  promotion?: string;
  zip?: string;
};

export type ImportIssue = { row: number; field: string; code: string; message: string };

export type ImportPreview = {
  issues: ImportIssue[];
  accepted: number;
  skipped: number;
};

export function validateFacebookGroupRows(rows: WorkbookRow[]): ImportPreview {
  const issues: ImportIssue[] = [];
  let accepted = 0;
  let skipped = 0;
  for (const row of rows) {
    const name = row.name?.trim() ?? "";
    const urlText = row.urlText?.trim() ?? "";
    const target = row.linkTarget?.trim() ?? "";
    if (!name && !urlText && !target) {
      skipped += 1;
      continue;
    }
    if (!name) issues.push({ row: row.rowNumber, field: "name", code: "missing_name", message: "Group name is required." });
    const href = target || urlText;
    if (!href) issues.push({ row: row.rowNumber, field: "url", code: "missing_url", message: "A direct group link is required." });
    if (target && urlText && hostOf(target) !== hostOf(urlText)) {
      issues.push({
        row: row.rowNumber,
        field: "url",
        code: "misleading_hyperlink",
        message: "The visible link text and the hyperlink target point at different hosts.",
      });
    }
    if (row.promotion && !["yes", "conditional", "no", ""].includes(row.promotion.trim().toLowerCase())) {
      issues.push({
        row: row.rowNumber,
        field: "promotion",
        code: "unmapped_value",
        message: `“${row.promotion}” is not a recognized promotion value.`,
      });
    }
    const count = row.memberCount?.trim();
    if (count && !/^\d+$/.test(count)) {
      issues.push({ row: row.rowNumber, field: "memberCount", code: "bad_count", message: "Member count must be a whole number." });
    }
    const promotion = row.promotion?.trim().toLowerCase();
    if ((promotion === "yes" || promotion === "conditional") && !row.countCheckedOn?.trim()) {
      issues.push({
        row: row.rowNumber,
        field: "countCheckedOn",
        code: "insufficient_evidence",
        message: "A verified cell without a count date cannot be published.",
      });
    }
    if (row.zip && !/^\d{5}$/.test(row.zip.trim())) {
      issues.push({ row: row.rowNumber, field: "zip", code: "bad_zip", message: "ZIP codes stay five digits, including leading zeros." });
    }
    const rowIssues = issues.filter((issue) => issue.row === row.rowNumber && issue.code !== "insufficient_evidence");
    if (name && href && rowIssues.length === 0) accepted += 1;
  }
  return { issues, accepted, skipped };
}

function hostOf(value: string): string {
  try {
    return new URL(value).host.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function mapPromotionCell(value: string): "confirmed_allowed" | "restricted" | "not_allowed" | "unknown" {
  const normalized = value.trim().toLowerCase();
  if (normalized === "yes") return "confirmed_allowed";
  if (normalized === "conditional") return "restricted";
  if (normalized === "no") return "not_allowed";
  return "unknown";
}
