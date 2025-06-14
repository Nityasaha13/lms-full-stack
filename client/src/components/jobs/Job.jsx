import React from 'react';
import { Button } from '../ui/button';
import { BookmarkPlus, ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setsavedJobs } from '../../redux/authSlice';
import { toast } from 'sonner';
import { USER_API_END_POINT } from '../../utils/constant';
import { Card } from '../ui/card';
import axios from 'axios';

const Job = ({ job }) => {
    const { savedJobs } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const getCompanyLogo = () => {
        if (job?.companyLogo && job.companyLogo.trim() !== "") {
            return job.companyLogo;
        }
        return "https://via.placeholder.com/150";
    };

    const formatDate = (mongodbTime) => {
        if (!mongodbTime) return "Unknown";
        return new Date(mongodbTime).toISOString().split("T")[0];
    };

    const handleSaveForLater = async (jobId) => {
        try {
            const response = await axios.post(`${USER_API_END_POINT}/savedjob`, { jobId }, {
                withCredentials: true
            });
            if (response) {
                dispatch(setsavedJobs(response.data.savedJobs));
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving job');
        }
    };

    return (
        <div className="flex items-stretch gap-4 p-4">
            <Card key={job.id} className="bg-white border-gray-200 w-full p-6 rounded shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <Avatar>
                            <AvatarImage
                                src={getCompanyLogo()}
                                alt={job?.company || "Company"}
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150";
                                }}
                            />
                        </Avatar>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">{job?.title}</h3>
                            <p className="text-gray-600">{job?.company}</p>
                        </div>
                    </div>
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveForLater(job._id)}
                        style={{ zIndex: 999 }}
                    >
                        <BookmarkPlus className="h-5 w-5 text-gray-500" />
                    </Button> */}
                </div>

                <div className="mt-4">
                    <div className="flex flex-wrap items-center text-gray-700 mb-2 gap-2">
                        <Badge variant="outline">{job?.position} Positions</Badge>
                        <Badge variant="secondary">{job?.jobType}</Badge>
                        <span className="text-sm">{job?.location}</span>
                    </div>
                    <p className="text-gray-800 font-medium">${job?.salary} year</p>

                    <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                        {/* {savedJobs?.some(savedJob => savedJob._id.toString() === job?._id.toString()) ? (
                            <Button className="bg-green-500 text-white text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4">
                                Saved Already
                            </Button>
                        ) : (
                            <Button className="bg-blue-700 text-white text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4"
                                onClick={() => handleSaveForLater(job._id)}>
                                Save For Later
                            </Button>
                        )} */}

                        <span className="text-xs sm:text-sm text-gray-500">
                            {formatDate(job?.createdAt)}
                        </span>

                        <Button
                            className="text-blue-600 text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (job?.applyLink) {
                                    window.open(job.applyLink, "_blank");
                                } else {
                                    navigate(`/description/${job?._id}`);
                                }
                            }}
                        >
                            {job?.applyLink ? 'Apply Link' : 'View Description'}
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Job;
