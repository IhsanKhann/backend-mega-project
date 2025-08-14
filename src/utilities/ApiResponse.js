// custom api response handling:
class ApiResponse {
    constructor(statusCode,data,message,success=true){
        this.statusCode = statusCode < 400
        this.data = data
        this.message = message
        this.success = success
    }
}

export default {
    ApiResponse
};
