# ExpenseResolve — Expense Sharing Application

🔗 **Live Demo:**
[https://poornima20.github.io/ExpenseResolve/](https://poornima20.github.io/ExpenseResolve/)

---

## Overview

**ExpenseResolve** is a simplified expense sharing application inspired by Splitwise.
The project focuses on **core backend design concepts** such as expense modeling, balance derivation, and settlement logic, demonstrated through a minimal frontend.

The goal is to show **clear thinking, correct logic, and clean structure**, not UI complexity.

---

## Features

* Create multiple groups
* Add members to groups
* Add shared expenses
* Track balances accurately
* Settle dues incrementally

### Supported Split Types

1. Equal split
2. Exact amount split
3. Percentage split

---

## Balance Tracking Logic

The system tracks **who owes whom** using expenses as the single source of truth.

Each user can see:

* **You Owe** → Amount the user owes to others
* **You Are Owed** → Amount others owe to the user

🔒 **Important Rule:**
Only expenses involving the logged-in user affect their balances.
Third-party debts (e.g., Alice ↔ Bob) do **not** appear in the user’s ledger.

---

## Engineering Design Decisions

### Explicit Ownership

* *You Owe* → Someone else paid, user owes
* *You Are Owed* → User paid, others owe

This mirrors real-world expense tracking behavior.

### No Persistent Storage (Intentional)

Data is cleared on refresh.

```js
localStorage.clear();
```

This is intentional to keep the assignment focused on:

* Data modeling
* Business logic
* Balance correctness

The design can easily be extended to persistent storage or a backend service.

---

## Tech Stack

* HTML / CSS
* Vanilla JavaScript
* No frameworks
* Logic-first implementation

---

## Assignment Alignment

* Create groups ✅
* Add shared expenses ✅
* Equal / Exact / Percentage splits ✅
* Track who owes whom ✅
* View personal balances ✅
* Simplified balances ✅
* Settle dues ✅

---

## Submission

📨 **Assignment Link:**
[https://forms.gle/an7MvEAjZ8cghR1A8](https://forms.gle/an7MvEAjZ8cghR1A8)


