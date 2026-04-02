import { Router, type IRouter } from "express";
import healthRouter from "./health";
import oddsRouter from "./odds";
import sportsRouter from "./sports";
import marketsRouter from "./markets";
import betsRouter from "./bets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(oddsRouter);
router.use(sportsRouter);
router.use(marketsRouter);
router.use(betsRouter);

export default router;
