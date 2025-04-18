// scheduler.js
const cron = require('node-cron');
const Course = require('./models/course'); // Uses the existing mongoose model

// Schedule the job (no DB connection here)
cron.schedule('0 2 * * 0', async () => {
  try {
    await Course.deleteMany({});
    console.log('✅ Course data cleared from MongoDB');
  } catch (err) {
    console.error('❌ Error clearing course data:', err.message);
  }
});
