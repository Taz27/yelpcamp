const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

app.use(express.static("public"));
//app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var campgrounds = [
		{name: "Salmon Creek", image: "/images/dino-camp.jpg"},
		{name: "Granite Hill", image: "/images/kevin-camp.jpg"},
		{name: "Mountain Goat's Rest", image: "https://live.staticflickr.com/3714/20071979298_976c54bf23_z.jpg"},
		{name: "Salmon Creek", image: "/images/dino-camp.jpg"},
		{name: "Granite Hill", image: "/images/kevin-camp.jpg"},
		{name: "Mountain Goat's Rest", image: "https://live.staticflickr.com/3714/20071979298_976c54bf23_z.jpg"},
		{name: "Salmon Creek", image: "/images/dino-camp.jpg"},
		{name: "Granite Hill", image: "/images/kevin-camp.jpg"},
		{name: "Mountain Goat's Rest", image: "https://live.staticflickr.com/3714/20071979298_976c54bf23_z.jpg"},
	];

app.get("/", (req, res) => {
	// console.log(__dirname);
	// console.log(process.cwd());
	res.render("landing");
});

app.get("/campgrounds", (req, res) => {
	//get route.
	res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", (req, res) => {
	//post route.
	var name = req.body.name;
	var image = req.body.image;
	var newCampGround = {name: name, image: image};
	campgrounds.push(newCampGround);
	res.redirect("/campgrounds");
});

app.get("/campgrounds/new", (req, res) => {
	//get 'add new' form.
	res.render("new");
});

app.get("*", (req, res) => {
	res.status(404).send("Sorry, page not found! Error Code: 404");
});

app.listen(3000, () => console.log("YelpCamp server has started!"));