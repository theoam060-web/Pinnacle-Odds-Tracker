import { Router, type IRouter } from "express";
import healthRouter from "./health";
import oddsRouter from "./odds";
import sportsRouter from "./sports";
import marketsRouter from "./markets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(oddsRouter);
router.use(sportsRouter);
router.use(marketsRouter);

export default router;
