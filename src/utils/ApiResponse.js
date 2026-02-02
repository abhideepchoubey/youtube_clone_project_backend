class ApiResponse{
    constructor(statusCode,data,message="Success"){
        this.statusCode=statusCode;
        this.statusCode=statusCode
        this.data = data
        this.message= messsage
        this.success= statusCode < 400
    }
}