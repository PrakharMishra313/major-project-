const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("../major_project/utils/wrapAsync.js");
const expressError = require("../major_project/utils/expressError.js");
const { listingSchema } = require("./schema.js");

// Fix 1: Ensure navbar.ejs path exists
console.log('Resolved Path:', path.join(__dirname, 'views/includes/navbar.ejs'));

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

// Fix 2: Correct validateListings middleware (error.details, not error.detials)
const validateListings = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(404, errMsg);
  } else {
    next();
  }
};

// Routes
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
}));

app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show", { listing });
}));

app.post("/listings", validateListings, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
}));

app.put("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

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