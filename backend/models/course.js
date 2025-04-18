const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    course_title: { type: String, required: true },
    provider: { type: String, required: true },
    url: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews_count: { type: Number, default: 0 },
    duration: { type: String, default: "Unknown" },
    level: { type: String, default: "Unknown" },
    topic: { type: String, required: true },  // Add topic field here
});

// Add an index to improve lookup speed for the `topic` field
CourseSchema.index({ topic: 1 });

module.exports = mongoose.model("Course", CourseSchema);
