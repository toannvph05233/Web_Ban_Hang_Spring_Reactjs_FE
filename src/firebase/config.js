import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAmD1jRFGZslaPMYb3iTSlBpEJRhwcawws",
    authDomain: "project-md6-cg.firebaseapp.com",
    projectId: "project-md6-cg",
    storageBucket: "project-md6-cg.appspot.com",
    messagingSenderId: "1078083774419",
    appId: "1:1078083774419:web:4828e7618f318167ce7126"
};


const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);