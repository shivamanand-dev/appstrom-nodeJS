const express = require("express");
const router = express.Router();
const { contactmail } = require("../accounts/email");

router.post("/contact", async (req, res) => {
  try {
    const { email, message } = req.body;
    contactmail(email, message);
    res.json(req.body);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

module.exports = router;
