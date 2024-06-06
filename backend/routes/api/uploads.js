const express = require('express');
const multer = require('multer');
const s3 = require('../../config/aws');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  console.log('Received file:', req.file);
  console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME); 

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}_${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  };

  try {
    const data = await s3.upload(params).promise();
    console.log('File uploaded successfully:', data);
    res.json({ url: data.Location });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

module.exports = router;
