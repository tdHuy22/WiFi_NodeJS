const { execSync } = require("child_process");

function turnOnAccessPoint() {
  try {
    console.log("Turning on access point...");
    execSync("sudo service dhcpcd stop");
    execSync("sudo service NetworkManager start");
    // execSync(
    //   "sudo nmcli device wifi hotspot ifname wlan0 con-name UTK_Converter ssid RPI_Zero password RPI012345"
    // );
    const stdout = execSync("sudo nmcli device connect wlan0");
    console.log(stdout.toString());
  } catch (error) {
    console.error("Error turning on access point:", error);
    execSync("sudo systemctl restart NetworkManager");
    const stdoutErr = execSync("sudo nmcli device connect wlan0");
    console.log(stdout.toString());
  }
}

function turnOffAccessPoint() {
  try {
    console.log("Turning off access point...");
    // execSync("sudo nmcli connection down UTK_Converter");
    execSync("sudo nmcli device disconnect wlan0");
    execSync("sudo service NetworkManager stop");
    const stdout = execSync("sudo service dhcpcd start");
    console.log(stdout.toString());
  } catch (error) {
    console.error("Error turning off access point:", error);
    execSync("sudo systemctl restart dhcpcd");
  }
}

module.exports = { turnOnAccessPoint, turnOffAccessPoint };
