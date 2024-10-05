const mongoose = require('mongoose');

// Define the schema for a user
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  skills: [String],
  education: [
    {
      school_name: String,
      logo: String,
      level: String,
      title: String,
      year: String // Changed to String to match your JSON data
    }
  ],
  experiences: [
    {
      company: String,
      company_logo: String,
      position: String, // Fixed typo from "postion" to "position"
      work_year: String,
      duties: [String]
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
