const cloudinary = require('../config/cloudinary');

async function uploadImage(filePath) {
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      public_id: 'your_public_id' // optional: set your own public ID
    });
    console.log(uploadResult);

    // optimize the image
    const optimizeUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });
    console.log(optimizeUrl);

    // transform the image: auto-crop to square aspect ratio
    const autoCropUrl = cloudinary.url(uploadResult.public_id, {
      crop: 'auto',
      gravity: 'auto',
      width: 500,
      height: 500
    });
    console.log(autoCropUrl);

    return uploadResult.secure_url; // URL of the uploaded image
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

module.exports = uploadImage;
