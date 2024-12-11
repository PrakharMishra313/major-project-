if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
};
console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const wrapAsync = require("../major_project/utils/wrapAsync.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { connect } = require("http2");

mongoose.set("strictQuery", true);

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Set up EJS and Views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret : "mysuppersecretcode",
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7*24*60*60*1000,
    maxAge : 7*24*60*60*1000,
    httpOnly : true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Test root route
 app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(404, errMsg);
  } else {
    next();
  }
};

// app.get("/demouser", async(req,res) => {
//   let fakeUser = new User({
//     email : "xyz@123.com",
//     username : "xyz"
//   });

//   let registereduser = await User.register(fakeUser,"helloworld");
//   res.send(registereduser);
// });

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.get("/seed", wrapAsync(async (req, res) => {
  try {
    await Listing.insertMany(listings);
    res.send("Data seeded successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
    res.status(500).send("Failed to seed data");
  }
}));

// Error Handling
app.all("*", (req, res, next) => {
  next(new expressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 505, message = "Something went wrong" } = err;
  res.status(statusCode).render("err", { message });
});

app.listen(3000, () => {
  console.log("Server is listening to port 3000");
});