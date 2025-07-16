import { GOOGLE_DRIVE_CONFIG } from '../config/googleDriveConfig';

export const uploadToGoogleDrive = async (file, metadata, accessToken) => {
    try {
        if (!accessToken) {
            throw new Error('No access token available');
        }

        // Convert file to form data
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType || 'application/pdf',
            name: file.name
        });

        // Add metadata
        if (metadata) {
            Object.keys(metadata).forEach(key => {
                formData.append(key, metadata[key]);
            });
        }

        // Add authorization header with access token
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        };

        // Upload directly to Google Drive API
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed: ' + await response.text());
        }

        const result = await response.json();
        return {
            fileId: result.id,
            webViewLink: result.webViewLink,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${result.id}`
        };
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

export const getFileUrl = async (fileId, accessToken) => {
    try {
        if (!accessToken) {
            throw new Error('No access token available');
        }

        const headers = {
            'Authorization': `Bearer ${accessToken}`,
        };

        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink,id`, {
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to get file URL');
        }

        const data = await response.json();
        return {
            webViewLink: data.webViewLink,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${data.id}`
        };
    } catch (error) {
        console.error('Get file URL error:', error);
        throw error;
    }
}; 