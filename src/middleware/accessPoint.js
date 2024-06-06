const { exec: execCallback } = require("child_process");
const util = require("util");
const exec = util.promisify(execCallback);
const { delay } = require("./delay").default;

let accessPointOn = false;

async function turnOnAccessPoint() {
  if (accessPointOn) return;
  accessPointOn = true;
  try {
    console.log("Turning on access point...");
    await exec("sudo service NetworkManager start");
    await delay(3000);
    const { stdout } = await exec("sudo nmcli connection up UTK_Converter");
    console.log(stdout.toString());
  } catch (err) {
    console.error("Error turning on access point:", err);
  }
}

async function turnOffAccessPoint() {
  if (!accessPointOn) return;
  accessPointOn = false;
  try {
    console.log("Turning off access point...");
    await exec("sudo service dhcpcd start");
    await delay(2000);
  } catch (err) {
    console.error("Error turning off access point:", err);
  }
}

module.exports = { turnOnAccessPoint, turnOffAccessPoint };
