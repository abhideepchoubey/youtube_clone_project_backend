import 'dotenv/config';
import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async()=>{
    try{
        const connectionInstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MONGODB connected !! DB HOST :${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MONGODB connection error", error);
        process.exit(1)
        //process.exit(1) is used to terminate the Node.js process with a non-zero exit code, indicating that an error occurred.
        // here it is used to stop the application if there is a failure in connecting to the MongoDB database.
        // this ensures that the application does not continue running in an unstable state without a database connection.
        // exit code 0 indicates a successful completion, while a non-zero exit code (like 1) indicates an error or abnormal termination.
        //other parts of the application can check this exit code to determine if the process ended successfully or encountered an issue.
        //other exit codes can be used to indicate different types of errors or statuses as needed.
        //for example, exit code 2 might indicate a specific type of configuration error, while exit code 3 could indicate a runtime error.
        //all exit codes are written below this line for reference
        // 0: Success
        // 1: General error
        // 2: Misuse of shell builtins
        // 126: Command invoked cannot execute
        // 127: Command not found
        // 128: Invalid argument to exit
        // 130: Script terminated by Control-C
        // 255*: Exit status out of range
        // *: Exit codes greater than 128 indicate termination due to a signal.
    }
} 

export default connectDB;