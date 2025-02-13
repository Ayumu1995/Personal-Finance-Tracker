// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", function () {
   // Getting references to important DOM elements
   const monthlyIncome = document.getElementById("monthly-income");
   const addExpenseBtn = document.getElementById("add-expense");
   const expenseList = document.querySelector(".expense-list");
   const totalExpenseEl = document.getElementById("total-expenses");
   const remainingBudgetEl = document.getElementById("remaining-budget");
   const header = document.getElementById("header");
   let currentScroll = 0;
   let hamburger = document.querySelector(".hamburger");
   const checkbox = document.querySelector("#checkbox");
   const monthSelector = document.getElementById("month-selector");
   let selectedMonth = getCurrentMonth();

   // daniel
   // Dark mode toggle functionality
   checkbox.addEventListener("change", () => {
      document.body.classList.toggle("dark");
   });

   // Hide header on scroll down, show it on scroll up
   window.addEventListener("scroll", function () {
      let scrollLatest = window.scrollY;
      if (scrollLatest > currentScroll) {
         header.style.top = "-100%";
      } else {
         header.style.top = "0";
      }
      currentScroll = scrollLatest;
   });

   // Mobile menu toggle (hamburger menu)
   hamburger.addEventListener("click", function () {
      document.body.classList.toggle("open");
   });
   // till here daniel

   // Igor
   // Function to create a new expense element with editable name and amount
   function createExpenseElement(name = "Enter your usage", amount = "") {
      const newExpense = document.createElement("div");
      newExpense.className = "expense-category";
      newExpense.draggable = true;
      newExpense.innerHTML = `
         <span contenteditable>${name}</span>
         <input type="number" placeholder="Amount" value="${amount}">
         <button class="delete-expense" aria-label="Delete expense">×</button>`;

      // Update budget when expense amount is changed
      newExpense.querySelector("input").addEventListener("input", () => {
         updateBudget();
         saveData();
      });

      // Save when expense name is edited
      newExpense.querySelector("span").addEventListener("blur", saveData);

      // Handle expense deletion
      newExpense.querySelector(".delete-expense").addEventListener("click", () => {
         newExpense.remove();
         updateBudget();
         saveData();
      });

      return newExpense;
   }

   // Add new expense when button is clicked
   addExpenseBtn.addEventListener("click", () => {
      const newExpense = createExpenseElement();
      expenseList.appendChild(newExpense);
      updateBudget();
      saveData();
   });
   // till here igor

   // Ayumu
   // Function to calculate chart data for visualization
   monthSelector.addEventListener("change", function () {
      selectedMonth = monthSelector.value;
      loadSavedData();
   });

   function calculateChartData() {
      const income = parseFloat(monthlyIncome.value) || 0;
      const expenseElements = document.querySelectorAll(".expense-category");
      const chartData = [];

      // Calculate total expenses
      const expenses = Array.from(expenseElements).reduce((total, expense) => {
         return total + (parseFloat(expense.querySelector("input").value) || 0);
      }, 0);

      // Add remaining budget to the chart if greater than zero
      const remaining = income - expenses;
      if (remaining > 0) {
         chartData.push({
            name: "Remaining Budget",
            y: remaining,
            color: "#50c878", // Green color for remaining budget
         });
      }

      // Add each expense category to the chart
      expenseElements.forEach((expense) => {
         const amount = parseFloat(expense.querySelector("input").value) || 0;
         if (amount > 0) {
            chartData.push({
               name: expense.querySelector("span").textContent,
               y: amount,
            });
         }
      });

      return chartData;
   }

   // Function to load and display the budget chart
   function loadChart() {
      Highcharts.chart("budget-chart", {
         chart: { type: "pie" },
         title: { text: `Income and Expenses - ${selectedMonth}` },
         credits: { enabled: false }, // Removes Highcharts branding
         plotOptions: {
            series: {
               allowPointSelect: true,
               cursor: "pointer",
               dataLabels: [
                  { enabled: true, distance: 20, format: "{point.name}: ${point.y:,.2f}" },
                  {
                     enabled: true,
                     distance: -40,
                     format: "{point.percentage:.1f}%",
                     style: { fontSize: "1.0rem", textOutline: "none", opacity: 0.7 },
                     filter: { operator: ">", property: "percentage", value: 5 },
                  },
               ],
            },
         },
         series: [{ name: "Budget Distribution", colorByPoint: true, data: calculateChartData() }],
      });
   }
   // till here ayumu

   // DANIEL
   // Function to update total expenses and remaining budget
   function updateBudget() {
      const income = parseFloat(monthlyIncome.value) || 0;
      let totalExpenses = 0;

      // Sum up all expenses
      document.querySelectorAll(".expense-category input").forEach((input) => {
         totalExpenses += parseFloat(input.value) || 0;
      });

      // Update the budget display
      if (totalExpenses > income) {
         window.alert("Your expense is more than income");
      }
      totalExpenseEl.textContent = `$${totalExpenses.toFixed(2)}`;
      remainingBudgetEl.textContent = `$${(income - totalExpenses).toFixed(2)}`;

      saveData();
   }
   // DANIEL

   // IGOR AND AYUMU
   // Function to load saved budget data from local storage
   function loadSavedData() {
      const savedData = JSON.parse(localStorage.getItem(`budgetData_${selectedMonth}`)) || {
         income: "",
         expenses: [],
      };

      // Populate income field
      monthlyIncome.value = savedData.income;

      // Clear existing expense list and reload saved expenses
      expenseList.innerHTML = "";

      savedData.expenses.forEach((expense) => {
         const expenseEl = createExpenseElement(expense.name, expense.amount);
         expenseList.appendChild(expenseEl);
      });

      updateBudget();
      loadChart();
      loadLineChart();
   }

   // Function to save current budget state to local storage
   function saveData() {
      const expenses = Array.from(document.querySelectorAll(".expense-category")).map(
         (expense) => ({
            name: expense.querySelector("span").textContent,
            amount: expense.querySelector("input").value || "",
         })
      );

      const budgetData = { income: monthlyIncome.value, expenses: expenses };
      localStorage.setItem(`budgetData_${selectedMonth}`, JSON.stringify(budgetData));
      loadChart();
      loadLineChart();
   }

   // Initialize the app by loading saved data
   loadSavedData();

   // till here IGOR AND AYUMU

   // Ayumu
   function populateMonthSelector() {
      const now = new Date();
      const monthSelector = document.getElementById("month-selector");

      for (let i = -6; i <= 6; i++) {
         const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
         const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

         const option = document.createElement("option");
         option.value = monthValue;
         // convert date format to ex) "March 2024"
         option.textContent = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
         }).format(date);

         if (monthValue === getCurrentMonth()) {
            option.selected = true;
         }

         monthSelector.appendChild(option);
      }
   }

   // Initialize the month selector
   populateMonthSelector();

   function getCurrentMonth() {
      const now = new Date();
      //  ensures that the month is always two digits by adding a leading "0" ex. January is 01
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
   }

   function getMonthlyData() {
      const monthlyData = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
         const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
         // the example of date [Mon Mar 01 2024 00:00:00 GMT+0000 (UTC)]
         const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
         const savedData = JSON.parse(localStorage.getItem(`budgetData_${monthKey}`)) || {
            income: 0,
            expenses: [],
         };

         // Calculate total expenses for the month
         const totalExpenses = savedData.expenses.reduce(
            (sum, data) => sum + (parseFloat(data.amount) || 0),
            0
         );

         monthlyData.push({
            month: monthKey,
            income: parseFloat(savedData.income) || 0,
            expenses: totalExpenses,
         });
      }

      return monthlyData;
   }

   function loadLineChart() {
      const monthlyData = getMonthlyData();

      Highcharts.chart("bottom-chart", {
         chart: { type: "line" },
         title: { text: "Monthly Income vs. Expenses" },
         xAxis: {
            categories: monthlyData.map((data) => data.month),
            title: { text: "Month" },
         },
         yAxis: {
            title: { text: "Amount ($)" },
         },
         series: [
            {
               name: "Income",
               data: monthlyData.map((data) => data.income), // Income per month
               color: "#50c878",
            },
            {
               name: "Total Expenses",
               data: monthlyData.map((data) => data.expenses), // Total expenses per month
               color: "#ff4d4d",
            },
         ],
      });
   }

   // till here Ayumu
});
