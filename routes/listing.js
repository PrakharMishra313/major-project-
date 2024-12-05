const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const expressError = require("../utils/expressError.js");
const Listing = require("../models/listing.js");
const {isLoggedin} = require("../middleware.js");

const validateListings = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(",");
      throw new expressError(404, errMsg);
    } else {
      next();
    }
  };

// Routes
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  }));
  
router.get("/new", (req, res) => {
    res.render("listings/new");
});
  
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
      req.flash("error","listing is not exited");
      res.redirect("/listings")
    }
    res.render("listings/show", { listing });
}));
  // add listing
  router.post("/", validateListings, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","new listing added");
    res.redirect("/listings");
  }));
  
  // update listing
  router.get("/:id/edit",isLoggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","listing is not exited");
      res.redirect("/listings")
    }
    res.render("listings/edit", { listing });
  }));
  
  router.put("/:id",isLoggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","listing updated");
    res.redirect(`/listings/${id}`);
  }));
  
  // delete
  router.delete("/:id",isLoggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","listing removed");
    res.redirect("/listings");
  }));

module.exports = router;