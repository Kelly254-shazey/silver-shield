function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.statusCode || 500;
  const message = error.message || "Unexpected server error.";

  return res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production"
      ? { stack: error.stack, code: error.code }
      : {}),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
