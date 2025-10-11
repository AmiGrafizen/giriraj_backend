// class ApiResponse {
//     constructor(statusCode, data, message = "Success"){
//         this.statusCode = statusCode
//         this.data = data
//         this.message = message
//         this.success = statusCode < 400
//     }
// }

// export { ApiResponse }

 export const sendResponse = (res, status, message, data = null) => {
    res.status(status).send({
      status: status,
      message: message,
      data: data
    });
  };
