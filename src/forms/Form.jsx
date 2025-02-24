import { useEffect, useState, useRef } from "react";
import { Formik, Form } from "formik";
import { makeStyles } from "@mui/styles";
import {
  Button,
  Card,
  TextField,
  Box,
  Typography,
  MenuItem,
} from "@mui/material";
import * as Yup from "yup";


const useStyles = makeStyles(() => ({
  card: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    height: "82vh",
    width: "100vw",
    paddingTop: "100px",
    backgroundColor: "black!important",
    color: "white",
  },
  inputFieldsWrapper: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
  },
  buttonsWrapper: {
    display: "flex",
    margin: "20px",
    gap: 5,
    pt: "20px !important",
    justifyContent: "center",
  },
  typographyWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
  inputFields: {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "orange",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "white !important", 
    },
    "& .MuiInputLabel-root": {
      color: "white",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "white !important",
    },
    "& .MuiSelect-outlined": {
      borderColor: "orange",
    },

    "& .MuiInputBase-root":{
      backgroundColor:'black',
      color:'white'
    }
  },
  startButton:{
    "&.MuiButton-contained.Mui-disabled":{
      backgroundColor:'grey',
    }
  }
  
}));

function speakText(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.volume = 1.0; 
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Speech synthesis not supported in this browser.");
  }
}

const audio = new Audio("whip-afro-dancehall-music-110235.mp3");
audio.volume = 0.1

let isPaused = false;

const playAudio = () => {
  if (isPaused) {
    audio.play();
  } else {
    audio.currentTime = 0;
    audio.play();
  }
  isPaused = false;
};

const pauseAudio = () => {
  if (!audio.paused) {
    audio.pause();
    isPaused = true;
  }
};

const stopAudio = () => {
  audio.pause();
  audio.currentTime = 0;
  isPaused = false;
};

