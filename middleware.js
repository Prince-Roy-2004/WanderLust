const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req, res, next) => {

    if(!req.isAuthenticated()) {  //Checks whether the user whose info is being saved for this session is authendicated (Logged In) or not
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveRedirectUrl = (req, res, next) => {          //Session vs Local variable on GPT or Lec - 57, 5th video
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

//When an user wants to create or edit a listing, we redirect them to login if they're not logged in, otherwise we allow them to do that.
//But after they log in, they used to get redirected to the /listings page, but they should be redirected to the page where they left.
//So to do that we did this. "req.originalUrl" stores the exact path where the user made the req to go (like clicked on create new 
//listing, so this /newlisting route would be stored it). Now we store that value into "req.session.redirectUrl", because we're storing
//the value into the session object inside the req object so that the value remains for that particular session not only for that 
//"/newListing" request. Then we create another middleware where we store that value into "res.locals.redirectUrl" because passport
//resets the session after a new request is made but locals keeps them safe and are also accessible everywhere.
//For clear explanation - GPT.

module.exports.isOwner = async(req, res, next) => {       //This middleware is defined so that no one from hoppscotch can send request to /edit/listings to directly edit without authorization
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You have no permission to edit or delete this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


//Listing Schema Validation
module.exports.validateListing = (req, res, next) => {                              //Validating Schema using Joi, Pt. 1-c last 2 videos
    let { error } = listingSchema.validate(req.body); 
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}

//Review Schema Validation
module.exports.validateReview = (req, res, next) => {                              
    let { error } = reviewSchema.validate(req.body); 
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {       
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You have no permission to delete this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
