
// require('dotenv').config({path : './env'});
//to use environment variables from .env file
import dotenv from 'dotenv'
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants.js';
import connectDB from './db/db.js';
// import express from 'express';
// const app = express();

//1st way of connecting to database,all in one file

//iffe function 

// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on('error', (error)=>
//         {
//             console.log('ERROR',error);
//             throw error;
//         })

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
// })()

//2nd way of connecting to database,using db file

dotenv.config({
    path : './env'
});
connectDB()