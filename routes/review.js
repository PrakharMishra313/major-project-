const express = require("express");
const router = express.Router({ mergeParams: true }); // Add mergeParams
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedin, isOwner, validateListings } = require("../middleware.js");
const reviewController = require("../controllers/reviews")

router.post("/",isLoggedin,validateListings, wrapAsync(reviewController.createReview));

router.delete("/:reviewId",isLoggedin,isOwner, wrapAsync(reviewController.destroyReview));

module.exports = router;