const express    = require("express"),
	  router     = express.Router(),
	  Campground = require("../models/campground"),
	  middleware = require("../middleware");

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
router.post("/campgrounds", middleware.isLoggedIn, (req, res) => {
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
router.get("/campgrounds/new", middleware.isLoggedIn, (req, res) => {
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

//EDIT ROUTE
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	//find campground by id the show it with data loaded.
	Campground.findById(req.params.id, (err, foundCampG) => {
		res.render("campgrounds/edit", {campground: foundCampG});
	});
});

//UPDATE ROUTE
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, (req, res) => {
	//update campground by id. SANITIZE first.
	req.body.campground.name = req.sanitize(req.body.campground.name);
	req.body.campground.description = req.sanitize(req.body.campground.description);
	
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampG) => {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			console.log("SUCCESS: Campground Updated!");
			res.redirect("/campgrounds/" + req.params.id);	
		}
	});
});

//DELETE ROUTE
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, (req, res) => {
	//delete campground by id.
	Campground.findByIdAndDelete(req.params.id, (err, deletedCampG) => {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			console.log("SUCCESS: Campground Deleted!");
			res.redirect("/campgrounds");	
		}
	});
});


module.exports = router;