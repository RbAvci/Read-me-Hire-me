import { Router } from "express";
import getGradList from "../controller/getGradList";
const router = Router();

router.get("/graduates", getGradList);

export default router;
