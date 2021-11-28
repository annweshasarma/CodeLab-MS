//requring bull 
const Queue = require("bull");


const jobQueue = new Queue('job-queue');
const NUM_WORKERS = 5; // how many jobs we want to do at a single time
const Job = require('./models/Job'); 
const {executeCpp} = require('./executeCpp');
const {executePy} = require('./executePy');

jobQueue.process(NUM_WORKERS , async({data}) => {
console.log(data);
const {id: jobId} =data;
const job = await Job.findById(jobId);

if(job === undefined){
    throw Error("job not found");
}
console.log("Fetched Job" , job);
try
{ 
    //finding when the job was firststarted when the language was selected
    job["startedAt"]= new Date(); 
    if(job.language === "cpp"){
     output = await executeCpp(job.filepath);
    }
    else{
      output = await executePy(job.filepath);
    }
    //job completed time
     job["completedAt"] = new Date();
     job["status"] ="success";
     job["output"] = output;

     await job.save();
    
     
     //return res.json({filepath, output });
    }
    catch(err){ // getting the completed time when it catches the err
      job["completedAt"] = new Date();
      job["status"] ="error";
      job["output"] = JSON.stringify(err);
      await job.save();
      
        //res.status(500).json({err});
    }

return true;
});

 jobQueue.on("failed" , (error) => {
     console.log(error.data.id, "failed" , error.failedReason);
 });

const addJobToQueue = async(jobId) =>{
    await jobQueue.add({id: jobId});
} ;

module.exports ={
    addJobToQueue
}