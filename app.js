var express = require("express");
var methodOverride = require("method-override");
var app = express();
var expressSanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({dest: "uploads/"});
var mongoose = require("mongoose");
var flash = require("connect-flash");
var Blog = require("./models/blog");
var Comment = require("./models/comment");
const blog = require("./models/blog");
var passport = require("passport");
var User = require("./models/user");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

var commentRoutes = require("./routes/comments.js"),
    blogRoutes = require("./routes/blogs"),
    authRoutes = require("./routes/auth")

    var port = process.env.PORT;
    var uristring = process.env.MONGODB_URI;
    
    //CONNECTION TO DB
    mongoose.connect(uristring, function (err, res) {
        if (err) { 
          console.log ('ERROR connecting to: ' + uristring + '. ' + err);
        } else {
          console.log ('Succeeded connected to: ' + uristring);
        }
      });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
	secret: "Sports page",
	resave: false,
	saveUninitialized: false 
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next)
{
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success")
    next();
})

app.use(blogRoutes);
app.use(commentRoutes);
app.use(authRoutes);

//PORT CONNECTION 

app.listen(port, function()
{
    console.log(" app has started at localhost:" + port);
});
