// Firebase utilities for Vercel serverless functions
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let firebaseApp = null;
let db = null;

export function initializeFirebase() {
  if (firebaseApp) {
    return { app: firebaseApp, db };
  }

  try {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
      db = getFirestore(firebaseApp);
      return { app: firebaseApp, db };
    }

    // Use fallback credentials if environment variables are not set
    const projectId = process.env.FIREBASE_PROJECT_ID || 'studynovabot';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@studynovabot.iam.gserviceaccount.com';
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDU/4jNDJ3dQe0+
ihso+MGitaV6G71B64bozJZp1HBCCoQKQ/ijbk1BPnkCsS8gBCcQOuDMf7YcGB+D
ktRIjOrqCzdcQxUsu54hxCA5a9l8VCsqxMLf/nGkJfUENSpErPoZwqABa6Vnyipe
lGMKs0Tsx6vg4E7ikSlVCTcI1zk40+7PHap319T+ogl/yTA0nTmZGak76PZWQ61K
vOjQ99GNf0CRmyNXGo4r25wZ38VM3x85dZunLtxHQ6tJJlErH4WBgth1DEZfm+0p
8LlB7pZuThQYXd//IjzkHWevK+/HM+hM3FmERaUV0Zwibgzsop9qYAhKIt6doCTG
gLBGRVRPAgMBAAECggEADxqicXfy5zJk8nRfV1kcfL9IzA8/gnct3+ryF5sa7XP1
cmI+NXNS7czSTqCQk5f3yoItAr4OWeZUBcPZuIiq9+HHu+EolT17XzBF4Lcx0Evf
q8QRgEojdjJth4OFoHfBByadVhHIxEK6cm6Eqh5ARad7HBKL8Cu/Ceqss7x0sFTQ
j4gsIdZioV1QUsX+hHrQKnlYG2lydpcoq+aYvuPevVvJK55oGuf50yQxgORQY4al
pUJKqr9xDEdfg4gNoO2twZ6XZ0Yi/fFIjDJZQrIRc3W6+ABFgWFBlFGlpdAeUXnN
c5gdVmzFY+bm8d4rSjPfWpX3s7mPLLoXRkcwUsxWIQKBgQDvh4IO3ksFVFvUbXXl
sLXRYIlFQOEc/IqfaTdy1NmxYdNv2bBwgpz/sije+HuRuirqdFrQeB8Ice2XNmIv
6pf/gRch+jOkMTWuimNY4sMzud0JE74C7sLx76UQhIwVlbD0CZGLS1bHEIwbFWsu
vbpy2B6S4MwV6HA9596HwbykJwKBgQDjpP4CPdwI7lN7Uafw9QM+pwTPGSslsluP
WLrI3InIaDMKANYcobvo3S5syv2sEmh9tUe/VptszWrgGKpu1OTfrrp3GjcSZ3Pg
+FZSLPf26RMna5DVhKJCrch5IPqgMUjX1dfYn0aSxg3bpGXY/BdHNRayUOv6otQ9
XryHhbWfmQKBgQCj8HQUpxJjsGw1hUGXFo4qos7xBknM5BAgsQvRXVstq83iFPVM
3CiGXTLaAOnaQLgUxdROMJjU190MjJ1BPGgR6RGjILLtovyh3HfIo1OE+KYPC2MW
cMIegq3QE1gpgc2eCVqDIupezrWF5+/3CsYsyjyKvK8SI4eG50cIVZI+KwKBgAZP
t78mKeiRev0LSYWztVBSXx7CyuBzrngt9JfHDYbh5LBdT5JhpY0SPMxFYH0Z0Y3S
rdePNiXxGAp4hJkoC+Rrur28m1RGS/8rw3Dp0EInOiG4qL5SvBDvMoSxNmGknCln
w2E9IT7GgPHa//vhGWAfB68P8Ur0or/E1aNIQL3ZAoGBANPbqrLqe5ZQIPMCBLyf
dPgX8j9Qly/mR4a+48fS0ckATEhRh35LmTdZs/Zf5ojJZTTImB3YA+j/O58Aq7/z
dkBZQYBzLcBcvox1xBiQhC+k6b5ZeAznjSvVp4pFmwyaEg/BjzOBcinWiT7Fmihx
kVm25X7PTd8kbcqKC2Jy9m7U
-----END PRIVATE KEY-----`;

    // Initialize Firebase Admin
    const serviceAccount = {
      type: "service_account",
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: clientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${clientEmail}`
    };

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId
    });

    db = getFirestore(firebaseApp);

    console.log('✅ Firebase initialized successfully for Vercel');
    return { app: firebaseApp, db };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

export function getFirestoreDb() {
  if (!db) {
    const { db: database } = initializeFirebase();
    return database;
  }
  return db;
}
