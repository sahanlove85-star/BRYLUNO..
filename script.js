// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoYDclGhL75b14C1fT_5SRsrrEt8B6iyU",
  authDomain: "bryluno-system.firebaseapp.com",
  databaseURL: "https://bryluno-system-default-rtdb.firebaseio.com",
  projectId: "bryluno-system",
  storageBucket: "bryluno-system.firebasestorage.app",
  messagingSenderId: "666741527124",
  appId: "1:666741527124:web:bebf8a61c085eba11cd3c1",
  measurementId: "G-N5KBSRT7BS"
};

// Initialize Firebase (Compat Version for simple HTML)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// 2. Register Function (ரீசெல்லர் விபரங்களைச் சேமிக்க)
async function registerReseller(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    try {
        // Firebase Auth-ல் பயனர் கணக்கை உருவாக்குதல்
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const uid = userCredential.user.uid;

        // தரவுத்தளத்தில் விபரங்களைச் சேமித்தல் (Status: Pending)
        await db.ref('users/' + uid).set({
            name: name,
            email: email,
            status: "Pending", // நீங்கள் அப்ரூவ் செய்யும் வரை இது Pending-ல் இருக்கும்
            regDate: new Date().toISOString()
        });

        alert("பதிவு செய்யப்பட்டது! அட்மின் அப்ரூவலுக்காகக் காத்திருக்கவும்.");
        location.reload(); // பக்கத்தைப் புதுப்பிக்க
    } catch (error) {
        alert("தவறு நடந்துள்ளது: " + error.message);
    }
}

// 3. Admin Notification (புதிய பதிவுகளைக் கண்காணித்தல்)
function listenForApplications() {
    db.ref('users').orderByChild('status').equalTo('Pending').on('value', (snapshot) => {
        const count = snapshot.numChildren();
        const notifBadge = document.getElementById('notif-count');
        
        if(count > 0) {
            notifBadge.innerText = count;
            notifBadge.style.display = 'block'; // சிவப்பு நோட்டிபிகேஷன் காட்டும்
        } else {
            notifBadge.style.display = 'none';
        }
    });
}

// பக்கத்தை லோட் செய்யும் போது ரன் ஆகும்
window.onload = () => {
    // ஒருவேளை அட்மின் லாகின் செய்திருந்தால் நோட்டிபிகேஷனை ஆன் செய்யவும்
    // (இதை அடுத்த ஸ்டெப்பில் விரிவாகப் பார்ப்போம்)
};
