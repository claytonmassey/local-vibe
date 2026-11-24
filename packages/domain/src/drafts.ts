export type DraftInput = {
  businessName: string;
  category: string;
  city: string;
  zip: string;
  offerings: string;
  tone: string;
  themeName: string;
  themePrompt: string;
  talkingPoints: string;
  groupName?: string | null;
  conditions?: string | null;
};

export type DraftOutput = {
  title: string;
  body: string;
  reminders: string[];
};

export function composeDraft(input: DraftInput): DraftOutput {
  const reminders = [
    "PostLocal does not post to Facebook. Copy the draft, open the group, and post it yourself.",
    "Only facts you entered are included. No offer, testimonial or result was added.",
  ];
  if (input.conditions) reminders.unshift(input.conditions);
  if (input.themeName === "Thankful Thursday" && !input.talkingPoints.trim()) {
    reminders.push("No testimonial was provided, so none was written.");
  }
  if (input.themeName === "Feature Friday" && !input.talkingPoints.trim()) {
    reminders.push("No consented customer or specific offer was provided, so the draft stays general.");
  }

  const points = input.talkingPoints
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const ownWords = input.talkingPoints.trim();
  const lines = [
    `${input.themeName} for ${input.businessName}.`,
    "",
    `${input.businessName} is a ${input.category.toLowerCase()} business based in ${input.city} (${input.zip}).`,
    input.offerings.trim() ? `What we actually offer: ${input.offerings.trim()}` : "Offerings were not provided, so none are described here.",
    "",
    ownWords ? `Notes from you:\n${points.join("\n")}` : input.themePrompt,
    "",
    input.groupName ? `Written for ${input.groupName}.` : "No group was selected.",
    input.conditions ? `Group conditions: ${input.conditions}` : "Confirm the group rules before posting.",
  ];

  return {
    title: `${input.themeName} · ${input.businessName}`,
    body: lines.join("\n"),
    reminders,
  };
}
