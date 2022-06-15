import express from "express";
import { search, crawl } from "../controllers/dataController";
import { protectorMiddleware } from "../middlewares";


const dataRouter = express.Router();

dataRouter.route("/search").all(protectorMiddleware).get(search).post(crawl);;


export default dataRouter;