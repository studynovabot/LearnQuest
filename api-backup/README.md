# API Backup

This directory contains backups of the original API files before consolidation.
These files were consolidated to reduce the serverless function count for Vercel deployment.

Original files consolidated:
- user-profile.js → user-management.js
- user-activity.js → user-management.js  
- student-analytics.js → user-management.js
- admin-users.js → user-management.js
- image-analysis.js → media-services.js
- image-generation.js → media-services.js
- chat.js → ai-services.js
- ai/help.js → ai-services.js
- ncert-data.js → ncert-management.js
- ncert-solutions.js → ncert-management.js
- ncert-upload.js → ncert-management.js
- ncert-solutions/stats.js → ncert-management.js
- ncert-solutions/upload.js → ncert-management.js
- ncert-solutions/[id]/content.js → ncert-management.js