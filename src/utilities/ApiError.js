// custom api error handling to avoid excessive use of try catch
class ApiError extends Error {
    constructor(statusCode,message){
        super(message)
        this.statusCode = statusCode
    }
}
export default ApiError;
