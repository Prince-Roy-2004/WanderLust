const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async(req, res) => {     //using try - catch so that we do not get redirected to an unknown page...
    try {                                                //..on hitting an error and just only get a flash error message on the same page
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {     //req.login is an inbuilt passport method to login an user automatically as soon as they signup
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust");
            res.redirect("/listings");
        });

    }
    catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect : "/login", failureFlash : true }), async(req, res) => {
    req.flash("success", "Welcome back to WanderLust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});
//saveRedirectUrl middleware is used above to redirect the user that same page from where they were redirected to the login page.


router.get("/logout", (req, res, next) => {
    req.logout((err) => {                      //Its a pre-defined method in passport, uses serialize and deserialize to remove the...
        if(err) {                             //...info of the current user from the session to make them log out 
            return next(err);
        }
        req.flash("success", "You logged out!");
        res.redirect("/listings");
    })
});

module.exports = router;