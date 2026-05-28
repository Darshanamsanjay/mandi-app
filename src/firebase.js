import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDnO_FhqGKFPWECnkElWLZGErM3SDDHj7E",
    authDomain: "madannapet-mandi.firebaseapp.com",
    projectId: "madannapet-mandi",
    storageBucket: "madannapet-mandi.firebasestorage.app",
    messagingSenderId: "568026484085",
    appId: "1:568026484085:web:0bf57f23e3d07039aad73c",
    measurementId: "G-1DLMKXB6BR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);