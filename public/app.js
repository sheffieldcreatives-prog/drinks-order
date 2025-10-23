// Firebase-backed client app for drinks-order
// Requires public/firebase-config.js to exist and set window.FIREBASE_CONFIG

// Load Firebase via CDN (index.html includes the compat scripts).
// Initialize Firebase
if (!window.FIREBASE_CONFIG) {
  console.error('Missing Firebase config — add public/firebase-config.js from README instructions.');
}
const firebaseConfig = window.FIREBASE_CONFIG || {};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const ordersCollection = db.collection('orders');

const ordersList = document.getElementById('ordersList');
const orderForm = document.getElementById('orderForm');
const nameInput = document.getElementById('name');
const orderInput = document.getElementById('order');
const clearBtn = document.getElementById('clearBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

function renderOrders(orders) {
  ordersList.innerHTML = '';
  if (!orders || orders.length === 0) {
    const li = document.createElement('li');
    li.className = 'list-group-item text-muted';
    li.textContent = 'No orders yet';
    ordersList.appendChild(li);
    return;
  }
  orders.sort((a, b) => a.created_at - b.created_at);
  for (const o of orders) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start flex-wrap';
    const left = document.createElement('div');
    left.innerHTML = `<strong>${escapeHtml(o.name)}</strong><div class="small text-muted">${new Date(o.created_at).toLocaleString()}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<div>${escapeHtml(o.order)}</div>`;
    const actions = document.createElement('div');
    actions.className = 'ms-3';
    const del = document.createElement('button');
    del.className = 'btn btn-sm btn-outline-danger';
    del.textContent = 'Delete';
    del.onclick = async () => {
      if (!confirm('Remove this order?')) return;
      try {
        await ordersCollection.doc(o.id).delete();
      } catch (err) {
        alert('Delete failed: ' + err);
      }
    };
    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(right);
    li.appendChild(actions);
    ordersList.appendChild(li);
  }
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

// Real-time listener from Firestore
ordersCollection.orderBy('created_at', 'asc').onSnapshot(snapshot => {
  const orders = [];
  snapshot.forEach(doc => {
    const d = doc.data();
    orders.push({
      id: doc.id,
      name: d.name,
      order: d.order,
      created_at: d.created_at ? d.created_at.toMillis() : Date.now()
    });
  });
  renderOrders(orders);
}, (err) => {
  console.error('Firestore listener error', err);
});

// Form submit: add to Firestore
orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const order = orderInput.value.trim();
  if (!name || !order) return alert('Please add both name and order');
  try {
    await ordersCollection.add({
      name,
      order,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    nameInput.value = '';
    orderInput.value = '';
  } catch (err) {
    alert('Failed to submit order: ' + err);
  }
});

clearBtn.addEventListener('click', () => {
  nameInput.value = '';
  orderInput.value = '';
});

clearAllBtn.addEventListener('click', async () => {
  if (!confirm('Clear ALL orders?')) return;
  try {
    const snapshot = await ordersCollection.get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  } catch (err) {
    alert('Failed to clear: ' + err);
  }
});
