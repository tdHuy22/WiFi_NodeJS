const router = require("express").Router();
const {
  userIndex,
  userScan,
  userConnect,
} = require("../middleware/userController");

router.get("/", userIndex);

router.get("/scan", userScan);

router.post("/connect", userConnect);

module.exports = router;
