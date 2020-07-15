var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
const blog = require("../models/blog");
const multer = require("multer");
const upload = multer({dest: "uploads/"});

//HOME ALL BLOGS
router.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs)
    {
        if(err){console.log(err);}
        else{res.render("index.ejs",{blogs:blogs, currentUser: req.user});}
    })   
});

//NEW BLOG 
router.get("/blogs/new",isLoggedIn,function(req,res)
{
    res.render("new.ejs",{currentUser: req.user});
});

//CREATE BLOG
router.post("/blogs",upload.single("blogimage"),isLoggedIn,function(req,res)
{
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog,function(err,blog)
    {   
        
        if(err){render("new.ejs");}
        else{
            blog.author.id = req.user._id;
            blog.author.username = req.user.username;
            blog.save();
            req.flash("success","New blog created!");
            res.redirect("/blogs");
            }
    });
});

//SHOW BLOG 
router.get("/blogs/:id",function(req,res)
{
    Blog.findById(req.params.id).populate('comments').exec(function(err,foundBlog)
    {
        if(err){res.redirect("/blogs");}
        else{res.render("show.ejs",{blog: foundBlog});}
    });
});

//EDIT BLOG
router.get("/blogs/:id/edit",isLoggedIn,function(req,res)
{
    if(req.isAuthenticated)
    {
        Blog.findById(req.params.id, function(err,blog)
        {
            if(err){res.redirect("/blogs");}
            else{
                if(blog.author.id.equals(req.user._id))
                    {
                        res.render("edit.ejs",{blog: blog});
                    }
                else
                {
                    res.send("permission denied")
                }    
                }
        })
    }
    else
        {
            res.redirect("/blogs/"+req.params.id);
        }
});

//UPDATE BLOG 
router.put("/blogs/:id",isLoggedIn, function(req,res)
{   
    if(req.isAuthenticated)
        {
        req.body.blog.body = req.sanitize(req.body.blog.body)
        Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,blog)
        {
            if(err){res.redirect("/blogs")}
            else{
                    if(blog.author.id.equals(req.user._id))
                    {
                        req.flash("success","Blog successfully edited!");
                        res.redirect("/blogs/"+req.params.id);
                    }
                    else
                    {
                        res.send("permission denied")
                    }
                }
        })
        }
    else
    {
        res.redirect("/blogs/"+req.params.id);
    }    
});

//DELETE BLOG
router.delete("/blogs/:id",isLoggedIn, function(req,res)
{
    if(req.isAuthenticated)   
    {
        Blog.findByIdAndRemove(req.params.id, function(err,blog)
        {
            if(err){ console.log(err);
                res.redirect("/blogs");}
            else{
                if(blog.author.id.equals(req.user._id))
                {
                    req.flash("success","Blog deleted!");
                    res.redirect("/blogs");
                }
                else
                {
                    res.send("permission denied")
                }
                }
        })
    }
    else
    {
        res.redirect("/blogs");
    }
});

//Middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
    }
    req.flash("error", "Please Login First!")
	res.redirect("/login");
}

//AUTHERIZATION middleare
function checkBlogOwnership(req,res,next)
{
    if(req.isAuthenticated)
        {
            Blog.findById(req.params.id, function(err,blog)
            {
                if(err){res.redirect("/blogs");}
                else{
                    if(blog.author.id.equals(req.user._id))
                        {
                            res.render("edit.ejs",{blog: blog, currentUser: req.user});
                        }
                    else
                    {
                        res.send("permission denied")
                    }     
                    }
            })
        }
    else
        {
            res.redirect("back");
        }
}

module.exports = router;