const express = require("express");
const router = express.Router();     //Using express Router
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");


//Listing Schema Validation
const validateListing = (req, res, next) => {                              //Validating Schema using Joi, Pt. 1-c last 2 videos
    let { error } = listingSchema.validate(req.body); 
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}



//Index Route
router.get("/", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {    //The /new route must be before the /:id route otherwise "new" will be treared as an id
    res.render("listings/new.ejs");
});


//Show Route
router.get("/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");   //Using populate() to display the complete review and not just its _id
    res.render("listings/show.ejs", { listing });
}));

//Create Route (POST) 
router.post("/", validateListing, wrapAsync(async(req, res, next) => {
    const newListing = new Listing(req.body.listing);   //Search "Line 53 Explanation on GPT"
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", validateListing, wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});    //understand
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


module.exports = router;          //router is an object and router.get, router.post etc are its methods