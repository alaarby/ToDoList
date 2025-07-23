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

//check if user logged in or not
if (state.user) {
  renderLoading();
} else {
  renderLoginForm();
} 

//View log in page
function renderLoginForm(): void {
  body.innerHTML = `
  <main class="h-screen flex justify-center items-center">
    <section>
        <div class="flex flex-col w-96 bg-white border-0 rounded-md shadow-md shadow-blue-600 space-y-2 h-96 justify-evenly items-center p-2 relative">
            <span class=""><i class="fa fa-user-circle fa-5x text-blue-700"></i></span>
            <h2 class="font-bold text-2xl text-gray-500">User Log in</h2>
            <form id="loginForm" class="space-y-4 w-full items-center flex flex-col">
                <div class="w-full">
                    <input type="text" name="username" placeholder="username" id="username" class="w-full outline-0 border-0 rounded-md p-2 focus:border-blue-400 focus:border-2">
                    <p id="usernameError" class="text-red-500 text-sm"></p>
                </div>
                <div class="w-full">
                    <input type="password" name="password" id="password" placeholder="password" class="w-full outline-0 border-0 rounded-md p-2 focus:border-blue-400 focus:border-2">
                    <p id="passwordError" class="text-red-500 text-sm"></p>
                </div>
                <button type="submit" class="bg-blue-700 text-white border-0 rounded-md w-1/2 cursor-pointer hover:bg-blue-700/80 p-2">Log In</button>
            </form>    
        </div>    
    </section>
  </main>
  `;
  const loginForm = document.getElementById("loginForm") as HTMLFormElement;
  loginForm.addEventListener("submit", handleLogin);  
}

//Validation username and password
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

 //View To do page
  function renderTodosPage(): void {
    
    body.innerHTML = `
    <main class="flex justify-center">
      <div class="bg-blue-300/50 p-6 rounded shadow-blue-300 drop-shadow-xl w-3/5">
        <section>  
          <div class="mb-4 relative">
            <h1 class="font-bold text-2xl text-center">Hello, ${state.user?.username}</h1>
            <button id="logoutBtn" class="bg-red-500 absolute right-0 top-0 rounded-md text-white p-2 m-4 cursor-pointer hover:bg-red-500/80">Logout <i class="fa-solid fa-right-from-bracket"></i></button>
          </div>
        </section>
        <section>
          <form id="todoForm" class="flex mb-4">
            <input id="newTodo" class="flex-1 border-1 border-blue-300 rounded-l-md outline-0 p-2 focus:border-2 focus:border-blue-400" placeholder="Add new task" />
            <button type="submit" class="bg-green-500 text-white px-4 rounded-r-md cursor-pointer">Add</button>
          </form>
        </section>
        <section>
        <div class="flex gap-2 mb-4">
              <button id="all" class="filter-btn cursor-pointer">All</button>
              <button id="active" class="filter-btn cursor-pointer">Active</button>
              <button id="completed" class="filter-btn cursor-pointer">Completed</button>
        </div>
        </section>
        <section>
          <div id="todosContainer" class="flex flex-col"></div>
        </section>
      </div>
    </main>
    `;

    //Log out button
  (document.getElementById("logoutBtn")as HTMLButtonElement).addEventListener("click", () => {
      localStorage.removeItem("user");
      state.user = null;
      renderLoginForm();
    });

    (document.getElementById("todoForm") as HTMLFormElement).addEventListener("submit", addTodo);

    //assign event to filter buttons
    document.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", e => {
      const target = e.target as HTMLButtonElement;
      state.filter = target.id as typeof state.filter;
      renderTodos();
    }));

    fetchTodos();
  }

  //fetch top10 to dos from api
  async function fetchTodos(): Promise<void> {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=10");
    const todos: Todo[] = await res.json();
    state.todos = todos;
    renderTodos();
  } catch (error) {
    const container = document.getElementById("todosContainer") as HTMLElement;
    container.innerHTML = "<p class='text-red-500'>Failed to load todos</p>";
  }
}
//view loading pag
function renderLoading(): void {
  body.innerHTML = `
    <main class="h-screen flex justify-center items-center">
      <section>
        <i class="fa fa-spinner fa-5x fa-spin"></i>
      </section>
    </main>`;
  setTimeout(() => {
    renderTodosPage();
  }, 500);
}

//View to dos list
function renderTodos(): void {
  const container = document.getElementById("todosContainer") as HTMLElement;
  const filtered = state.todos.filter(todo => {
    if (state.filter === "active") return !todo.completed;
    if (state.filter === "completed") return todo.completed;
    return true;
  });

  container.innerHTML = filtered
    .map(todo => `
      <div class="flex items-center justify-between p-2 border-b">
        <div class="flex items-center gap-2">
          <input type="checkbox" ${todo.completed ? "checked" : ""} data-id="${todo.id}" class="toggle" />
          <span class="${todo.completed ? "line-through" : ""}">${todo.title}</span>
        </div>
        <button data-id="${todo.id}" class="delete text-red-500 cursor-pointer p-2 rounded-md hover:bg-red-500/80 hover:text-white">Delete</button>
      </div>
    `).join("");

  container.querySelectorAll<HTMLInputElement>(".toggle").forEach(checkbox => {
    checkbox.addEventListener("change", toggleTodo);
  });
  container.querySelectorAll<HTMLButtonElement>(".delete").forEach(btn => {
    btn.addEventListener("click", deleteTodo);
  });
}

//add new todo 
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

//toggle todo between completed and active
async function toggleTodo(e: Event): Promise<void> {
  const target = e.target as HTMLInputElement;
  const id = Number(target.dataset.id);
  const todo = state.todos.find(t => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  try {
    await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: todo.completed })
    });
    renderTodos();
  } catch (error) {
    alert("Failed to update todo");
  }
}

//delete todo from list
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
