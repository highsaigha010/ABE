import React, { useState } from 'react';

export default function FileUpload({ jobId, onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // REPLACE WITH YOUR API URL
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            // 1. Get the Presigned URL from your Go Backend
            // We pass the filename so S3 knows what to expect
            const urlRes = await fetch(`${API_URL}/upload-url?filename=${file.name}`);
            const urlData = await urlRes.json();

            if (!urlRes.ok) throw new Error("Could not get upload URL");

            const { upload_url, file_key } = urlData;

            // 2. Upload the actual file directly to S3 (PUT request)
            const uploadRes = await fetch(upload_url, {
                method: 'PUT',
                body: file, // We send the raw binary file
            });

            if (!uploadRes.ok) throw new Error("S3 Upload failed");

            // 3. Tell the Backend we are done
            await fetch(`${API_URL}/jobs/${jobId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: [file_key] // We send the S3 key (path) back to save in DynamoDB
                })
            });

            alert("File Uploaded Successfully!");
            onUploadComplete(); // Refresh the UI

        } catch (error) {
            console.error(error);
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <h5 className="font-bold text-sm text-gray-700 mb-2">Upload Raw Photos</h5>
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {uploading ? 'Uploading to S3...' : 'Submit Work'}
            </button>
        </div>
    );
}