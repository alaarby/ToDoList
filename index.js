"use strict";
// TypeScript logic moved to this file (converted version)
// Uses the new class names from style.scss
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const state = {
    user: JSON.parse(localStorage.getItem("user") || "null"),
    todos: [],
    filter: "all"
};
const body = document.querySelector("body");
if (state.user) {
    renderLoading();
}
else {
    renderLoginForm();
}
function renderLoginForm() {
    body.innerHTML = `
  <main class="main-center">
    <section>
        <div class="login-card">
            <span><i class="fa fa-user-circle fa-5x icon-blue"></i></span>
            <h2 class="login-title">User Log in</h2>
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <input type="text" name="username" placeholder="username" id="username" class="input-field">
                    <p id="usernameError" class="error-text"></p>
                </div>
                <div class="form-group">
                    <input type="password" name="password" id="password" placeholder="password" class="input-field">
                    <p id="passwordError" class="error-text"></p>
                </div>
                <button type="submit" class="login-btn">Log In</button>
            </form>    
        </div>    
    </section>
  </main>
  `;
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", handleLogin);
}
function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    usernameError.innerText = "";
    passwordError.innerText = "";
    let valid = true;
    if (!username) {
        usernameError.textContent = "Username is required";
        valid = false;
    }
    else if (!/^\w{3,20}$/.test(username)) {
        usernameError.textContent = "Username must be 3-20 characters and contain only letters, numbers, and underscores";
        valid = false;
    }
    if (!password) {
        passwordError.textContent = "Password is required";
        valid = false;
    }
    else if (password.length < 3 || password.length > 50) {
        passwordError.textContent = "Password must be 3-50 characters";
        valid = false;
    }
    if (valid && username === "alaa" && password === "123") {
        state.user = { username };
        localStorage.setItem("user", JSON.stringify(state.user));
        renderLoading();
    }
    else if (valid) {
        passwordError.textContent = "Invalid credentials";
    }
}
function renderTodosPage() {
    var _a;
    body.innerHTML = `
    <main class="todo-wrapper">
      <div class="todo-container">
        <section>  
          <div class="todo-header">
            Hello, ${(_a = state.user) === null || _a === void 0 ? void 0 : _a.username}
            <button id="logoutBtn" class="logout-btn">Logout <i class="fa-solid fa-right-from-bracket"></i></button>
          </div>
        </section>
        <section>
          <form id="todoForm" class="todo-form">
            <input id="newTodo" class="todo-input" placeholder="Add new task" />
            <button type="submit" class="todo-add-btn">Add</button>
          </form>
        </section>
        <section>
          <div class="filter-group">
              <button id="all" class="filter-btn">All</button>
              <button id="active" class="filter-btn">Active</button>
              <button id="completed" class="filter-btn">Completed</button>
          </div>
        </section>
        <section>
          <div id="todosContainer" class="todo-list"></div>
        </section>
      </div>
    </main>
  `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("user");
        state.user = null;
        renderLoginForm();
    });
    document.getElementById("todoForm").addEventListener("submit", addTodo);
    document.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", e => {
        const target = e.target;
        state.filter = target.id;
        renderTodos();
    }));
    fetchTodos();
}
function renderLoading() {
    body.innerHTML = `
    <main class="loading-spinner">
      <section>
        <i class="fa fa-spinner fa-5x fa-spin"></i>
      </section>
    </main>`;
    setTimeout(() => {
        renderTodosPage();
    }, 500);
}
function fetchTodos() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch("https://jsonplaceholder.typicode.com/todos?_limit=10");
            const todos = yield res.json();
            state.todos = todos;
            renderTodos();
        }
        catch (error) {
            const container = document.getElementById("todosContainer");
            container.innerHTML = "<p class='error-text'>Failed to load todos</p>";
        }
    });
}
function renderTodos() {
    const container = document.getElementById("todosContainer");
    const filtered = state.todos.filter(todo => {
        if (state.filter === "active")
            return !todo.completed;
        if (state.filter === "completed")
            return todo.completed;
        return true;
    });
    container.innerHTML = filtered
        .map(todo => `
      <div class="todo-item">
        <div class="todo-left">
          <input type="checkbox" ${todo.completed ? "checked" : ""} data-id="${todo.id}" class="toggle" />
          <span class="${todo.completed ? "line-through" : ""}">${todo.title}</span>
        </div>
        <button data-id="${todo.id}" class="todo-delete">Delete</button>
      </div>
    `).join("");
    container.querySelectorAll(".toggle").forEach(checkbox => {
        checkbox.addEventListener("change", toggleTodo);
    });
    container.querySelectorAll(".todo-delete").forEach(btn => {
        btn.addEventListener("click", deleteTodo);
    });
}
function addTodo(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const input = document.getElementById("newTodo");
        const title = input.value.trim();
        if (!title)
            return;
        const newTodo = { title, completed: false };
        try {
            const res = yield fetch("https://jsonplaceholder.typicode.com/todos", {
                method: "POST",
                body: JSON.stringify(newTodo),
                headers: { "Content-Type": "application/json" },
            });
            const todo = yield res.json();
            todo.id = Date.now();
            state.todos.unshift(todo);
            input.value = "";
            renderTodos();
        }
        catch (_a) {
            alert("Failed to add todo");
        }
    });
}
function toggleTodo(e) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = e.target;
        const id = Number(target.dataset.id);
        const todo = state.todos.find(t => t.id === id);
        if (!todo)
            return;
        todo.completed = !todo.completed;
        try {
            yield fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: todo.completed })
            });
            renderTodos();
        }
        catch (_a) {
            alert("Failed to update todo");
        }
    });
}
function deleteTodo(e) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = e.target;
        const id = Number(target.dataset.id);
        try {
            const res = yield fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                state.todos = state.todos.filter(t => t.id !== id);
                renderTodos();
            }
            else {
                alert("Failed to delete todo");
            }
        }
        catch (_a) {
            alert("Network error");
        }
    });
}
