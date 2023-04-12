// Import necessary modules
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");

// Configure multer for file upload
const upload = multer({ dest: "uploads/" });

// Initialize Express app
const app = express();

// Create a POST endpoint for file upload
app.post("/upload", upload.single("file"), (req, res) => {
  // Get the file's local path
  const filePath = req.file.path;

  // Run the OS command with the file as a parameter
  const command = `some-command ${filePath}`; // Replace 'some-command' with the desired command
  exec(command, (error, stdout, stderr) => {
    // Remove the uploaded file after executing the command
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error while deleting the file: ${err}`);
      }
    });

    // If there's an error running the command, send it as a response
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Send the command output as the API response
    res.json({ output: stdout });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});