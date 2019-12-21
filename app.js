const express = require("express"),
	  app = express(),
	  bodyParser = require("body-parser"),
	  path = require("path"),
	  mongoose = require("mongoose"),
	  Comment = require("./models/comment"),
	  Campground = require("./models/campground"),
	  seedDB = require("./seeds");

mongoose.connect("mongodb://localhost/yelp_camp_v3", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

app.use(express.static("public"));
//app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//Seed the database.
//seedDB();

// (async () => {
// 	await Campground.updateOne({name: "Salmon Creek"}, {description: "This is Salmon Creek camp. Another Paradise!"});
// 	await Campground.updateOne({name: "Granite Hill"}, {description: "This is a huge Granite Hill. Just Beautiful!"});
// 	await Campground.updateOne({name: "Mountain Goat's Rest"}, {description: "This is hill that looks like a Goat's resting place."});
// 	await Campground.updateOne({name: "Camp @Beach"}, {description: "This is an amazing camp at heavenly beach!!!"});
// })();

app.get("/", (req, res) => {
	// console.log(__dirname);
	// console.log(process.cwd());
	res.render("landing");
});

app.get("/campgrounds", (req, res) => {
	//find campgrounds in database.
	Campground.find({}, (err, campgrounds) => {
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: campgrounds});
		}
	});
});

app.post("/campgrounds", (req, res) => {
	//post route. Add new CampG in database.
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newCampGround = {name: name, image: image, description: desc};
	Campground.create(newCampGround, (err, newlyCreated) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
});

app.get("/campgrounds/new", (req, res) => {
	//get 'add new' form.
	res.render("campgrounds/new");
});

app.get("/campgrounds/:id", (req, res) => {
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

//--------------
//Comments Routes
//--------------
app.get("/campgrounds/:id/comments/new", (req, res) => {
	//render add comment form.
	Campground.findById(req.params.id, (err, foundCampG) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: foundCampG});
		}
	});
});

app.post("/campgrounds/:id/comments", (req, res) => {
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
					foundCampG.comments.push(comment);
					foundCampG.save();
					console.log("SUCCESS: comment added to CG")
					res.redirect(`/campgrounds/${foundCampG._id}`);
				}
			});
		}
	});
});


app.get("*", (req, res) => {
	res.status(404).send("Sorry, page not found! Error Code: 404");
});

app.listen(3000, () => console.log("YelpCamp server has started!"));