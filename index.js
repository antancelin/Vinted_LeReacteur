const express = require("express"); // import du package 'express'
const mongoose = require("mongoose"); // import du package 'mongoose'
const fileUpload = require("express-fileupload");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const app = express(); // création du serveur
const port = 3000; // port utilisé pour faire tourner le serveur

app.use(express.json()); // permet de lire les 'body' dans les requêtes

mongoose.connect("mongodb://localhost:27017/vinted"); // connexion/création de la BDD

// import des routes
const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");

// chargement des routes
app.use(userRouter);
app.use(offerRouter);

// gestion des mauvaises routes requêtées
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// lancement du serveur sur le port indiqué en amont
app.listen(port, () => {
  console.log("Server has started 👕");
});
