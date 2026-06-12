function notFoundMiddleware(req, res) {
  res.status(404).json({
    message: "Endpoint tidak ditemukan",
  });
}

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "Format JSON tidak valid",
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Terjadi kesalahan pada server",
  });
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware,
};
