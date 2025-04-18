import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      return onSearch([]);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/courses?topic=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        onSearch(data.courses);
      } else {
        onSearch([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      onSearch([]);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <input
        type="text"
        placeholder="Search for a course..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
      >
        🔍 Search
      </button>
    </div>
  );
};

export default SearchBar;
