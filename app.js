//Requiring Everything Needed
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");                //Used Ejs-Mate For Templating
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");              //Learn why this was exported via de-sturucturing
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//Creating a Connection with DataBase
main().then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

//Defining The Main Function
async function main() {
    await mongoose.connect(MONGO_URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//Home Route
app.get("/", (req, res) => {
    res.send("Hi, I'm root");
});



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



//Index Route
app.get("/listings", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {    //The /new route must be before the /:id route otherwise "new" will be treared as an id
    res.render("listings/new.ejs");
});


//Show Route
app.get("/listings/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");   //Using populate() to display the complete review and not just its _id
    res.render("listings/show.ejs", { listing });
}));

//Create Route (POST) 
app.post("/listings", validateListing, wrapAsync(async(req, res, next) => {
    const newListing = new Listing(req.body.listing);   //Search "Line 53 Explanation on GPT"
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});    //understand
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//Reviews Route (POST)
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);          //Recall why we used req.params.id instead of req.params
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);                             //Note amra push puro review tai korchi but save just otar id ta hbe

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//DELETE Reviews Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});     //$pull - It pulls out(removes) all the instances of a value/values from an array that match a specified condition 
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));





// //Test Listing to add a Sample Listing
// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By The Hills",
//         price : 1200,
//         location : "Calangute, Goa",
//         country : "India"
//     });

//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful Testing");
// });



app.all("/*notFound", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});


//Error Handling MiddleWare
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!"} = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});