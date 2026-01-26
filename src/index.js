//the difference between dependencies and devDependencies is that dependencies are the packages required for
//the application to run in production, while devDependencies are the packages needed only during development and testing.
//For example, a web framework like Express would be a dependency, while a testing library like Mocha would be a devDependency.
//in short, dependencies are essential for the app's functionality, while devDependencies are essential for development tasks.

// --- IGNORE ---

//by placeholder file, i mean a file that is created to hold a place in a directory structure, often to ensure that the directory is included in version control systems like Git.
//These files are typically empty or contain minimal content, and their primary purpose is to prevent the directory from being ignored or deleted when the project is shared or deployed.
//For example, a common placeholder file is named .gitkeep, which is used to keep an otherwise empty directory in a Git repository.

// --- IGNORE ---


// require('dotenv').config({path : './env'});
 //to use environment variables from .env file
import dotenv from 'dotenv'
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants.js';
import connectDB from './db/db.js';
// import express from 'express';
// const app = express();
//database is always in another continent , so it takes time to connect 
// & also there maybe some problem while connecting so we use async await & wrap it in try catch for error handling

//1st way of connecting to database,all in one file

//iffe function 
//immediately invoked function expression
//it is a function that runs as soon as it is defined, normally functions are defined and then called later in the code
//but iffe functions are executed right away, without needing to be called separately

// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on('error', (error)=>
//         {
//             console.log('ERROR',error);
//             throw error;
//         })

// app.on is used to set up an event listener on the Express application instance (app).
// In this case, it listens for the 'error' event, which is emitted when an error occurs within the application.
// When such an error occurs, the provided callback function is executed, logging the error to the console and throwing it for further handling.
// This helps in monitoring and managing errors that may arise during the application's runtime.
// here it is used to catch and handle any errors that occur within the Express application.

//         app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })
//     }
//     catch(error){
//         console.error('ERROR', error);
//         //console.error is used to log error messages to the console, it functions similarly to
//         //  console.log but is specifically intended for error output.
//         throw error;
//     }

//catch block is used to handle any errors that may occur during the execution of the code within the try block.
// If an error is thrown in the try block, the catch block will execute, allowing you to manage the error gracefully.
// In this case, it logs the error message to the console and then rethrows the error for further handling if needed.
//here it is used to catch errors that may occur while connecting to the MongoDB database using Mongoose.
// })()

//2nd way of connecting to database,using db file

dotenv.config({
    path : './env'
});
connectDB()