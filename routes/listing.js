const express = require("express");
const router = express.Router();     //Using express Router
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");



//Index Route
router.get("/", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {    //The /new route must be before the /:id route otherwise "new" will be treared as an id
    res.render("listings/new.ejs");
});


//Show Route
router.get("/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate : {path : "author"}}).populate("owner");   //Using populate() to display the complete review and not just its _id
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");  //Flash message
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

//Create Route (POST) 
router.post("/", isLoggedIn, validateListing, wrapAsync(async(req, res, next) => {
    const newListing = new Listing(req.body.listing);   //Search "Line 53 Explanation on GPT"
    newListing.owner = req.user._id;   //req.user stores the info about current user in the session and then we store the user's ._id into the listing's owner
    await newListing.save();
    req.flash("success", "New Listing Created!");  //Flash message
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");  //Flash message
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});    //understand
    req.flash("success", "Listing Updated!");  //Flash message
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");  //Flash message
    res.redirect("/listings");
}));


module.exports = router;          //router is an object and router.get, router.post etc are its methods