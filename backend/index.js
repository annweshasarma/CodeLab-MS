
//implementing the required packagee
const express = require ('express');
const cors = require("cors");
const mongoose = require('mongoose');


const {generateFile} = require('./generateFile'); // it creates a file having the code
const { addJobToQueue} = require('./jobQueue');
const Job = require("./models/Job");

//connecting to mongoDB database
mongoose.connect(
  "mongodb://localhost/compilerdb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    err && console.error(err);
    console.log("Successfully connected to MongoDB: compilerdb");
  }
);


const app = express();
const server = require("http").createServer(app); //creating a server for our video app

const io = require("socket.io")(server, { // requring socket io for real time conversation for our video app
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});



app.use(cors());
const PORT = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/status" , async(req , res) =>{
  //extracting the jobID
     const jobId =  req.query.id;

     console.log("status requsted" , jobId);

     if(jobId == undefined){   //incase the jobid is not found returing a status 
       return res.status(400).json({success: false , error: "missing id query param"});
     }
     try
    { 
      const job = await  Job.findById(jobId); // finding the jobid inside the database

     if(job === undefined){ //checking if the job is empty or not defined
      return res.status(404).json({success: false , error: " invalid job id"});
     }
       
     return res.status(200).json({success:true , job});

    }
    catch(err){
      return res.status(400).json({success: false , error: JSON.stringify(err)});

    }

});

// sending post request for the language and the code 
app.post("/run", async(req, res) => {
     const { language = "cpp", code } = req.body;
     console.log(language , code.length);
    
  //if the code is undefined/empty we send a status request
    if (code === undefined) {
      return res.status(400).json({ success: false, error: "Empty code body!" });
    }

    let job;
    try{
    // through the generate file module we create a filepath by sending the required language alonge with its code
    const filepath = await generateFile(language , code);

     job = await new Job({language , filepath}).save();
    const jobId = job["_id"];
    addJobToQueue(jobId);
    console.log(job);

    res.status(201).json({success: true , jobId});
  
    }catch(err){
      //if the file creation causes an error we will send a status of error
     return res.status(500).json({success: false , err: JSON.stringify(err)});
    }
});


app.get('/', (req, res) => {
	res.send('Running');
});

//connecting socket io to the backend for real time video/audio and message conferencing 
io.on("connection", (socket) => {
    socket.emit("me", socket.id);
  
    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
      io.to(userToCall).emit("callUser", {
        signal: signalData,
        from,
        name,
      });
    });
  
    socket.on("updateMyMedia", ({ type, currentMediaStatus }) => {
      console.log("updateMyMedia");
      socket.broadcast.emit("updateUserMedia", { type, currentMediaStatus });
    });
  
    socket.on("msgUser", ({ name, to, msg, sender }) => {
      io.to(to).emit("msgRcv", { name, msg, sender });
    });
  
    socket.on("answerCall", (data) => {
      socket.broadcast.emit("updateUserMedia", {
        type: data.type,
        currentMediaStatus: data.myMediaStatus,
      });
      io.to(data.to).emit("callAccepted", data);
    });
    socket.on("endCall", ({ id }) => {
      io.to(id).emit("endCall");
    });
  });
  
  server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  