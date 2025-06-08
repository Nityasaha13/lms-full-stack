import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const MyJobs = () => {
  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext);

  const [jobs, setJobs] = useState(null);

  const fetchEducatorJobs = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(backendUrl + "/api/educator/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const token = await getToken();

      const { data } = await axios.delete(
        backendUrl + `/api/educator/job/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchEducatorJobs(); // Refresh the jobs list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchEducatorJobs();
    }
  }, [isEducator]);

  return jobs ? (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">My Jobs</h2>
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
                  <th className="px-4 py-3 font-semibold truncate">
                    Applications
                  </th>
                  <th className="px-4 py-3 font-semibold truncate">
                    Posted On
                  </th>
                  <th className="px-4 py-3 font-semibold truncate">Actions</th>
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
                      {currency} {job.salary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {job.applications?.length || 0}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this job?"
                            )
                          ) {
                            deleteJob(job._id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-lg mb-2">No jobs found</div>
            <div className="text-gray-400 text-sm">
              You haven't posted any jobs yet.
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MyJobs;
