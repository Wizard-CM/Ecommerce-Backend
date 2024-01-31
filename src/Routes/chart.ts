import express from "express";
import { barChartPageData, dashboardChartData, lineChartPageData } from "../Controllers/chart.js";
import { isAdmin } from "../Middlewares/authendication.js";

const chartRouter = express.Router();

// Get Routes
chartRouter.get("/dashboard", dashboardChartData);
chartRouter.get("/bar", isAdmin, barChartPageData);
chartRouter.get("/line", isAdmin, lineChartPageData);

export default chartRouter;
