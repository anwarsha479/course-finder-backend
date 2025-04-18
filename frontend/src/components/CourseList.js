import React from 'react';
import CourseCard from './CourseCard';

const CourseList = ({ courses, onLoadMore, hasMore }) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    return <p className="text-center text-gray-600 mt-4">No courses found.</p>;
  }

  return (
    <div className="px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button 
            onClick={onLoadMore} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseList;
