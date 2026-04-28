const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Render port (IMPORTANT)
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ---------------- ROOT ROUTE ----------------
app.get("/", (req, res) => {
  res.json({
    message: "Video API is running",
    endpoints: {
      upload: "/upload",
      list: "/videos-list"
    }
  });
});

// ---------------- VIDEO FOLDER ----------------
const videoDir = path.join(__dirname, "videos");

if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir);
}

// Serve static videos
app.use("/videos", express.static(videoDir));

// ---------------- MULTER SETUP ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// LIMIT UPLOAD SIZE (IMPORTANT FIX)
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB max
  }
});

// ---------------- UPLOAD ROUTE (SAFE) ----------------
app.post("/upload", (req, res) => {
  upload.single("video")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("MULTER ERROR:", err.message);
      return res.status(400).json({ error: "File too large or upload error" });
    }

    if (err) {
      console.error("UNKNOWN ERROR:", err);
      return res.status(500).json({ error: "Server crashed during upload" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      message: "Upload successful",
      file: `/videos/${req.file.filename}`
    });
  });
});

// ---------------- LIST VIDEOS ----------------
app.get("/videos-list", (req, res) => {
  try {
    const files = fs.readdirSync(videoDir);
    res.json(files.map(file => `/videos/${file}`));
  } catch (err) {
    console.error("LIST ERROR:", err);
    res.status(500).json({ error: "Cannot read videos folder" });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
