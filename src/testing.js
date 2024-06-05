const { exec: execCallback } = require("child_process");
const util = require("util");

const exec = util.promisify(execCallback);

let accessPointOn = false;

async function turnOnAccessPoint() {
  if (accessPointOn) return;
  accessPointOn = true;
  try {
    console.log("Turning on access point...");
    await exec("sudo service dhcpcd stop");
    await exec("sudo service NetworkManager start");
    // execSync(
    //   "sudo nmcli device wifi hotspot ifname wlan0 con-name UTK_Converter ssid RPI_Zero password RPI012345"
    // );
    const { error, stdout, stderr } = await exec(
      "sudo nmcli device connect wlan0"
    );
    console.log(stdout.toString());
  } catch (error) {
    console.error("Error turning on access point:", error);
    const err = await exec("sudo systemctl restart NetworkManager");
    console.log(err.toString());
  }
}

async function turnOffAccessPoint() {
  accessPointOn = false;
  try {
    console.log("Turning off access point...");
    // execSync("sudo nmcli connection down UTK_Converter");
    const { error, stdout, stderr } = await exec(
      "sudo nmcli device disconnect wlan0"
    );
    await exec("sudo service NetworkManager stop");
    await exec("sudo service dhcpcd start");
    console.log(stdout.toString());
  } catch (err) {
    console.error("Error turning off access point:", err);
    const { error, stdout, stderr } = await exec(
      "sudo systemctl restart dhcpcd"
    );
    console.log(stdout.toString());
  }
}

async function testing() {
  await turnOnAccessPoint();
  await turnOffAccessPoint();
}

testing();
