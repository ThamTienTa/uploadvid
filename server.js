const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use("/videos", express.static("videos"));

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "videos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("video"), (req, res) => {
  res.json({
    message: "Video uploaded!",
    file: `/videos/${req.file.filename}`
  });
});

// Get all videos
const fs = require("fs");
app.get("/videos-list", (req, res) => {
  const files = fs.readdirSync("videos");
  res.json(files.map(file => `/videos/${file}`));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
