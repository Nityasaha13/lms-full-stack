import express from "express";
// import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    deleteJob, 
    getAdminJobs, 
    getAllJobs, 
    getJobById, 
    postJob, 
    fetchAndSaveJobs
} from "../controllers/job.controller.js";

const router = express.Router();

// router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(getAllJobs);
// router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(getJobById);
// router.route("/delete").post(deleteJob);

// Route to fetch jobs from RapidAPI and save them
router.route("/fetch-jobs").get(fetchAndSaveJobs);

// router.get("/test", (req, res) => {
//   console.log("✅ Test route hit");
//   res.json({ message: "Test route working" });
// });

export default router;
