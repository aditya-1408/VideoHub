//require("dotenv").config({path:'./.env'});

import "./env.js";
import app from "./app.js";
import connectDB from "./db/index.js";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at port : ${port}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  });

// .then(() => {
//   app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });
// })
// .catch((error) => {
//   console.log("Error starting server:", error);
// });

/*  this code is for connecting to MongoDB and starting the Express server. It uses Mongoose to connect to the MongoDB database specified by the MONGODB_URI environment variable and the DB_NAME constant. If the connection is successful, it starts the Express server on the port specified by the PORT environment variable. If there is an error during the connection, it logs the error to the console.
import express from "express";
const app = express();
(async ()=>{
    try{
         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
         app.on("error",(error)=>{
            console.log("Error connecting to MongoDB:", error);
            throw error; l
         })

         app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
         })
        console.log("Connected to MongoDB successfully!");
    }
        catch(error){
            console.log("Error connecting to MongoDB:", error);
        }
})()
        */
