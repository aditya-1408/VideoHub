import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app =express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true 
}))

app.use(express.json({limit:"16kb"})) // fro receiving json data from req 

app.use(express.urlencoded({extended:true,limit:"16kb"})) // for receiving url and its data from req
 app.use(express.static("public"))

 app.use(cookieParser())  

 // routes import
 import userRouter from "./routes/user.routes.js";
 //routes declarration

 app.use("/api/v1/users",userRouter)

 //http://localhost:5000/api/v1/users/resgister

export default app;