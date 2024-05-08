const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verification");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = "qwerty";

// Route for creating a user (signup)

router.post(
  "/signup",
  [
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("email", "Enter a valid Email Address").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const securedPassword = await bcrypt.hash(req.body.password, salt);

        User.create({
          name: req.body.name,
          email: req.body.email,
          password: securedPassword,
        })
          .then((user) => {
            const authToken = jwt.sign(user.id, JWT_SECRET);
            res.json({ success: true, token: authToken });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ success: false, error: err.message });
          });
      } else {
        return res
          .status(400)
          .json({ success: false, error: "Email Address already exists!" });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// Route for authenticating a user (login)

router.post(
  "/login",
  [
    body("email", "Enter a valid Email Address").isEmail(),
    body("password", "Enter a valid Password").exists(),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email: email });

      if (user) {
        const comparePassword = await bcrypt.compare(password, user.password);
        if (comparePassword) {
          const authToken = jwt.sign(user.id, JWT_SECRET);
          res.json({ success: true, token: authToken });
        } else {
          return res.status(400).json({
            success: false,
            error: "Invalid Email Address or Password!",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid Email Address or Password!",
        });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// Route for getting a user's details

router.post("/user", verifyToken, async (req, res) => {
  try {
    const userID = req.user;
    const user = await User.findById(userID).select("-password");
    res.send(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
