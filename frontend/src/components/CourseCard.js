import React from 'react';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-[#1e293b] rounded-2xl shadow-md p-6 transition hover:shadow-xl text-white">
      <h3 className="text-lg font-semibold text-white mb-2">
        {course.course_title}
      </h3>

      <p className="text-sm text-gray-300">
        <strong className="font-medium text-gray-200">Platform:</strong> {course.provider}
      </p>

      <p className="text-sm text-gray-300 mt-1">
        <strong className="font-medium text-gray-200">Rating:</strong> ⭐ {course.rating}
      </p>

      <p className="text-sm text-gray-300 mt-1">
        <strong className="font-medium text-gray-200">Reviews:</strong> {course.reviews_count}
      </p>

      <a
        href={course.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-md transition"
      >
        View Course
      </a>
    </div>
  );
};

export default CourseCard;
