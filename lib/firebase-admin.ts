import { cert, getApps, getApp, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

function buildCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID || "miumo-61696";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Thiếu FIREBASE_CLIENT_EMAIL hoặc FIREBASE_PRIVATE_KEY. Lấy từ Firebase Console > Project settings > Service accounts > Generate new private key."
    );
  }

  return cert({ projectId, clientEmail, privateKey });
}

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: buildCredential(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

export const adminDb = getDatabase(app);
