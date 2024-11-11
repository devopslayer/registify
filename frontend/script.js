const userForm = document.getElementById("userForm");
const userTable = document.getElementById("userTable");
const userTableBody = document.getElementById("userTableBody");
const noDataMessage = document.getElementById("noDataMessage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const apiUrl = "http://localhost:3001/users";

let currentEditId = null;
let currentPage = 1;
const usersPerPage = 10;
let totalUsers = 0;

window.onload = fetchUsers;

// Add user
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const dob = document.getElementById("dob").value;

  if (currentEditId) {
    await updateUser(currentEditId, { name, email, dob });
    currentEditId = null;
  } else {
    const newUser = { name, email, dob };
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const user = await response.json();
    renderUser(user);
  }

  userForm.reset();
  fetchUsers();
});

// Fetch users
async function fetchUsers() {
  const response = await fetch(
    `${apiUrl}?_page=${currentPage}&_limit=${usersPerPage}`
  );
  if (response.ok) {
    const users = await response.json();
    const totalCount = response.headers.get("X-Total-Count");

    totalUsers = totalCount ? parseInt(totalCount, 10) : 0;
    console.log("Total users:", totalUsers); // Log to verify
    userTableBody.innerHTML = "";
    users.forEach((user) => renderUser(user));
    updateUserTableDisplay();
    updatePaginationControls();
  } else {
    console.error("Failed to fetch users:", response.statusText);
  }
}

// Render user
function renderUser(user) {
  const row = document.createElement("tr");
  row.setAttribute("data-id", user.id);
  row.innerHTML = `
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.dob}</td>
    <td>
      <button class="btn btn-danger btn-sm action-btn delete-btn" onclick="deleteUser(${user.id})">
        <i class="bi bi-trash"></i><span class="d-none d-md-inline"> Delete</span>
      </button>
      <button class="btn btn-warning btn-sm action-btn edit-btn" onclick="editUser(${user.id})">
        <i class="bi bi-pencil-square"></i><span class="d-none d-md-inline"> Edit</span>
      </button>
    </td>
  `;
  userTableBody.appendChild(row);
}

// Update table
function updateUserTableDisplay() {
  if (userTableBody.children.length > 0) {
    userTable.style.display = "table";
    noDataMessage.style.display = "none";
  } else {
    userTable.style.display = "none";
    noDataMessage.style.display = "block";
  }
}

// Update pagination
function updatePaginationControls() {
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= totalPages;
}

// Handle Prev and Next
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    console.log("Previous page:", currentPage); // Log for debugging
    fetchUsers();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    console.log("Next page:", currentPage); // Log for debugging
    fetchUsers();
  }
});

// Delete user
async function deleteUser(id) {
  await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
  fetchUsers();
}

// Edit user
function editUser(id) {
  currentEditId = id;
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const name = row.children[0].textContent;
  const email = row.children[1].textContent;
  const dob = row.children[2].textContent;

  // Convert date from dd-MM-yyyy to yyyy-MM-dd
  const formattedDob = formatDate(dob);

  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("dob").value = formattedDob;

  const submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.textContent = "Update";
  submitBtn.classList.add("btn-warning");
  submitBtn.classList.remove("btn-primary");
}

// Function to convert date
function formatDate(date) {
  const [day, month, year] = date.split("-");
  return `${year}-${month}-${day}`;
}

// Update user
async function updateUser(id, updatedData) {
  await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });

  fetchUsers();
  const submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.textContent = "Add User";
  submitBtn.classList.add("btn-primary");
  submitBtn.classList.remove("btn-warning");
}
