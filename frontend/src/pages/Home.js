import React, { useState } from 'react';
import axios from 'axios';
import searchIcon from '../assets/search.png';
import logo from '../assets/logo.png';
import separate from '../assets/separate.png';
import png1 from '../assets/png 1.png';
import png2 from '../assets/png 2.png';
import png3 from '../assets/png 3.png';
import png4 from '../assets/png 4.png';
import fullStar from '../assets/fullStar.png';
import halfStar from '../assets/halfStar.png';
import './Home.css';

function Home() {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `http://localhost:5000/api/courses?topic=${query}&limit=100&skip=0`
      );

      if (response.data && Array.isArray(response.data.courses)) {
        const sorted = response.data.courses.sort((a, b) => {
          const aScore = (a.rating || 0) * (a.reviews_count || 0);
          const bScore = (b.rating || 0) * (b.reviews_count || 0);
          return bScore - aScore;
        });
        setCourses(sorted);
        setVisibleCount(9);
        setPlatformFilter('All');
      } else {
        setCourses([]);
        setError('No courses found for this topic.');
      }
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
      setError('Failed to fetch courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    let stars = [];
    for (let i = 0; i < fullStars; i++) stars.push(<img src={fullStar} alt="Full Star" className="w-5 h-5" key={`full-${i}`} />);
    for (let i = 0; i < halfStars; i++) stars.push(<img src={halfStar} alt="Half Star" className="w-5 h-5" key={`half-${i}`} />);
    for (let i = 0; i < emptyStars; i++) stars.push(<img src={fullStar} alt="Empty Star" className="w-5 h-5 opacity-30" key={`empty-${i}`} />);
    return stars;
  };

  const filteredCourses = platformFilter === 'All'
    ? courses
    : courses.filter(course => course.provider.toLowerCase() === platformFilter.toLowerCase());

  return (
    <div className="bg-[#0f172a] min-h-screen text-white font-sans">

      {/* Header */}
      <div className="bg-[#0f172a] shadow-md px-4 py-3 relative flex flex-col md:flex-row md:items-center md:justify-between max-w-full mx-auto gap-4">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Course Finder Logo" className="h-20 w-20 object-contain" />
          <h1 className="text-xl font-rubikmono font-bold tracking-wide flex items-center">
            <span>S M A R T</span>
            <img src={separate} alt="separator" className="h-5 w-auto mx-2" />
            <span>C O U R S E</span>
          </h1>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:max-w-4xl md:ml-8 mx-auto">
          <input
            type="text"
            placeholder="Search courses (e.g. Python, Web Dev, AI)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-4 pr-14 py-3 rounded-full border border-gray-600 bg-[#1e293b] text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-base"
          />
          <div
            onClick={handleSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 cursor-pointer shadow-md hover:scale-105 transition"
          >
            <img src={searchIcon} alt="Search" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div className="text-center text-gray-300 mt-2 text-lg custom-bungee">
        Your Gateway to Quality Learning
      </div>

      {/* Filter Dropdown */}
      {courses.length > 0 && (
        <div className="flex justify-center mt-4">
          <select
            className="bg-[#1e293b] border border-gray-600 text-white px-4 py-2 rounded"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="All">All Platforms</option>
            <option value="Coursera">Coursera</option>
            <option value="YouTube">YouTube</option>
            <option value="LinkedIn Learning">LinkedIn Learning</option>
            <option value="Pluralsight">Pluralsight</option>
          </select>
        </div>
      )}

      {/* Hero Section */}
      {courses.length === 0 && !loading && !error && (
        <section className="hero-section px-6 py-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold leading-snug mb-6">
                <span className="text-orange-400 font-bungee">UPGRADE</span> YOUR SKILLS,<br />
                STAY <span className="text-orange-400 font-bungee">AHEAD</span> OF THE CURVE
              </h1>
              <p className="text-gray-300 text-lg">
                The world of tech moves fast—don’t get left behind. Discover and compare the top-rated courses from platforms like Coursera, LinkedIn, YouTube, and more.
              </p>
            </div>

            <div className="text-gray-300 text-lg font-luxurious space-y-6">
              <div className="flex items-center gap-4">
                <img src={png1} alt="Curated Courses" className="h-10 w-10" />
                <span>6,500+ curated tech courses</span>
              </div>
              <div className="flex items-center gap-4">
                <img src={png2} alt="Labs and Projects" className="h-10 w-10" />
                <span>3,500+ hands-on labs & projects</span>
              </div>
              <div className="flex items-center gap-4">
                <img src={png3} alt="Skills Assessments" className="h-10 w-10" />
                <span>500+ skills assessments</span>
              </div>
              <div className="flex items-center gap-4">
                <img src={png4} alt="Certification Paths" className="h-10 w-10" />
                <span>150+ certification paths</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <a href="#search" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition text-lg">
              Start Exploring
            </a>
          </div>
        </section>
      )}

      {/* Course Results Section */}
      <div className="p-6 max-w-6xl mx-auto" id="search">
        <p className="text-center text-gray-300 mt-4 text-lg">
          Discover and compare top-rated courses across leading platforms like Coursera, YouTube, and more.
        </p>

        {loading && <p className="text-center text-white mt-6 font-medium">Loading courses...</p>}
        {error && <p className="text-center text-red-400 mt-6 font-medium">{error}</p>}

        {filteredCourses.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.slice(0, visibleCount).map((course, i) => (
              <div
                key={i}
                className="bg-[#1e293b] rounded-2xl shadow-md p-6 hover:shadow-xl transition text-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={`/logos/${course.provider.toLowerCase().replace(/\s+/g, '')}.png`}
                      alt={course.provider}
                      className="h-8 w-8 object-contain"
                    />
                    <p className="text-sm font-semibold text-gray-300">{course.provider}</p>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{course.course_title}</h3>

                  <div className="flex items-center gap-2 mb-2">
                    {renderStarRating(course.rating)}
                    <p className="text-sm text-gray-300">{course.rating} / 5</p>
                  </div>
                  <p className="text-sm text-gray-300"><strong>Reviews:</strong> {course.reviews_count}</p>
                </div>

                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-green-600 text-white text-center px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  View Course
                </a>
              </div>
            ))}
          </div>
        )}

        {visibleCount < filteredCourses.length && (
          <div className="text-center mt-10">
            <button onClick={handleShowMore}
              className="px-6 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-800 transition">
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
