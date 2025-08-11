const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async(req, res) => {
    let listing = await Listing.findById(req.params.id);          //Recall why we used req.params.id instead of req.params
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);                             //Note amra push puro review tai korchi but save just otar id ta hbe

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Added!");  //Flash message
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});     //$pull - It pulls out(removes) all the instances of a value/values from an array that match a specified condition 
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");  //Flash message
    res.redirect(`/listings/${id}`);
};