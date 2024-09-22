const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mime = require('mime-types');
const base64ToFile = require('base64-to-file');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Example user data (hardcoded)
const user = {
  full_name: "john_doe",
  dob: "17091999",
  email: "john@xyz.com",
  roll_number: "ABCD123"
};

// Utility function to extract numbers and alphabets
const extractData = (data) => {
  const numbers = data.filter(item => !isNaN(item));
  const alphabets = data.filter(item => isNaN(item));

  // Get the highest lowercase alphabet
  const lowercaseAlphabets = alphabets.filter(char => char === char.toLowerCase());
  const highestLowercaseAlphabet = lowercaseAlphabets.length > 0 ? [lowercaseAlphabets.sort().pop()] : [];

  return {
    numbers,
    alphabets,
    highestLowercaseAlphabet
  };
};

// Function to handle file processing from base64
const processFile = (base64File) => {
  if (!base64File) return { file_valid: false };

  try {
    const filePath = base64ToFile(base64File, './uploads');
    const fileMimeType = mime.lookup(filePath);
    const fileSizeKb = (fs.statSync(filePath).size / 1024).toFixed(2);

    return {
      file_valid: true,
      file_mime_type: fileMimeType,
      file_size_kb: fileSizeKb
    };
  } catch (error) {
    return { file_valid: false };
  }
};

// POST method route
app.post('/bfhl', (req, res) => {
  const { data, file_b64 } = req.body;

  if (!data) {
    return res.status(400).json({
      is_success: false,
      message: "Data field is required."
    });
  }

  const { numbers, alphabets, highestLowercaseAlphabet } = extractData(data);

  const fileDetails = processFile(file_b64);

  res.status(200).json({
    is_success: true,
    user_id: `${user.full_name}_${user.dob}`,
    email: user.email,
    roll_number: user.roll_number,
    numbers,
    alphabets,
    highest_lowercase_alphabet: highestLowercaseAlphabet,
    ...fileDetails
  });
});

// GET method route
app.get('/bfhl', (req, res) => {
  res.status(200).json({
    operation_code: 1
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
