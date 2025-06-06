# Deployment Instructions for StudyNovaAI

This document provides instructions for deploying the latest changes to fix the user profile update functionality.

## Changes Made

1. **Added Firebase Admin SDK Integration**
   - Created a new `firebase-admin.js` utility file for server-side operations
   - Updated API routes to use Firebase Admin instead of client SDK

2. **Added Auto-User Creation**
   - Modified the user-profile API to automatically create users if they don't exist
   - Added retry mechanism in the client code

3. **Improved Error Handling**
   - Enhanced error detection and reporting
   - Added user-friendly error messages

## Deployment Steps

### 1. Update Environment Variables in Vercel

Before deploying, make sure to add the following environment variables to your Vercel project:

```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studynovabot.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDnDGTbgrgqLdkJ\ncLeQrISyvZsVH4UcWDNEhFqX5d4AUD/l+q962HYGdkgS6k4v1jvNzb0U5T3byTAm\nrGpSGVJE3qRvP9C3kFlNWGbObYGNcaF62zO0/46vVM1PxTsuovhau8j8Grd5543T\nf/ktkp+nC8CbL0DGLitdWNGMNjdneNVVtDqZaiU7jID/oMKW6tpQLXBHaDvfR2TH\nbzQz7FvEIEPQ/d/rIjt95pLuvKusV/6LxOwC18GEjlIfqX49WVYbULU2H4kGfDYl\nhZt+PatEBf81Apc3wU9vN/LbYQmQGoU7S6v3/jU9IxPEOafmXY3wGyZduIXmvDJR\nPPcuwlG/AgMBAAECggEAaXUNv+eNWastihKJpp4nv1GtrFmDrylO1TI4C2bfCnOW\nhskCOWb9j/uC8CdD4q+9AjWq3RO5RU0yDiTaLnjiRQ7+LM0K3g4jxJrZ6dSvsjiw\nRNwyYKXYoYxqXcOfPK0kAH3/wZoMLrcS0/twZ22qM1u44NwTi6FdJ7E3i/DfHvl5\nEBi4ndlaFgpKt5dmBaoeTsFYkyMr5vXVyyGe+4OWqgg+ewQwHuohI9m23Ns401Z1\naGXx8s0eQBnOtWnQZVd+LyAuBjSasDvuQpXXCaUjDffzHqnNV/6VH/fYZATPVWGW\n6uRCUu0TuVW52dftaerISzapZ+J0+/7p2ZuZMFBqeQKBgQD35MiI152Gn3j7RQhI\nuMQ1sZkLszfAVLZnqTYGUS0YnCak3ooCQNufGAVeePIc3Rr+Rzfef6MKoOmrENRg\nxSVzN66aGERj8ivQbZXpCYrBEfaja3pzfkR3LGPr4Z2+k9EFMURYTbDTP+Pvkz8f\ne19niOw3MkTGO5x1HoFQudYDOwKBgQDumpeYijJ/EcyI2oZr8XCYIlo8x4GYrj9f\nK0nBYmMW6euzcQ5h0+rrHbOVeG9bOYlifaxzHfiRORH1e6Ln9D7YQ2MkbuNGp4R8\nkHlMXIvZdHQ/9Z2RsKOhGVsOAMdhdSMuyLG1j3OxKm4J2C5gP09u/Bqnmg8SXKwa\nRa1KmCJ7TQKBgCRpDDNdSBvv7Hsrpo3X5anlTg9z4Wp0ht4u8mp3HeKRfPOWZDr0\nf82cX52Csj0fFMnoeAJMSQxUmj2wGSGlk1ya/yBPFCyB84GHtw8lgaXeF5XlQXUZ\nRMEkWgDZgKvvVjInDFzT/Hbq2XXk8M6U9mxkph1tWsCrHM3vDxtmUFLlAoGAC50u\nv9gKOTEumYK5hEuORXl2lvrHDh19LC65OlaFqDnepS9dmdls1+DsOtxP30rfqxGe\n8UOGM9tpSl+oQE4dOP2et8lF+sxwoHePz+25SO5oMizMbKkCbfcD/ZyAF/hRrBdM\nvx+qa/c6v/Pr3fd28FoJGhtfnG8yWV0G4FijZQkCgYBHK3mMmJX6B0o84lv7OswO\npqUitFTR4u3ZxaW/huA5uXZ99QsqldISbbBynBaaXYiFZ68O0AftA2Y0peAK1FXI\ncmbULlmh3ixbd4FXp+957l/QiDbigyfrlqyPBWuWoBDmv4ygq8plZreNN7DWhLmk\nCpmAwsIt14tI8+PTE3WEXQ==\n-----END PRIVATE KEY-----\n"
```

Make sure to set these variables for all environments (Production, Preview, and Development).

### 2. Deploy to Vercel

1. Push all changes to your GitHub repository
2. Log in to your Vercel dashboard
3. Select your "StudyNovaAI" project
4. Go to the "Deployments" tab
5. Click "Deploy" to deploy the latest changes

### 3. Verify the Deployment

After deployment, test the profile update functionality:

1. Navigate to the Settings page
2. Update your profile information
3. Click "Save Changes"
4. Verify that the changes are saved successfully

## Troubleshooting

If you encounter any issues after deployment:

1. **Check Vercel Logs**
   - Go to your Vercel dashboard
   - Select your project
   - Go to the "Deployments" tab
   - Click on the latest deployment
   - Check the Function Logs for any errors

2. **Verify Environment Variables**
   - Make sure the environment variables are correctly set in Vercel
   - Check that the private key includes all newline characters (`\n`)

3. **Check Firebase Console**
   - Log in to the Firebase Console
   - Go to the Firestore Database
   - Verify that user documents are being created

## Security Considerations

The private key included in this document is already in your codebase as a fallback. For better security:

1. Generate a new service account key from the Firebase Console
2. Store the new key only in environment variables, not in your code
3. Restrict the service account's permissions to only what's needed