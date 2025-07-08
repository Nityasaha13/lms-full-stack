import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '../../redux/jobSlice';
import { Button } from '../../components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import Footer from '../../components/student/Footer';
import FilterCard from '../../components/jobs/FilterCard';
import Job from '../../components/jobs/Job';
import ChatBoat from '../../components/ChatBoat';

const Browse = () => {
    const dispatch = useDispatch();
    const { allJobs } = useContext(AppContext);
    const searchedQuery = useSelector(state => state.job.searchedQuery);

    const [query, setQuery] = useState(searchedQuery || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        dispatch(setSearchedQuery(query));
    };

    const queryWords = searchedQuery?.toLowerCase().split(" ").filter(Boolean) || [];

    const filteredJobs = allJobs.filter((job) => {
        if (queryWords.length === 0) return true;

        const searchableFields = [
            job.title,
            job.description,
            job.location,
            job.industry,
            job.requirements?.join(" "),
            job.skills?.join(" ")
        ];

        return queryWords.some(word =>
            searchableFields.some(field =>
                field?.toLowerCase().includes(word)
            )
        );
    });

    return (
        <>
            <div className="bg-white min-h-screen text-black">
                {/* ✅ Search Bar */}
                <div className=''>
                    <div className="flex w-full sm:w-[70%] lg:w-[40%] shadow-md border border-gray-300 pl-3 pr-1 py-1 items-center gap-4 mx-auto mt-20 mb-12 bg-white">
                        <Input
                            type="text"
                            value={query}
                            placeholder="Search by job title or skills"
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                            className="w-full p-3 outline-none border-none bg-transparent text-black placeholder-gray-500 focus:outline-none"
                        />
                        <Button
                            onClick={handleSearch}
                            className=" bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 px-6 py-3 flex items-center"
                        >
                            <Search className="h-5 w-5 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>

                {/* ✅ Filter + Results Section */}
                <div className="max-w-7xl mx-auto pt-10 px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filter Toggle on Small Screens */}
                        <div className="lg:hidden w-full">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mb-4"
                            >
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>

                        {/* Filters Sidebar */}
                        <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
                            <FilterCard />
                        </div>

                        {/* Job Listings */}
                        <div className="lg:col-span-3">
                            <h1 className="font-bold text-xl mb-6">
                                Search Results ({filteredJobs.length})
                            </h1>

                            {filteredJobs.length > 0 ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
                                    {filteredJobs.map((job) => (
                                        <Job key={job._id} job={job} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-lg text-gray-500">
                                    No jobs found. Please adjust your search or filters.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ChatBoat />
            <Footer />
        </>
    );
};

export default Browse;
