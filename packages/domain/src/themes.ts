import type { Theme } from "./types";
import { civilWeekday } from "./time";

export const THEMES: Theme[] = [
  { weekday: 1, name: "Marketing Monday", prompt: "Introduce the business, offer or service.", studioType: "Business intro" },
  { weekday: 2, name: "Tip Tuesday", prompt: "Share practical advice or an educational tip.", studioType: "Educational tip" },
  { weekday: 3, name: "Work It Wednesday", prompt: "Show work, a product, service or recent project.", studioType: "Work in progress" },
  { weekday: 4, name: "Thankful Thursday", prompt: "Share appreciation, an approved testimonial or community support.", studioType: "Appreciation" },
  { weekday: 5, name: "Feature Friday", prompt: "Highlight a product, service, offer or customer with consent.", studioType: "Feature" },
  { weekday: 6, name: "Small Business Saturday", prompt: "Encourage shopping locally or spotlight a local business.", studioType: "Shop local" },
  { weekday: 0, name: "Setup Sunday", prompt: "Prepare and schedule the coming week’s marketing tasks.", studioType: "Week setup" },
];

export function themeForWeekday(weekday: number): Theme {
  const theme = THEMES.find((item) => item.weekday === weekday);
  if (!theme) throw new Error(`Unknown weekday ${weekday}`);
  return theme;
}

export function themeForDate(isoDate: string): Theme {
  return themeForWeekday(civilWeekday(isoDate));
}
