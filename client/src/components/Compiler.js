// importing the required packages
import axios from 'axios';
import React , {useState , useEffect} from 'react';
import stubs from './default';
import Grid from "@mui/material/Grid";
import moment from "moment";
import { makeStyles } from '@material-ui/core/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';


const useStyles = makeStyles((theme) => ({
  root: {
    flexgrow:1
  },
  

 btn:{
   
   marginLeft:"30px",
  //  backgroundColor:"#1890FF",
   color:"black",
   padding:10
 },
 outputDiv:{
   backgroundColor:"black",
   color:"#fff",
   marginLeft:"5px",
 },
 code :{
  marginLeft:"5px",
   width:"102vh",
   height:"100vh",
   backgroundColor:"#011936",
   color:"#fff"
 },

 lbl:{
   color:"#fff",
   fontSize:"20px"
 },
//  appbar:{
//    marginLeft:"5px",
//    paddingTop:"2px",
//    paddingBottom:"5px",
//    backgroundColor:"#fff",
//    height:"8vh",
//    width:"90vh"
//  }



}));

function Compiler() {
  const classes = useStyles();
  const [code , setCode] = useState('');
  const [language , setLanguage] = useState("cpp");
  const [output , setOutput] = useState("");
  const[status , setStatus] = useState("");
  const[jobId , setJobId] = useState("");
  const[jobDetails , setJobDetails] = useState(null);

  
 
 //storig the default language
  useEffect(() => {
  const defaultLang = localStorage.getItem("default-language") || "cpp"
  setLanguage(defaultLang);
  }, [])
  
  // setting the default codes
  useEffect(() => {
    setCode(stubs[language]);
  } , [language]);
 
 //creating the set default function
 const setDefaultLanguage = () =>{
   localStorage.setItem("default-language" , language);
   console.log(language ,'set as default language.');
 }
 
 //generating the time of job done
 const renderTimeDetails = () => {
  if (!jobDetails) {
    return "";
  }
  let { submittedAt } = jobDetails;
  let result = "";
  submittedAt = moment(submittedAt).toString();
  result += `Job Submitted At: ${submittedAt}`;
  
  
  return result;
};

// generating the execution time of the job done
const renderExe = () => {
  if (!jobDetails) {
    return "";
  }
  let { startedAt, completedAt } = jobDetails;
  let result = "";
  
  if (!completedAt || !startedAt) return result;
  const start = moment(startedAt)
  const end = moment(completedAt)
  const exTime = end.diff(start, "seconds", true);
  result +=`Execution Time: ${exTime}s`;
  
  return result;
};

   
 
 
 // creating the functiom for submit button
  const handleSubmit = async () => {
   const payload ={
    language,
    code
   };
   try{
     setJobId("");
     setStatus("");
     setOutput("");
   const {data} =  await axios.post("http://localhost:5000/run", payload);
   console.log(data);
   setJobId(data.jobId);
   
   let intervalId;
 
  intervalId = setInterval(async() =>{
    const {data : dataRes} = await axios.get("http://localhost:5000/status" ,
     {params:{id: data.jobId}}
    );
     const { success , job , error} = dataRes;
     console.log(dataRes);
 
     if(success)
     {
         
      const {status: jobStatus , output: jobOutput} = job;
      setStatus(jobStatus);
      setJobDetails(job);
      if(jobStatus === "pending") return;
      setOutput(jobOutput);
      clearInterval(intervalId);
 
 
 
     }else{
       setStatus("Error: Please Retry!")
      console.error(error);
      clearInterval(intervalId);
      setOutput(error);
 
     }
 
 
    console.log(dataRes);
   } , 1000);
   
 
   }
   catch({response}){
    if(response){
      const errMsg = response.data.err.stderr;
      setOutput(errMsg)
    }
    else{
      window.alert("Error connecting to Server!");
    }
   
   }
  };
  return (
    <div className="Compiler">
      
      <div>
        <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" >
        <Toolbar variant="dense">
          {/* making the dropdown for language */}
        <label>Language</label> 
        <select className={classes.btn}
        value ={language}
        onChange ={
          (e) => {
            let response = window.confirm("WARNING: Switching language will remove your code!");
            if(response){
            setLanguage(e.target.value);
            }
          }
        }
        >
          <option value="cpp">C++</option>
          <option value ="py">Python</option>
        </select>

      {/* button for set default */}
        <button className={classes.btn} onClick={setDefaultLanguage}>Set Default</button>
        {/* button for submit button */}
        <button className={classes.btn} onClick ={handleSubmit}>Submit</button>
          
        </Toolbar>
      </AppBar>
    </Box>
      </div>
      <br />

    {/* textarea to code */}
      
      <div>

      <textarea className ={classes.code}
        
      value ={code}
      onChange = {
        (e) =>{
          setCode(e.target.value);
        }
      }
      ></textarea>
      </div>
      <br/>
      {/* finding the status jobid submission time and execution time */}
      <div className={classes.outputDiv} >
      <p>{status}</p>
      <p>{jobId && `Job ID: ${jobId}`}</p>
      <p>{renderTimeDetails()}</p>
      <p>{renderExe()}</p>
      <p>{output}</p>
      </div>
    </div>
  );
}
 
export default Compiler;
 