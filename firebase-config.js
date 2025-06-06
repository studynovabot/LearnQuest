// Firebase configuration
import { loadEnvVariables, getFirebaseConfigFromEnv } from './utils/env-loader.js';

// Load environment variables if needed
loadEnvVariables();

// Fallback configuration in case environment variables are not available
const fallbackConfig = {
  apiKey: "AIzaSyBWqEeO_-9OWKXK_MIoITnwnvPS0F5j4ANY",
  authDomain: "studynovabot.firebaseapp.com",
  projectId: "studynovabot",
  storageBucket: "studynovabot.appspot.com",
  messagingSenderId: "250481817155",
  appId: "1:250481817155:web:16ef3bbdb36bbc375dc6f6",
  clientEmail: "firebase-adminsdk-fbsvc@studynovabot.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDnDGTbgrgqLdkJ\ncLeQrISyvZsVH4UcWDNEhFqX5d4AUD/l+q962HYGdkgS6k4v1jvNzb0U5T3byTAm\nrGpSGVJE3qRvP9C3kFlNWGbObYGNcaF62zO0/46vVM1PxTsuovhau8j8Grd5543T\nf/ktkp+nC8CbL0DGLitdWNGMNjdneNVVtDqZaiU7jID/oMKW6tpQLXBHaDvfR2TH\nbzQz7FvEIEPQ/d/rIjt95pLuvKusV/6LxOwC18GEjlIfqX49WVYbULU2H4kGfDYl\nhZt+PatEBf81Apc3wU9vN/LbYQmQGoU7S6v3/jU9IxPEOafmXY3wGyZduIXmvDJR\nPPcuwlG/AgMBAAECggEAaXUNv+eNWastihKJpp4nv1GtrFmDrylO1TI4C2bfCnOW\nhskCOWb9j/uC8CdD4q+9AjWq3RO5RU0yDiTaLnjiRQ7+LM0K3g4jxJrZ6dSvsjiw\nRNwyYKXYoYxqXcOfPK0kAH3/wZoMLrcS0/twZ22qM1u44NwTi6FdJ7E3i/DfHvl5\nEBi4ndlaFgpKt5dmBaoeTsFYkyMr5vXVyyGe+4OWqgg+ewQwHuohI9m23Ns401Z1\naGXx8s0eQBnOtWnQZVd+LyAuBjSasDvuQpXXCaUjDffzHqnNV/6VH/fYZATPVWGW\n6uRCUu0TuVW52dftaerISzapZ+J0+/7p2ZuZMFBqeQKBgQD35MiI152Gn3j7RQhI\nuMQ1sZkLszfAVLZnqTYGUS0YnCak3ooCQNufGAVeePIc3Rr+Rzfef6MKoOmrENRg\nxSVzN66aGERj8ivQbZXpCYrBEfaja3pzfkR3LGPr4Z2+k9EFMURYTbDTP+Pvkz8f\ne19niOw3MkTGO5x1HoFQudYDOwKBgQDumpeYijJ/EcyI2oZr8XCYIlo8x4GYrj9f\nK0nBYmMW6euzcQ5h0+rrHbOVeG9bOYlifaxzHfiRORH1e6Ln9D7YQ2MkbuNGp4R8\nkHlMXIvZdHQ/9Z2RsKOhGVsOAMdhdSMuyLG1j3OxKm4J2C5gP09u/Bqnmg8SXKwa\nRa1KmCJ7TQKBgCRpDDNdSBvv7Hsrpo3X5anlTg9z4Wp0ht4u8mp3HeKRfPOWZDr0\nf82cX52Csj0fFMnoeAJMSQxUmj2wGSGlk1ya/yBPFCyB84GHtw8lgaXeF5XlQXUZ\nRMEkWgDZgKvvVjInDFzT/Hbq2XXk8M6U9mxkph1tWsCrHM3vDxtmUFLlAoGAC50u\nv9gKOTEumYK5hEuORXl2lvrHDh19LC65OlaFqDnepS9dmdls1+DsOtxP30rfqxGe\n8UOGM9tpSl+oQE4dOP2et8lF+sxwoHePz+25SO5oMizMbKkCbfcD/ZyAF/hRrBdM\nvx+qa/c6v/Pr3fd28FoJGhtfnG8yWV0G4FijZQkCgYBHK3mMmJX6B0o84lv7OswO\npqUitFTR4u3ZxaW/huA5uXZ99QsqldISbbBynBaaXYiFZ68O0AftA2Y0peAK1FXI\ncmbULlmh3ixbd4FXp+957l/QiDbigyfrlqyPBWuWoBDmv4ygq8plZreNN7DWhLmk\nCpmAwsIt14tI8+PTE3WEXQ==\n-----END PRIVATE KEY-----\n"
};

// Get configuration from environment variables or use fallback
const envConfig = getFirebaseConfigFromEnv();

// Merge configurations, prioritizing environment variables
export const firebaseConfig = {
  apiKey: envConfig.apiKey || fallbackConfig.apiKey,
  authDomain: envConfig.authDomain || fallbackConfig.authDomain,
  projectId: envConfig.projectId || fallbackConfig.projectId,
  storageBucket: envConfig.storageBucket || fallbackConfig.storageBucket,
  messagingSenderId: envConfig.messagingSenderId || fallbackConfig.messagingSenderId,
  appId: envConfig.appId || fallbackConfig.appId,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  clientEmail: envConfig.clientEmail || fallbackConfig.clientEmail,
  privateKey: envConfig.privateKey || fallbackConfig.privateKey
};

// Log configuration status (without sensitive data)
console.log('🔥 Firebase configuration status:', {
  apiKeyPresent: !!firebaseConfig.apiKey,
  authDomainPresent: !!firebaseConfig.authDomain,
  projectIdPresent: !!firebaseConfig.projectId,
  storageBucketPresent: !!firebaseConfig.storageBucket,
  messagingSenderIdPresent: !!firebaseConfig.messagingSenderId,
  appIdPresent: !!firebaseConfig.appId,
  clientEmailPresent: !!firebaseConfig.clientEmail,
  privateKeyPresent: !!firebaseConfig.privateKey
});
