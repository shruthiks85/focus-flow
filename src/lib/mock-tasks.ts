import type { Task } from "./tasks";

function dateFromToday(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export const MOCK_TASKS: Task[] = [
  { id: "mock-001", priority: "IU", subject: "Finalize Q4 premium vodka campaign", dueDate: dateFromToday(2), actionPlan: "Approve the campaign platform, talent shortlist, and channel budget for the holiday launch.", completionDate: "" },
  { id: "mock-002", priority: "IU", subject: "Review new tequila packaging direction", dueDate: dateFromToday(4), actionPlan: "Review three agency routes for the limited-edition bottle and select one for consumer testing.", completionDate: "" },
  { id: "mock-003", priority: "UNI", subject: "Approve distributor launch toolkit", dueDate: dateFromToday(0), actionPlan: "Sign off on sell sheets, tasting notes, POS assets, and the distributor training deck.", completionDate: "" },
  { id: "mock-004", priority: "UNI", subject: "Resolve retail compliance copy updates", dueDate: dateFromToday(1), actionPlan: "Coordinate with Legal and Regulatory to update responsible drinking and country-of-origin language.", completionDate: "" },
  { id: "mock-005", priority: "INU", subject: "Build annual brand health survey", dueDate: dateFromToday(7), actionPlan: "Draft the questionnaire covering awareness, consideration, taste credentials, and purchase occasions.", completionDate: "" },
  { id: "mock-006", priority: "INU", subject: "Plan trade tasting roadshow", dueDate: dateFromToday(10), actionPlan: "Create the city route, venue shortlist, ambassador brief, and sampling requirements for key accounts.", completionDate: "" },
  { id: "mock-007", priority: "NINU", subject: "Refresh product photography library", dueDate: dateFromToday(14), actionPlan: "Catalog existing bottle and serve photography and identify gaps for the digital asset library.", completionDate: "" },
  { id: "mock-008", priority: "NINU", subject: "Document social content guidelines", dueDate: dateFromToday(18), actionPlan: "Capture tone of voice, visual rules, moderation guidance, and market adaptation examples.", completionDate: "" },
  { id: "mock-009", priority: "IU", subject: "Present innovation pipeline priorities", dueDate: dateFromToday(-3), actionPlan: "Share the three-year innovation roadmap with leadership and align on consumer need states.", completionDate: dateFromToday(-1) },
  { id: "mock-010", priority: "UNI", subject: "Close summer campaign performance report", dueDate: dateFromToday(-6), actionPlan: "Summarize media delivery, retail velocity, sampling conversion, and lessons for the next flight.", completionDate: dateFromToday(-2) },
  { id: "mock-011", priority: "INU", subject: "Update portfolio positioning matrix", dueDate: dateFromToday(-10), actionPlan: "Map each spirit brand against price, occasion, audience, and premiumization opportunity.", completionDate: dateFromToday(-8) },
  { id: "mock-012", priority: "NINU", subject: "Archive completed agency briefs", dueDate: dateFromToday(-15), actionPlan: "Move final briefs, creative outputs, and post-campaign reviews into the shared marketing archive.", completionDate: dateFromToday(-14) },
];
