const { execSync } = require("child_process");

function checkInternetConnection() {
  try {
    execSync("ping -c 1 8.8.8.8");
    return true;
  } catch (error) {
    return false;
  }
}

function scanForWiFiNetworks() {
  try {
    let scanOutput = execSync("sudo iwlist wlan0 scan").toString();
    const WiFi_List = scanOutput
      .match(/ESSID:"(.*?)"/g)
      .map((ssid) => ssid.replace("ESSID:", "").replace(/"/g, ""));
    return WiFi_List;
  } catch (error) {
    console.error("Error scanning for Wi-Fi networks:", error);
  }
}

function continuousInternetCheck() {
  setInterval(() => {
    if (!checkInternetConnection()) {
      turnOnAccessPoint();
    } else {
      turnOffAccessPoint();
    }
  }, 60000); // Check every 60 seconds
}

export {
  checkInternetConnection,
  scanForWiFiNetworks,
  continuousInternetCheck,
};
