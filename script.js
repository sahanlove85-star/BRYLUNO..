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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// 2. Navigation Logic - பக்கங்களை மாற்ற
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.add('hidden'));
    
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    window.scrollTo(0,0);
}

// 3. Load Inventory from your Google Sheet
async function loadInventory() {
    // உங்கள் Sheet ID இங்கே இணைக்கப்பட்டுள்ளது
    const sheetID = "1BQ819L1qmuatSTgwjXMAR0K-tNQcIIanow7EdthO6Sg";
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        // JSON டேட்டாவை மட்டும் பிரித்தெடுத்தல்
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;
        
        const display = document.getElementById('product-display');
        if (!display) return;
        
        display.innerHTML = ''; // Loading மெசேஜை நீக்க

        rows.forEach(row => {
            // Column 0: Name, Column 1: Price, Column 2: Image URL
            const name = row.c[0] ? row.c[0].v : "Luxury Item";
            const price = row.c[1] ? row.c[1].v : "Contact for Price";
            const imgUrl = row.c[2] ? row.c[2].v : "https://via.placeholder.com/300";

            display.innerHTML += `
                <div class="glass-card p-6 rounded-[30px] border border-white/5 group">
                    <div class="h-64 bg-white/5 rounded-2xl mb-6 overflow-hidden">
                        <img src="${imgUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform" onerror="this.src='https://via.placeholder.com/300'">
                    </div>
                    <h3 class="brand-font text-xl mb-1 gold-text">${name}</h3>
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-4">LKR ${price}</p>
                    <button class="w-full py-3 border border-amber-500/30 rounded-xl text-[10px] font-bold uppercase hover:bg-amber-500 hover:text-black transition-all">Reserve Piece</button>
                </div>
            `;
        });
    } catch (e) {
        console.error("Sheet loading error:", e);
        const display = document.getElementById('product-display');
        if(display) display.innerHTML = '<p class="text-white/20 text-center col-span-full">Unable to sync with Google Sheets. Check permissions.</p>';
    }
}

// 4. Reseller Registration
async function registerReseller(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const uid = userCredential.user.uid;

        // Firebase-ல் டேட்டாவைச் சேமித்தல்
        await db.ref('users/' + uid).set({
            name: name,
            email: email,
            status: "Pending",
            role: "reseller",
            regDate: new Date().toISOString()
        });

        alert("Application Submitted Successfully! Wait for Admin Approval.");
        showPage('home');
        document.getElementById('reg-form').reset();
    } catch (e) {
        alert("Registration Error: " + e.message);
    }
}

// 5. Admin Login & System Logic
function authAdminCheck() {
    const email = prompt("Enter Admin Gmail:");
    if (!email) return;
    const pass = prompt("Enter Admin Password:");
    if (!pass) return;

    // Owner Email சரிபார்ப்பு
    if(email === 'bryluno.pvt.ltd@gmail.com') {
        auth.signInWithEmailAndPassword(email, pass).then(() => {
            showPage('admin');
            loadAdminDashboard();
        }).catch(e => alert("Login Failed: " + e.message));
    } else {
        // ஒருவேளை இது ரீசெல்லராக இருந்தால்
        auth.signInWithEmailAndPassword(email, pass).then((user) => {
            checkUserStatus(user.user.uid);
        }).catch(e => alert("Login Failed: " + e.message));
    }
}

function checkUserStatus(uid) {
    db.ref('users/' + uid).once('value').then(snap => {
        const userData = snap.val();
        if (userData && userData.status === "Approved") {
            document.getElementById('reseller-name-display').innerText = userData.name;
            showPage('reseller');
        } else {
            alert("Your account is still PENDING approval.");
            auth.signOut();
        }
    });
}

// 6. Admin Dashboard & Notifications
function loadAdminDashboard() {
    // புதிய விண்ணப்பங்களைக் கண்காணித்தல் (Pending)
    db.ref('users').orderByChild('status').equalTo('Pending').on('value', snap => {
        const list = document.getElementById('pending-users-list');
        if(!list) return;
        
        list.innerHTML = '';
        let count = 0;
        
        snap.forEach(child => {
            count++;
            const user = child.val();
            list.innerHTML += `
                <div class="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div>
                        <p class="font-bold text-xs gold-text">${user.name}</p>
                        <p class="text-[9px] text-white/30">${user.email}</p>
                    </div>
                    <button onclick="approveUser('${child.key}', '${user.email}')" class="bg-amber-600 text-black px-4 py-1 rounded-lg text-[10px] font-black hover:bg-white transition-all">APPROVE</button>
                </div>
            `;
        });
        
        const notifBadge = document.getElementById('notif-count');
        if(notifBadge) {
            notifBadge.innerText = count;
            notifBadge.classList.toggle('hidden', count === 0);
        }
    });
}

// 7. Approve Function (Email Notification Placeholder)
function approveUser(uid, email) {
    db.ref('users/' + uid).update({
        status: 'Approved'
    }).then(() => {
        alert("Reseller Approved! They can now login to their dashboard.");
        // Note: For automatic emails, you'd typically use a Firebase Cloud Function or EmailJS.
    }).catch(e => alert("Error: " + e.message));
}

// Logout Function
function logout() {
    auth.signOut().then(() => {
        alert("Logged Out Safely.");
        location.reload();
    });
}

// Initialize on Window Load
window.onload = () => {
    loadInventory();
};
