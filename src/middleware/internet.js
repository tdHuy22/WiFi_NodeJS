const { turnOnAccessPoint } = require("./accessPoint");
const util = require("util");
const { exec } = util.promisify(require("child_process"));

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
    const wpaConfig = await exec(
      "sudo cat /etc/wpa_supplicant/wpa_supplicant.conf"
    ).toString();
    const WPA_List = wpaConfig.stdout
      .match(/ssid="(.*?)"/g)
      .map((ssid) => ssid.replace("ssid=", "").replace(/"/g, ""));
    return WPA_List;
  } catch (error) {
    console.error("Error reading WPA configuration:", error);
    return [];
  }
}

async function scanForWiFiNetworks() {
  try {
    let scanOutput = await exec("sudo iwlist wlan0 scan").toString();
    const WiFi_List = scanOutput
      .match(/ESSID:"(.*?)"/g)
      .map((ssid) => ssid.replace("ESSID:", "").replace(/"/g, ""));
    return WiFi_List;
  } catch (error) {
    console.error("Error scanning for Wi-Fi networks:", error);
    return [];
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
      exec(
        "chromium-browser --kiosk --enable-browser-cloud-management https://192.168.1.5:8000/screen"
      );
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
