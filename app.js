const express = require('express'),
  serverless = require('serverless-http'),
  app = express(),
  passport = require('passport'),
  bodyParser = require('body-parser'),
  path = require('path'),
  mongoose = require('mongoose'),
  Comment = require('./models/comment'),
  Campground = require('./models/campground'),
  User = require('./models/user'),
  seedDB = require('./seeds'),
  session = require('express-session'),
  flash = require('connect-flash'),
  methodOverride = require('method-override'),
  expressSanitizer = require('express-sanitizer'),
  LocalStrategy = require('passport-local'),
  passportLocalMongoose = require('passport-local-mongoose');

const commentRoutes = require('./routes/comments'),
  campgroundRoutes = require('./routes/campgrounds'),
  indexRoutes = require('./routes/index');

const PORT = process.env.PORT || 3000,
  DB_URL = process.env.DATABASE_URL;

async function connectToMongoDb() {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    // attach connection result to global object
    global.isConnectedToMongo = true;

    console.log('connected to mongodb :)');
    return true;
  } catch (err) {
    console.error('Error: could not connect to MongoDB.', err.message);
    return false;
  }
}

//Seed the database.
//seedDB();

// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(expressSanitizer());
app.use(flash());
app.locals.moment = require('moment');

//Configure PASSPORT
app.use(
  session({
    secret: 'Kiara is the best and cutest baby in the world!',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to make Current User details available on every route/ejs file.
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
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

app.get('*', (req, res) => {
  res.status(404).send('Sorry, page not found! Error Code: 404');
});

// app.listen(PORT, process.env.IP, () => console.log("YelpCamp server has started!"));

// Wrap the express app in serverless for AWS Lambda deployment
const handler = serverless(app);
module.exports.handler = async (event, context) => {
  // connect to MongoDB first
  if (!global.isConnectedToMongo) {
    const isConnected = await connectToMongoDb();

    if (!isConnected) {
      return {
        statusCode: 500,
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
        isBase64Encoded: false,
        body: '<h2>Database Connection Error!</h2>',
      };
    }
  }

  const result = await handler(event, context);
  return result;
};
