import React from 'react';
import { assets } from '../../assets/assets';
import SearchBar from '../../components/student/SearchBar';

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 pb-20 md:pb-36 px-7 md:px-0 space-y-7 text-center bg-gradient-to-r from-neutral-200 to-violet-300 ">
      <h1 className="md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-3xl mx-auto">
        Shape Your Future<br/> Courses Crafted to <span class="text-blue-600">Fit You Goal.</span>
        <img src={assets.sketch} alt="sketch" className="md:block hidden absolute -bottom-7 right-0" />
      </h1>
      <p className="md:block hidden text-gray-500 max-w-2xl mx-auto">
        We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
      </p>
      <p className="md:hidden text-gray-500 max-w-sm mx-auto">
        We bring together world-class instructors to help you achieve your professional goals.
      </p>
      <SearchBar />
    </div>
  );
};

export default Hero;
