class ApiError extends Error {
   constructor(
    statusCode,
    messasge= "something went wrong",
    error=[],
    stack=""
   ){
    super(messasge);
    this.statusCode = statusCode;
    this.data =null
    this.message = message
    this.success = false;
    this.errors= errors

    if(stack){
        this.stack=stack
    } else{
        Error.captureStackTrace(this,this.constructor)
    }
   }
}

export {ApiError}