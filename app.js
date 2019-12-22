const express = require("express"),
	  app = express(),
	  passport = require("passport"),
	  bodyParser = require("body-parser"),
	  path = require("path"),
	  mongoose = require("mongoose"),
	  Comment = require("./models/comment"),
	  Campground = require("./models/campground"),
	  User = require("./models/user"),
	  seedDB = require("./seeds"),
      LocalStrategy = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose");

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
app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
	//render add comment form.
	Campground.findById(req.params.id, (err, foundCampG) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: foundCampG});
		}
	});
});

app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
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

//============
// AUTH ROUTES
//============

//show sign up form
app.get("/register", (req, res) => {
   res.render("register"); 
});

//register route
//sign up logic!
app.post("/register", (req, res) => {
	//get the username from request and create new user using User model.
	var newUser = new User({username: req.body.username});
	//execute User.register method provided by 'passport-local-mongoose' lib.
	//pass the password as an argument rather than in the User object.
	//it will create SALT and HASH properties and add to user document rather than saving the password.
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			return res.redirect("/register");
		}
		//authenticate the user by executing passport.authenticate method by 'passport.js' package 
		//using the 'authenticate' method provided by 'passport-local-mongoose' plug-in on User model.
		//and LOG IN.
		passport.authenticate("local")(req, res, () => {
			//After loggin in the user and starting the session by attaching passport object containing
			//user ID or name to req.session (req.session.passport = {user: 'userid/name'}) which is SERIALIZING
			//and also getting user details (inlc. SALT and HASH) from DB and attaching the user object to request
			//(req.user) which is DESERIALIZING.
			
			//console.log(req.session);
			//console.log(user);
			res.redirect("/campgrounds"); //show campgrounds after log in.
		});
	});
});

//LOGIN ROUTE
//show login form.
app.get("/login", (req, res) => {
	res.render("login");
});

//login logic
//use 'passport.authenticate' method as a MIDDLEWARE which will run before callback by express.
//provide "local" and options object as parameters. it will use the 'User.authenticate' method
//as set above in LocalStrategy object of 'passport-local' lib. It will authenticate the user 
//(by checking if password matches with details in the DB. It will first generate the original password using
//SALT (which is a random key added to plain text password before hashing) and 
//HASH (encrypted password (hash value (eg MD5 or SHA) of plain text password + salt )) from the DB 
//and check if it matches with entered password)
//then on success, redirect to show campgrounds and on failure, redirect to login page.
app.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}), (req, res) => {});

//log out
//just use the logout method attached to req (request) object.
app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
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

app.get("*", (req, res) => {
	res.status(404).send("Sorry, page not found! Error Code: 404");
});

app.listen(3000, () => console.log("YelpCamp server has started!"));