import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import YouTube from 'react-youtube';
import { assets } from '../../assets/assets';
import { useParams } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from '../../components/student/Rating';
import Footer from '../../components/student/Footer';
import Loading from '../../components/student/Loading'; 

const Player = ({ }) => {

  const { enrolledCourses, backendUrl, getToken, calculateChapterTime, userData, fetchUserEnrolledCourses, navigate } = useContext(AppContext)

  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [canGetCertificate, setCanGetCertificate] = useState(false);
  const [certificateProgress, setCertificateProgress] = useState(null);

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course)
        course.courseRatings.map((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating)
          }
        })
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const checkCertificateEligibility = async () => {
    try {
      const token = await getToken();
      
      const { data } = await axios.post(
        `${backendUrl}/api/user/can-get-certificate`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCanGetCertificate(data.canGetCertificate);
        setCertificateProgress(data.progress);
      }
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
    }
  };

  const handleGetCertificate = () => {
    navigate(`/certificate/${courseId}`);
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData()
    }
  }, [enrolledCourses])

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/update-course-progress',
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        getCourseProgress()
        // Check certificate eligibility after completing a lecture
        checkCertificateEligibility()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const getCourseProgress = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/get-course-progress',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setProgressData(data.progressData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleRate = async (rating) => {
    try {
      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/add-rating',
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchUserEnrolledCourses()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    getCourseProgress()
    checkCertificateEligibility()
  }, [])

  return courseData ? (
    <>
    
    <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36' >
      <div className=" text-gray-800" >
        <h2 className="text-xl font-semibold">Course Structure</h2>
        <div className="pt-5">
          {courseData && courseData.courseContent.map((chapter, index) => (
            <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center gap-2">
                  <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
                  <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                </div>
                <p className="text-sm md:text-default">{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`} >
                <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                  {chapter.chapterContent.map((lecture, i) => (
                    <li key={i} className="flex items-start gap-2 py-1">
                      <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                      <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                        <p>{lecture.lectureTitle}</p>
                        <div className='flex gap-2'>
                          {lecture.lectureUrl && <p onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })} className='text-blue-500 cursor-pointer'>Watch</p>}
                          <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Certificate Section */}
        {certificateProgress && (
          <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              Course Progress & Certificate
            </h3>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span className="font-semibold">{certificateProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${certificateProgress.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {certificateProgress.completed} of {certificateProgress.total} lectures completed
              </p>
            </div>
            
            {canGetCertificate ? (
              <div className="text-center">
                <div className="mb-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    🎉 Congratulations! Course Completed!
                  </span>
                </div>
                <button 
                  onClick={handleGetCertificate}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🏆 Get Your Certificate
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Click to view and download your certificate
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Complete all lectures to unlock your certificate
                </p>
                <button 
                  disabled
                  className="bg-gray-300 text-gray-500 px-8 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  🔒 Certificate Locked
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  {certificateProgress.total - certificateProgress.completed} lectures remaining
                </p>
              </div>
            )}
          </div>
        )}

        <div className=" flex items-center gap-2 py-3 mt-10">
          <h1 className="text-xl font-bold">Rate this Course:</h1>
          <Rating initialRating={initialRating} onRate={handleRate} />
        </div>

      </div>

      <div className='md:mt-10'>
        {/* {console.log(playerData?.lectureTitle)} */}
        {
          playerData
            ? (
              <div>
                <YouTube iframeClassName='w-full aspect-video' videoId={playerData.lectureUrl.split('/').pop()} />
                <div className='flex justify-between items-center mt-1'>
                  <p className='text-xl '>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                  <button 
                    onClick={() => markLectureAsCompleted(playerData.lectureId)} 
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      progressData && progressData.lectureCompleted.includes(playerData.lectureId) 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                    }`}
                  >
                    {progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? '✅ Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            )
            : <img src={courseData ? courseData.courseThumbnail : ''} alt="" className="w-full rounded-lg" />
        }
      </div>
    </div>
    <Footer />
    </>
  ) : <Loading />
}

export default Player