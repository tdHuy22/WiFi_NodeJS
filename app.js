const express = require("express");
const { exec, execSync } = require("child_process");
const path = require("path");
const {
  continuousInternetCheck,
  checkInternetConnection,
} = require("./src/middleware/internet");
const router = require("./src/route/route");

const app = express();
const PORT = 5050;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "/src/public")));

app.set("view engine", "ejs");

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  if (checkInternetConnection()) {
    console.log("Internet is connected.");
    exec("chromium-browser --kiosk https://192.168.1.5:8000");
  } else {
    turnOnAccessPoint();
  }

  continuousInternetCheck();
});
