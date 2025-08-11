const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/user.js");

//GET and POST Signup 
router.route("/signup")
.get(userController.renderSignupForm )
.post(wrapAsync(userController.signup));


//GET and POST Login
router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", { failureRedirect : "/login", failureFlash : true }), userController.login);
//saveRedirectUrl middleware is used above to redirect the user that same page from where they were redirected to the login page.

//Logout 
router.get("/logout", userController.logout);

module.exports = router;