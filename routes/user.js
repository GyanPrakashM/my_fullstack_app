const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { route } = require("./listing.js");
const {saveRedirectUrl} = require("../middleware.js");
const userCotroller = require("../controllers/users.js")


//  for signup
router.route("/signup")
    .get(userCotroller.renderSignupform)
    .post(wrapAsync(userCotroller.signup)
);

// for login
router.route("/login")
    .get(userCotroller.renderloginform)
    .post(saveRedirectUrl , passport.authenticate("local" ,{failureRedirect:'/login' , failureFlash : true}) ,userCotroller.Login);


router.get("/logout",userCotroller.logout);

module.exports = router;

