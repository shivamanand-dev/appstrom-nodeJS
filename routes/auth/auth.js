const express = require("express");
const router = express.Router();
const User = require("../../models/auth/User");
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
const Elaichi = require("../../models/socialAppElaichi/Elaichi");
var jwt = require("jsonwebtoken");
const getUser = require("../../middleware/getUser");
const { sendWelcomeEmail } = require("../../accounts/email");

const JWT_Secret = process.env.JWT_Secret;

// SIGN UP
router.post(
  "/signup",
  //   Validators
  [
    body("email", "Enter correct email").isEmail(),
    body("username", "Username must be min 3 char").isLength({ min: 3 }),
    body("password", "Password must be min 7 char").isLength({ min: 7 }),
  ],
  async (req, res) => {
    try {
      let success = false;

      // Validation Check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ success: success, errors: errors.array() });
      }

      //   Destructring request body
      const {
        name,
        email,
        username,
        password,
        promocode,
        appliedPromocode,
        openningBalance,
        location,
        dateOfBirth,
        gender,
      } = {
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        promocode: req.body.username,
        appliedPromocode: req.body.appliedPromocode,
        openningBalance: req.body.openningBalance,
        location: req.body.location,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
      };

      //   Find user with same userName and email
      let user = await User.findOne({ email: email });
      let availUsername = await User.findOne({ username: username });

      sendWelcomeEmail(email, name);
      //   If same usernaem or email is Present give 404
      if (user || availUsername) {
        return res
          .status(400)
          .json({ success: success, error: "sorry, user already registered" });
      }

      //   If username == appliedPromocode
      if (username === appliedPromocode) {
        return res.status(400).json({
          success: success,
          error: "sorry, username aand applied promocode can't be same",
        });
      }

      //   Find user with Promo
      let promoUser = await User.findOne({
        promocode: appliedPromocode,
      });

      //   Function for user who promoted
      if (promoUser) {
        // console.log(`promo ${promoUser.openningBalance}`);
        let promoUserId = promoUser._id;
        let currentBalance = promoUser.openningBalance;
        await User.findByIdAndUpdate(promoUserId, {
          $set: {
            openningBalance: currentBalance + 100,
          },
        });
      }

      //   Hash Password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      //   Else create User
      user = await User.create({
        name,
        email,
        username,
        password: secPass,
        promocode,
        appliedPromocode,
        openningBalance,
        location,
        dateOfBirth,
        gender,
      });

      //   create jwt token
      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_Secret);

      //   Response
      success = true;
      res.json({ success, user, authToken });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error occur" });
    }
  }
);

// LOG IN
router.post(
  "/login",
  [body("password", "Password must be min 7 char").isLength({ min: 7 })],
  async (req, res) => {
    try {
      let success = false;

      // Validation Check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ success: success, errors: errors.array() });
      }

      //   Destructure request body
      const { username } = req.body;

      //   Find User for the requested username
      let user;

      if (username.search("@") === -1) {
        user = await User.findOne({ username: req.body.username });
      } else {
        user = await User.findOne({ email: req.body.username });
      }

      if (!user) {
        return res.status(400).json({
          success: success,
          error: "sorry, login with correct credentials",
        });
      }

      const comparePass = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!comparePass) {
        return res.status(400).json({
          success: success,
          error: "sorry login with correct credentials!",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_Secret);

      success = true;
      res.json({ success, user, authToken });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error occur" });
    }
  }
);

// GET USER
router.get("/getuser", getUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    // console.log(user.avatar, " user");

    // const img = await sharp(user.avatar).toFormat("jpeg").toFile("../img");

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

// Visit Profile
router.get("/profile/:username/:page", getUser, async (req, res) => {
  try {
    const { username, page } = req.params;

    let skip = page * 10;

    const user = await User.findOne({ username: username }).select("-password");
    const totalElaichis = await Elaichi.find({
      username: username,
      elaichiType: "public",
    });
    const elaichi = await Elaichi.find(
      { username: username, elaichiType: "public" },
      null,
      {
        skip: skip,
      }
    )
      .sort("-time")
      .limit(Number(10));
    res.json({ user, totalElaichis: totalElaichis.length, elaichi });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

// Update Follow
router.put("/updateFollower/", getUser, async (req, res) => {
  try {
    let success = false;
    let followStatus = "following";
    let alertStatus = "success";

    const { follower, name } = req.body;
    let updateUserFollower = { followers: [] };
    let updateUserFollowing = { following: [] };

    // Checking is follower id is correct
    let followUser = await User.findOne({ username: req.body.follower });
    if (!followUser) {
      return res.status(400).send({ success, message: "User not found" });
    }

    // if follower User is correct
    let user = await User.findById(req.user.id);

    // following and follower fetching and pushing in arrays
    updateUserFollower.followers = followUser.followers;
    updateUserFollowing.following = user.following;

    // Checking still following or not
    if (
      updateUserFollowing.following.some((e) => {
        return e.follower === follower;
      })
    ) {
      // Checking index and removing from array
      const indexNoFollowing = updateUserFollowing.following.findIndex((e) => {
        return e.follower === follower;
      });
      updateUserFollowing.following.splice(indexNoFollowing, 1);
      // ----
      const indexNoFollower = updateUserFollower.followers.findIndex((e) => {
        return e.following === user.username;
      });
      updateUserFollower.followers.splice(indexNoFollower, 1);

      // Changing status
      followStatus = "not following";
      alertStatus = "warning";
      // console.log(updateUserFollower.followers);
    } else {
      updateUserFollowing.following.push({ follower: follower, name: name });
      updateUserFollower.followers.push({
        following: user.username,
        name: user.name,
      });
    }

    // Saving in DB
    await User.findByIdAndUpdate(followUser._id.toString(), {
      $set: updateUserFollower,
      new: true,
    });
    await User.findByIdAndUpdate(req.user.id, {
      $set: updateUserFollowing,
      new: true,
    });

    //
    success = true;
    res.json({
      success,
      alertStatus,
      message: `Now you are ${followStatus} ${follower}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

module.exports = router;
