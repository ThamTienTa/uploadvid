const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// PORT for Render
const PORT = process.env.PORT || 3000;

// Allow frontend (you can restrict later if needed)
app.use(cors());

// JSON support
app.use(express.json());

// -------------------- ROOT ROUTE --------------------
app.get("/", (req, res) => {
  res.json({
    message: "Video API is running",
    endpoints: {
      upload: "/upload",
      list: "/videos-list"
    }
  });
});

// -------------------- VIDEO FOLDER --------------------
const videoDir = path.join(__dirname, "videos");

// create folder if not exists
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir);
}

// serve videos statically
app.use("/videos", express.static(videoDir));

// -------------------- MULTER SETUP --------------------
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

// -------------------- UPLOAD ROUTE --------------------
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

// -------------------- LIST VIDEOS --------------------
app.get("/videos-list", (req, res) => {
  try {
    const files = fs.readdirSync(videoDir);
    res.json(files.map(file => `/videos/${file}`));
  } catch (err) {
    console.error("LIST ERROR:", err);
    res.status(500).json({ error: "Cannot read videos folder" });
  }
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
