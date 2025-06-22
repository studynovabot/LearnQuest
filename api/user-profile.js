// User Profile API - Direct endpoint
// Redirects to user-management.js with profile action

import { handleCors } from '../utils/cors.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import { extractUserFromRequest } from '../utils/jwt-auth.js';

export default function handler(req, res) {
    return handleCors(req, res, async (req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
        
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        console.log('👤 User Profile API called directly');
        
        try {
            // Initialize Firebase
            initializeFirebaseAdmin();
            const db = getFirestoreAdminDb();
            
            if (req.method === 'GET') {
                // Extract user from request
                const user = await extractUserFromRequest(req);
                
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                console.log(`📋 Fetching profile for user: ${user.id}`);
                
                // Get user profile from database
                const userDoc = await db.collection('users').doc(user.id).get();
                
                if (!userDoc.exists) {
                    return res.status(404).json({
                        success: false,
                        message: 'User profile not found'
                    });
                }
                
                const userData = userDoc.data();
                
                // Return sanitized user data
                const profile = {
                    id: user.id,
                    email: userData.email || user.email,
                    displayName: userData.displayName || userData.name || 'User',
                    subscriptionPlan: userData.subscriptionPlan || 'free',
                    tier: userData.tier || 'free',
                    role: userData.role || 'user',
                    isAdmin: userData.isAdmin || false,
                    createdAt: userData.createdAt,
                    lastLogin: userData.lastLogin,
                    preferences: userData.preferences || {},
                    stats: userData.stats || {
                        totalSessions: 0,
                        totalQuestions: 0,
                        totalTime: 0
                    }
                };
                
                return res.status(200).json({
                    success: true,
                    data: profile,
                    message: 'Profile retrieved successfully'
                });
            }
            
            if (req.method === 'PUT') {
                // Update user profile
                const user = await extractUserFromRequest(req);
                
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const updates = req.body;
                
                // Sanitize updates (only allow certain fields)
                const allowedFields = ['displayName', 'preferences', 'bio', 'avatar'];
                const sanitizedUpdates = {};
                
                for (const field of allowedFields) {
                    if (updates[field] !== undefined) {
                        sanitizedUpdates[field] = updates[field];
                    }
                }
                
                if (Object.keys(sanitizedUpdates).length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No valid fields to update'
                    });
                }
                
                // Add update timestamp
                sanitizedUpdates.updatedAt = new Date().toISOString();
                
                // Update user document
                await db.collection('users').doc(user.id).update(sanitizedUpdates);
                
                console.log(`✅ Profile updated for user: ${user.id}`);
                
                return res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    data: sanitizedUpdates
                });
            }
            
            return res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
            
        } catch (error) {
            console.error('❌ User profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
}