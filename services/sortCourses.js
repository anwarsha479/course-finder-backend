const compareCourses = require('./compareCourses');

function sortCourses(allCourses) {
    // Filter, score, and sort the combined list
    return compareCourses(allCourses);
}

module.exports = sortCourses;
