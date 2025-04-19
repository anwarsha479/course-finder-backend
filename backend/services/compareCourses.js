function parseReviewCount(count) {
    return Number(count) || 0; // Ensure review count is treated as an integer
}

function normalizeRating(rating) {
    return Math.min(parseFloat(rating) || 0, 5); // Ensure rating is within 0-5 range
}

function calculateScore(course) {
    const rating = normalizeRating(course.rating);
    const reviews = parseReviewCount(course.reviews_count);

    // Weighted score: 80% rating + 20% scaled reviews
    // For simplicity, we scale review count logarithmically so that large counts don't dominate
    const scaledReviews = Math.log10(reviews + 1); // +1 to avoid log(0)
    return rating * 0.8 + scaledReviews * 0.2;
}

function compareCourses(courses) {
    return courses
        .filter(course => normalizeRating(course.rating) > 0 && parseReviewCount(course.reviews_count) > 0)
        .map(course => ({
            ...course,
            score: calculateScore(course)
        }))
        .sort((a, b) => b.score - a.score);
}

module.exports = compareCourses;
