import { GOOGLE_DRIVE_CONFIG } from '../config/googleDriveConfig';

export const uploadToGoogleDrive = async (file, metadata) => {
    try {
        // Convert file to form data
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType || 'application/pdf',
            name: file.name
        });

        // Add metadata
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        // Upload to your backend server or Firebase Function
        const response = await fetch('YOUR_BACKEND_UPLOAD_ENDPOINT', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

export const getFileUrl = async (fileId) => {
    try {
        const response = await fetch(`YOUR_BACKEND_GET_FILE_ENDPOINT/${fileId}`);
        if (!response.ok) {
            throw new Error('Failed to get file URL');
        }
        const data = await response.json();
        return data.webViewLink;
    } catch (error) {
        console.error('Get file URL error:', error);
        throw error;
    }
}; 