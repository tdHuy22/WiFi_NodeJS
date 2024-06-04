const { execSync } = require("child_process");

function turnOnAccessPoint() {
  try {
    console.log("Turning on access point...");
    execSync("sudo systemctl stop dhcpcd");
    execSync("sudo systemctl start NetworkManager");
    // execSync(
    //   "sudo nmcli device wifi hotspot ifname wlan0 con-name UTK_Converter ssid RPI_Zero password RPI012345"
    // );
    const stdout = execSync("sudo nmcli device connect wlan0");
    console.log(stdout.toString());
  } catch (error) {
    console.error("Error turning on access point:", error);
    execSync("sudo systemctl restart NetworkManager");
  }
}

function turnOffAccessPoint() {
  try {
    console.log("Turning off access point...");
    // execSync("sudo nmcli connection down UTK_Converter");
    execSync("sudo nmcli device disconnect wlan0");
    execSync("sudo systemctl stop NetworkManager");
    const stdout = execSync("sudo systemctl start dhcpcd");
    console.log(stdout.toString());
  } catch (error) {
    console.error("Error turning off access point:", error);
    execSync("sudo systemctl restart dhcpcd");
  }
}

module.exports = { turnOnAccessPoint, turnOffAccessPoint };
