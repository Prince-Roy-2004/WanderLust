//Requiring Everything Needed
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");                //Used Ejs-Mate For Templating
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");              //Learn why this was exported via de-sturucturing
const session = require("express-session");
const flash = require("connect-flash");


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");            //Requiring restructured code



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


const sessionOptions = {
    secret : "ultimatespidermonkey",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};


//Home Route
app.get("/", (req, res) => {
    res.send("Hi, I'm root");
});


app.use(session(sessionOptions));
app.use(flash());                   //Note - This middleware must be declared before the common route middlewares

//Middleware for Flash Message
app.use((req, res, next) => {
    res.locals.success = req.flash("success");  
    res.locals.error = req.flash("error");      
    next();
});

app.use("/listings", listings);           // Here, "/listings" is the common part in all the routes in "listing.js" file and "listings" is the required name from listing.js using module.exports
app.use("/listings/:id/reviews", reviews);


//Random Route Error Handling
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