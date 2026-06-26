
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDIMD_SNPhm34casPqsV7vLkWq0Slt3w9c",
    authDomain: "daily-expense-tracker-e603f.firebaseapp.com",
    projectId: "daily-expense-tracker-e603f",
    storageBucket: "daily-expense-tracker-e603f.firebasestorage.app",
    messagingSenderId: "507469013848",
    appId: "1:507469013848:web:014816e588b7429918fb2d",
    measurementId: "G-0QWBB9B0TR"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  console.log("Firebase Connected");
//////..

/////// login and register page start down the edge /////////////////////
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
const auth = getAuth(app);
const db = getFirestore(app);
let editId = null;
window.register = async function () {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {

    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Account Created Successfully");

    window.location.href = "index.html";

  } catch (error) {

    alert(error.message);

  }
};////////login function
window.login = async function () {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Login Successful");

    window.location.href = "dashboard.html";

  } catch (error) {

    alert(error.message);

  }
};
/////////////////////////////////////icon dropdown page ///////////////////////////
const menuButton = document.querySelector(".menu-button");
const dropdown = document.querySelector(".dropdown");

menuButton.addEventListener("click", function(e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
});

document.addEventListener("click", function() {
    dropdown.classList.remove("show");
});
////////////////////////////////////window dashboard function ////////////////////////

window.addExpense = async function () {

    const date = document.getElementById("expense-date").value;
    const name = document.getElementById("expense-name").value;
    const amount = document.getElementById("expense-amount").value;
    const description = document.getElementById("description").value;

    if (!date || !name || !amount) {
        alert("Please fill all required fields");
        return;
    }

    try {

        if (editId == null) {

            // Add New Expense
            await addDoc(collection(db, "expenses"), {
                date: date,
                name: name,
                amount: Number(amount),
                description: description
            });

        } else {

            // Update Existing Expense
            await updateDoc(doc(db, "expenses", editId), {
                date: date,
                name: name,
                amount: Number(amount),
                description: description
            });

            editId = null;

            // Remove Edit Mode
            document.querySelector(".add-expense").classList.remove("edit-mode");

            // Change button text back
            document.querySelector("#expense-form button").textContent = "Add Expense";
        }

        // Reset Form
        document.getElementById("expense-form").reset();

        // Reload Table
        loadExpenses();

    } catch (error) {
        alert(error.message);
    }

}
/////////////////////////////////Load Exoense  ////////////////////////////////////////
window.loadExpenses = async function () {

    const querySnapshot = await getDocs(collection(db, "expenses"));

    const expenseList = document.getElementById("expense-list");

    expenseList.innerHTML = "";

    let monthlyTotal = 0;
    let yearlyTotal = 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    querySnapshot.forEach((doc) => {

        const data = doc.data();

        const expenseDate = new Date(data.date);

        // ===== Yearly Total (Poore Current Year ka) =====
        if (expenseDate.getFullYear() === currentYear) {
            yearlyTotal += Number(data.amount);
        }

        // ===== Sirf Current Month ka Data Table me Dikhao =====
        if (
            expenseDate.getMonth() !== currentMonth ||
            expenseDate.getFullYear() !== currentYear
        ) {
            return;
        }

        // ===== Current Month Total =====
        monthlyTotal += Number(data.amount);

        const formattedDate = expenseDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        expenseList.innerHTML += `
        <tr>
            <td>${formattedDate}</td>
            <td>${data.name}</td>
            <td>₹ ${data.amount}</td>
            <td>${data.description}</td>
            <td>
                <button class="delete-btn" onclick="deleteExpense('${doc.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>

                <button class="edit-btn" onclick="editExpense('${doc.id}')">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </td>
        </tr>
        `;

    });

    document.getElementById("monthly-total").textContent = "₹ " + monthlyTotal;
    document.getElementById("yearly-total").textContent = "₹ " + yearlyTotal;

}
///////////////////////////////////////////edit and delete expanse ////////////////////////////////////////
window.editExpense = async function(id){

    editId = id;

    document.querySelector(".add-expense").classList.add("edit-mode");

    document.querySelector(".add-expense").scrollIntoView({
        behavior: "smooth"
    });

    document.querySelector("#expense-form button").textContent = "Update Expense";

    const docRef = doc(db, "expenses", id);

    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){

        const data = docSnap.data();

        document.getElementById("expense-date").value = data.date;
        document.getElementById("expense-name").value = data.name;
        document.getElementById("expense-amount").value = data.amount;
        document.getElementById("description").value = data.description;

    }

}
window.deleteExpense = async function(id){

    await deleteDoc(doc(db, "expenses", id));

    

    loadExpenses();

}

/////////////////////////////previous data review /////////////////////////////////////////
window.searchHistory = async function () {

    const month = document.getElementById("history-month").value;
    const year = document.getElementById("history-year").value;

    if (month === "" || year === "") {
        alert("Please select Month and Year");
        return;
    }

    const querySnapshot = await getDocs(collection(db, "expenses"));

    const historyList = document.getElementById("history-list");

    historyList.innerHTML = "";

    let historyTotal = 0;
    let totalCount = 0;

    querySnapshot.forEach((doc) => {

        const data = doc.data();

        const expenseDate = new Date(data.date);

        if (
            expenseDate.getMonth() == Number(month) &&
            expenseDate.getFullYear() == Number(year)
        ) {

            historyTotal += Number(data.amount);
            totalCount++;

            const formattedDate = expenseDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            historyList.innerHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${data.name}</td>
                <td>₹ ${data.amount}</td>
                <td>${data.description}</td>
            </tr>
            `;
        }

    });

    if (totalCount === 0) {

        historyList.innerHTML = `
        <tr>
            <td colspan="4">No Expenses Found</td>
        </tr>
        `;
    }
    document.getElementById("history-total").textContent = "₹ " + historyTotal;
}

///////////////////////////////////////////// download pdf ///////////////////////////////////
window.downloadPDF = function () {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Expense History Report", 14, 20);

    const month = document.getElementById("history-month");
    const year = document.getElementById("history-year");

    pdf.setFontSize(12);
    pdf.text(
        "Month : " + month.options[month.selectedIndex].text +
        "    Year : " + year.value,
        14,
        30
    );

    let y = 45;

    // Table Heading
    pdf.setFont(undefined, "bold");
    pdf.text("Date", 14, y);
    pdf.text("Expense", 55, y);
    pdf.text("Amount", 110, y);
    pdf.text("Description", 145, y);

    y += 8;

    pdf.setFont(undefined, "normal");

    const rows = document.querySelectorAll("#history-list tr");

    rows.forEach((row) => {

        const cols = row.querySelectorAll("td");

        if (cols.length >= 4) {

            pdf.text(cols[0].innerText, 14, y);
            pdf.text(cols[1].innerText, 55, y);
            pdf.text(cols[2].innerText, 110, y);
            pdf.text(cols[3].innerText, 145, y);

            y += 8;

            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
        }
    });

    y += 10;

    pdf.setFont(undefined, "bold");
    pdf.text(
        "Selected Month Total : " +
        document.getElementById("history-total").innerText,
        14,
        y
    );

    pdf.save("Expense_History_Report.pdf");

}