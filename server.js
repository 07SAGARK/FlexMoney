const express = require('express');
const app=express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000; // Change as needed
// const mongoUri = 'mongodb+srv://sagar-admin:Sagar@123@cluster0.u2f9pac.mongodb.net/Demodb';

mongoose.connect('mongodb+srv://sagar-admin:Sagar%40123@cluster0.u2f9pac.mongodb.net/Demodb', {useNewUrlParser: true}, {useUnifiedTopology: true });

const yogaSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  age: Number,
  selectedBatch: String,
});

const YogaParticipant = mongoose.model('YogaParticipant', yogaSchema);


app.use(bodyParser.json());

// Serve the HTML form
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
 
});

// Handle form submissions
app.post('/enroll', async (req, res) => {
  const formData = req.body;

  // Validate age
  if (formData.age < 18 || formData.age > 65) {
    return res.status(400).send('Age must be between 18 and 65');
  }

  try {
    // Check if the email is already enrolled for this month
    const existingParticipant = await YogaParticipant.findOne({
      email: formData.email,
      selectedBatch: { $exists: true },
    });

    if (existingParticipant) {
      return res.status(400).send('You are already enrolled for this month');
    }

    // Save the participant's data
    const newParticipant = new YogaParticipant(formData);

    await newParticipant.save();
    res.send('Enrollment successful');
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (email already exists)
      return res.status(400).send('Email is already registered');
    }
    res.status(500).send('Error saving to database');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
