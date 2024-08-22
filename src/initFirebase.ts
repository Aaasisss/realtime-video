import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCs1iqHbmh-7ElKTzR7OZLnm0AWqxG1na0",
  authDomain: "realtime-video-aff30.firebaseapp.com",
  projectId: "realtime-video-aff30",
  storageBucket: "realtime-video-aff30.appspot.com",
  messagingSenderId: "227010121686",
  appId: "1:227010121686:web:78a78418ff0190f9081e77",
  measurementId: "G-0PZ55NJ86B",
};

export const firebaseApp = initializeApp(firebaseConfig);

export const firestoreDB = getFirestore(firebaseApp);
