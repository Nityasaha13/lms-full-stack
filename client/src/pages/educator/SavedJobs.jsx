import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const MySavedJobs = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const [jobs, setJobs] = useState(null);

  const fetchSavedJobs = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(backendUrl + "/api/user/saved-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setJobs(data.savedJobs || []);
      } else {
        toast.error(data.message || "Failed to fetch saved jobs");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  return jobs ? (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">Saved Jobs</h2>
        {jobs.length > 0 ? (
          <div className="flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="md:table-auto table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold truncate">
                    Job Details
                  </th>
                  <th className="px-4 py-3 font-semibold truncate">Company</th>
                  <th className="px-4 py-3 font-semibold truncate">Location</th>
                  <th className="px-4 py-3 font-semibold truncate">Salary</th>
                  <th className="px-4 py-3 font-semibold truncate">Posted On</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {jobs.map((job) => (
                  <tr key={job._id} className="border-b border-gray-500/20">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="flex items-center space-x-3">
                        {job.companyLogo && (
                          <img
                            src={job.companyLogo}
                            alt="Company Logo"
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 truncate">
                            {job.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {job.jobType} • {job.position} position
                            {job.position > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 truncate">{job.company}</td>
                    <td className="px-4 py-3 truncate">{job.location}</td>
                    <td className="px-4 py-3">
                      {currency} {job.salary?.toLocaleString() || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-lg mb-2">No saved jobs</div>
            <div className="text-gray-400 text-sm">
              You haven’t saved any jobs yet.
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MySavedJobs;
