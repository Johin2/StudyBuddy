import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useDropzone } from 'react-dropzone';

const Hero = ({ login, isUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleDefaultImageClick = () => {
    setIsEditing(true);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      <span>world</span>
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*' });

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async () => {
    return await getCroppedImgHelper(preview, croppedAreaPixels);
  }, [preview, croppedAreaPixels]);

  const handleCropSubmit = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      if (!croppedBlob) return;
      const formData = new FormData();
      formData.append('profileImage', croppedBlob, 'cropped.jpg');

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadedImageUrl(data.user.profileImage);
        setIsEditing(false);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Image upload failed', error);
    }
  };

  const imageToDisplay = uploadedImageUrl || '/images/preview-img.png';

  const handleSubmit = async () => {

  }

  return (
    isUser ? (
      <div className="grid grid-cols-[20%_80%] h-screen w-screen">
        <div className="grid grid-cols-[20%_80%] p-4 gap-4">
          <div className="bg-blue-300 rounded-md flex items-center justify-center">
            <span className="text-white">Left Part</span>
          </div>
          <div className="bg-green-300 rounded-md flex flex-col items-center justify-center p-4">
            <img
              src={imageToDisplay}
              alt="Profile"
              className="rounded-full h-24 w-24 object-cover cursor-pointer"
              onClick={handleDefaultImageClick}
            />
          </div>
        </div>
        <div className="bg-white p-4 grid gap-4 mt-32">
          <div className="bg-red-300 h-48 rounded-md flex items-center justify-center">
            <span className="text-white text-lg">Big Rectangle</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-300 h-32 rounded-md flex items-center justify-center">
              <span className="text-white">Box A</span>
            </div>
            <div className="bg-purple-300 h-32 rounded-md flex items-center justify-center">
              <span className="text-white">Box B</span>
            </div>
            <div className="bg-pink-300 h-32 rounded-md flex items-center justify-center">
              <span className="text-white">Box C</span>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md relative w-96">
              <h2 className="text-xl mb-4 text-center">Upload and Crop your Profile Image</h2>
              {preview ? (
                <div className="relative w-full h-64 bg-gray-100">
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              ) : (
                <div {...getRootProps()} className="border-dashed border-2 border-gray-300 p-8 text-center">
                  <input {...getInputProps()} />
                  <p>Drag and drop an image here, or click to select one</p>
                </div>
              )}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                {preview && (
                  <button
                    onClick={handleCropSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className='flex h-screen w-screen'>
        <div className='w-[50%] h-full overflow-hidden rounded-md'>
          <img src="/images/login-signup.png" alt="cover-image" className='object-cover object-center w-full h-full p-2' />
        </div>
        
        <div className='w-[50%] h-full flex justify-center items-center flex-col'>
          <div className='flex-col space-y-12 justify-center items-center'>
          <div className='rounded-lg w-full h-12 flex justify-center items-center space-x-40 border-[2px] border-black'>
            <div className='w-[50%] flex justify-center items-center'>
              <h1>Signup</h1>
            </div>
            <div className='border-[2px] border-y-2 border-black h-full'>
            </div>
            <div className='w-[50%] flex justify-center items-center'>
              <h1>Login</h1>
            </div>
          </div>
            <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center space-y-10'>
              <div className='flex space-x-6'>
                <div>
                  <input type="text" placeholder='First name' className='p-2 border-2 border-black w-full rounded-md' />
                </div>
                <div>
                  <input type="text" placeholder='Last name' className='p-2 border-2 border-black w-full rounded-md' />
                </div>

              </div>
              <div className='w-full'>
                <input type="email" placeholder='Email' className='p-2 border-2 border-black w-full rounded-md' />
              </div>
              <div className='w-full'>
                <input type="password" placeholder='Password' className='p-2 border-2 border-black w-full rounded-md' />
              </div>
              <div className='w-full'>
                <button className='bg-marsOrange w-full p-3 rounded-md hover:bg-orange-600'>Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default Hero;

async function getCroppedImgHelper(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg');
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}
