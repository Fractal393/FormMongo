var express = require("express");
var methodOverride = require("method-override");
var app = express();
var expressSanitizer = require("express-sanitizer");
bodyParser = require("body-parser");
mongoose = require("mongoose");

//CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/blog', {useNewUrlParser: true});
mongoose.connection.on('error', err => {
    logError(err);
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//SCHEMA
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog= mongoose.model("Blog",blogSchema);


//MAIN ROUTE
app.get("/",function(req,res){
    res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs)
    {
        if(err){console.log(err);}
        else{res.render("index.ejs",{blogs:blogs});}
    })   
});

app.get("/blogs/new",function(req,res)
{
    res.render("new.ejs");
});


//CREATE ROUTE
app.post("/blogs",function(req,res)
{
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog,function(err,newBlog)
    {
        if(err){render("new.ejs");}
        else{res.redirect("/blogs");}
    });
});


//SHOW ROUTE
app.get("/blogs/:id",function(req,res)
{
    Blog.findById(req.params.id, function(err,foundBlog)
    {
        if(err){res.redirect("/blogs");}
        else{res.render("show.ejs",{blog: foundBlog});}
    })
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res)
{
    Blog.findById(req.params.id, function(err,foundBlog)
    {
        if(err){res.redirect("/blogs");}
        else{res.render("edit.ejs",{blog: foundBlog});}
    }) 
});

//UPDATE ROUTE  
app.put("/blogs/:id", function(req,res)
{   
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog)
    {
        if(err){res.redirect("/blogs")}
        else{res.redirect("/blogs/"+req.params.id);}
    })
});

//DELETE ROUTE  
app.delete("/blogs/:id", function(req,res)
{
   Blog.findByIdAndRemove(req.params.id, function(err)
   {
       if(err){res.redirect("/blogs");}
       else{res.redirect("/blogs");}
   })
});

//PORT CONNECTION 
let port = 13579;
app.listen(process.env.PORT | port, process.env.IP, function()
{
    console.log("Yelpcamp app has started at localhost:" + port);
});
