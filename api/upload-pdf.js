// Simple PDF Upload Redirect API
// Redirects to the working admin-pdf-upload-fixed.js

export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'PDF Upload API - Redirected to admin-pdf-upload-fixed',
            redirectTo: '/api/admin-pdf-upload-fixed',
            usage: {
                method: 'POST',
                endpoint: '/api/admin-pdf-upload-fixed',
                description: 'Use the fixed PDF upload endpoint for file uploads'
            }
        });
    }
    
    // For POST requests, redirect to the working endpoint
    if (req.method === 'POST') {
        return res.status(200).json({
            success: false,
            message: 'Please use /api/admin-pdf-upload-fixed for PDF uploads',
            redirectTo: '/api/admin-pdf-upload-fixed'
        });
    }
    
    return res.status(405).json({
        success: false,
        message: 'Method not allowed'
    });
}