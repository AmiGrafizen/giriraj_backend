class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      stack: this.isOperational ? undefined : this.stack,
    };
  }
}

// const errorHandler = (err, req, res, next) => {
//   if (err instanceof ApiError) {
//     res.status(err.statusCode).json(err.toJSON());
//   } else {
//     console.error(err); 
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      data: null, 
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 500,
    message: 'Internal Server Error',
    data: null,
  });
};
export { ApiError, errorHandler };