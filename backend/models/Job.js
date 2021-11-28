//creating a model for our server
const mongoose = require('mongoose');

//jobschema is the required schema for our mongoose model
const JobSchema = mongoose.Schema({
  //contains the language
    language :{
        type: String,
        required: true,
        enum: ["cpp" , "py"]
    },
    // the filepath of the code
    filepath:{
        type:String,
        required: true

    },
    //time at which the code was submitted
    submittedAt:{
      type: Date,
      default:Date.now
    },
    //the time when the execution started
    startedAt: {
        type:Date
    },
    // the time when the execution was completed
    completedAt:{
        type: Date
    },
    // the output of the code f
    output:{
        type: String
    },
   // status of the code
    status:{
        type: String,
        default: "pending",
        enum : ["pending" , "success" , "error"]
    }
});

const Job = new mongoose.model('job' , JobSchema);
module.exports = Job;
