const Listing = require("../models/listing.js");
const axios = require("axios");
const opencage = require('opencage-api-client');


module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {    //The /new route must be before the /:id route otherwise "new" will be treared as an id
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate : {path : "author"}}).populate("owner");   //Using populate() to display the complete review and not just its _id
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");  //Flash message
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async(req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const geoData = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
            q: req.body.listing.location,
            key: process.env.OPENCAGE_KEY
        }
    });
    const coordinates = geoData.data.results[0]?.geometry;

    const newListing = new Listing(req.body.listing);   //Search "Line 53 Explanation on GPT"
    newListing.owner = req.user._id;   //req.user stores the info about current user in the session and then we store the user's ._id into the listing's owner
    newListing.image = { url, filename };  //Listing Schema r image field er modhhe url and filename ta store korachhi 

    newListing.geometry = {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
    };

    let savedListing = await newListing.save();
    req.flash("success", "New Listing Created!");  //Flash message
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");  //Flash message
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250"); //This two lines are to display image in edit form but in lower quality.

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) => {
    // let { id } = req.params;
    // await Listing.findByIdAndUpdate(id, {...req.body.listing});    //understand

    // if(typeof req.file != "undefined") {     //This condition is to check whether we've uploaded any file while editing the form or not.
    //     let url = req.file.path;
    //     let filename = req.file.filename;
    //     listing.image = { url, filename };  
    //     await listing.save();                  //Doing the whole thing because req.body.listing er modhhe file ta thakbe na, its's on cloudinary.
    // }

    // req.flash("success", "Listing Updated!");  //Flash message
    // res.redirect(`/listings/${id}`);



    
    let { id } = req.params;
    
    // First, get the existing listing to compare locations
    const existingListing = await Listing.findById(id);
    
    let updatedData = { ...req.body.listing };
    
    // Check if location has changed or if it's a new location
    const newLocation = req.body.listing.location;
    const oldLocation = existingListing.location;
    
    // If location is provided and different from existing, geocode it
    if (newLocation && newLocation.trim() !== "" && newLocation !== oldLocation) {
        try {
            const geoData = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                params: {
                    q: newLocation,
                    key: process.env.OPENCAGE_KEY
                }
            });
            
            if (geoData.data.results && geoData.data.results.length > 0) {
                const coordinates = geoData.data.results[0].geometry;
                updatedData.geometry = {
                    type: "Point",
                    coordinates: [coordinates.lng, coordinates.lat]
                };
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            req.flash("error", "Could not update location. Please try again.");
            return res.redirect(`/listings/${id}/edit`);
        }
    } else if (!newLocation || newLocation.trim() === "") {
        // If no location provided, keep the old location and geometry
        updatedData.location = existingListing.location;
        updatedData.geometry = existingListing.geometry;
    }
    // If location is the same as before, geometry remains unchanged automatically
    
    // Handle image update if provided
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedData.image = { url, filename };
    }
    
    await Listing.findByIdAndUpdate(id, updatedData);
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");  //Flash message
    res.redirect("/listings");
};