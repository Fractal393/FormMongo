var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var Comment = require("../models/comment");

//EDIT COMMENT
router.get("/blogs/:id/comments/new",isLoggedIn, function(req,res)
{
    Blog.findById(req.params.id, function(err,blog)
    {
        if(err){console.log(err);}
        else{res.render("newcomment.ejs",{blog:blog, currentUser: req.user});}       
    })
});

//POST COMMENT 
router.put("/blogs/:id/comments", function(req,res)
{
    Blog.findById(req.params.id, function(err,blog)
    {
        if(err){console.log(err)
            res.redirect("/blogs")
           }
        else{Comment.create(req.body.comment, function(err,comment)
        {
            if(err){console.log(err);}
            else{ 
                    //adding user id and username to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //saving comment
                    comment.save();
                    blog.comments.push(comment);
                    blog.save();
                    req.flash("success","Comment posted!");
                    res.redirect("/blogs/"+blog.id);
                }
        })}    
    })
})

//EDIT COMMENT ROUTE
router.get("/blogs/:id/comments/:comment_id/edit",checkCommentOwnership,function(req,res)
{
    Comment.findById(req.params.comment_id, function(err, comment)
    {
        if(err){res.redirect("/blogs")}
        else{
            res.render("editcomment.ejs",{blog_id:req.params.id,comment:comment});}
    })
});    

//POST EDITED COMMENT ROUTE
router.put("/blogs/:id/comments/:comment_id",checkCommentOwnership,function(req,res)
{
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,comment)
    {
        if(err){res.redirect("/blogs");}
        else{ req.flash("success","Comment successfully edited!");
            res.redirect("/blogs/"+req.params.id)        
        ;}
    })
    
})

//DELETE COMMENT ROUTE
router.delete ("/blogs/:id/comments/:comment_id",checkCommentOwnership,function(req,res)
{ 
    Comment.findByIdAndRemove(req.params.comment_id,function(err,comment)
    {
        if(err){res.redirect("/blogs");}
        else{req.flash("success","Comment deleted!");
            res.redirect("/blogs/"+req.params.id);}
    })
    
})

//Middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
    }
    req.flash("error", "Please Login First!")
	res.redirect("/login");
}

//COMMENT MIDDLEWARE 
function checkCommentOwnership(req,res,next)
{
    if(req.isAuthenticated())
    {
        Comment.findById(req.params.comment_id,function(err,blog)
        {
            if(err){res.redirect("/blogs")}
            else
            {
                if(blog.author.id.equals(req.user._id))
                {
                    next();
                }
                else
                {
                    res.redirect("/blogs");
                }
            }
        })
    }
    else
    {
        res.redirect("/blogs");
    }
}

module.exports = router;