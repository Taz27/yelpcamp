const express    = require("express"),
	  router     = express.Router({mergeParams: true}),
      Comment    = require("../models/comment"),
	  Campground = require("../models/campground");
//--------------
//Comments Routes
//--------------
//NEW FORM route
router.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
	//render add comment form.
	Campground.findById(req.params.id, (err, foundCampG) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: foundCampG});
		}
	});
});

//CREATE route
router.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
	//find campground by ID. Create new comment. Connect it to Campground then redirect.
	Campground.findById(req.params.id, (err, foundCampG) => {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
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
					res.redirect(`/campgrounds/${foundCampG._id}`);
				}
			});
		}
	});
});


//own middleware function
function isLoggedIn(req, res, next) {
	//check if user is logged in
	//if yes, run the callback function of route (which is next)
	//else redirect to login page.
	if (req.isAuthenticated()) {
        next();
    } else {
		res.redirect("/login");
	}
		
}

module.exports = router;