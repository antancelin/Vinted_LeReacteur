const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

// CREATE => POST (créer un user)
router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const convertedAvatar = convertToBase64(req.files.avatar);

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const newsletter = req.body.newsletter;

    const existingEmail = await User.findOne({ email: req.body.email });

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing parameters" });
    }
    if (existingEmail) {
      return res.status(409).json({ message: "Email already used" });
    }

    const userSalt = uid2(16);

    const userHash = SHA256(password + userSalt).toString(encBase64);

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

    // // envoi de l'image dans 'cloudinary', dans un dossiers 'offers', lui même placé dans un dossier 'vinted'
    const sentAvatar = await cloudinary.uploader.upload(convertedAvatar, {
      folder: `vinted/users/${newUser._id}`,
    });

    newUser.account.avatar = sentAvatar;

    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
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
      return res.status(400).json({ message: "wrong email or password" });
    }

    const actualUserHash = SHA256(userPassword + actualUser.salt).toString(
      encBase64
    );

    if (actualUserHash !== actualUser.hash) {
      return res.status(400).json({ message: "Wrong email or password" });
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
