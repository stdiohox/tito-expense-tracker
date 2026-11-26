/* Every test runs in the app's home time zone, before anything reads the clock. */
module.exports = () => {
  process.env.TZ = 'Africa/Lagos';
};
