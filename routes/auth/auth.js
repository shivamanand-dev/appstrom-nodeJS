const express = require("express");
const router = express.Router();
const User = require("../../models/auth/User");
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const getUser = require("../../middleware/getUser");
const multer = require("multer");
const sharp = require("sharp");

const JWT_Secret = process.env.JWT_Secret;

// SIGN UP
router.post(
  "/signup",
  //   Validators
  [
    body("email", "Enter correct email").isEmail(),
    body("username", "Username must be min 5 char").isLength({ min: 5 }),
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
      } = {
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        promocode: req.body.username,
        appliedPromocode: req.body.appliedPromocode,
        openningBalance: req.body.openningBalance,
      };

      //   Find user with same userName and email
      let user = await User.findOne({ email: email });
      let availUsername = await User.findOne({ username: username });

      //   If same usernaem or email is Present give 404
      if (user && availUsername) {
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
  [
    body("username", "Username must be min 5 char").isLength({ min: 5 }),
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

      //   Destructure request body
      //   const { username, password } = req.body;

      //   Find User for the requested username
      let user = await User.findOne({ username: req.body.username });
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
      res.json({ success, authToken });
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

// Profile Pic Upload
// const upload = multer({
//   limits: {
//     fileSize: 3000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       return cb(new Error("Please upload images in png, jpg or jpeg"));
//     }

//     // cb(new Error("File must be pdf"));
//     cb(undefined, true);
//     // cb(undefined, false);
//   },
// });

router.put("/avatar", getUser, async (req, res) => {
  try {
    const avatar = {
      avatar: req.files.avatar,
    };

    // const userId = req.user.id;
    // const user = await User.findById(userId).select("-password");

    let savedImage = await User.findByIdAndUpdate(req.params.id, {
      $set: avatar,
      new: true,
    });
    res.status(200).send(savedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

module.exports = router;
