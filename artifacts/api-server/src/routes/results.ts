import { Router, type IRouter } from "express";
import { resolveResults, type ResolveRequest } from "../lib/resultsResolver";

const router: IRouter = Router();

/**
 * POST /api/results/check
 * Body: { bets: ResolveRequest[] }
 * Returns: resolved results per-index with win/loss/void/null
 */
router.post("/results/check", async (req, res): Promise<void> => {
  const { bets } = req.body as { bets?: ResolveRequest[] };

  if (!Array.isArray(bets) || bets.length === 0) {
    res.status(400).json({ error: "bets array is required" });
    return;
  }

  if (bets.length > 50) {
    res.status(400).json({ error: "Maximum 50 bets per request" });
    return;
  }

  const results = await resolveResults(bets);
  res.json({ results });
});

export default router;
