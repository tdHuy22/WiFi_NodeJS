const express = require("express");
const { exec } = require("child_process");
const {
  startInternetCheck,
  turnOnAccessPoint,
  checkInternetConnection,
  getIpAddress,
} = require("./src/middleware/internet");
const path = require("path");
const bodyParser = require("body-parser");
const router = require("./src/route/route");

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "/src/public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/src/view"));
app.use(express.static(path.join(__dirname, "/src/public")));

app.use("/", router);
app.use((err, res, req, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, getIpAddress(), () => {
  console.log(`Server is running on http://${getIpAddress()}:${PORT}`);
  if (checkInternetConnection()) {
    console.log("Internet is connected.");
    exec(
      "chromium-browser --kiosk --enable-browser-cloud-management https://192.168.1.5:8000/screen"
    );
  } else {
    turnOnAccessPoint();
    startInternetCheck();
  }
});
