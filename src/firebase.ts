import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAniQRejPH2XKtCfpH3X37_g9jTpTNhU78",
  authDomain: "exofix-maneger.firebaseapp.com",
  projectId: "exofix-maneger",
  storageBucket: "exofix-maneger.firebasestorage.app",
  messagingSenderId: "1068997645156",
  appId: "1:1068997645156:web:b6f77d9185a07c26cc2071",
  measurementId: "G-TG5VQV4J4P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
