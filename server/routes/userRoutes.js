import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses, savedJobs, getSavedJobs, getCertificateData, canGetCertificate } from '../controllers/userController.js';
import { protectEducator } from '../middlewares/authMiddleware.js';


const userRouter = express.Router()

// Get user Data
userRouter.get('/data', getUserData)
userRouter.post('/purchase', purchaseCourse)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/update-course-progress', updateUserCourseProgress)
userRouter.post('/get-course-progress', getUserCourseProgress)
userRouter.post('/add-rating', addUserRating)
userRouter.post('/savedjob', savedJobs)
userRouter.get('/saved-jobs', getSavedJobs)


userRouter.post('/get-certificate-data', getCertificateData);
userRouter.post('/can-get-certificate', canGetCertificate);

export default userRouter;