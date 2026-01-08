import express from "express";
import { cancelKot } from "../controllers/restaurantController.js";

const router = express.Router();


router.put("/cancel/:id", cancelKot);

export default router;
