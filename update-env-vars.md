# Updating Environment Variables in Vercel

To fix the "Missing or insufficient permissions" error in your production environment, you need to add the Firebase Admin SDK service account credentials to your Vercel environment variables.

## Steps to Update Vercel Environment Variables

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your "StudyNovaAI" project
3. Go to the "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add the following environment variables:

```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studynovabot.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDnDGTbgrgqLdkJ\ncLeQrISyvZsVH4UcWDNEhFqX5d4AUD/l+q962HYGdkgS6k4v1jvNzb0U5T3byTAm\nrGpSGVJE3qRvP9C3kFlNWGbObYGNcaF62zO0/46vVM1PxTsuovhau8j8Grd5543T\nf/ktkp+nC8CbL0DGLitdWNGMNjdneNVVtDqZaiU7jID/oMKW6tpQLXBHaDvfR2TH\nbzQz7FvEIEPQ/d/rIjt95pLuvKusV/6LxOwC18GEjlIfqX49WVYbULU2H4kGfDYl\nhZt+PatEBf81Apc3wU9vN/LbYQmQGoU7S6v3/jU9IxPEOafmXY3wGyZduIXmvDJR\nPPcuwlG/AgMBAAECggEAaXUNv+eNWastihKJpp4nv1GtrFmDrylO1TI4C2bfCnOW\nhskCOWb9j/uC8CdD4q+9AjWq3RO5RU0yDiTaLnjiRQ7+LM0K3g4jxJrZ6dSvsjiw\nRNwyYKXYoYxqXcOfPK0kAH3/wZoMLrcS0/twZ22qM1u44NwTi6FdJ7E3i/DfHvl5\nEBi4ndlaFgpKt5dmBaoeTsFYkyMr5vXVyyGe+4OWqgg+ewQwHuohI9m23Ns401Z1\naGXx8s0eQBnOtWnQZVd+LyAuBjSasDvuQpXXCaUjDffzHqnNV/6VH/fYZATPVWGW\n6uRCUu0TuVW52dftaerISzapZ+J0+/7p2ZuZMFBqeQKBgQD35MiI152Gn3j7RQhI\nuMQ1sZkLszfAVLZnqTYGUS0YnCak3ooCQNufGAVeePIc3Rr+Rzfef6MKoOmrENRg\nxSVzN66aGERj8ivQbZXpCYrBEfaja3pzfkR3LGPr4Z2+k9EFMURYTbDTP+Pvkz8f\ne19niOw3MkTGO5x1HoFQudYDOwKBgQDumpeYijJ/EcyI2oZr8XCYIlo8x4GYrj9f\nK0nBYmMW6euzcQ5h0+rrHbOVeG9bOYlifaxzHfiRORH1e6Ln9D7YQ2MkbuNGp4R8\nkHlMXIvZdHQ/9Z2RsKOhGVsOAMdhdSMuyLG1j3OxKm4J2C5gP09u/Bqnmg8SXKwa\nRa1KmCJ7TQKBgCRpDDNdSBvv7Hsrpo3X5anlTg9z4Wp0ht4u8mp3HeKRfPOWZDr0\nf82cX52Csj0fFMnoeAJMSQxUmj2wGSGlk1ya/yBPFCyB84GHtw8lgaXeF5XlQXUZ\nRMEkWgDZgKvvVjInDFzT/Hbq2XXk8M6U9mxkph1tWsCrHM3vDxtmUFLlAoGAC50u\nv9gKOTEumYK5hEuORXl2lvrHDh19LC65OlaFqDnepS9dmdls1+DsOtxP30rfqxGe\n8UOGM9tpSl+oQE4dOP2et8lF+sxwoHePz+25SO5oMizMbKkCbfcD/ZyAF/hRrBdM\nvx+qa/c6v/Pr3fd28FoJGhtfnG8yWV0G4FijZQkCgYBHK3mMmJX6B0o84lv7OswO\npqUitFTR4u3ZxaW/huA5uXZ99QsqldISbbBynBaaXYiFZ68O0AftA2Y0peAK1FXI\ncmbULlmh3ixbd4FXp+957l/QiDbigyfrlqyPBWuWoBDmv4ygq8plZreNN7DWhLmk\nCpmAwsIt14tI8+PTE3WEXQ==\n-----END PRIVATE KEY-----\n"
```

6. Make sure to set these variables for all environments (Production, Preview, and Development)
7. Click "Save" to apply the changes
8. Redeploy your application by clicking on the "Deployments" tab and then "Redeploy"

## Important Notes

1. The private key must include the newline characters (`\n`) exactly as shown above
2. After updating the environment variables, it may take a few minutes for the changes to propagate
3. If you're still experiencing issues, check the Vercel deployment logs for any errors

## Security Considerations

The private key provided in this file is already in your codebase as a fallback. For better security:

1. Consider generating a new service account key from the Firebase Console
2. Store the new key only in environment variables, not in your code
3. Restrict the service account's permissions to only what's needed