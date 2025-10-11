import httpStatus from "http-status"

export const generateSuccessMessage = (action) => {
    const actionMap = {
      create: 'created successfully',
      update: 'updated successfully',
      delete: 'deleted successfully',
      get: 'retrieved successfully',
      cancel: 'cancel successfully'
    };
  
    return actionMap[action] || `${action} operation successful`;
  };

export const sendSuccessResponse = (res, action, data = null) => {
    const message = generateSuccessMessage(action);  
    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: message,
      data: data,
    });
  };
  