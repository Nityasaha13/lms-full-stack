import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import { clerkClient } from '@clerk/express'

// update role to educator
export const updateRoleToEducator = async (req, res) => {

    try {

        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            },
        })

        res.json({ success: true, message: 'You can publish a course now' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add New Course
export const addCourse = async (req, res) => {

    try {

        const { courseData } = req.body

        const imageFile = req.file

        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = await JSON.parse(courseData)

        parsedCourseData.educator = educatorId

        const newCourse = await Course.create(parsedCourseData)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        newCourse.courseThumbnail = imageUpload.secure_url

        await newCourse.save()

        res.json({ success: true, message: 'Course Added' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {

        const educator = req.auth.userId

        const courses = await Course.find({ educator })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        // Fetch all courses created by the educator
        const courses = await Course.find({ educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};


// Add New Job
export const addJob = async (req, res) => {
    try {
        const { jobData } = req.body
        const imageFile = req.file
        const creatorId = req.auth.userId

        const parsedJobData = JSON.parse(jobData)

        // Get creator name from Clerk
        const user = await clerkClient.users.getUser(creatorId)
        const creatorName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || 'Anonymous'

        // Prepare job data
        const jobInfo = {
            ...parsedJobData,
            created_by: creatorId
        }

        // Upload company logo if provided
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path)
            jobInfo.companyLogo = imageUpload.secure_url
        }

        const newJob = await Job.create(jobInfo)

        res.json({ success: true, message: 'Job Posted Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Jobs
export const getEducatorJobs = async (req, res) => {
    try {
        const creatorId = req.auth.userId

        // Get creator name from Clerk
        const user = await clerkClient.users.getUser(creatorId)
        const creatorName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || 'Anonymous'

        const jobs = await Job.find({ created_by: creatorId }).sort({ createdAt: -1 })

        res.json({ success: true, jobs })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Delete Job
export const deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params
        const creatorId = req.auth.userId

        // Get creator name from Clerk
        const user = await clerkClient.users.getUser(creatorId)
        const creatorName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || 'Anonymous'

        // Find and delete job only if it belongs to the creator
        const job = await Job.findOneAndDelete({ 
            _id: jobId, 
            created_by: creatorName 
        })

        if (!job) {
            return res.json({ success: false, message: 'Job not found or unauthorized' })
        }

        res.json({ success: true, message: 'Job deleted successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}



export const getAppliedCandidates = async (req, res) => {
  try {
    const educatorId = req.auth.userId;
    // console.log("Educator ID:", educatorId);

    // Get all jobs created by this educator
    const jobs = await Job.find({ created_by: educatorId }).select('_id');
    const jobIds = jobs.map(job => job._id);
    // console.log("Job IDs found:", jobIds);

    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        applications: [],
        message: 'No jobs found for this educator'
      });
    }

    // Get all applications for those jobs with population
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate({
        path: 'applicant',
        select: 'name email imageUrl',
        model: 'User'
      })
      .populate({
        path: 'job',
        select: 'title',
        model: 'Job'
      })
      .sort({ createdAt: -1 });

    // console.log("Applications found:", applications.length);
    // console.log("Sample application:", applications[0]);

    // Check for failed populations
    const failedPopulations = applications.filter(app => 
      !app.applicant || !app.job
    );
    
    if (failedPopulations.length > 0) {
    //   console.log("Failed populations:", failedPopulations.length);
    //   console.log("Sample failed application:", failedPopulations[0]);
    }

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    // console.error("Error fetching applied candidates:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applied candidates',
      error: error.message
    });
  }
};