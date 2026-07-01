const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/", transactionController.getTransactions);
router.get("/:id", transactionController.getTransactionById);
router.post("/", transactionController.createTransaction);

module.exports = router;
