import { getFirestore } from "firebase/firestore";
import { firebaseApp } from ".";

export const db = getFirestore(firebaseApp);
