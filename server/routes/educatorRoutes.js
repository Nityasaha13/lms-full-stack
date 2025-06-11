import express from 'express'
import { 
    addCourse, 
    educatorDashboardData, 
    getEducatorCourses, 
    getEnrolledStudentsData, 
    updateRoleToEducator,
    // Job related imports
    addJob,
    getEducatorJobs,
    deleteJob,
    getAppliedCandidates,
    // jobDashboardData,
    // getAllJobs,
    // getJobDetails
} from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router()

// Add Educator Role 
educatorRouter.get('/update-role', updateRoleToEducator)

// Course Routes
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)

// Job Routes
educatorRouter.post('/add-job', upload.single('image'), protectEducator, addJob)
educatorRouter.get('/jobs', protectEducator, getEducatorJobs)
educatorRouter.delete('/job/:jobId', protectEducator, deleteJob)
// educatorRouter.get('/job-dashboard', protectEducator, jobDashboardData)

// Public Job Routes (for job seekers)
// educatorRouter.get('/all-jobs', getAllJobs)
// educatorRouter.get('/job/:jobId', getJobDetails)

// Dashboard Routes
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)
educatorRouter.get('/job-applicants', protectEducator, getAppliedCandidates)

export default educatorRouter;