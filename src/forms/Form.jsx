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
    backgroundColor: "rgba(0, 0, 0, 0.14) !important",
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
}));

function speakText(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Speech synthesis not supported in this browser.");
  }
}

const audio = new Audio("whip-afro-dancehall-music-110235.mp3");

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

  console.log(formikRef);

  const totalSeconds = hour * 60 * 60 + minutes * 60 + seconds;
  const cycleDuration = Number(setDuration) + Number(breakDuration);
  const elapsedInCycle = totalSeconds % cycleDuration;
  const [pausedTime, setPausedTime] = useState(0);

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
    if (elapsedInCycle === 0 && totalSeconds !== 0) {
      speakText(`Set ${Math.floor(totalSeconds / cycleDuration)} completed!`);
    }

    if (cycleDuration * noOfSets * noOfRounds === totalSeconds)
      speakText("Workout is complete");
  }, [elapsedInCycle, totalSeconds, cycleDuration]);

  useEffect(() => {
    if (noOfRounds * noOfSets * cycleDuration === totalSeconds) {
      if (formikRef.current) {
        resetWatch(formikRef.current);
      }
    }
  }, [totalSeconds, noOfSets, cycleDuration]);

  useEffect(() => {
    return () => clearInterval(intervalId);
  }, [intervalId]);

  const resetWatch = (formik) => {
    stopAudio();
    setWatchRunning(false);
    clearInterval(intervalId);
    setSeconds(0);
    setMinutes(0);
    setHour(0);
    formik?.resetForm(); // Reset form
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
              marginBottom: 10,
              marginTop: 0,
            }}
          >
            🤾🏽 Time To Train 🏋🏃🏽‍♀️
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
                    sx={{ width: "180px" }}
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
                    >
                      {startButtonText}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
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
                          bgcolor: "#c7c7c7",
                          color:
                            elapsedInCycle <= setDuration ? "green" : "red",
                        }}
                      >
                        {i < 10 ? `0${i}` : i}
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
