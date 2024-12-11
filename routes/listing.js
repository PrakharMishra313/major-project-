const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedin, isOwner, validateListings } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

// Routes

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(validateListings,
    isLoggedin,
    upload.single('listing[image]'), 
    wrapAsync(listingController.createListing)
  );

// Render form to create a new listing
router.get("/new", isLoggedin, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListings))
  .put(isLoggedin,
     isOwner,
     upload.single('listing[image]'),
     validateListings,
      wrapAsync(listingController.updateListing)
    )
  .delete(isLoggedin, isOwner, wrapAsync(listingController.destroyListing));

// Render form to edit a listing
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;