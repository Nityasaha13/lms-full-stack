import React, { useContext, useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify'
import Quill from 'quill';
import axios from 'axios'
import { AppContext } from '../../context/AppContext';

const AddJob = () => {

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const { backendUrl, getToken } = useContext(AppContext)

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('full-time')
  const [salary, setSalary] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [position, setPosition] = useState('')
  const [requirements, setRequirements] = useState('')
  const [applyLink, setApplyLink] = useState('')
  const [image, setImage] = useState(null)

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      const jobData = {
        title,
        company,
        location,
        jobType,
        salary: Number(salary),
        experienceLevel,
        position: Number(position),
        requirements: requirements.split(',').map(req => req.trim()).filter(req => req),
        description: quillRef.current.root.innerHTML,
        applyLink
      }

      const formData = new FormData()
      formData.append('jobData', JSON.stringify(jobData))
      if (image) {
        formData.append('image', image)
      }

      const token = await getToken()

      console.log(formData);

      const { data } = await axios.post(backendUrl + '/api/educator/add-job', formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      

      if (data.success) {
        toast.success(data.message)
        setTitle('')
        setCompany('')
        setLocation('')
        setJobType('full-time')
        setSalary('')
        setExperienceLevel('')
        setPosition('')
        setRequirements('')
        setApplyLink('')
        setImage(null)
        quillRef.current.root.innerHTML = ""
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  };

  useEffect(() => {
    // Initiate Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div>
        <h2 className="pb-4 text-lg font-medium">Add Job</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
          <div className='flex flex-col gap-1'>
            <p>Job Title</p>
            <input 
              onChange={e => setTitle(e.target.value)} 
              value={title} 
              type="text" 
              placeholder='e.g. Senior React Developer' 
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' 
              required 
            />
          </div>

          <div className='flex flex-col gap-1'>
            <p>Company Name</p>
            <input 
              onChange={e => setCompany(e.target.value)} 
              value={company} 
              type="text" 
              placeholder='e.g. Tech Corp' 
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' 
              required 
            />
          </div>

          <div className='flex flex-col gap-1'>
            <p>Location</p>
            <input 
              onChange={e => setLocation(e.target.value)} 
              value={location} 
              type="text" 
              placeholder='e.g. New York, NY or Remote' 
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' 
              required 
            />
          </div>

          <div className='flex flex-col gap-1'>
            <p>Job Type</p>
            <select 
              onChange={e => setJobType(e.target.value)} 
              value={jobType} 
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' 
              required
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Internship</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className='flex flex-col gap-1'>
              <p>Salary</p>
              <input 
                onChange={e => setSalary(e.target.value)} 
                value={salary} 
                type="number" 
                placeholder='50000' 
                className='outline-none md:py-2.5 py-2 w-32 px-3 rounded border border-gray-500' 
                required 
              />
            </div>

            <div className='flex flex-col gap-1'>
              <p>Positions</p>
              <input 
                onChange={e => setPosition(e.target.value)} 
                value={position} 
                type="number" 
                placeholder='1' 
                min="1"
                className='outline-none md:py-2.5 py-2 w-20 px-3 rounded border border-gray-500' 
                required 
              />
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <p>Experience Level</p>
            <select 
              onChange={e => setExperienceLevel(e.target.value)} 
              value={experienceLevel} 
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
            >
              <option value="">Select Experience Level</option>
              <option value="entry-level">Entry Level (0-2 years)</option>
              <option value="mid-level">Mid Level (2-5 years)</option>
              <option value="senior-level">Senior Level (5+ years)</option>
              <option value="executive">Executive Level</option>
            </select>
          </div>

          <div className='flex flex-col gap-1'>
            <p>Requirements (comma separated)</p>
            <input 
              onChange={e => setRequirements(e.target.value)} 
              value={requirements} 
              type="text" 
              placeholder='React, Node.js, JavaScript, MongoDB' 
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' 
            />
          </div>

          <div className='flex flex-col gap-1'>
            <p>Job Description</p>
            <div ref={editorRef}></div>
          </div>

          <div className='flex flex-col gap-1'>
            <p>Application Link (Optional)</p>
            <input 
              onChange={e => setApplyLink(e.target.value)} 
              value={applyLink} 
              type="url" 
              placeholder='https://company.com/apply' 
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' 
            />
          </div>

          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Company Logo (Optional)</p>
            <label htmlFor='companyLogo' className='flex items-center gap-3'>
              <img src={assets.file_upload_icon} alt="" className='p-3 bg-blue-500 rounded' />
              <input type="file" id='companyLogo' onChange={e => setImage(e.target.files[0])} accept="image/*" hidden />
              <img className='max-h-10' src={image ? URL.createObjectURL(image) : ''} alt="" />
            </label>
          </div>

          <button type="submit" className='bg-black text-white w-max py-2.5 px-8 rounded my-4'>
            ADD JOB
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;