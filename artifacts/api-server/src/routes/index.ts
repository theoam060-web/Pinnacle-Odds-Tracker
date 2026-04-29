import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import oddsRouter from "./odds.js";
import sportsRouter from "./sports.js";
import marketsRouter from "./markets.js";
import betsRouter from "./bets.js";
import resultsRouter from "./results.js";
import userRouter from "./user.js";
import stripeRouter from "./stripe.js";
import softOddsRouter from "./soft-odds.js";
import pushRouter from "./push.js";
import chatRouter from "./chat.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(oddsRouter);
router.use(sportsRouter);
router.use(marketsRouter);
router.use(betsRouter);
router.use(resultsRouter);
router.use(userRouter);
router.use(stripeRouter);
router.use(softOddsRouter);
router.use(pushRouter);
router.use(chatRouter);

export default router;
