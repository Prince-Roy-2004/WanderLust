const express = require("express");
const router = express.Router();     //Using express Router
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer  = require('multer');           //Requiring Multer to accept files/images from frontend (From).
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });   //Specifing the location where the files/images will be stored.




//Index and Create Route
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));  //upload.single - learn from GPT

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show, Update and Delete Route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;          //router is an object and router.get, router.post etc are its methods