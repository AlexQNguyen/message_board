var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

var server = app.listen(8000, function() {
 console.log("listening on port 8000");
});


//////DataBase ///

mongoose.connect('mongodb://localhost/message_board');
var Schema = mongoose.Schema;
/////Post
var PostSchema =  new mongoose.Schema({
  name : {type: String, required: [true, "Your name needs to be at least 3 character"], minlength: 2},
  message: {type: String, required: [true,"Your post must be at least 6 characters"], minlength: 6 },
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
},  { timestamps: true });
mongoose.model("Post", PostSchema);
var Post = mongoose.model('Post');


////////Comments
var CommentSchema = new mongoose.Schema({
  name : {type: String, required: true, minlength: 3},
  comment:{type: String, required:true, minlength:3 },
  _post: {type: Schema.Types.ObjectId, ref: 'Post'}
}, {timestamps: true });
mongoose.model("Comment", CommentSchema);
var Comment = mongoose.model('Comment');


////// Routes ///
app.get('/', function(req, res) {
  Post.find({}).populate('comments').exec(function(err, posts){
    res.render("index", {post:posts});
  })

})

app.post('/posts', function(req,res){
  var post = new Post();
  post.name = req.body.name;
  post.message = req.body.message;
  post.save(function(err){
    if(err){
      res.render('index', {title: "you have errors", errors: post.errors});
    }
    else{
      res.redirect('/');
    }
  })
})

app.post('/comments/:id', function(req, res){
  Post.findOne({_id:req.params.id }, function(err, post){
    var comment = new Comment({ name : req.body.name, comment : req.body.comment});
    comment._post = post._id;
    comment.save(function(err){

      post.comments.push(comment._id);
      post.save(function(err){
        if(err){
          console.log(err);
        }
        else{
          res.redirect('/');
        }
      });
    });
  });
});
