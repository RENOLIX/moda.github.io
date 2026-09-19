import { db } from './firebase-config.js';
import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const safely = async (work) => {
  try { return await work(); } catch (error) { console.warn('Firebase Moda:', error.message); return null; }
};

const productRef = collection(db, 'products');
let receivedServerProducts = false;
onSnapshot(productRef, { includeMetadataChanges: true }, (snapshot) => {
  // Firestore peut fournir une ancienne copie locale avant la réponse serveur.
  // On l'ignore lors du premier chargement pour ne jamais faire clignoter une
  // fiche de produit précédente avant la bonne fiche.
  if (snapshot.metadata.fromCache && !receivedServerProducts) return;
  if (!snapshot.empty && window.setFirebaseProducts) {
    receivedServerProducts = true;
    window.setFirebaseProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }
}, error => {
  console.warn('Catalogue Firebase indisponible:', error.message);
  window.renderProductFallback?.();
});

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
