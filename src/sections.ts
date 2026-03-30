export const relatedToOptions = [
  { id: "booster-meetings", name: "Comitee meetings" },
  { id: "social", name: "Social gatherings" },
  { id: "conference-dinner", name: "Conference dinner" },
  { id: "speakers-dinner", name: "Speakers dinner" },
  { id: "afterparty", name: "Afterparty" },
  { id: "booster-conference", name: "Main Conference" },
  { id: "booster-kids", name: "Booster Kids" },
  { id: "other", name: "Not sure / whatever / leave me alone..." },
] as const;

export const expenseTypes = [
  { id: "transport", name: "Taxi / Transport" },
  { id: "food", name: "Drinks, snacks, food..." },
  { id: "office", name: "Office supplies" },
  { id: "hardware", name: "Hardware" },
  { id: "software", name: "Software" },
  { id: "other", name: "Other... Whatever... Papasan?" },
] as const;
