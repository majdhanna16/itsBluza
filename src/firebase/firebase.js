import firebase from 'firebase';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyApTDZ4T35TyJInx1_crOb33q8KmtFtwvA",
    authDomain: "itsbluza-161997.firebaseapp.com",
    projectId: "itsbluza-161997",
    storageBucket: "itsbluza-161997.appspot.com",
    messagingSenderId: "43962949714",
    appId: "1:43962949714:web:93d8c064c6fd5abca1ff8b",
    measurementId: "G-FTKN0B0LJ8"
};

firebase.initializeApp(firebaseConfig);
var storage = firebase.storage();
export default storage; 