import express from "express";
import { protectEducator } from '../middlewares/authMiddleware.js';
import { applyJob, getApplicants, getAppliedJobs, updateStatus } from "../controllers/application.controller.js";
 
const router = express.Router();

router.route("/apply/:id").get(protectEducator, applyJob);
router.route("/get").get(protectEducator, getAppliedJobs);
router.route("/:id/applicants").get(protectEducator, getApplicants);
router.route("/status/:id/update").post(protectEducator, updateStatus);
 

export default router;

