import { db } from './firebase-config.js';
import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const safely = async (work) => {
  try { return await work(); } catch (error) { console.warn('Firebase Moda:', error.message); return null; }
};

const productRef = collection(db, 'products');
onSnapshot(productRef, (snapshot) => {
  if (!snapshot.empty && window.setFirebaseProducts) {
    window.setFirebaseProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }
}, error => console.warn('Catalogue Firebase indisponible:', error.message));

safely(async () => {
  const snapshot = await getDocs(collection(db, 'deliveryRates'));
  if (!snapshot.empty && window.setFirebaseDeliveryRates) {
    window.setFirebaseDeliveryRates(snapshot.docs.map(doc => ({ code: doc.id, ...doc.data() })).sort((a, b) => a.code.localeCompare(b.code)));
  }
});

window.createFirebaseOrder = async (order) => {
  const result = await safely(() => addDoc(collection(db, 'orders'), { ...order, status: 'Nouvelle', createdAt: serverTimestamp() }));
  if (!result) throw new Error('La commande ne peut pas être enregistrée pour le moment.');
  return result.id;
};

window.firebaseStoreReady = true;
