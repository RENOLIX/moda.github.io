import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: 'AIzaSyBglK-06DCU6H6VaKilzgpSgHOWLanFiCA',
  authDomain: 'moda-df2da.firebaseapp.com',
  projectId: 'moda-df2da',
  storageBucket: 'moda-df2da.firebasestorage.app',
  messagingSenderId: '29135452485',
  appId: '1:29135452485:web:a19735965291ae5437e62c'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
