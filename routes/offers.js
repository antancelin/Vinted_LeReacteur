// import des packages
const express = require("express");

// import des middlewares
const isAuthenticated = require("../middleware/isAuthenticated");

// import du modèle 'Offer'
const Offer = require("../models/Offer");

// utilisation du 'Router'
const router = express.Router();

// READ => GET
router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    const filters = {};
    const limit = 3;

    // filtrage
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin || priceMax) {
      filters.product_price = {};
      if (priceMin) {
        filters.product_price.$gte = Number(priceMin);
      }
      if (priceMax) {
        filters.product_price.$lte = Number(priceMax);
      }
    }

    // tri
    const sortOpt = {};
    if (sort === "price-desc") {
      sortOpt.product_price = -1;
    } else if (sort === "price-asc") {
      sortOpt.product_price = 1;
    }

    // page
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * limit;

    // bdd
    const offers = await Offer.find(filters)
      .populate("owner")
      .sort(sortOpt)
      .skip(skip)
      .limit(limit);

    const totalCountOffers = (await Offer.find(filters)).length;

    res.json({
      count: totalCountOffers,
      offers: offers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
