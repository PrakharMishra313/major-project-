const express = require("express");
const app = express();
const router = express.Router({mergeParams:true});
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("../major_project/utils/wrapAsync.js");
const expressError = require("../major_project/utils/expressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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