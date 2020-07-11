var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
const { model } = require("../models/user");

//MAIN ROUTE
router.get("/",function(req,res){
    res.redirect("/blogs");
});

//Auth Routes
//show sign up forms
router.get("/register", function(req, res){
	res.render("register");
})
//Handling user sign ups
router.post("/register", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if(err){
			req.flash("error",err.message);
			res.redirect("/register");
		}
			passport.authenticate("local")(req, res, function(){
			req.flash("succcess", "Welcome to Blog site" + user.username);
			res.redirect("/blogs");
		})
	})
})

//LOGIN
//Render login form
router.get("/login", function(req, res){
	res.render("login");
})

//LOGIN LOGIC
router.post("/login",passport.authenticate("local",{
	successRedirect: "/",
	failureRedirect: "/login"
}) ,function(req, res){
	req.flash("succcess", "Welcome back" + user.username);
})

//LOGOUT ROUTE
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success","Logged you out!");
	res.redirect("/blogs");
})

//MIDDLEWARE TO CHECK IS USER IS LOGGED IN
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please Login First!")
	res.redirect("/login");
}

module.exports = router;