const express = require("express");
const router = express.Router({mergeParams : true});           //({mergeParams : true}) is used to use "req.params", (know more from GPT)
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/review.js");



//Reviews Route (POST)
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//DELETE Reviews Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;