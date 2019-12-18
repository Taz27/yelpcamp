const express = require("express"),
	  app = express(),
	  bodyParser = require("body-parser"),
	  path = require("path"),
	  mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

app.use(express.static("public"));
//app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//SETUP Campground Schema
const campgroundSchema = new mongoose.Schema({
	name: String,
	image: String
});

const campground = mongoose.model("Campground", campgroundSchema);

// campground.insertMany([
// 		{name: "Salmon Creek", image: "/images/dino-camp.jpg"},
// 		{name: "Granite Hill", image: "/images/kevin-camp.jpg"},
// 		{name: "Mountain Goat's Rest", image: "https://live.staticflickr.com/3714/20071979298_976c54bf23_z.jpg"}
// ], (err, campgds) => {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log("NEW CAMPGROUNDS ADDED!!");
// 		console.log(campgds);
// 	}
// });

app.get("/", (req, res) => {
	// console.log(__dirname);
	// console.log(process.cwd());
	res.render("landing");
});

app.get("/campgrounds", (req, res) => {
	//find campgrounds in database.
	campground.find({}, (err, campgrounds) => {
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds", {campgrounds: campgrounds});
		}
	});
});

app.post("/campgrounds", (req, res) => {
	//post route.
	var name = req.body.name;
	var image = req.body.image;
	var newCampGround = {name: name, image: image};
	campground.create(newCampGround, (err, newlyCreated) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
});

app.get("/campgrounds/new", (req, res) => {
	//get 'add new' form.
	res.render("new");
});

app.get("*", (req, res) => {
	res.status(404).send("Sorry, page not found! Error Code: 404");
});

app.listen(3000, () => console.log("YelpCamp server has started!"));