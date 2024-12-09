const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Review = require('../models/review');

// Add a review to a listing
router.post('/listings/:id/reviews', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    const { rating, comment } = req.body.review;

    const review = new Review({
      rating,
      comment,
      author: req.user._id,  // Assuming req.user is populated with the logged-in user
    });

    await review.save();

    listing.reviews.push(review._id);  // Add the review's ID to the listing's reviews array
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding review');
  }
});