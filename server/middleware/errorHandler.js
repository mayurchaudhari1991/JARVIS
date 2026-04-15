// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    type: "error",
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
