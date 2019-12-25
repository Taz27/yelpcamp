const express    = require("express"),
	  router     = express.Router(),
      passport   = require("passport"),
	  User       = require("../models/user");

router.get("/", (req, res) => {
	// console.log(__dirname);
	// console.log(process.cwd());
	res.render("landing");
});


//============
// AUTH ROUTES
//============

//show sign up form
router.get("/register", (req, res) => {
   res.render("register"); 
});

//register route
//sign up logic!
router.post("/register", (req, res) => {
	//get the username from request and create new user using User model.
	var newUser = new User({username: req.body.username});
	//execute User.register method provided by 'passport-local-mongoose' lib.
	//pass the password as an argument rather than in the User object.
	//it will create SALT and HASH properties and add to user document rather than saving the password.
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			req.flash("error", err.message);
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
			req.flash("success", "Welcome to YelpCamp, " + user.username);
			res.redirect("/campgrounds"); //show campgrounds after log in.
		});
	});
});

//LOGIN ROUTE
//show login form.
router.get("/login", (req, res) => {
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
router.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login",
	failureFlash: true,
	successFlash: "Welcome to YelpCamp!"
}), (req, res) => {});

//log out
//just use the logout method attached to req (request) object.
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "logged you out!");
	res.redirect("/");
});


module.exports = router;