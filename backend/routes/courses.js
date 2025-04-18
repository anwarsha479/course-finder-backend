const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const { runScraper } = require("../services/courseService");
const compareCourses = require("../services/compareCourses");

// 📌 GET /api/courses?topic=python&limit=10&skip=0&platform=Coursera
router.get("/", async (req, res) => {
  const topic = req.query.topic?.trim();
  const platform = req.query.platform?.trim(); // 🆕 get platform filter
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  if (!topic) {
    return res.status(400).json({ success: false, message: "Topic is required" });
  }

  console.log(`📡 GET /api/courses?topic=${topic}&limit=${limit}&skip=${skip}&platform=${platform || 'All'}`);

  try {
    const query = {
      topic: { $regex: new RegExp('^' + topic + '$', 'i') }
    };

    if (platform) {
      query.platform = platform; // 🆕 apply platform filter if provided
    }

    const existingCourses = await Course.find(query).lean();

    if (existingCourses.length > 0) {
      console.log(`✅ Returning cached courses for topic: ${topic} ${platform ? `on ${platform}` : ''}`);

      const cleanedCourses = existingCourses.map(({ _id, __v, ...course }) => course);
      const sortedCourses = compareCourses(cleanedCourses);
      const paginatedCourses = sortedCourses.slice(skip, skip + limit);

      console.log(`📦 Sending ${paginatedCourses.length} courses (skip: ${skip})`);
      paginatedCourses.forEach((course, i) => {
        console.log(`${skip + i + 1}. ${course.course_title} | Platform: ${course.platform} | Rating: ${course.rating}, Reviews: ${course.reviews_count}`);
      });

      return res.json({
        success: true,
        source: "database",
        total: sortedCourses.length,
        courses: paginatedCourses,
      });
    }

    console.log("⚠️ No cached courses found. Running scrapers...");

    const scrapers = ["coursera", "linkedin", "pluralsight", "youtube"];
    const results = await Promise.allSettled(scrapers.map(scraper => runScraper(scraper, topic)));

    const scrapedCourses = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value);

    if (scrapedCourses.length === 0) {
      return res.status(404).json({ success: false, message: "No courses found." });
    }

    // Save scraped courses
    const bulkOps = scrapedCourses.map(course => ({
      updateOne: {
        filter: { url: course.url },
        update: { $set: { ...course, topic } },
        upsert: true,
      },
    }));
    await Course.bulkWrite(bulkOps);
    console.log(`✅ Stored ${scrapedCourses.length} new courses.`);

    const cleanedScrapedCourses = scrapedCourses.map(({ _id, __v, ...course }) => course);

    // 🆕 If platform filter is applied, filter after scraping too
    const filteredCourses = platform
      ? cleanedScrapedCourses.filter(c => c.platform === platform)
      : cleanedScrapedCourses;

    const sortedScrapedCourses = compareCourses(filteredCourses);
    const paginatedScrapedCourses = sortedScrapedCourses.slice(skip, skip + limit);

    console.log(`🧠 Sorted & sending ${paginatedScrapedCourses.length} scraped courses (skip: ${skip})`);
    paginatedScrapedCourses.forEach((course, i) => {
      console.log(`${skip + i + 1}. ${course.course_title} | Platform: ${course.platform} | Rating: ${course.rating}, Reviews: ${course.reviews_count}`);
    });

    res.json({
      success: true,
      source: "scraper",
      total: sortedScrapedCourses.length,
      courses: paginatedScrapedCourses,
    });

  } catch (error) {
    console.error("❌ Error in /api/courses:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
