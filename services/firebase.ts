
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmNdzZT_ibX_iN_erEya8zYW9pACHYxCs",
  authDomain: "tele-nahidx07.firebaseapp.com",
  projectId: "tele-nahidx07",
  storageBucket: "tele-nahidx07.firebasestorage.app",
  messagingSenderId: "791722355896",
  appId: "1:791722355896:web:90fad22fe299c7c396d84d",
  measurementId: "G-4MP2MV2DRF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const firebaseAuth = {
  login: (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass),
  register: (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass),
  loginWithGoogle: () => signInWithPopup(auth, googleProvider),
  logout: () => signOut(auth)
};
