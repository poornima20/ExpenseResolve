// 🧪 TEST MODE: clear all saved data on every refresh
localStorage.clear();

/***********************
 * GLOBAL STATE
 ***********************/
const user = "User";               // logged-in user
let splitMode = "equal";
let currentGroupName = null;

const STORAGE_KEY = "expenseDB";

/***********************
 * INIT DATABASE
 ***********************/
function initDB() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const db = {
      groups: {
        "Trip to Goa": {
          members: ["User", "Alice", "Bob"],
          expenses: []
        }
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}
initDB();

/***********************
 * DB HELPERS
 ***********************/
function getDB() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/***********************
 * RENDER GROUPS
 ***********************/
renderGroups();

function renderGroups() {
  const ul = document.getElementById("groupList");
  ul.innerHTML = "";

  const db = getDB();
  Object.keys(db.groups).forEach(group => {
    const li = document.createElement("li");
    li.innerText = group;
    li.onclick = () => openGroup(group);
    ul.appendChild(li);
  });
}

/***********************
 * OPEN GROUP
 ***********************/
function openGroup(name) {
  currentGroupName = name;

  document.getElementById("groupTitle").innerText = name;
  document.getElementById("emptyState").style.display = "none";
  document.getElementById("dashboard").style.display = "flex";

  renderMembersUI();
  renderPaidByDropdown();
  renderBalances();
  renderSplitUI();
}

/***********************
 * MEMBERS UI
 ***********************/
function renderMembersUI() {
  const db = getDB();
  const group = db.groups[currentGroupName];
  const container = document.querySelector(".member-chips");

  container.innerHTML = "";

  group.members.forEach(m => {
    const chip = document.createElement("span");
    chip.className = "chip" + (m === user ? " you" : "");
    chip.innerText = m;
    container.appendChild(chip);
  });

  const addChip = document.createElement("span");
  addChip.className = "chip add";
  addChip.innerText = "+ Add";
  addChip.onclick = addMember;
  container.appendChild(addChip);
}

/***********************
 * ADD Members
 ***********************/
function addMember() {
 
  const db = getDB(); // 1. Get database from localStorage  
  const group = db.groups[currentGroupName]; // 2. Get currently open group
  
  const name = prompt("Enter member name");// 3. Ask user for member name 
  if (!name) return;  // 4. Stop if empty or cancelled
  
  if (group.members.includes(name)) {
    alert("Member already exists");
    return;
  }// 5. Prevent duplicate members

  group.members.push(name); // 6. Add member to group  
  saveDB(db);// 7. Save updated DB back to localStorage

  // 8. Re-render UI
  renderMembersUI();
  renderPaidByDropdown();
  renderSplitUI();
}


/***********************
 * PAID BY DROPDOWN
 ***********************/
function renderPaidByDropdown() {
  const db = getDB();
  const group = db.groups[currentGroupName];
  const select = document.getElementById("paidBy");

  select.innerHTML = "";

  group.members.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.innerText = m + (m === user ? " (You)" : "");
    select.appendChild(opt);
  });

  select.value = user;
}

/***********************
 * ADD EXPENSE (CORE LOGIC)
 ***********************/
function addExpense() {
  const total = Number(document.getElementById("totalAmount").value);
  const paidBy = document.getElementById("paidBy").value;

  if (!total || total <= 0) {
    alert("Invalid amount");
    return;
  }

  const db = getDB();
  const group = db.groups[currentGroupName];
  const members = group.members;

  const splits = {};

  if (splitMode === "equal") {
    const share = total / members.length;

    members.forEach(m => {
      if (m !== paidBy) {
        splits[m] = share; // only people who owe
      }
    });
  }

if (splitMode === "exact") {
  let sum = 0;

  members.forEach(m => {
    if (m === paidBy) return; // payer has NO input

    const val = Number(
      document.getElementById(`exact-${m}`)?.value || 0
    );

    sum += val;
    if (val > 0) {
      splits[m] = val; // only others owe
    }
  });

  const payerShare = total - sum;

  if (payerShare < 0) {
    alert("Exact amounts exceed total ₹" + total);
    return;
  }
}

if (splitMode === "percent") {
  let usedPercent = 0;

  members.forEach(m => {
    if (m === paidBy) return;

    const p = Number(
      document.getElementById(`percent-${m}`)?.value || 0
    );

    usedPercent += p;

    if (p > 0) {
      splits[m] = (total * p) / 100;
    }
  });

  if (usedPercent > 100) {
    alert("Percentages exceed 100%");
    return;
  }
}


  group.expenses.push({
    id: Date.now(),
    paidBy,
    total,
    splits,       // ONLY who owes whom
    settled: {},
    date: new Date().toLocaleString()
  });

  saveDB(db);
  renderBalances();
}

/***********************
 * YOU OWE (DERIVED)
 ***********************/
function getYouOwe() {
  const db = getDB();
  const group = db.groups[currentGroupName];
  let owe = 0;

  group.expenses.forEach(e => {
    if (e.paidBy !== user && e.splits[user] && !e.settled[user]) {
      owe += e.splits[user];
    }
  });

  return owe;
}

