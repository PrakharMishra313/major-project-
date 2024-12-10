const { response } = require("express");
const Listing = require("./models/listing");
const { listingSchema, reviewSchema} = require("./schema.js");
const expressError = require("./utils/expressError.js");

module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.orignalUrl; 
        req.flash("error","You must be logged in to create listing!");
        res.redirect("/login");
    };
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.local.redirectUrl = req.session.redirectUrl;
    };
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    if (!listing.owner || !res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListings = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(",");
      throw new expressError(404, errMsg);
    } else {
      next();
    }
  };

  
//review validation
module.exports.validReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        console.log(error)
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new expressError(400, errMsg);
    }
    else {
        next();
    }
}