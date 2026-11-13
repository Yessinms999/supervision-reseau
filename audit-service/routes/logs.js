var express = require("express");
var router = express.Router();
const logController = require("../controller/LogController");

router.post("/addlog", logController.addlog);
router.get("/showalllogs", logController.showalllogs);
router.get("/showlog/:id", logController.showlog);
router.delete("/deletelog/:id", logController.deletelog);

router.get("/stats/byservice", logController.statsbyservice);
router.get("/stats/errorsperday", logController.errorsperday);
router.get("/stats/topusers", logController.topusers);

router.delete("/purge", logController.purgeoldlogs);

module.exports = router;