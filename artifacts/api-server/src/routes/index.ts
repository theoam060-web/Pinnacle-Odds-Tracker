import { Router, type IRouter } from "express";
import healthRouter from "./health";
import oddsRouter from "./odds";
import sportsRouter from "./sports";
import marketsRouter from "./markets";
import betsRouter from "./bets";
import resultsRouter from "./results";
import userRouter from "./user";
import stripeRouter from "./stripe";
import softOddsRouter from "./soft-odds";
import pushRouter from "./push";
import chatRouter from "./chat";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(authRouter);
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
