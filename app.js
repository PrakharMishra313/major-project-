const express = require("express");
const app = express();
const router = express.Router({mergeParams:true});
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const wrapAsync = require("../major_project/utils/wrapAsync.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
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

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
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

app.use("/listings" , listings);
app.use("/listings/:id/reviews",reviews)

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