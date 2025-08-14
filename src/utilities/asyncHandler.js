// custom error handling of the error related to the async functions.

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };

// pass a function and to an async callback. Either use a async callback try/catch or this
// const asyncHandler2 = async(fn) => {
//     try {
//         await fn(req, res, next);
//         next();
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

