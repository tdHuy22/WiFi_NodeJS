const express = require("express");
const {
  checkInternetConnection,
  getIpAddress,
} = require("./src/middleware/internet");
const { turnOnAccessPoint } = require("./src/middleware/accessPoint");
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

app.use("/", router);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.send("Something went wrong!");
});

async function main() {
  await initDevice();
  const hostname = await getIpAddress();
  startExpress(hostname, PORT);
}

async function initDevice() {
  const isInternetConnected = await checkInternetConnection();
  if (!isInternetConnected) {
    await turnOnAccessPoint();
  }
}

function startExpress(hostname, PORT) {
  app.listen(PORT, hostname, () => {
    console.log(`Server is running on http://${hostname}:${PORT}`);
  });
}

main();
