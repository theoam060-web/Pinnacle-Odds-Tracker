import { Router, type IRouter } from "express";
import healthRouter from "./health";
import oddsRouter from "./odds";
import sportsRouter from "./sports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(oddsRouter);
router.use(sportsRouter);

export default router;
