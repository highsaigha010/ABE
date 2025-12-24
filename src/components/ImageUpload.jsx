import React, { useState } from 'react';

export default function ImageUpload({ onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);

    // REPLACE WITH YOUR ACTUAL API URL (No /jobs at the end)
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get Presigned URL
            const urlRes = await fetch(`${API_URL}/upload-url?filename=${file.name}`);
            const urlData = await urlRes.json();

            // 2. Upload to S3
            await fetch(urlData.upload_url, {
                method: 'PUT',
                body: file
            });

            // 3. Return the FULL S3 URL to the parent component
            // (We construct the public URL manually so we can display it immediately)
            const publicUrl = urlData.upload_url.split('?')[0];
            onUploadSuccess(publicUrl);

        } catch (error) {
            alert("Upload failed");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mt-1">
            {uploading ? (
                <span className="text-sm text-blue-600 animate-pulse">Uploading...</span>
            ) : (
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
            )}
        </div>
    );
}