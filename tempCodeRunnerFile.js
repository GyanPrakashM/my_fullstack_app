const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//  Connect to MongoDB
main()
  .then(() => console.log(" Connected to DB"))
  .catch((err) => console.log("DB Error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

//  Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

//  Session + Flash Config
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//  Flash Middleware (important!)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
 res.locals.currUser = req.user;

  next();
});

// app.get("/demouser",async(req,res) =>{
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"delta-student"
//   });

//  let registerUser =  await User.register(fakeUser,"helloworld");
//  res.send(registerUser);
// });


//  Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//  Home route
app.get("/", (req, res) => {
  res.send("🏠 Home Page");
});

//  Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

//  Server start
app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
