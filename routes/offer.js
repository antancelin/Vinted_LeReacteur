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
      if (req.body.title.length > 50) {
        return res
          .status(400)
          .json({ message: "Title must not exceed 50 characters" });
      }

      if (req.body.description.length > 500) {
        return res
          .status(400)
          .json({ message: "Description must not exceed 500 characters" });
      }

      if (Number(req.body.price) > 10000) {
        return res.status(400).json({ message: "Price must not exceed 10000" });
      }

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
router.put("/offer/:id", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const offerToUpdate = await Offer.findById(req.params.id);

    if (req.user._id.toString() !== offerToUpdate.owner.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // suppression ancienne image
    if (offerToUpdate.product_image && offerToUpdate.product_image.public_id) {
      await cloudinary.uploader.destroy(offerToUpdate.product_image.public_id);
    }

    const convertedPicture = convertToBase64(req.files.picture);

    offerToUpdate.product_name = req.body.title;
    offerToUpdate.product_description = req.body.description;
    offerToUpdate.product_price = req.body.price;
    offerToUpdate.product_details[2]["ÉTAT"] = req.body.condition;
    offerToUpdate.product_details[4]["EMPLACEMENT"] = req.body.city;
    offerToUpdate.product_details[0]["MARQUE"] = req.body.brand;
    offerToUpdate.product_details[1]["TAILLE"] = req.body.size;
    offerToUpdate.product_details[3]["COULEUR"] = req.body.color;

    // envoi de l'image dans 'cloudinary'
    const sentPicture = await cloudinary.uploader.upload(convertedPicture, {
      folder: `vinted/offers/${offerToUpdate._id.toString()}`,
    });

    offerToUpdate.product_image = sentPicture;

    await offerToUpdate.save();

    res.json({
      message: "Item updated",
      offerToUpdate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE => DELETE (supprimer une annonce, uniquement pour le user qui en est l'auteur)
router.delete("/offer/:id", isAuthenticated, async (req, res) => {
  try {
    const offerToDelete = await Offer.findById(req.params.id);

    if (req.user._id.toString() !== offerToDelete.owner.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!offerToDelete) {
      return res.status(404).json({ message: "Event not found" });
    }

    // suppression ancienne image
    if (offerToDelete.product_image && offerToDelete.product_image.public_id) {
      await cloudinary.uploader.destroy(offerToDelete.product_image.public_id);
    }

    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);

    res.json({
      message: "Offer deleted",
      deletedOffer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
