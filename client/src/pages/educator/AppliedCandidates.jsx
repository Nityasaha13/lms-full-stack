import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const AppliedCandidates = () => {
  const { backendUrl, getToken, isEducator } = useContext(AppContext);
  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      console.log("Fetching applications...");
      
      const { data } = await axios.get(`${backendUrl}/api/educator/job-applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response data:", data);

      if (data.success) {
        console.log("Applications received:", data.applications);
        setApplications(data.applications.reverse());
      } else {
        toast.error(data.message || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [isEducator]);

  if (loading) return <Loading />;

  if (!applications) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Unable to load applications. Please try again.</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
        <div>
          <h2 className="pb-4 text-lg font-medium">Applied Candidates</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20 p-8">
            <p className="text-gray-500 text-center">No applications found for your jobs yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div>
        <h2 className="pb-4 text-lg font-medium">Applied Candidates ({applications.length})</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-fixed md:table-auto w-full overflow-hidden pb-4">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                <th className="px-4 py-3 font-semibold">Candidate Name</th>
                <th className="px-4 py-3 font-semibold">Job Title</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Applied On</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {applications.map((item, index) => {
                // Debug logging for each item
                console.log(`Application ${index}:`, item);
                
                return (
                  <tr key={item._id || index} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                    <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                      <img
                        src={item.applicant?.imageUrl || '/default-user.png'}
                        alt={item.applicant?.name || 'User'}
                        className="w-9 h-9 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-user.png';
                        }}
                      />
                      <span className="truncate">
                        {item.applicant?.name || item.applicant || 'Unknown User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 truncate">
                      {item.job?.title || 'Unknown Job'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppliedCandidates;