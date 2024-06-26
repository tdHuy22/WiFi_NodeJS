const { exec: execCallback } = require("child_process");
const util = require("util");
const exec = util.promisify(execCallback);
const { delay } = require("./delay");
const {
  checkInternetConnection,
  scanForWiFiNetworks,
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
  const selectedWifi = req.body.wifi;
  const password = req.body.password;
  await turnOffAccessPoint();

  try {
    const result = await exec("sudo wpa_cli -i wlan0 add_network");
    const networkId = parseInt(result.stdout.toString());
    await delay(1000);
    await exec(
      `sudo wpa_cli -i wlan0 set_network ${networkId} ssid '"${selectedWifi}"'`
    );
    await delay(1000);
    await exec(
      `sudo wpa_cli -i wlan0 set_network ${networkId} psk '"${password}"'`
    );
    await delay(1000);
    await exec(`sudo wpa_cli -i wlan0 enable_network ${networkId}`);
    await delay(1000);
    await exec("sudo wpa_cli -i wlan0 save_config");
  } catch (error) {
    console.error("Error connecting to Wi-Fi network:", error);
    await turnOnAccessPoint();
    return res.redirect("/");
  }

  setTimeout(async () => {
    const isInternetConnected = await checkInternetConnection();
    if (isInternetConnected) {
      console.log("Internet is connected.");
      // exec(
      //   "chromium-browser --kiosk --enable-browser-cloud-management https://192.168.1.5:8000/screen"
      // );
      // resumeInternetCheck();
      console.log("Internet is connected");
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
