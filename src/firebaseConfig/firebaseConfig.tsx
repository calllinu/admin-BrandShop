import {initializeApp} from 'firebase/app'
import { getFirestore } from '@firebase/firestore';
import {getAuth} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSZZBli3eOaQfOUYnFRszMzsMPgvJXrME",
  authDomain: "exclusiveshop-31175.firebaseapp.com",
  projectId: "exclusiveshop-31175",
  storageBucket: "exclusiveshop-31175.appspot.com",
  messagingSenderId: "352427841894",
  appId: "1:352427841894:web:3b62c97023b32f41f190a7",
  measurementId: "G-S0GCR25JNH"
};

export const app = initializeApp(firebaseConfig)
export const database = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);


