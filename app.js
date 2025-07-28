  // if (process.env.NODE_ENV !== "production") {
  //   require("dotenv").config();
  // }

  // const express = require("express");
  // const mongoose = require("mongoose");
  // const ejsMate = require("ejs-mate");
  // const path = require("path");
  // const methodOverride = require("method-override");
  // const session = require("express-session");
  // const ExpressError = require("./utils/ExpressError");
  // const listingsRouter = require("./routes/listing");
  // const reviewsRouter = require("./routes/review");
  // const userRouter = require("./routes/user");
  // const flash = require("connect-flash");
  // const passport = require("passport");
  // const LocalStrategy = require("passport-local");
  // const User = require("./models/user");

  // const app = express();

  // // Mongoose connection
  // main().catch((err) => console.log(err));
  // async function main() {
  //   await mongoose.connect(process.env.ATLASDB_URL);
  //   console.log("DB Connected");
  // }

  // // Template engine setup
  // app.engine("ejs", ejsMate);
  // app.set("view engine", "ejs");
  // app.set("views", path.join(__dirname, "views"));

  // // Middlewares
  // app.use(express.urlencoded({ extended: true }));
  // app.use(methodOverride("_method"));
  // app.use(express.static(path.join(__dirname, "public")));

  // const sessionOptions = {
  //   secret: "keyboard cat",
  //   resave: false,
  //   saveUninitialized: true,
  //   cookie: {
  //     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  //     maxAge: 7 * 24 * 60 * 60 * 1000,
  //     httpOnly: true,
  //   },
  // };

  // app.use(session(sessionOptions));
  // app.use(flash());

  // // Passport configuration
  // app.use(passport.initialize());
  // app.use(passport.session());
  // passport.use(new LocalStrategy(User.authenticate()));

  // passport.serializeUser(User.serializeUser());
  // passport.deserializeUser(User.deserializeUser());

  // // Flash messages & user middleware
  // app.use((req, res, next) => {
  //   res.locals.success = req.flash("success");
  //   res.locals.error = req.flash("error");
  //   res.locals.currUser = req.user;
  //   next();
  // });

  // app.get("/", (req, res) => {
  //   res.render("listings/index"); // make sure views/home.ejs exists
  // });

  // // Routes
  // app.use("/listings", listingsRouter);
  // app.use("/listings/:id/reviews", reviewsRouter);
  // app.use("/", userRouter);

  // // Error handler for unknown routes
  // app.all("*", (req, res, next) => {
  //   next(new ExpressError(404, "Page Not Found!"));
  // });

  // // General error handler
  // app.use((err, req, res, next) => {
  //   let { statusCode = 500, message = "Something went wrong!" } = err;
  //   res.status(statusCode).render("error", { message });
  // });

  // app.listen(8080, () => {
  //   console.log("Server is listening on port 8080");
  // });
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user");

const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");

const app = express();

// MongoDB connection
async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
  console.log("DB Connected");
}
main().catch((err) => console.log(err));

// View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


const sessionOptions = {
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(session(sessionOptions));
app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and current user setup
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
// Routes
app.use("/listings", listingsRouter); // ✅ valid route
app.use("/listings/:id/reviews", reviewsRouter); // ✅ valid nested route
app.use("/", userRouter); // ✅ user auth routes

// Home page
app.get("/", (req, res) => {
  res.render("listings/index");
});

// 404 handler
app.all(/.*/, (req,res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { message });
});

// Start Server
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});