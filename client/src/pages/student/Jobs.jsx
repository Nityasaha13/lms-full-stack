import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
// import Navbar from './shared/Navbar';
import FilterCard from '../../components/jobs/FilterCard';
import Job from '../../components/jobs/Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';


import Footer from '../../components/student/Footer';
// import Hero from '../../components/student/Hero';

const Jobs = () => {
    // const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [showFilters, setShowFilters] = useState(false); // State to control filter card visibility

    // useEffect(() => {
    //     if (searchedQuery) {
    //         const queryWords = searchedQuery.toLowerCase().split(" ");
    //         const filtered = allJobs.filter(job => {
    //             const searchFields = [
    //                 job.title,
    //                 job.description,
    //                 job.requirements?.join(" "), // Join requirements array into a single string
    //                 job.location
    //             ];
    //             return queryWords.some(word =>
    //                 searchFields.some(field => field?.toLowerCase().includes(word))
    //             );
    //         });
    //         setFilteredJobs(filtered);
    //     } else {
    //         setFilteredJobs(allJobs);
    //     }
    // }, [allJobs, searchedQuery]);

    const { allJobs } = useContext(AppContext) 

    // console.log(allJobs);

    return (
        <div className="bg-gray-900 min-h-screen text-white bg-gradient-to-br from-[#00040A] to-[#001636]">
            {/* <Navbar /> */}
            <div className="max-w-7xl mx-auto pt-20 bg-gradient-to-br from-[#00040A] to-[#001636]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:hidden w-full">
                        <button
                            onClick={ () => setShowFilters(!showFilters) }
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mb-4"
                        >
                            { showFilters ? 'Hide Filters' : 'Show Filters' }
                        </button>
                    </div>
                    {/* Filter Sidebar */ }
                    <div className={ `lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1` }>
                        <FilterCard />
                    </div>

                    {/* Button to toggle filter card on small screens */ }


                    {/* Main Job List Section */ }
                    <div className="lg:col-span-3">
                        <motion.div
                            className="grid grid-cols-1 gap-2"
                            initial={ { opacity: 0 } }
                            animate={ { opacity: 1 } }
                            transition={ { duration: 0.5 } }
                        >
                            { allJobs.length > 0 ? (
                                allJobs.map((job) => (
                                    <motion.div
                                        key={ job?._id }
                                        layout
                                        initial={ { opacity: 0, y: 50 } }
                                        animate={ { opacity: 1, y: 0 } }
                                        transition={ {
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 20
                                        } }
                                    >
                                        <Job job={ job } />
                                    </motion.div>
                                ))
                            ) : (
                                <span className="text-blue-600 font-bold">No jobs found</span>
                            ) }
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Jobs;
