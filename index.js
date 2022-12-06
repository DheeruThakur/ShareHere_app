const express = require("express");
const mongoose = require("mongoose");
const fileRoute = require("./routes/files");
const showRoute = require("./routes/show");
const downloadRoute = require("./routes/download");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { engine } = require("express/lib/application");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

app.use(
  multer({ storage: fileStorage, limit: { fileSize: 1000000 * 100 } }).single(
    "myfile"
  )
);

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use("/api/files", fileRoute);
app.use("/files", showRoute);
app.use("/files/download", downloadRoute);

const PORT = process.env.PORT || 1080;
mongoose.connect(process.env.MONGO_CONNECTION_URL, () => {
  console.log("connected successfully!!");
  app.listen(PORT, () => {
    console.log(`server is running at ${PORT}`);
  });
});
