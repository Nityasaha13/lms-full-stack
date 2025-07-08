import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from 'cloudinary';



// Get User Data
export const getUserData = async (req, res) => {
    try {

        const userId = req.auth.userId

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Purchase Course 
export const purchaseCourse = async (req, res) => {

    try {

        const { courseId } = req.body
        const { origin } = req.headers


        const userId = req.auth.userId

        const courseData = await Course.findById(courseId)
        const userData = await User.findById(userId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url });


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {

    try {

        const userId = req.auth.userId

        const userData = await User.findById(userId)
            .populate('enrolledCourses')

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {

    try {

        const userId = req.auth.userId

        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {

            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()

        } else {

            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })

        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {

    try {

        const userId = req.auth.userId

        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add User Ratings to Course
export const addUserRating = async (req, res) => {

    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    // Validate inputs
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'InValid Details' });
    }

    try {
        // Find the course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        // Check is user already rated
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update the existing rating
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            // Add a new rating
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};



export const savedJobs = async(req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.auth.userId;

        let user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                message: "Job is already saved",
                success: false
            })
        }

        user.savedJobs.push(jobId);
        await user.save()

        await user.populate('savedJobs');
        return res.status(200).json({
            user,
            message: "Job saved successfully",
            success: true,
            savedJobs: user.savedJobs
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred",
            error: error.message,
            success: false
        });

    }
}


export const getSavedJobs = async (req, res) => {

  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId).populate('savedJobs');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      savedJobs: user.savedJobs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};




export const getCertificateData = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.auth.userId; // From auth middleware

    // Get course progress
    const courseProgress = await CourseProgress.findOne({ 
      userId: userId, 
      courseId: courseId 
    });

    if (!courseProgress) {
      return res.json({ 
        success: false, 
        message: "Course progress not found" 
      });
    }

    // Get course details with educator info
    const course = await Course.findById(courseId).populate('educator', 'name imageUrl');

    if (!course) {
      return res.json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    // Get user details
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Calculate total lectures
    let totalLectures = 0;
    course.courseContent.forEach(chapter => {
      totalLectures += chapter.chapterContent.length;
    });

    // Check if course is completed
    const completedLectures = courseProgress.lectureCompleted.length;
    const isCompleted = completedLectures === totalLectures;

    if (!isCompleted) {
      return res.json({ 
        success: false, 
        message: "Course not completed yet" 
      });
    }

    // Calculate course duration
    let totalDuration = 0;
    course.courseContent.forEach(chapter => {
      chapter.chapterContent.forEach(lecture => {
        totalDuration += lecture.lectureDuration;
      });
    });

    // Convert duration to human readable format
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    const courseDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Generate certificate ID
    const certificateId = `CERT-${Date.now()}-${userId.slice(-4).toUpperCase()}`;

    // Format dates
    const currentDate = new Date();
    const issuedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const completionDate = courseProgress.updatedAt ? 
      new Date(courseProgress.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : issuedDate;

    // Determine course level based on duration or other criteria
    let level = 'Beginner';
    if (totalDuration > 300) { // More than 5 hours
      level = 'Advanced';
    } else if (totalDuration > 120) { // More than 2 hours
      level = 'Intermediate';
    }

    const certificateData = {
      studentName: user.name,
      courseName: course.courseTitle,
      instructorName: course.educator?.name || 'Unknown',
      courseDuration: courseDuration,
      totalLectures: totalLectures,
      completedLectures: completedLectures,
      completionDate: completionDate,
      issuedDate: issuedDate,
      level: level,
      certificateId: certificateId,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateId}`,
      instructorSignature: course.educator?.imageUrl // Using instructor's image as signature placeholder
    };

    res.json({
      success: true,
      certificateData: certificateData
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Check if user can get certificate (course completed)
export const canGetCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.auth.userId;

    const courseProgress = await CourseProgress.findOne({ 
      userId: userId, 
      courseId: courseId 
    });

    const course = await Course.findById(courseId);

    if (!courseProgress || !course) {
      return res.json({ 
        success: true,
        canGetCertificate: false,
        progress: {
          completed: 0,
          total: 0,
          percentage: 0
        }
      });
    }

    // Calculate total lectures
    let totalLectures = 0;
    course.courseContent.forEach(chapter => {
      totalLectures += chapter.chapterContent.length;
    });

    const completedLectures = courseProgress.lectureCompleted.length;
    const isCompleted = completedLectures === totalLectures;

    res.json({
      success: true,
      canGetCertificate: isCompleted,
      progress: {
        completed: completedLectures,
        total: totalLectures,
        percentage: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};





// File upload configuration using multer
export const addResume = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if file is uploaded
    const resumeFile = req.file;
    if (!resumeFile) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Validate file type (only PDF files)
    if (resumeFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: "Only PDF files are allowed" });
    }

    // If user already has a resume, delete the old one from Cloudinary
    if (user.resume) {
      try {
        // Extract public_id from the URL
        const publicId = user.resume.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (error) {
        console.log('Error deleting old resume:', error);
      }
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(resumeFile.path, {
      resource_type: 'raw',
      folder: 'resumes',
      public_id: `resume_${userId}_${Date.now()}`,
      use_filename: true,
      unique_filename: false,
      access_mode: 'public'
    });

    // Delete the temporary file
    fs.unlinkSync(resumeFile.path);

    // Update user's resume URL
    user.resume = uploadResult.secure_url;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Resume uploaded successfully", 
      resumeUrl: user.resume 
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    
    // Delete temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserResume = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (!user.resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    
    res.status(200).json({ 
      success: true, 
      resumeUrl: user.resume 
    });

  } catch (error) {
    console.error('Error getting resume:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    // Delete from Cloudinary
    try {
      const publicId = user.resume.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (error) {
      console.log('Error deleting from Cloudinary:', error);
    }

    // Remove resume from user document
    user.resume = '';
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Resume deleted successfully" 
    });

  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getUserResumeById = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.auth.userId;

    // Find the user whose resume is being requested
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Check if the user has uploaded a resume
    if (!user.resume) {
      return res.status(404).json({ success: false, message: "Resume not found for this user" });
    }

    // Optional: Add additional security checks here
    // For example, you might want to verify that the requesting user (educator)
    // has permission to view this specific user's resume
    // This could involve checking if the user has applied to the educator's jobs
    
    res.status(200).json({ 
      success: true, 
      resumeUrl: user.resume,
      userName: user.name // Optional: include user name for reference
    });

  } catch (error) {
    console.error('Error getting user resume by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};