const WorkoutForm = () => {
  const classes = useStyles();
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hour, setHour] = useState(0);
  const [intervalId, setIntervalId] = useState(0);
  const [isWatchRunning, setWatchRunning] = useState(false);
  const [startButtonText, setStartButtonText] = useState("Start");
  const [{ noOfRounds, noOfSets, setDuration, breakDuration }, setInputData] =
    useState({
      noOfRounds: 1,
      noOfSets: 1,
      setDuration: 0,
      breakDuration: 0,
    });
  const formikRef = useRef(null);

  const totalSeconds = hour * 60 * 60 + minutes * 60 + seconds;
  const cycleDuration = Number(setDuration) + Number(breakDuration);
  const elapsedInCycle = totalSeconds % cycleDuration;
  const [pausedTime, setPausedTime] = useState(0);
  const [hasSpokenBreak, setHasSpokenBreak] = useState(false);

  const handleStartWatch = () => {
    playAudio();
    if (!isWatchRunning) {
      setWatchRunning(true);
      setStartButtonText("Pause");

      let totalSeconds = pausedTime;

      if (intervalId) clearInterval(intervalId);

      const id = setInterval(() => {
        totalSeconds += 1;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setHour(hours);
        setMinutes(minutes);
        setSeconds(seconds);
      }, 1000);

      setIntervalId(id);
    }
  };

  const pauseWatch = () => {
    pauseAudio();
    setStartButtonText("Resume");
    setWatchRunning(false);
    clearInterval(intervalId);
    setPausedTime(hour * 3600 + minutes * 60 + seconds);
  };


  useEffect(() => {
    if (elapsedInCycle >= setDuration && !hasSpokenBreak) {
      speakText(`time for ${breakDuration} seconds break`);
      setHasSpokenBreak(true);
    } else if (elapsedInCycle < setDuration) {
      setHasSpokenBreak(false);
    }
  
    if (elapsedInCycle === 0 && totalSeconds !== 0 && !hasSpokenBreak) {
      speakText(`Set ${Math.floor(totalSeconds / cycleDuration)} complete!`);
      speakText("Break is over");
      setHasSpokenBreak(false);
    }
  

    if (totalSeconds === cycleDuration * noOfSets * noOfRounds) {
      speakText("Workout is complete");
      
      if (formikRef.current) {
        resetWatch(formikRef.current);
      }
    }
  }, [elapsedInCycle, totalSeconds, cycleDuration, noOfRounds, noOfSets, setDuration, hasSpokenBreak]);
  
  
  useEffect(() => {
    return () => clearInterval(intervalId);
  }, []);
  
  
  const resetWatch = (formik) => {
    stopAudio();
    setWatchRunning(false);
    clearInterval(intervalId);
    setSeconds(0);
    setMinutes(0);
    setHour(0);
    formik?.resetForm(); 
    setStartButtonText("Start");
  };

  return (
    <Card className={classes.card}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: "50px",
              fontWeight: "bold",
              marginBottom: 5,
              marginTop: -10,
              color:'white'
            }}
          >
            🤾🏽 Time To Train 🏃🏽‍♀️
          </Typography>
        </Box>
        <Formik
          innerRef={formikRef}
          initialValues={{
            noOfRounds: 1,
            noOfSets: 1,
            setDuration: 0,
            breakDuration: 0,
          }}
          validationSchema={Yup.object({
            noOfRounds: Yup.number().required("Required"),
            noOfSets: Yup.number().required("Required"),
            setDuration: Yup.number().required("Required"),
            breakDuration: Yup.number().required("Required"),
          })}
          onSubmit={(values) => {
            setInputData(() => ({
              ...values,
            }));
          }}
        >
          {(formik) => {
            return (
              <Form>
                <Box className={classes.inputFieldsWrapper}>
                  <TextField
                    id="noOfRounds"
                    label="Number of Rounds"
                    variant="outlined"
                    select
                    autoFocus
                    {...formik.getFieldProps("noOfRounds")}
                    error={
                      formik.touched.noOfRounds && !!formik.errors.noOfRounds
                    }
                    helperText={
                      formik.touched.noOfRounds && formik.errors.noOfRounds
                    }
                    className={classes.inputFields}
                    sx={{width:"180px"}}
                    
                  >
                    {Array.from({ length: 5 }, (_, index) => {
                      return (
                        <MenuItem key={index} value={index + 1}>
                          {index + 1}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                  <TextField
                    id="noOfSets"
                    label="Number of Sets"
                    variant="outlined"
                    select
                    autoFocus
                    {...formik.getFieldProps("noOfSets")}
                    error={formik.touched.noOfSets && !!formik.errors.noOfSets}
                    helperText={
                      formik.touched.noOfSets && formik.errors.noOfSets
                    }
                    className={classes.inputFields}
                    sx={{ width: "180px" }}
                  >
                    {Array.from({ length: 30 }, (_, index) => {
                      return (
                        <MenuItem key={index} value={index + 1}>
                          {index + 1}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                  <TextField
                    id="setDuration"
                    label="Duration for set (in sec)"
                    variant="outlined"
                    {...formik.getFieldProps("setDuration")}
                    error={
                      formik.touched.setDuration && !!formik.errors.setDuration
                    }
                    helperText={
                      formik.touched.setDuration && formik.errors.setDuration
                    }
                    className={classes.inputFields}
                  />
                  <TextField
                    id="breakDuration"
                    label="Duration for break(in sec)"
                    variant="outlined"
                    {...formik.getFieldProps("breakDuration")}
                    error={
                      formik.touched.breakDuration &&
                      !!formik.errors.breakDuration
                    }
                    helperText={
                      formik.touched.breakDuration &&
                      formik.errors.breakDuration
                    }
                    className={classes.inputFields}
                  />
                </Box>
                <Box className={classes.buttonsWrapper}>
                  {!isWatchRunning ? (
                    <Button
                      type="submit"
                      variant="contained"
                      color={startButtonText === "Resume" ? "info" : "success"}
                      size="large"
                      sx={{ borderRadius: "20px" }}
                      disabled={!formik.dirty}
                      onClick={handleStartWatch}
                      className={classes.startButton}
                    >
                      {startButtonText}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      color="warning"
                      size="large"
                      sx={{ borderRadius: "20px" }}
                      disabled={!formik.dirty}
                      onClick={pauseWatch}
                    >
                      Pause
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => resetWatch(formik)}
                    size="large"
                    sx={{ borderRadius: "20px" }}
                  >
                    Reset
                  </Button>
                </Box>
                <Box className={classes.typographyWrapper}>
                  <Typography
                    variant="h1"
                    sx={{ display: "flex", fontWeight: "bold", gap: 1 }}
                  >
                    {[hour, minutes, seconds].map((i, index) => (
                      <Card
                        key={i + index}
                        sx={{
                          padding: 2,
                          bgcolor: "black",
                          boxShadow: "0px 1px 11px 0px rgb(239 114 27 / 49%)",
                          color:
                            elapsedInCycle <= setDuration ? "green" : "red",
                        }}
                      >
                        <Typography variant="h1" sx={{fontWeight: 'bold', fontSize: '10rem' }} >{i < 10 ? `0${i}` : i}</Typography>
                      </Card>
                    ))}
                  </Typography>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Card>
  );
};

export default WorkoutForm;
