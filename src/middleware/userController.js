const { exec, execSync } = require("child_process");
const {
  checkInternetConnection,
  scanForWiFiNetworks,
  readWPAConfig,
  resumeInternetCheck,
} = require("./internet");

function userIndex(req, res) {
  const WiFi_List = scanForWiFiNetworks();
  res.render("index", { WiFi_List });
}

function userScan(req, res) {
  res.redirect("/");
}

function userConnect(req, res) {
  const WPA_List = readWPAConfig();
  const selectedWifi = req.body.wifi;
  const password = req.body.password;
  turnOffAccessPoint();

  try {
    let networkId = WPA_List.indexOf(selectedWifi);
    if (networkId === -1) {
      let addNetworkOutput = execSync(
        "sudo wpa_cli -i wlan0 add_network"
      ).toString();
      networkId = addNetworkOutput.trim();
      execSync(
        `sudo wpa_cli -i wlan0 set_network ${networkId} ssid '"${selectedWifi}"'`
      );
      execSync(
        `sudo wpa_cli -i wlan0 set_network ${networkId} psk '"${password}"'`
      );
    } else {
      execSync(
        `sudo wpa_cli -i wlan0 set_network ${networkId} psk '"${password}"'`
      );
    }
    execSync(`sudo wpa_cli -i wlan0 enable_network ${networkId}`);
    execSync("sudo wpa_cli -i wlan0 save_config");
  } catch (error) {
    console.error("Error connecting to Wi-Fi network:", error);
    turnOnAccessPoint();
    return res.redirect("/");
  }

  setTimeout(() => {
    if (checkInternetConnection()) {
      console.log("Internet is connected.");
      exec(
        "chromium-browser --kiosk --enable-browser-cloud-management https://192.168.1.5:8000/screen"
      );
      resumeInternetCheck();
      res.send("Internet is connected");
    } else {
      console.log(
        "Failed to connect to the internet. Re-enabling access point."
      );
      turnOnAccessPoint();
      res.redirect("/");
    }
  }, 10000); // Wait 10 seconds for the connection to be established
}

module.exports = {
  userIndex,
  userScan,
  userConnect,
};
