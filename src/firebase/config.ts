import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, onValue } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type Auth, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA2T8PddUwaJHiaMNJ3XvwMDBFJ4CaohHE",
  authDomain: "optimum-website-1a60b.firebaseapp.com",
  databaseURL: "https://optimum-website-1a60b-default-rtdb.firebaseio.com",
  projectId: "optimum-website-1a60b",
  storageBucket: "optimum-website-1a60b.appspot.com",
  messagingSenderId: "472845820373",
  appId: "1:784083256897:web:3edc73fa438f5faa2f68c0"
};

let database: ReturnType<typeof getDatabase> | null = null;
let auth: Auth | null = null;

try {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.log('Firebase initialization deferred - config needed');
}

export const fbRef = (path: string) => {
  if (!database) throw new Error('Firebase not initialized');
  return ref(database, path);
};

export const fbAuth = () => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return auth;
};

export type FbUser = User;

export const fbLogin = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return signInWithEmailAndPassword(auth, email, password);
};

export const fbLogout = async () => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return signOut(auth);
};

export const fbOnAuthStateChanged = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

export const fbGet = async (path: string) => {
  try {
    if (!database) return null;
    const snapshot = await get(fbRef(path));
    return snapshot.val();
  } catch (error) {
    console.error('Firebase get error:', error);
    return null;
  }
};

export const fbSet = async (path: string, data: any) => {
  try {
    if (!database) return;
    await set(fbRef(path), data);
    console.log('Firebase data saved:', path);
  } catch (error) {
    console.error('Firebase set error:', error);
  }
};

export const fbSubscribe = (path: string, callback: (data: any) => void) => {
  try {
    if (!database) return () => {};
    const dataRef = fbRef(path);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      callback(snapshot.val());
    });
    return unsubscribe;
  } catch (error) {
    console.error('Firebase subscribe error:', error);
    return () => {};
  }
};
