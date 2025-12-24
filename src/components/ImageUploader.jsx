import React, { useState } from 'react';

const ImageUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);

    try {
      const apiUrl = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";
      
      // 1. Get Presigned URL from backend
      const response = await fetch(`${apiUrl}/upload-url?filename=${encodeURIComponent(file.name)}`);
      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { upload_url, file_key } = await response.json();

      // 2. PUT request to S3 with file body
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // 3. Return the FULL S3 URL to the parent component
      const publicUrl = upload_url.split('?')[0];
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Something went wrong during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center w-full">
        <label 
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {preview ? (
              <div className="relative w-full h-48 mb-4 flex justify-center">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="h-full object-contain rounded-lg"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm font-medium text-white">Uploading...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <svg 
                  className="w-8 h-8 mb-4 text-gray-500" 
                  aria-hidden="true" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 20 16"
                >
                  <path 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 font-semibold">Click to upload</p>
                <p className="text-xs text-gray-400 uppercase">SVG, PNG, JPG or GIF</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={uploading}
          />
        </label>
        
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {error}
          </p>
        )}
        
        {uploading && !preview && (
          <div className="flex items-center mt-4 text-blue-600">
            <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
