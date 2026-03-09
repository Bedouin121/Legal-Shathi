const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