/***********************
 * YOU ARE OWED (DERIVED)
 ***********************/
function getYouAreOwed() {
  const db = getDB();
  const group = db.groups[currentGroupName];
  const owed = {};

  group.expenses.forEach(e => {
    if (e.paidBy !== user) return;

    Object.entries(e.splits).forEach(([person, amt]) => {
      if (!e.settled[person]) {
        owed[person] = (owed[person] || 0) + amt;
      }
    });
  });

  return owed;
}

/***********************
 * RENDER BALANCES
 ***********************/
function renderBalances() {
  document.getElementById("youOwe").innerText =
    `₹${getYouOwe().toFixed(2)}`;

  const owedMap = getYouAreOwed();
  const totalOwed = Object.values(owedMap).reduce((a, b) => a + b, 0);

  document.getElementById("youAreOwed").innerText =
    `₹${totalOwed.toFixed(2)}`;
}

/***********************
 * SPLIT MODE
 ***********************/
function setSplit(mode) {
  splitMode = mode;

  document.querySelectorAll(".split-tabs button")
    .forEach(b => b.classList.remove("active"));

  document
    .querySelector(`.split-tabs button[onclick="setSplit('${mode}')"]`)
    ?.classList.add("active");

  renderSplitUI();
}

/***********************
 * SPLIT UI
 ***********************/

function updateExactRemaining() {
  if (splitMode !== "exact") return;

  const total = Number(document.getElementById("totalAmount").value || 0);
  const paidBy = document.getElementById("paidBy").value;

  const db = getDB();
  const group = db.groups[currentGroupName];

  let sum = 0;

  group.members.forEach(m => {
    if (m === paidBy) return;

    const input = document.getElementById(`exact-${m}`);
    const val = Number(input?.value || 0);
    sum += val;
  });

  const remaining = Math.max(total - sum, 0);

  const remainingEl = document.getElementById("exact-remaining");
  if (remainingEl) {
    remainingEl.innerText = `₹${remaining.toFixed(2)}`;
  }
}

function updatePercentRemaining() {
  if (splitMode !== "percent") return;

  const total = Number(document.getElementById("totalAmount").value || 0);
  const paidBy = document.getElementById("paidBy").value;

  const db = getDB();
  const group = db.groups[currentGroupName];

  let usedPercent = 0;

  group.members.forEach(m => {
    if (m === paidBy) return;

    const input = document.getElementById(`percent-${m}`);
    const val = Number(input?.value || 0);
    usedPercent += val;

    const amtEl = document.getElementById(`percent-amt-${m}`);
    if (amtEl) {
      const amt = (total * val) / 100;
      amtEl.innerText = `₹${amt.toFixed(2)}`;
    }
  });

  const remainingPercent = Math.max(100 - usedPercent, 0);
  const remainingAmount = (total * remainingPercent) / 100;

  const percentEl = document.getElementById("percent-remaining");
  const amtEl = document.getElementById("percent-remaining-amt");

  if (percentEl) percentEl.innerText = `${remainingPercent.toFixed(2)}%`;
  if (amtEl) amtEl.innerText = `₹${remainingAmount.toFixed(2)}`;
}


function renderSplitUI() {
  const area = document.getElementById("splitArea");
  const db = getDB();
  const group = db.groups[currentGroupName];

  area.innerHTML = "";

  const total = Number(document.getElementById("totalAmount").value || 0);
  const paidBy = document.getElementById("paidBy").value;
  const equalShare = total / group.members.length;

  group.members.forEach(m => {
    const row = document.createElement("div");
    row.className = "split-row" + (m === user ? " you" : "");

    let rightSide = "";

    if (splitMode === "equal") {
      rightSide = `<span>₹${equalShare.toFixed(2)}</span>`;
    }

if (splitMode === "exact") {
  if (m === paidBy) {
    rightSide = `
      <span id="exact-remaining">₹${total.toFixed(2)}</span>
    `;
  } else {
    rightSide = `
      <input
        type="number"
        id="exact-${m}"
        placeholder="₹"
        oninput="updateExactRemaining()"
      />
    `;
  }
}

if (splitMode === "percent") {
  if (m === paidBy) {
    rightSide = `
      <span id="percent-remaining">100%</span>
      <span id="percent-remaining-amt" style="margin-left:8px">
        ₹${total.toFixed(2)}
      </span>
    `;
  } else {
    rightSide = `
      <input
        type="number"
        id="percent-${m}"
        placeholder="%"
        oninput="updatePercentRemaining()"
        style="width:60px"
      />
      <span id="percent-amt-${m}" style="margin-left:8px">
        ₹0.00
      </span>
    `;
  }
}




    row.innerHTML = `
      <span>${m}${m === user ? " (You)" : ""}</span>
      ${rightSide}
    `;

    area.appendChild(row);
  });
}


document.getElementById("totalAmount")
  ?.addEventListener("input", renderSplitUI);

document.getElementById("paidBy")
  ?.addEventListener("change", renderSplitUI);
