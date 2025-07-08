import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const Dashboard = () => {

  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext)

  const [dashboardData, setDashboardData] = useState(null)
  const [resumeData, setResumeData] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.get(backendUrl + '/api/educator/dashboard',
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchResumeData = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.get(backendUrl + '/api/user/get-resume',
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setResumeData(data.resumeUrl)
      }

    } catch (error) {
      // Resume not found is not an error we want to show
      if (error.response?.status !== 404) {
        toast.error(error.message)
      }
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleResumeUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('resume', selectedFile)

      const { data } = await axios.post(backendUrl + '/api/user/add-resume', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        toast.success('Resume uploaded successfully')
        setResumeData(data.resumeUrl)
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById('resume-upload')
        if (fileInput) fileInput.value = ''
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) {
      return
    }

    try {
      const token = await getToken()

      const { data } = await axios.delete(backendUrl + '/api/user/delete-resume',
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success('Resume deleted successfully')
        setResumeData(null)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleResumeView = () => {
    if (resumeData) {
      window.open(resumeData, '_blank')
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchDashboardData()
      fetchResumeData()
    }
  }, [isEducator])

  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='space-y-5'>

        <h2 className="text-lg font-medium">Your Resume</h2>
        <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-full rounded-md'>
          <img src={assets.resume_icon} alt="resume_icon" className='w-12 h-12' />
          <div className='flex-1'>
            <p className='text-2xl font-medium text-gray-600'>Resume</p>
            <p className='text-base text-gray-500'>
              {resumeData ? 'Resume uploaded successfully' : 'Update your resume here.'}
            </p>
          </div>
          <div className='flex gap-2'>
            {resumeData ? (
              <>
                <button
                  onClick={handleResumeView}
                  className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors'
                >
                  View
                </button>
                <button
                  onClick={handleResumeDelete}
                  className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors'
                >
                  Delete
                </button>
              </>
            ) : (
              <div className='flex items-center gap-2'>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className='hidden'
                />
                <label
                  htmlFor="resume-upload"
                  className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors cursor-pointer'
                >
                  Choose File
                </label>
                {selectedFile && (
                  <button
                    onClick={handleResumeUpload}
                    disabled={uploading}
                    className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300'
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-lg font-medium">Overview</h2>
        <div className='flex flex-wrap gap-5 items-center'>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.patients_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.enrolledStudentsData.length}</p>
              <p className='text-base text-gray-500'>Total Enrolments</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.appointments_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.totalCourses}</p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.earning_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{currency}{Math.floor(dashboardData.totalEarnings)}</p>
              <p className='text-base text-gray-500'>Total Earnings</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="pb-4 text-lg font-medium">Latest Enrolments</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed md:table-auto w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {dashboardData.enrolledStudentsData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                    <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                      <img
                        src={item.student.imageUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full"
                      />
                      <span className="truncate">{item.student.name}</span>
                    </td>
                    <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard;