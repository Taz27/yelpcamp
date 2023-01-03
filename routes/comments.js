const express    = require("express"),
	  router     = express.Router({mergeParams: true}),
      Comment    = require("../models/comment"),
	  Campground = require("../models/campground"),
	  middleware = require("../middleware");
//--------------
//Comments Routes
//--------------
//NEW FORM route
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, (req, res) => {
	//render add comment form.
	Campground.findById(req.params.id, (err, foundCampG) => {
		if (err || !foundCampG) {
			console.log(err);
			req.flash("error", "Campground not found!");
            res.redirect("back");
		} else {
			res.render("comments/new", {campground: foundCampG});
		}
	});
});

//CREATE route
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, (req, res) => {
	//find campground by ID. Create new comment. Connect it to Campground then redirect.
	Campground.findById(req.params.id, (err, foundCampG) => {
		if (err || !foundCampG) {
			console.log(err);
			req.flash("error", "Something went wrong!");
			res.redirect("/dev/campgrounds");
		} else {
			Comment.create(req.body.comment, (err, comment) => {
				if (err) {
					console.log(err);
				} else {
					//add user ID and name to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					
					foundCampG.comments.push(comment);
					foundCampG.save();
					console.log("SUCCESS: comment added to CG")
					req.flash("success", "Successfully added comment!");
					res.redirect(`/dev/campgrounds/${foundCampG._id}`);
				}
			});
		}
	});
});

//EDIT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	//find comments by id the show edit form it with data loaded.
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		res.render("comments/edit", { campground_id: req.params.id, comment: foundComment });
	});
});

//UPDATE COMMENT ROUTE
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	//update comment by id. SANITIZE first.
	req.body.comment.text = req.sanitize(req.body.comment.text);
	
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if (err) {
			res.redirect("back");
		} else {
			console.log("SUCCESS: Comment Updated!");
			res.redirect("/dev/campgrounds/" + req.params.id);	
		}
	});
});

//DELETE COMMENT ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	//delete comment by id.
	Comment.findByIdAndDelete(req.params.comment_id, (err, deletedComment) => {
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment Deleted!");
			console.log("SUCCESS: Comment Deleted!");
			res.redirect("/dev/campgrounds/"  + req.params.id);	
		}
	});
});

module.exports = router;