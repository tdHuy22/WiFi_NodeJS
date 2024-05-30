const { execSync } = require("child_process");

function turnOnAccessPoint() {
  try {
    console.log("Turning on access point...");
    execSync("sudo systemctl stop dhcpcd");
    execSync("sudo systemctl start NetworkManager");
    execSync(
      "sudo nmcli device wifi hotspot ifname wlan0 con-name UTK_Converter ssid RPI_Zero password RPI012345"
    );
  } catch (error) {
    console.error("Error turning on access point:", error);
  }
}

function turnOffAccessPoint() {
  try {
    console.log("Turning off access point...");
    execSync("sudo nmcli connection down UTK_Converter");
    execSync("sudo systemctl stop NetworkManager");
    execSync("sudo systemctl start dhcpcd");
  } catch (error) {
    console.error("Error turning off access point:", error);
  }
}

export { turnOnAccessPoint, turnOffAccessPoint };
