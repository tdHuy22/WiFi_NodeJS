const express = require("express");
const { exec } = require("child_process");
const {
  startInternetCheck,
  checkInternetConnection,
  getIpAddress,
} = require("./src/middleware/internet");
const { turnOnAccessPoint } = require("./src/middleware/accessPoint");
const path = require("path");
const bodyParser = require("body-parser");
const router = require("./src/route/route");
const { get } = require("http");

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "/src/public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/src/view"));

app.use("/", router);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.send("Something went wrong!");
});

async function main() {
  const internetConnection = await checkInternetConnection();
  if (!internetConnection) {
    await turnOnAccessPoint();
  }
  const hostname = await getIpAddress();
  console.log(`Server is running on http://${hostname}:${PORT}`);
  startInternetCheck();
}

await main();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
