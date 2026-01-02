import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary - ensure it's configured
const configureCloudinary = () => {
  const currentConfig = cloudinary.config();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('Configuring Cloudinary:', {
    cloudName: cloudName || 'MISSING',
    apiKey: apiKey ? 'SET' : 'MISSING',
    apiSecret: apiSecret ? 'SET' : 'MISSING',
    currentCloudName: currentConfig.cloud_name || 'NOT SET'
  });

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are missing. Please check your .env file.');
  }

  // Always reconfigure to ensure latest values
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  console.log('Cloudinary configured successfully');
};

// Initialize configuration
try {
  configureCloudinary();
} catch (error) {
  console.error('Failed to configure Cloudinary at module load:', error.message);
}

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder = 'sayed-safi-portfolio', mimetype = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure Cloudinary is configured
      configureCloudinary();

      // Validate buffer
      if (!buffer || buffer.length === 0) {
        return reject(new Error('Buffer is empty'));
      }

      // Ensure Cloudinary is configured (reconfigure if needed)
      try {
        configureCloudinary();
      } catch (configError) {
        console.error('Cloudinary configuration error:', configError);
        return reject(new Error('Cloudinary configuration failed: ' + configError.message));
      }

      // Validate Cloudinary config
      const config = cloudinary.config();
      if (!config.cloud_name || !config.api_key || !config.api_secret) {
        console.error('Cloudinary config after setup:', {
          cloud_name: config.cloud_name || 'MISSING',
          api_key: config.api_key ? 'SET' : 'MISSING',
          api_secret: config.api_secret ? 'SET' : 'MISSING'
        });
        return reject(new Error('Cloudinary configuration is missing. Please check your .env file.'));
      }

      // Convert buffer to base64 string
      const base64String = buffer.toString('base64');
      const dataUri = `data:${mimetype};base64,${base64String}`;

      console.log('Uploading to Cloudinary:', {
        folder,
        mimetype,
        bufferSize: buffer.length,
        base64Length: base64String.length
      });

      cloudinary.uploader.upload(
        dataUri,
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 630, crop: 'limit' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            reject(new Error(error.message || 'Cloudinary upload failed'));
          } else if (!result) {
            reject(new Error('No result from Cloudinary'));
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      );
    } catch (error) {
      console.error('Error in uploadToCloudinary:', error);
      reject(error);
    }
  });
};

export default cloudinary;

