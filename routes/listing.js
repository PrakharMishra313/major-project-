const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedin, isOwner, validateListings } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

// Routes

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(validateListings, wrapAsync(listingController.createListing));

// Render form to create a new listing
router.get("/new", isLoggedin, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListings))
  .put(isLoggedin, isOwner, wrapAsync(listingController.updateListing))
  .delete(isLoggedin, isOwner, wrapAsync(listingController.destroyListing));

// Render form to edit a listing
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;