const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Safer CORS (allows GitHub Pages + testing)
app.use(cors());

// JSON support (safe default)
app.use(express.json());

// Ensure videos folder exists
const videoDir = path.join(__dirname, "videos");
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir);
}

// Serve videos
app.use("/videos", express.static(videoDir));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir);
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
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get video list
app.get("/videos-list", (req, res) => {
  try {
    const files = fs.readdirSync(videoDir);
    res.json(files.map(file => `/videos/${file}`));
  } catch (err) {
    console.error("LIST ERROR:", err);
    res.status(500).json({ error: "Cannot read videos folder" });
  }
});

// Start server (Render-safe)
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
