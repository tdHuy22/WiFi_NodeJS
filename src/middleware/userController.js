const util = require("util");
const { exec } = util.promisify(require("child_process"));
const {
  checkInternetConnection,
  scanForWiFiNetworks,
  readWPAConfig,
  resumeInternetCheck,
} = require("./internet");
const { turnOnAccessPoint, turnOffAccessPoint } = require("./accessPoint");

async function userIndex(req, res) {
  const WiFi_List = await scanForWiFiNetworks();
  res.render("index", { WiFi_List });
}

function userScan(req, res) {
  res.redirect("/");
}

async function userConnect(req, res) {
  const WPA_List = await readWPAConfig();
  const selectedWifi = req.body.wifi;
  const password = req.body.password;
  await turnOffAccessPoint();

  try {
    let networkId = WPA_List.indexOf(selectedWifi);
    if (networkId === -1) {
      let addNetworkOutput = await exec(
        "sudo wpa_cli -i wlan0 add_network"
      ).toString();
      networkId = addNetworkOutput.stdout.trim();
      await exec(
        `sudo wpa_cli -i wlan0 set_network ${networkId} ssid '"${selectedWifi}"'`
      );
      await exec(
        `sudo wpa_cli -i wlan0 set_network ${networkId} psk '"${password}"'`
      );
    } else {
      await exec(
        `sudo wpa_cli -i wlan0 set_network ${networkId} psk '"${password}"'`
      );
    }
    await exec(`sudo wpa_cli -i wlan0 enable_network ${networkId}`);
    await exec("sudo wpa_cli -i wlan0 save_config");
  } catch (error) {
    console.error("Error connecting to Wi-Fi network:", error);
    await turnOnAccessPoint();
    return res.redirect("/");
  }

  setTimeout(async () => {
    if (await checkInternetConnection()) {
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
      await turnOnAccessPoint();
      res.redirect("/");
    }
  }, 10000); // Wait 10 seconds for the connection to be established
}

module.exports = {
  userIndex,
  userScan,
  userConnect,
};
