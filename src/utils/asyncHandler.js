//method 1

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

export { asyncHandler };
export default asyncHandler;

//  method 2

// const aysncHandler = () =>{}
// const asyncHandler = () => {() =>{}}  // you can acept function as parameter and return a function from it
// // also can remove outer yellow brackets
// const asyncHandler = (func) => async () => {}

// method 2 : wrapping the function in try catch block and return a function from it
// const asyncHandler = (fn) => async (req,res,next) =>{
// try{
//     await fn(req,res,next)
// } catch(error){
//     res.status(error.code || 500).json({
//         success:false,
//         message:error.message || "Internal Server Error"
//     })
// }
// }
