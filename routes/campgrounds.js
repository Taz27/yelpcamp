const express    = require("express"),
	  router     = express.Router(),
	  Campground = require("../models/campground");

//INDEX route
router.get("/campgrounds", (req, res) => {
	//console.log(req.user);
	//find campgrounds in database.
	Campground.find({}, (err, allCampgrounds) => {
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});

//CREATE route
router.post("/campgrounds", isLoggedIn, (req, res) => {
	//post route. Add new CampG in database.
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampGround = {name: name, image: image, description: desc, author: author};
	Campground.create(newCampGround, (err, newlyCreated) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
});

//NEW FORM ROUTE
router.get("/campgrounds/new", isLoggedIn, (req, res) => {
	//get 'add new' form.
	res.render("campgrounds/new");
});

//SHOW ROUTE
router.get("/campgrounds/:id", (req, res) => {
	//find campground by ID and show.
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampG) => {
		if (err) {
			console.log(err);
		} else {
			//console.log(foundCampG);
			res.render("campgrounds/show", {campground: foundCampG});
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