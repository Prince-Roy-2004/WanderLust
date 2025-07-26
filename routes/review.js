const express = require("express");
const router = express.Router({mergeParams : true});           //({mergeParams : true}) is used to use "req.params", (know more from GPT)
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


//Review Schema Validation
const validateReview = (req, res, next) => {                              
    let { error } = reviewSchema.validate(req.body); 
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}


//Reviews Route (POST)
router.post("/", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);          //Recall why we used req.params.id instead of req.params
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);                             //Note amra push puro review tai korchi but save just otar id ta hbe

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//DELETE Reviews Route
router.delete("/:reviewId", wrapAsync(async(req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});     //$pull - It pulls out(removes) all the instances of a value/values from an array that match a specified condition 
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));


module.exports = router;