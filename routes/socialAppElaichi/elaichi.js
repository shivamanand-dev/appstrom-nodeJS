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
  [body("elaichi", "Tweet must be min 1 char").isLength({ min: 1 })],
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

// Delete Elaichi
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

// Update Tweet Likes
router.put("/updatelikes/:id", getUser, async (req, res) => {
  try {
    let success = false;
    let likeStatus = "liked";
    let alertStatus = "success";

    // const { username, name } = req.body;
    let updateTweetLike = { likedBy: [] };

    // Checking is like tweet is present
    let likeElaichi = await Elaichi.findById(req.params.id);
    if (!likeElaichi) {
      return res
        .status(400)
        .send({ success, message: "Not found please try refreshing page" });
    }

    // if liked elaichi is present
    let user = await User.findById(req.user.id);
    // like elaichi pushing in arrays
    updateTweetLike.likedBy = likeElaichi.likedBy;

    // Checking still liking or not
    if (
      updateTweetLike.likedBy.some((e) => {
        return e.username === user.username;
      })
    ) {
      // Checking index and removing from array
      const indexNoLike = updateTweetLike.likedBy.findIndex((e) => {
        return e.username === user.username;
      });
      updateTweetLike.likedBy.splice(indexNoLike, 1);

      // Changing status
      likeStatus = "removed like";
      alertStatus = "warning";

      // If not like then push user to liked by
    } else {
      updateTweetLike.likedBy.push({
        username: user.username,
        name: user.name,
      });
    }

    // Saving in DB
    await Elaichi.findByIdAndUpdate(req.params.id, {
      $set: updateTweetLike,
      new: true,
    });

    //
    success = true;
    res.json({
      success,
      alertStatus,
      message: `You ${likeStatus} successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

// Update Tweet disLikes
router.put("/updatedislikes/:id", getUser, async (req, res) => {
  try {
    let success = false;
    let likeStatus = "disliked";
    let alertStatus = "success";

    // const { username, name } = req.body;
    let updateTweetLike = { likedBy: [] };

    // Checking is like tweet is present
    let likeElaichi = await Elaichi.findById(req.params.id);
    if (!likeElaichi) {
      return res
        .status(400)
        .send({ success, message: "Not found please try refreshing page" });
    }

    // if liked elaichi is present
    let user = await User.findById(req.user.id);
    // like elaichi pushing in arrays
    updateTweetLike.likedBy = likeElaichi.likedBy;

    // Checking still liking or not
    if (
      updateTweetLike.likedBy.some((e) => {
        return e.username === user.username;
      })
    ) {
      // Checking index and removing from array
      const indexNoLike = updateTweetLike.likedBy.findIndex((e) => {
        return e.username === user.username;
      });
      updateTweetLike.likedBy.splice(indexNoLike, 1);

      // Changing status
      likeStatus = "removed like";
      alertStatus = "warning";

      // If not like then push user to liked by
    } else {
      updateTweetLike.likedBy.push({
        username: user.username,
        name: user.name,
      });
    }

    // Saving in DB
    await Elaichi.findByIdAndUpdate(req.params.id, {
      $set: updateTweetLike,
      new: true,
    });

    //
    success = true;
    res.json({
      success,
      alertStatus,
      message: `You ${likeStatus} successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

module.exports = router;
