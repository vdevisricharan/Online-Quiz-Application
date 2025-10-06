const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal server error',
    status: 500
  };

  // SQLite constraint error
  if (err.code === 'SQLITE_CONSTRAINT') {
    error.message = 'Database constraint violation';
    error.status = 400;
  }

  // SQLite foreign key error
  if (err.message && err.message.includes('FOREIGN KEY')) {
    error.message = 'Referenced resource not found';
    error.status = 404;
  }

  // Validation error
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.status = 400;
    error.details = err.details;
  }

  res.status(error.status).json(error);
};

module.exports = errorHandler;