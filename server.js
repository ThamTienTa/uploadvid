const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// IMPORTANT: Render needs this port
const PORT = process.env.PORT || 3000;

// Allow frontend (GitHub Pages)
app.use(cors({
  origin: "https://thamtienta.github.io"
}));

// Serve videos folder
app.use("/videos", express.static("videos"));

// Create videos folder if missing (IMPORTANT FIX)
if (!fs.existsSync("videos")) {
  fs.mkdirSync("videos");
}

// Multer setup (file upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "videos/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      message: "Upload successful",
      file: `/videos/${req.file.filename}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during upload" });
  }
});

// Get video list
app.get("/videos-list", (req, res) => {
  try {
    const files = fs.readdirSync("videos");
    res.json(files.map(file => `/videos/${file}`));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot read videos folder" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
