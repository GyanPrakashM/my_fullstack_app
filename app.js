if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingsRoutes = require("./routes/listing");
const reviewsRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

const app = express();

const sessionOptions = {
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ✅ ROUTES
app.use("/", userRoutes);
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);

// ✅ Root route - only one
app.get("/", (req, res) => {
  res.redirect("/listings"); // or res.render("home") if you have home.ejs
});

// ❌ Catch-all for unhandled routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error", { err });
});

// ✅ MongoDB connection
main().then(() => console.log("Database connected"))
     .catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL); // Make sure env var is set
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
