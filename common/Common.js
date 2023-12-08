const message = {
  SUCCESS: "Successful",
  ERROR: "Error",
  NOTFOUND: "Data Not found",
};

const code = {
  SUCCESS: 200,
  ERROR: 404,
  BAD_REQUEST: 400,
  ERROR_SERVER: 500,
};

const getUserNameByEmail = (email) => {
  let index = email.indexOf("@");
  return email.substring(0, index);
};

const createResponseModel = (code, message, data) => {
  return {
    statusCode: code,
    message: message,
    totalRecord: 0,
    data: data,
  };
};

const createSuccessResponseModel = (totalRecord = 1, data) => {
  return {
    statusCode: 200,
    message: "Successful",
    totalRecord: totalRecord,
    data: data,
  };
};

const createErrorResponseModel = (totalRecord = 0, data = false) => {
  return {
    statusCode: 404,
    message: "Failed",
    totalRecord: totalRecord,
    data: data,
  };
};

const generateRandomToken = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }

  return token;
};

module.exports = {
  messageCode: message,
  statusCode: code,
  getUserNameByEmail: getUserNameByEmail,
  createResponseModel: createResponseModel,
  createSuccessResponseModel: createSuccessResponseModel,
  generateRandomToken: generateRandomToken,
  createErrorResponseModel: createErrorResponseModel,
};
