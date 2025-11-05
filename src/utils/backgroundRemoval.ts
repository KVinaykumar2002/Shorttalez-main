import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 512;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

// Simple blue background removal using color-based masking
const removeBlueBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting blue background removal...');
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize and draw image
    resizeImageIfNeeded(canvas, ctx, imageElement);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Remove blue background by making blue pixels transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check if pixel is predominantly blue (adjust thresholds as needed)
      const isBlueBackground = (
        b > 100 && // Blue component is strong
        b > r + 30 && // Blue is significantly stronger than red
        b > g + 30 && // Blue is significantly stronger than green
        (r < 150 && g < 150) // Red and green are not too strong
      );
      
      if (isBlueBackground) {
        data[i + 3] = 0; // Make transparent
      }
    }
    
    // Put the processed image data back
    ctx.putImageData(imageData, 0, 0);
    console.log('Blue background removed successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing blue background:', error);
    throw error;
  }
};

// Extract frames from GIF and process each one
export const processGifBackgroundRemoval = async (gifUrl: string): Promise<string[]> => {
  try {
    console.log('Processing GIF for background removal...');
    
    // Load the GIF
    const response = await fetch(gifUrl);
    const gifBlob = await response.blob();
    
    // For now, we'll create a simple version by loading the first frame
    // In a production environment, you'd use a library like 'gif-frames' to extract all frames
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Process the image to remove blue background
          const processedBlob = await removeBlueBackground(img);
          const processedUrl = URL.createObjectURL(processedBlob);
          
          // For simplicity, return the same processed frame multiple times
          // In production, you'd process each frame individually
          resolve([processedUrl]);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(gifBlob);
    });
  } catch (error) {
    console.error('Error processing GIF:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};