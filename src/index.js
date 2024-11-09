import { initializeApp } from 'firebase/app'
import { 
    getFirestore,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDoc,
    updateDoc,
} from 'firebase/firestore'

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBAqQe-BzISsTL_ez4fIDUpBpM_uwzG9-g",
    authDomain: "campus-ridesharing.firebaseapp.com",
    projectId: "campus-ridesharing",
    storageBucket: "campus-ridesharing.firebasestorage.app",
    messagingSenderId: "579381548392",
    appId: "1:579381548392:web:4864cd98932792882cb2dd",
    measurementId: "G-TQ3WWR9EZR"
  };

// init firebase app
initializeApp(firebaseConfig)

// init services
const db = getFirestore()
const auth = getAuth()

// collection ref
const colRef = collection(db, 'rides')

// queries
const q = query(colRef, orderBy('Date', 'asc'), orderBy('Location', 'asc'))

// real collection data
const unsubCol = onSnapshot(q, (snapshot) => {
  let rides = []
    snapshot.docs.forEach((doc) => {
        rides.push({...doc.data(), id: doc.id})
    })
    console.log(rides)
  })


// Adding document
const addRideForm = document.querySelector('.add')
addRideForm.addEventListener('submit', (e) => {
  e.preventDefault()

  addDoc(colRef, {
    Cost: addRideForm.Cost.value,
    Date: addRideForm.Date.value,
    Location: addRideForm.Location.value,
  })
  .then(() => {
    addRideForm.reset()
  })

})

// Deleting document
const deleteRideForm = document.querySelector('.delete')
deleteRideForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const docRef = doc(db, 'rides', deleteRideForm.id.value)
  deleteDoc(docRef)
    .then(() => {
      deleteRideForm.reset()
    })
})

// Get a single document
const docRef = doc(db, 'rides', 'R9xhFA5ipETGwFR3YfMR')

//getDoc(docRef)
  //.then((doc) => {
    //console.log(doc.data(), doc.id)

  //})
const unsubDoc = onSnapshot(docRef, (doc) => {
  console.log(doc.data(), doc.id)
})

// Updating a document
const updateForm = document.querySelector('.update')
updateForm.addEventListener('submit', (e) =>{
  e.preventDefault()

  const docRef = doc(db, 'rides', updateForm.id.value)
  updateDoc(docRef, {
    Cost: '1'
  })
  .then(() => {updateForm.reset()})

})

// Signing users up
const signUpForm = document.querySelector('.signup')
signUpForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const email = signUpForm.email.value
  const password = signUpForm.password.value

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("user created:", cred.user)
      signUpForm.reset()
    })
    .catch((err) => {
      console.log(err.message)
    })

})

// Logging in and out
const logoutButton = document.querySelector('.logout')
logoutButton.addEventListener('click', () => {

  signOut(auth)
  .then(() => {
    //console.log('user signed out')
  })
  .catch((err) => {
    console.log(err.message)
  })

})

const loginForm = document.querySelector('.login')
loginForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const email = loginForm.email.value
  const password = loginForm.password.value

  signInWithEmailAndPassword(auth, email, password)
  .then((cred) => {
    //console.log('user logged in', cred.user)
  })
  .catch((err) => {
    console.log(err.message)
  })
})

// subscribing to auth changes
const unsubAuth = onAuthStateChanged(auth, (user) => {
  console.log('user status changed: ', user)
})

// unsubscribing from changes (db/auth)
const unsubButton = document.querySelector('.unsub')
unsubButton.addEventListener('click', () => {
  console.log('unsubscribing')
  unsubCol()
  unsubDoc()
  unsubAuth()
})