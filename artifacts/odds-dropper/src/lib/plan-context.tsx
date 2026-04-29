import { createContext, useContext } from "react";

export type PlanTier = "silver" | "gold" | "platinum" | "none";

export const PlanContext = createContext<PlanTier>("none");

export function usePlan(): PlanTier {
  return useContext(PlanContext);
}

// Sports available on Silver. null = unlimited (Gold/Platinum).
export const SILVER_SPORTS = ["soccer", "basketball", "tennis"] as const;

export const PLAN_LIMITS = {
  silver:   { maxConfigs: 3,  markets: ["moneyline"] as string[], allowedSports: SILVER_SPORTS as readonly string[] },
  gold:     { maxConfigs: 9,  markets: null as string[] | null,   allowedSports: null as readonly string[] | null },
  platinum: { maxConfigs: 20, markets: null as string[] | null,   allowedSports: null as readonly string[] | null },
  none:     { maxConfigs: 0,  markets: [] as string[],            allowedSports: [] as readonly string[] },
} as const;
