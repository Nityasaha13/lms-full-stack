import React, { useContext } from 'react'
import { Routes, Route, useLocation, useMatch } from 'react-router-dom'
import Navbar from './components/student/Navbar'
import Home from './pages/student/Home'
import CourseDetails from './pages/student/CourseDetails'
import CoursesList from './pages/student/CoursesList'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import AddJob from './pages/educator/AddJob'
import MyJobs from './pages/educator/MyJobs'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import AppliedCandidates from './pages/educator/AppliedCandidates'
import SavedJobs from './pages/educator/SavedJobs'
import Educator from './pages/educator/Educator'
import 'quill/dist/quill.snow.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify'
import Player from './pages/student/Player'
import MyEnrollments from './pages/student/MyEnrollments'
import Loading from './components/student/Loading'

import Jobs from './pages/student/Jobs'
import Browse from './pages/student/Browse'
import Certificate from './pages/student/Certifigate'
import JobDescription from './pages/student/JobDescription'
import EditJob from './pages/educator/EditJob'
import EditCourse from './pages/educator/EditCourse'

const App = () => {

  const isEducatorRoute = useMatch('/educator/*');

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />
      {/* Render Student Navbar only if not on educator routes */}
      {!isEducatorRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/certificate/:courseId" element={<Certificate />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path='/educator' element={<Educator />}>
          <Route path='/educator' element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
          <Route path='edit-course/:id' element={<EditCourse />} />
          <Route path='my-courses' element={<MyCourses />} />
          <Route path='add-job' element={<AddJob />} />
          <Route path='edit-job/:id' element={<EditJob />} />
          <Route path='my-jobs' element={<MyJobs />} />
          <Route path='student-enrolled' element={<StudentsEnrolled />} />
          <Route path='applied-candidates' element={<AppliedCandidates />} />
          <Route path='saved-jobs' element={<SavedJobs />} />
        </Route>

        {/* <Route path="/jobs" element={<Jobs />} /> */}
        <Route path="/jobs" element={<Browse />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/description/:id" element={<JobDescription />} />
        
      </Routes>
    </div>
  )
}

export default App