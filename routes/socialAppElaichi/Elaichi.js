const express = require("express");
const getUser = require("../../middleware/getUser");
const Elaichi = require("../../models/socialAppElaichi/Elaichi");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../../models/auth/User");

// Get all Tweets
router.get("/", async (req, res) => {
  try {
    const { page } = req.body;
    const tweets = await Elaichi.find({ tweetType: "public" }, null, {
      skip: 0,
    })
      .sort("-time")
      .limit(Number(2));
    console.log(page);
    console.log(tweets.length);
    res.json(tweets);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

// Get Profile Tweets
router.get("/profile", getUser, async (req, res) => {
  try {
    const tweets = await Elaichi.find({ user: req.user.id });
    // console.log(req.body);
    res.json(tweets);
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
    const { tweetType, followers, following } = req.body;
    const updateTweet = {};

    if (tweetType) {
      updateTweet.tweetType = tweetType;
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
