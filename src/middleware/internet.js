const { turnOnAccessPoint } = require("./accessPoint");
const { exec: execCallback } = require("child_process");
const util = require("util");

const exec = util.promisify(execCallback);

async function checkInternetConnection() {
  try {
    const { stdout } = await exec("ping -c 1 8.8.8.8");
    console.log(stdout.toString());
    return true;
  } catch (error) {
    return false;
  }
}

async function getIpAddress() {
  try {
    const ip = await exec("hostname -I");
    const result = ip.stdout.toString().split(" ")[0];
    return result;
  } catch (error) {
    console.error("Error getting IP address:", error);
  }
}

async function readWPAConfig() {
  try {
    const result = await exec(
      "sudo cat /etc/wpa_supplicant/wpa_supplicant.conf"
    );
    const wpaConfig = result.stdout.toString();
    const WPA_List = wpaConfig
      .match(/ssid="(.*?)"/g)
      .map((ssid) => ssid.replace("ssid=", "").replace(/"/g, ""));
    console.log(WPA_List);
    return WPA_List;
  } catch (error) {
    console.error("Error reading WPA configuration:", error);
    return [];
  }
}

async function scanForWiFiNetworks() {
  try {
    const result = await exec("sudo iwlist wlan0 scan");
    const output = result.stdout.toString();

    // Find all SSIDs in the output
    const ssidMatches = output.match(/ESSID:"(.*?)"/g);

    // Check if ssidMatches is not null or undefined before calling map
    if (ssidMatches) {
      return ssidMatches.map((ssid) => {
        return ssid.replace("ESSID:", "").replace(/"/g, "");
      });
    } else {
      console.error("No networks found");
      return [];
    }
  } catch (error) {
    console.error("Error scanning for Wi-Fi networks:", error);
  }
}

let checkInterval = null;

function startInternetCheck() {
  if (checkInterval !== null) return; // If it's already running, do nothing

  checkInterval = setInterval(() => {
    if (!checkInternetConnection()) {
      console.log("Internet disconnected. Stopping checks.");
      clearInterval(checkInterval);
      checkInterval = null;
      turnOnAccessPoint();
    } else {
      console.log("Internet connected. Running checks.");
      // exec(
      //   "chromium-browser --kiosk --enable-browser-cloud-management https://192.168.1.5:8000/screen"
      // );
    }
  }, 60000); // Check every 60 seconds
}

function resumeInternetCheck() {
  if (checkInterval === null && checkInternetConnection()) {
    console.log("Internet reconnected. Resuming checks.");
    startInternetCheck();
  }
}

// Replace the export statement with the new functions
module.exports = {
  checkInternetConnection,
  scanForWiFiNetworks,
  readWPAConfig,
  getIpAddress,
  startInternetCheck,
  resumeInternetCheck,
};
