// const express = require('express');
// const router = express.Router();
const Listing = require('../models/listing');
const Review = require('../models/review');

// Add a review to a listing
module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  
};