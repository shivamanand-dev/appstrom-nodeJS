const express = require("express");
const getUser = require("../../middleware/getUser");
const router = express.Router();
const Activity = require("../../models/activityTracter/Activity");
const { body, validationResult } = require("express-validator");

router.get("/allActivity", getUser, async (req, res) => {
  try {
    const activity = await Activity.find({ user: req.user.id });
    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

router.post(
  "/addActivity",
  getUser,
  [body("name", "Name must be min 3 char").isLength({ min: 3 })],
  async (req, res) => {
    try {
      const { name, description, forDays, days } = req.body;

      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      }

      const activity = new Activity({
        name,
        description,
        forDays,
        days,
        user: req.user.id,
      });

      const savedActivity = await activity.save();
      res.json(savedActivity);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error occur" });
    }
  }
);

router.put(
  "/updateActivity/:id",
  getUser,
  [body("name", "Name must be min 3 char").isLength({ min: 3 })],
  async (req, res) => {
    try {
      const { name, description, days, isActivityCompeted } = req.body;
      const updatedActivity = {};

      if (name) {
        updatedActivity.name = name;
      }
      if (description) {
        updatedActivity.description = description;
      }
      if (days) {
        updatedActivity.days = days;
      }
      if (isActivityCompeted) {
        updatedActivity.isActivityCompeted = isActivityCompeted;
      }

      let activity = await Activity.findById(req.params.id);
      if (!activity) {
        return res.status(400).send({ message: "Activity Not Found" });
      }
      if (activity.user.toString() !== req.user.id) {
        return res.status(401).send({ message: "Not Allowed" });
      }

      activity = await Activity.findByIdAndUpdate(req.params.id, {
        $set: updatedActivity,
        new: true,
      });

      return res.json(activity);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error occur" });
    }
  }
);

router.delete("/deleteActivity/:id", getUser, async (req, res) => {
  try {
    let activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(400).send({ message: "Not Found" });
    }
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).send({ message: "Not Allowed" });
    }

    activity = await Activity.findByIdAndDelete(req.params.id);
    res.json({ Success: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error occur" });
  }
});

module.exports = router;
