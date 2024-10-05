const express = require("express");
const mongoose = require("mongoose");
const { generatePDF } = require("./process.js");
const User = require("./models/booksandskills.js"); // Import the User model

const port = 8000;

mongoose.connect("mongodb://127.0.0.1:27017/client", 
  
)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

const app = express();
app.use(express.json());

// POST route to save data and generate PDF
app.post("/jsondata", async (req, res) => {
  const data = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).send("User with this email already exists.");
    }

    // Save user data
    const newUser = new User(data);
    await newUser.save();

    // Generate PDF
    const doc = generatePDF(data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment;filename="Resume.pdf"');
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send("Failed to save user data.");
  }
});

// GET route to retrieve user data and generate PDF
app.get("/jsondata", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send("Query parameter 'email' must be provided.");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("No user found with the provided email");
    }

    const doc = generatePDF(user); // Pass the found user data to generatePDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment;filename="Resume.pdf"');
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Failed to retrieve user data");
  }
});

// PATCH route to update user data
app.patch("/jsondata", async (req, res) => {
  const email = req.query.email;
  const updatedData = req.body;

  if (!email) {
    return res.status(400).send("Query parameter 'email' must be provided.");
  }

  try {
    const user = await User.findOneAndUpdate({ email }, updatedData, { new: true });

    if (!user) {
      return res.status(404).send("No user found with the provided email");
    }

    const doc = generatePDF(user);  // Generate PDF from updated data
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment;filename="Updated_Resume.pdf"');
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).send("Failed to update user data.");
  }
});

// DELETE route to remove user data
app.delete("/jsondata", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send("Query parameter 'email' must be provided.");
  }

  try {
    const result = await User.findOneAndDelete({ email });
    if (!result) {
      return res.status(404).send("No user found with the provided email");
    }

    res.send("User and related records deleted successfully.");
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).send("Failed to delete user data.");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
