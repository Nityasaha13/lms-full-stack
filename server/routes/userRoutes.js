import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses, savedJobs, getSavedJobs, getCertificateData, canGetCertificate, addResume, getUserResume, deleteResume, getUserResumeById } from '../controllers/userController.js';
import { protectEducator } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';


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


// Resume routes
userRouter.post('/add-resume', upload.single('resume'), protectEducator, addResume);
userRouter.get('/get-resume', protectEducator, getUserResume);
userRouter.delete('/delete-resume', protectEducator, deleteResume);
// Add this new route to your existing routes
userRouter.get('/get-resume/:userId', protectEducator, getUserResumeById);


export default userRouter;