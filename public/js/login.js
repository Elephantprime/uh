<!-- /public/js/login.js -->
<script type="module">
  import { auth, db, storage } from "./js/firebase.js";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import {
    doc, setDoc, serverTimestamp
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  import {
    ref as storageRef, uploadBytes, getDownloadURL
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

  const $ = (id) => document.getElementById(id);

  // --- SIGN UP ---
  const signupForm = $("signup-form");
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("signup-email").value.trim();
    const pass  = $("signup-password").value;
    const file  = $("profile-picture").files?.[0] || null;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      let photoURL = null;

      if (file) {
        const path = `profilePictures/${cred.user.uid}/${file.name}`;
        const ref  = storageRef(storage, path);
        await uploadBytes(ref, file);
        photoURL = await getDownloadURL(ref);
        await updateProfile(cred.user, { photoURL });
      }

      await setDoc(doc(db, "profiles", cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName: cred.user.displayName || "Member",
        photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Go to the app after successful signup
      location.replace("./app.html");
    } catch (err) {
      alert(err?.message || "Sign up failed.");
    }
  });

  // --- LOGIN ---
  const loginForm = $("login-form");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("login-email").value.trim();
    const pass  = $("login-password").value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);

      // Touch profile on login
      await setDoc(doc(db, "profiles", cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName: cred.user.displayName || "Member",
        photoURL: cred.user.photoURL || null,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Go to the app
      location.replace("./app.html");
    } catch (err) {
      alert(err?.message || "Login failed.");
    }
  });
</script>
