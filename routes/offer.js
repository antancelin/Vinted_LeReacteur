// import des packages
const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // va chercher mes variables dans mon '.env'

// import des fonctions utiles
const convertToBase64 = require("../utils/convertToBase64");

// import des middlewares
const isAuthenticated = require("../middleware/isAuthenticated");

// import du modèle
const Offer = require("../models/Offer");
const User = require("../models/User");
// utilisation du 'Router'
const router = express.Router();

// configuration de 'cloudinary'
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// CREATE => POST (création d'une annonce)
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const user = req.user;

      const convertedPicture = convertToBase64(req.files.picture);

      const sentPicture = await cloudinary.uploader.upload(convertedPicture, {
        folder: "vinted/offers",
      });

      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ],
        product_image: sentPicture,
        owner: req.user,
      });

      await newOffer.save();
      const dataToDisplay = await Offer.find().populate(
        "owner",
        "account username, _id"
      );

      res.json(dataToDisplay);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
