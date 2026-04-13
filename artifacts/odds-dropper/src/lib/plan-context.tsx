import { createContext, useContext } from "react";

export type PlanTier = "silver" | "gold" | "none";

export const PlanContext = createContext<PlanTier>("none");

export function usePlan(): PlanTier {
  return useContext(PlanContext);
}

export const PLAN_LIMITS = {
  silver: { maxConfigs: 3, markets: ["moneyline"] as string[] },
  gold:   { maxConfigs: 9, markets: null as string[] | null },
  none:   { maxConfigs: 0, markets: [] as string[] },
} as const;
