import express from 'express'
import { 
    addCourse, 
    educatorDashboardData, 
    getEducatorCourses, 
    getEnrolledStudentsData, 
    updateRoleToEducator,
    getCourseById,
    // Job related imports
    addJob,
    getEducatorJobs,
    deleteJob,
    deleteCourse,
    updateCourse,
    getAppliedCandidates,
    updateJob,
    getJobById,
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
educatorRouter.put('/course/:id', upload.single('image'), protectEducator, updateCourse)
educatorRouter.get('/course/:id', protectEducator, getCourseById);
educatorRouter.get('/courses', protectEducator, getEducatorCourses)

// Job Routes
educatorRouter.post('/add-job', upload.single('image'), protectEducator, addJob)
educatorRouter.put('/job/:jobId', upload.single('image'), protectEducator, updateJob)
educatorRouter.get('/job/:jobId', protectEducator, getJobById)
educatorRouter.get('/jobs', protectEducator, getEducatorJobs)
educatorRouter.delete('/job/:jobId', protectEducator, deleteJob)
educatorRouter.delete('/course/:courseId', protectEducator, deleteCourse)
// educatorRouter.get('/job-dashboard', protectEducator, jobDashboardData)

// Public Job Routes (for job seekers)
// educatorRouter.get('/all-jobs', getAllJobs)
// educatorRouter.get('/job/:jobId', getJobDetails)

// Dashboard Routes
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)
educatorRouter.get('/job-applicants', protectEducator, getAppliedCandidates)

export default educatorRouter;