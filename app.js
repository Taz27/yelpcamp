const express 	=  require("express"),
	  app 		=  express(),
	  passport 	=  require("passport"),
	  bodyParser = require("body-parser"),
	  path = 	   require("path"),
	  mongoose =   require("mongoose"),
	  Comment =    require("./models/comment"),
	  Campground = require("./models/campground"),
	  User =       require("./models/user"),
	  seedDB =     require("./seeds"),
      LocalStrategy = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose");

const commentRoutes =    require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes =      require("./routes/index");


mongoose.connect("mongodb://localhost/yelp_camp_v3", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
}).then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log(err));

//Seed the database.
//seedDB();

// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//Configure PASSPORT
app.use(require("express-session")({
	secret: "Kiara is the best and cutest baby in the world!",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to make Current User details available on every route/ejs file.
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

//Requiring routes.
app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);

// (async () => {
// 	await Campground.updateOne({name: "Salmon Creek"}, {description: "This is Salmon Creek camp. Another Paradise!"});
// 	await Campground.updateOne({name: "Granite Hill"}, {description: "This is a huge Granite Hill. Just Beautiful!"});
// 	await Campground.updateOne({name: "Mountain Goat's Rest"}, {description: "This is hill that looks like a Goat's resting place."});
// 	await Campground.updateOne({name: "Camp @Beach"}, {description: "This is an amazing camp at heavenly beach!!!"});
// })();

app.get("*", (req, res) => {
	res.status(404).send("Sorry, page not found! Error Code: 404");
});

app.listen(3000, () => console.log("YelpCamp server has started!"));