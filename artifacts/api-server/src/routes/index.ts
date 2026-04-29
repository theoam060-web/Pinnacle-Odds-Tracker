import { Router, type IRouter } from "express";
import healthRouter from "./health";
import oddsRouter from "./odds";
import sportsRouter from "./sports";
import marketsRouter from "./markets";
import betsRouter from "./bets";
import resultsRouter from "./results";
import userRouter from "./user";
import softOddsRouter from "./soft-odds";
import pushRouter from "./push";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(oddsRouter);
router.use(sportsRouter);
router.use(marketsRouter);
router.use(betsRouter);
router.use(resultsRouter);
router.use(userRouter);
router.use(softOddsRouter);
router.use(pushRouter);
router.use(chatRouter);

export default router;
