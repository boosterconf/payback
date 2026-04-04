import type { ExpenseType } from "../types";

export const expenseTypes: ExpenseType[] = [
  { name: "Taxi / Transport",              incomeAccount: "7140", descriptionPrefix: "Transport" },
  { name: "Drinks, snacks, food...",       incomeAccount: "7360", descriptionPrefix: "Mat" },
  { name: "Office supplies",               incomeAccount: "6800", descriptionPrefix: "Kontorrekvisita" },
  { name: "Hardware",                      incomeAccount: "6551", descriptionPrefix: "Hardware" },
  { name: "Software",                      incomeAccount: "6553", descriptionPrefix: "Programvare" },
  { name: "Other... Whatever... Papasan?", incomeAccount: "7799", descriptionPrefix: "Annet" },
];
