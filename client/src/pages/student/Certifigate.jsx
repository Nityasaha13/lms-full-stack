import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';

const Certificate = () => {
  const { userData, backendUrl, getToken, enrolledCourses } = useContext(AppContext);
  const { courseId } = useParams();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCertificateData = async () => {
    try {
      const token = await getToken();
      
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-certificate-data`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCertificateData(data.certificateData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    const element = document.getElementById('certificate-content');
    const opt = {
      margin: 0.5,
      filename: `Certificate_${certificateData.courseName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    if (userData && courseId) {
      getCertificateData();
    }
  }, [userData, courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Certificate not available</h2>
          <p className="text-gray-500">Please complete the course to get your certificate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <button 
            onClick={downloadCertificate}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4 font-semibold shadow-lg"
          >
            📄 Download Certificate
          </button>
          <button 
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            ← Back to Course
          </button>
        </div>

        <div id="certificate-content" className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="relative p-12 bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Decorative border */}
            <div className="absolute inset-4 border-4 border-double border-blue-300 rounded-lg"></div>
            
            {/* Certificate content */}
            <div className="relative z-10 text-center">
              {/* Header */}
              <div className="mb-6">
                {/* <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-4xl font-bold">🎓</span>
                </div> */}
                <div className="w-60 flex items-center justify-center mx-auto mb-4">
                  {/* <img src='/site_icon.png'></img> */}
                  <img src='/logo_blue.png'></img>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">CERTIFICATE OF COMPLETION</h1>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-lg text-gray-600 mb-1">This certifies that</p>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{certificateData.studentName}</h2>
                <p className="text-lg text-gray-600 mb-1">
                  has successfully completed the online course
                </p>
                <h3 className="text-3xl font-bold mb-2 text-purple-700">"{certificateData.courseName}"</h3>
              </div>

              {/* Badge */}
              <div className="mb-8">
                <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-xl font-bold">
                  {certificateData.level} Level
                </div>
              </div>

              {/* Course details */}
              <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-blue-600">{certificateData.courseDuration}</div>
                  <div className="text-gray-600">Duration</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-purple-600">{certificateData.totalLectures}</div>
                  <div className="text-gray-600">Lectures</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-gray-600">Completed</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{certificateData.instructorName}</p>
                  <p className="text-gray-600">Course Instructor</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Completion Date</p>
                  <p className="font-semibold text-gray-800 text-xl">{certificateData.completionDate}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-600 mb-2">Certificate ID</p>
                  <p className="font-mono text-sm text-gray-800 bg-gray-100 px-3 py-1 rounded">
                    {certificateData.certificateId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;