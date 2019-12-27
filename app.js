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
	  session =    require("express-session"),
	  flash =      require("connect-flash"),
	  methodOverride = require("method-override"),
	  expressSanitizer = require("express-sanitizer"),
      LocalStrategy = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose");

const commentRoutes =    require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes =      require("./routes/index");

const PORT = process.env.PORT || 3000,
	  DB_URL = process.env.DATABASE_URL || "mongodb://localhost/yelp_camp_v12";

//MongoDB ATLAS url (to use at Heroku)
//const DB_URL_ATLAS = "mongodb+srv://taran:Coco1981@cluster-taz-8vczy.mongodb.net/yelp_camp?retryWrites=true&w=majority";

mongoose.connect(DB_URL, {
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
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());
app.locals.moment = require("moment");

//Configure PASSPORT
app.use(session({
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
	res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
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

app.listen(PORT, process.env.IP, () => console.log("YelpCamp server has started!"));
