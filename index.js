// import des packages
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // va chercher mes variables dans mon '.env'
const cloudinary = require("cloudinary").v2;

const app = express(); // création du serveur
const port = 3000; // port utilisé pour faire tourner le serveur

app.use(express.json()); // permet de lire les 'body' dans les requêtes

mongoose.connect("mongodb://localhost:27017/vinted"); // connexion/création de la BDD

// configuration de 'cloudinary'
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// import des routes
const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");
const offersRouter = require("./routes/offers");

// chargement des routes
app.use(userRouter);
app.use(offerRouter);
app.use(offersRouter);

// gestion des mauvaises routes requêtées
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// lancement du serveur sur le port indiqué en amont
app.listen(port, () => {
  console.log("Server has started 👕");
});
