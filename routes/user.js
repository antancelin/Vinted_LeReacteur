const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

const router = express.Router();

// CRUD

// CREATE => POST (créer un user)
router.post("/user/signup", async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const newsletter = req.body.newsletter;

    const existingEmail = await User.findOne({ email: req.body.email });

    if (!username) {
      return res.status(400).json({ message: "Missed username" });
    }
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exist" });
    }

    const userSalt = uid2(16);
    // console.log(userSalt);

    const userHash = SHA256(password + userSalt).toString(encBase64);
    // console.log(userHash);

    const userToken = uid2(64);

    const newUser = new User({
      email: email,
      account: {
        username: username,
      },
      newsletter: newsletter,
      token: userToken,
      hash: userHash,
      salt: userSalt,
    });

    await newUser.save();

    const userDataToDisplay = await User.findOne(newUser).select(
      "_id token account username"
    );

    res.json(userDataToDisplay);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// CREATE => POST (connexion d'un user)
router.post("/user/login", async (req, res) => {
  try {
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    const actualUser = await User.findOne({ email: userEmail });

    if (!actualUser) {
      return res.status(401).json({ message: "wrong email" });
    }

    const actualUserHash = SHA256(userPassword + actualUser.salt).toString(
      encBase64
    );

    if (actualUserHash !== actualUser.hash) {
      return res.status(401).json({ message: "Wrong password" });
    }

    res.json({
      _id: actualUser._id,
      token: actualUser.token,
      account: actualUser.account,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
