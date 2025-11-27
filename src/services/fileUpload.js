import { uploadAPI } from './api';

export const fileUpload = {
  validateFile: (file, maxSizeMB) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      throw new Error(`File size too large. Maximum size is ${maxSizeMB}MB.`);
    }

    // Check file type
    const allowedTypes = {
      'image/jpeg': 'image',
      'image/jpg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/webp': 'image',
      'video/mp4': 'video',
      'video/avi': 'video',
      'video/mov': 'video',
      'video/wmv': 'video',
      'audio/mp3': 'audio',
      'audio/wav': 'audio',
      'audio/m4a': 'audio',
      'audio/aac': 'audio',
      'application/pdf': 'pdf'
    };

    if (!allowedTypes[file.type]) {
      throw new Error('File type not supported. Please upload images, videos, audio, or PDF files.');
    }

    return allowedTypes[file.type];
  },

  compressImage: async (file, maxSizeMB = 1) => {
    return new Promise((resolve) => {
      if (file.size <= maxSizeMB * 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      reader.onload = (e) => {
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  uploadFile: async (file, onProgress = null) => {
    try {
      let fileToUpload = file;
      const fileType = fileUpload.validateFile(file, 
        file.type.startsWith('video/') ? 350 : 
        file.type.startsWith('image/') ? 100 : 350
      );

      // Compress images if needed
      if (fileType === 'image') {
        fileToUpload = await fileUpload.compressImage(file, 1); // 1MB max for images
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('fileType', fileType);

      const response = await uploadAPI.uploadFile(formData, onProgress);

      if (response.data && response.data.url) {
        return response.data.url;
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Upload failed');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw error;
      }
    }
  },

  uploadMultipleFiles: async (files, onProgress = null) => {
    const uploadPromises = files.map(file => fileUpload.uploadFile(file, onProgress));
    return Promise.all(uploadPromises);
  }
};