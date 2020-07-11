//THIS HAS THE BLOG SCHEMA

const mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    blogimage: String,
    body: String,
    theme: String,
    created: {type: Date, default: Date.now},
    author:
            {
                id:
                    {   
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User"
                    },
                username: String
            },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
              ]
});

module.exports = mongoose.model("Blog",blogSchema);