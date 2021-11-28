import { useEffect } from "react";

import Video from "./components/Video/Video";
import VideoState from "./context/VideoState";
import Compiler from './components/Compiler';
import Options from "./components/options/Options";
import { Typography, AppBar } from '@material-ui/core';
import { useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Grid";
const Home = () => {
  useEffect(() => {
    if (!navigator.onLine) alert("Connect to internet!");
  }, [navigator]);
 
 useEffect(()=>{
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
 }, [])
  return (
    <VideoState>
      <div  style={{ minWidth: "1260px", maxWidth: "2000px" }}>

  <Grid container spacing={2}>

<AppBar  position="static" color="inherit">
  <Typography variant="h2" align="center">Codelab</Typography>
 </AppBar>  

  <Grid item xs={6} >
   <Compiler /> 
  </Grid>

  <Grid sx={{ flexGrow: 3 }} item xs={6}>

  <Video/>
  
  <Options  />
  
  </Grid>
 
</Grid>
      </div>
    </VideoState>
  );
};

export default Home;
