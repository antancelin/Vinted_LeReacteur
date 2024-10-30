// import des packages
const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

// import des fonctions utiles
const convertToBase64 = require("../utils/convertToBase64");

// import des middlewares
const isAuthenticated = require("../middleware/isAuthenticated");

// import du modèle
const Offer = require("../models/Offer");

// utilisation du 'Router'
const router = express.Router();

// CREATE => POST (création d'une annonce)
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const convertedPicture = convertToBase64(req.files.picture); // conversion de l'image grâce à la fonction 'convertToBase64(file)'

      // envoi de l'image dans 'cloudinary', dans un dossiers 'offers', lui même placé dans un dossier 'vinted'
      const sentPicture = await cloudinary.uploader.upload(convertedPicture, {
        folder: "vinted/offers",
      });

      // création de la nouvelle offre à enregistrer en base de données (MongoDB)
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
        product_image: sentPicture, // envoi de l'objet de l'image, venant de 'cloudinary'
        owner: req.user,
      });

      await newOffer.save(); // envoi de la nouvelle offre complète en base de données (MongoDB)

      // création de la variable permettant d'afficher les informations souhaitées dans la réponse
      const dataToDisplay = await Offer.find().populate(
        "owner",
        "account username, _id"
      );

      res.status(201).json(dataToDisplay);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
