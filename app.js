const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("../major_project/utils/wrapAsync.js");
const expressError = require("../major_project/utils/expressError.js");
const {listingSchema} = require("./schema.js");
mongoose.set('strictQuery', true); // or false, depending on your needs

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListings = (req, res, next) => {
  const { error } = listingSchema.validate(req.body); // Assumes listingSchema is a Joi schema or similar
  console.log(error);
  if (error) {
    let errMsg = err.detials.map((el)=> el.message).join(",")
    throw new expressError(404,errMsg);
  } else {
    next();
  }
};

//Index Route
app.get("/listings", wrapAsync(async (req, res, next) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings", validateListings, async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});


//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// Route to seed the data
app.get("/seed", async (req, res) => {
  try {
    // await Listing.deleteMany({}); // Clear existing listings
    await Listing.insertMany(listings); // Insert new listings from data.js
    res.send("Data seeded successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
    res.status(500).send("Failed to seed data");
  }
});

app.all("*",(req,res,next)=>{
  next(new expressError(404,"page not found"));
});

app.get("/debug", (req, res) => {
  res.render("layouts/boilerplate", {});
});

app.use((err,req,res,next)=>{
  let{statusCode=505,message="something went wrong"} = err;
  res.status(statusCode).render("err.ejs",{message});
});

console.log('Resolved Path:', path.join(__dirname, 'views/includes/navbar.ejs'));

const fs = require('fs');
const navbarPath = path.join(__dirname, 'views/includes/navbar.ejs');
console.log("Navbar file exists:", fs.existsSync(navbarPath));  // Should log 'true'


app.listen(3000, () => {
  console.log("server is listening to port 3000");
});