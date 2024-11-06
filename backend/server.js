const express = require("express");
const cors = require("cors");
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const multer = require("multer");
const { Readable } = require("stream");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;
const upload = multer();

// List files
app.get("/files", async (req, res) => {
  try {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const data = await s3.send(command);
    res.json(data.Contents || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload file
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: req.file.originalname,
      Body: req.file.buffer,
    });
    await s3.send(command);
    res.json({ message: "File uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
app.get("/download/:filename", async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: req.params.filename,
    });
    const data = await s3.send(command);
    const stream = data.Body.pipe(Readable);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.filename}`
    );
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
