const { exec: execCallback } = require("child_process");
const util = require("util");
const exec = util.promisify(execCallback);

let accessPointOn = false;

async function turnOnAccessPoint() {
  if (accessPointOn) return;
  accessPointOn = true;
  try {
    console.log("Turning on access point...");
    await exec("sudo service NetworkManager start");
    // execSync(
    //   "sudo nmcli device wifi hotspot ifname wlan0 con-name UTK_Converter ssid RPI_Zero password RPI012345"
    // );
    // const { stdout } = await exec("sudo nmcli device connect wlan0");
    const { stdout } = await exec("sudo nmcli connection up UTK_Converter");
    console.log(stdout.toString());
  } catch (err) {
    console.error("Error turning on access point:", err);
  }
}

async function turnOffAccessPoint() {
  accessPointOn = false;
  try {
    console.log("Turning off access point...");
    await exec("sudo service dhcpcd start");
  } catch (err) {
    console.error("Error turning off access point:", err);
  }
}

module.exports = { turnOnAccessPoint, turnOffAccessPoint };
