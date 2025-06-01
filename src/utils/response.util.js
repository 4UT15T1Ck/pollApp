export const sendSuccess = (res, message, data, statusCode = 200) => {
    const response = { success: true, message };
    if (data !== undefined) response.data = data;
    return res.status(statusCode).json(response);
};

export const sendError = (res, message, statusCode = 500, errors = null) => {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};