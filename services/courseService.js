const { spawn } = require("child_process");

const scraperTimeout = 120000;

async function runScraper(scraper, topic) {
  return new Promise((resolve, reject) => {
    const process = spawn("python", [`./scrapers/${scraper}.py`, topic]);
    let result = "";

    process.stdout.on("data", (data) => result += data.toString());
    process.stderr.on("data", (data) => console.error(`❌ ${scraper}:`, data.toString()));

    process.on("close", (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(result);
          const courses = (parsed.courses || []).map((course) => {
            const rating = parseFloat(course.rating) || 0;
            const reviews = parseInt(course.reviews) || 0;
            course.score = rating * Math.log10(reviews + 1);
            return course;
          });
      
          // ✅ Sort by score here
          resolve(courses.sort((a, b) => b.score - a.score));
        } catch {
          reject(new Error(`❌ Failed to parse ${scraper} JSON`));
        }
      }
      
    });

    setTimeout(() => {
      process.kill();
      reject(new Error(`⏳ Timeout: ${scraper} took too long`));
    }, scraperTimeout);
  });
}

module.exports = { runScraper };
