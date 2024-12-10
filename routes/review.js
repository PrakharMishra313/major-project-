const express = require("express");
const router = express.Router({ mergeParams: true }); // Add mergeParams
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedin, isOwner, validReview } = require("../middleware.js");
const reviewController = require("../controllers/reviews")

router.post("/",isLoggedin,validReview, wrapAsync(reviewController.createReview));

router.delete("/:reviewId",isLoggedin,isOwner, wrapAsync(reviewController.destroyReview));

module.exports = router;