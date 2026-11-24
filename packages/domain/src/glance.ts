export type MonthGlance = {
  month: number;
  name: string;
  summary: string;
  mark: string;
};

export const MONTH_GLANCE: MonthGlance[] = [
  { month: 1, name: "January", summary: "New Year Goals, Winter Promotions, Organization & Planning", mark: "❄️" },
  { month: 2, name: "February", summary: "Valentine's, Local Love, Community Focus", mark: "❤️" },
  { month: 3, name: "March", summary: "Spring Refresh, St. Patrick's, Seasonal Services", mark: "☘️" },
  { month: 4, name: "April", summary: "Easter, Spring Events, Outdoor Services", mark: "🥚" },
  { month: 5, name: "May", summary: "Mother's Day, Graduation, End of School", mark: "🎓" },
  { month: 6, name: "June", summary: "Summer Kickoff, Father's Day, Travel & Outdoor", mark: "☀️" },
  { month: 7, name: "July", summary: "Independence Day, Summer Sales, Community Events", mark: "🎆" },
  { month: 8, name: "August", summary: "Back to School, Late Summer, Local Services", mark: "📚" },
  { month: 9, name: "September", summary: "Fall Refresh, Labor Day, Small Business Season", mark: "🍂" },
  { month: 10, name: "October", summary: "Halloween, Harvest, Community Festivals", mark: "🎃" },
  { month: 11, name: "November", summary: "Thanksgiving, Gratitude, Small Business Saturday", mark: "🦃" },
  { month: 12, name: "December", summary: "Holiday Gifts, Year-End, Community Giving", mark: "🎁" },
];

export type LocalEvent = {
  id: string;
  month: string;
  day: string;
  date: string;
  title: string;
  when: string;
  place: string;
};

export const LOCAL_EVENTS: LocalEvent[] = [
  { id: "evt_magnolia_networking", month: "NOV", day: "26", date: "2026-11-26", title: "Magnolia Business Networking", when: "Wed, Nov 26 · 9:00 AM – 10:30 AM", place: "The Local Table – Magnolia, TX" },
  { id: "evt_montgomery_mixer", month: "DEC", day: "4", date: "2026-12-04", title: "Montgomery County Business Mixer", when: "Thu, Dec 4 · 5:30 PM – 7:00 PM", place: "Montgomery Event Center" },
  { id: "evt_woodlands_women", month: "DEC", day: "12", date: "2026-12-12", title: "The Woodlands Women in Business", when: "Fri, Dec 12 · 11:30 AM – 1:00 PM", place: "The Woodlands Country Club" },
  { id: "evt_vendor_market", month: "DEC", day: "20", date: "2026-12-20", title: "Local Vendor Market", when: "Sat, Dec 20 · 10:00 AM – 4:00 PM", place: "Woodforest Town Center" },
];
