const rateLimit = require("express-rate-limit");

const userActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { userActionLimiter };
