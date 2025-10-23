// Firebase-backed client app for drinks-order
// Requires public/firebase-config.js to exist and set window.FIREBASE_CONFIG

if (!window.FIREBASE_CONFIG) {
  console.error("Missing Firebase config — add docs/firebase-config.js.");
}

firebase.initializeApp(window.FIREBASE_CONFIG);
const db = firebase.firestore();
const ordersCollection = db.collection("orders");

const ordersList = document.getElementById("ordersList");
const orderForm = document.getElementById("orderForm");
const nameInput = document.getElementById("name");
const orderInput = document.getElementById("order");
const clearBtn = document.getElementById("clearBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

// Escape helper
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

// Render orders list
function renderOrders(orders) {
  ordersList.innerHTML = "";
  if (!orders.length) {
    const li = document.createElement("li");
    li.className = "list-group-item text-muted";
    li.textContent = "No orders yet";
    ordersList.appendChild(li);
    return;
  }
  orders.sort((a, b) => a.created_at - b.created_at);
  for (const o of orders) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-start flex-wrap";

    const left = document.createElement("div");
    left.innerHTML = `<strong>${escapeHtml(o.name)}</strong>
      <div class="small text-muted">${new Date(o.created_at).toLocaleString()}</div>`;

    const right = document.createElement("div");
    right.innerHTML = `<div>${escapeHtml(o.order)}</div>`;

    const actions = document.createElement("div");
    actions.className = "ms-3";
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.textContent = "Delete";
    del.onclick = async () => {
      if (!confirm("Remove this order?")) return;
      try {
        await ordersCollection.doc(o.id).delete();
      } catch (err) {
        alert("Delete failed: " + err);
      }
    };
    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(right);
    li.appendChild(actions);
    ordersList.appendChild(li);
  }
}

// Real-time listener
ordersCollection.orderBy("created_at", "asc").onSnapshot(
  (snapshot) => {
    const orders = [];
    snapshot.forEach((doc) => {
      const d = doc.data();
      orders.push({
        id: doc.id,
        name: d.name,
        order: d.order,
        created_at: d.created_at ? d.created_at.toMillis() : Date.now()
      });
    });
    renderOrders(orders);
  },
  (err) => console.error("Firestore listener error", err)
);

// Form submit
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const order = orderInput.value.trim();
  if (!name || !order) return alert("Please add both name and order");
  try {
    await ordersCollection.add({
      name,
      order,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    nameInput.value = "";
    orderInput.value = "";
  } catch (err) {
    alert("Failed to submit order: " + err);
  }
});

// Clear form
clearBtn.addEventListener("click", () => {
  nameInput.value = "";
  orderInput.value = "";
});

// Clear all
clearAllBtn.addEventListener("click", async () => {
  if (!confirm("Clear ALL orders?")) return;
  try {
    const snapshot = await ordersCollection.get();
    const batch = db.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  } catch (err) {
    alert("Failed to clear: " + err);
  }
});
