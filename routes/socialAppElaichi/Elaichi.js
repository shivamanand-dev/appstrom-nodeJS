const express = require("express");
const getUser = require("../../middleware/getUser");
const Elaichi = require("../../models/socialAppElaichi/Elaichi");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../../models/auth/User");

// Get all Tweets
router.get("/:page", async (req, res) => {
  try {
    const { page } = req.params;

    let skip = page * 10;
    const totalElaichis = await Elaichi.find({ elaichiType: "public" });

    const tweets = await Elaichi.find({ elaichiType: "public" }, null, {
      skip: skip,
    })
      .sort("-time")
      .limit(Number(10));
    // console.log(totalElaichis.length);
    // console.log(page);
    res.json({ totalElaichis: totalElaichis.length, elaichi: tweets });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

// Get Profile Tweets
router.get("/profile/:page", getUser, async (req, res) => {
  try {
    const { page } = req.params;

    let skip = page * 10;
    const totalElaichis = await Elaichi.find({ user: req.user.id });

    const tweets = await Elaichi.find({ user: req.user.id }, null, {
      skip: skip,
    })
      .sort("-time")
      .limit(Number(10));
    // console.log(req.body);
    res.json({ totalElaichis: totalElaichis.length, elaichi: tweets });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

// Create Tweet
router.post(
  "/createpost",
  getUser,
  [body("elaichi", "Tweet must be min 5 char").isLength({ min: 5 })],
  async (req, res) => {
    try {
      // console.log(req.body);
      const { elaichi, elaichiType } = req.body;
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      }

      const user = await User.findById(req.user.id);

      const createElaichi = new Elaichi({
        elaichi,
        elaichiType,
        user: req.user.id,
        username: user.username,
        name: user.name,
      });

      const savedElaichi = await createElaichi.save();
      res.json(savedElaichi);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error occur" });
    }
  }
);

// Update Tweet
router.put("/updatePost/:id", getUser, async (req, res) => {
  try {
    const { elaichiType, followers, following } = req.body;
    const updateTweet = {};

    if (elaichiType) {
      updateTweet.elaichiType = elaichiType;
    }
    if (followers) {
      updateTweet.followers = followers;
    }
    if (following) {
      updateTweet.following = following;
    }

    let elaichi = await Elaichi.findById(req.params.id);
    if (!elaichi) {
      return res.status(400).send({ message: "Elaichi Not Found" });
    }

    if (elaichi.user.toString() !== req.user.id) {
      return res.status(401).send({ message: "Not Allowed" });
    }

    elaichi = await Elaichi.findByIdAndUpdate(req.params.id, {
      $set: updateTweet,
      new: true,
    });

    res.json(elaichi);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

router.delete("/deleteelaichi/:id", getUser, async (req, res) => {
  try {
    let elaichi = await Elaichi.findById(req.params.id);

    if (!elaichi) {
      return res.status(400).send({ message: "Elaichi Not Found" });
    }

    if (elaichi.user.toString() !== req.user.id) {
      return res.status(401).send({ message: "Not Allowed" });
    }

    elaichi = await Elaichi.findByIdAndDelete(req.params.id);

    res.json({ success: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

module.exports = router;
