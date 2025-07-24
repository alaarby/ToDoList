// TypeScript logic moved to this file (converted version)
// Uses the new class names from style.scss

interface User { 
  username: string;
}

interface Todo {
  userId?: number;
  id: number;
  title: string;
  completed: boolean;
}

const state: {
  user: User | null;
  todos: Todo[];
  filter: "all" | "active" | "completed";
} = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  todos: [],
  filter: "all"
};

const body = document.querySelector("body") as HTMLBodyElement;

if (state.user) {
  renderLoading();
} else {
  renderLoginForm();
}

function renderLoginForm(): void {
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
  const loginForm = document.getElementById("loginForm") as HTMLFormElement;
  loginForm.addEventListener("submit", handleLogin);  
}

function handleLogin(e: Event): void{
  e.preventDefault();
  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const usernameError = document.getElementById("usernameError") as HTMLParagraphElement;
  const passwordError = document.getElementById("passwordError") as HTMLParagraphElement;

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  usernameError.innerText = "";
  passwordError.innerText = "";

  let valid = true;

  if (!username) {
    usernameError.textContent = "Username is required";
    valid = false;
  } else if (!/^\w{3,20}$/.test(username)) {
    usernameError.textContent = "Username must be 3-20 characters and contain only letters, numbers, and underscores";
    valid = false;
  }

  if (!password) {
    passwordError.textContent = "Password is required";
    valid = false;
  } else if (password.length < 3 || password.length > 50) {
    passwordError.textContent = "Password must be 3-50 characters";
    valid = false;
  }

  if (valid && username === "alaa" && password === "123") {
    state.user = { username };
    localStorage.setItem("user", JSON.stringify(state.user));
    renderLoading();
  } else if (valid) {
    passwordError.textContent = "Invalid credentials";
  }
}

function renderTodosPage(): void {
  body.innerHTML = `
    <main class="todo-wrapper">
      <div class="todo-container">
        <section>  
          <div class="todo-header">
            Hello, ${state.user?.username}
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

  document.getElementById("logoutBtn")!.addEventListener("click", () => {
    localStorage.removeItem("user");
    state.user = null;
    renderLoginForm();
  });

  document.getElementById("todoForm")!.addEventListener("submit", addTodo);

  document.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", e => {
    const target = e.target as HTMLButtonElement;
    state.filter = target.id as typeof state.filter;
    renderTodos();
  }));

  fetchTodos();
}

function renderLoading(): void {
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

async function fetchTodos(): Promise<void> {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=10");
    const todos: Todo[] = await res.json();
    state.todos = todos;
    renderTodos();
  } catch (error) {
    const container = document.getElementById("todosContainer") as HTMLElement;
    container.innerHTML = "<p class='error-text'>Failed to load todos</p>";
  }
}

function renderTodos(): void {
  const container = document.getElementById("todosContainer") as HTMLElement;
  const filtered = state.todos.filter(todo => {
    if (state.filter === "active") return !todo.completed;
    if (state.filter === "completed") return todo.completed;
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

  container.querySelectorAll<HTMLInputElement>(".toggle").forEach(checkbox => {
    checkbox.addEventListener("change", toggleTodo);
  });
  container.querySelectorAll<HTMLButtonElement>(".todo-delete").forEach(btn => {
    btn.addEventListener("click", deleteTodo);
  });
}

async function addTodo(e: Event): Promise<void> {
  e.preventDefault();
  const input = document.getElementById("newTodo") as HTMLInputElement;
  const title = input.value.trim();
  if (!title) return;

  const newTodo: Partial<Todo> = { title, completed: false };

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: { "Content-Type": "application/json" },
    });
    const todo: Todo = await res.json();
    todo.id = Date.now();
    state.todos.unshift(todo);
    input.value = "";
    renderTodos();
  } catch {
    alert("Failed to add todo");
  }
}

async function toggleTodo(e: Event): Promise<void> {
  const target = e.target as HTMLInputElement;
  const id = Number(target.dataset.id);
  const todo = state.todos.find(t => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  try {
    await fetch(`https://jsonplaceholder.typicode.com/todos/${id}` , {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: todo.completed })
    });
    renderTodos();
  } catch {
    alert("Failed to update todo");
  }
}

async function deleteTodo(e: Event): Promise<void> {
  const target = e.target as HTMLButtonElement;
  const id = Number(target.dataset.id);

  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      state.todos = state.todos.filter(t => t.id !== id);
      renderTodos();
    } else {
      alert("Failed to delete todo");
    }
  } catch {
    alert("Network error");
  }
}
