const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.json({
    message: "SIPO Backend API is running",
  });
});

module.exports = router;
