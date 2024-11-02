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
        owner: req.user,
      });

      // envoi de l'image dans 'cloudinary', dans un dossiers 'offers', lui même placé dans un dossier 'vinted'
      const sentPicture = await cloudinary.uploader.upload(convertedPicture, {
        folder: `vinted/offers/${newOffer._id}`,
      });

      newOffer.product_image = sentPicture;

      await newOffer.save(); // envoi de la nouvelle offre complète en base de données (MongoDB)

      // création de la variable permettant d'afficher les informations souhaitées dans la réponse
      const dataToDisplay = await Offer.findOne({ _id: newOffer._id }).populate(
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

// READ => GET (lire les infos du annonces en fonction de son 'id')
router.get("/offer/:id", isAuthenticated, async (req, res) => {
  try {
    const offerId = req.params.id;

    const offerToDisplay = await Offer.find({ _id: offerId }).populate("owner");

    res.json(offerToDisplay);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE => PUT (modifier une annonce si elle appartient à son créateur)
router.put("/offer/:id", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.params.id); // id offer : 6726a986ad3d66ad3f011f43
    // console.log(req.user._id.toString()); // id user : 6726a89fad3d66ad3f011f40

    const offerToUpdate = await Offer.findOne({ _id: req.params.id });
    // console.log(offerToUpdate); // get offer
    // console.log(offerToUpdate.owner.toString()); // id user link to offer : 6726a89fad3d66ad3f011f40

    if (req.user._id.toString() !== offerToUpdate.owner.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.json({
      message: "Ok ✅",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
