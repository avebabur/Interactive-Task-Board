//All tasks are kept in this array, saved ones are loaded from localStorage
let tasks = JSON.parse(localStorage.getItem("kanban-lite-tasks")) || [];

//Column order from left to right, used by the arrow buttons
const columns = ["todo", "in-progress", "completed"];

//Elements from the page
const newTaskBtn = document.getElementById("new-task-btn");
const addToColumnBtns = document.querySelectorAll(".add-to-column");
const taskDialog = document.getElementById("task-dialog");
const taskForm = document.getElementById("task-form");
const cancelTaskBtn = document.getElementById("cancel-task-btn");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const categoryInput = document.getElementById("task-category");
const priorityInput = document.getElementById("task-priority");
const statusInput = document.getElementById("task-status");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

//Open the popup with the given column selected
function openTaskDialog(column) {
    taskForm.reset();
    statusInput.value = column;
    taskDialog.showModal();
}

//+ New task adds to To Do
newTaskBtn.addEventListener("click", function () {
    openTaskDialog("todo");
});

//Each column + adds to its own column
addToColumnBtns.forEach(function (button) {
    button.addEventListener("click", function () {
        openTaskDialog(button.dataset.status);
    });
});

cancelTaskBtn.addEventListener("click", function () {
    taskDialog.close();
});

//Make a new task from the form
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    //Stop titles that are only spaces
    const title = titleInput.value.trim();
    if (title === "") {
        titleInput.focus();
        return;
    }

    const task = {
        id: Date.now(),
        title: title,
        description: descriptionInput.value.trim(),
        category: categoryInput.value,
        priority: priorityInput.value,
        status: statusInput.value,
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskDialog.close();
});

//localStorage can only keep text, so the array is turned into JSON text
function saveTasks() {
    localStorage.setItem("kanban-lite-tasks", JSON.stringify(tasks));
}

//Move a task one column to the left (-1) or right (+1)
function moveTask(id, step) {
    const task = tasks.find(function (t) {
        return t.id === id;
    });
    const position = columns.indexOf(task.status);
    task.status = columns[position + step];
    saveTasks();
    renderTasks();
}

//Remove a task after asking first
function deleteTask(id) {
    if (!confirm("Delete this task?")) {
        return;
    }
    tasks = tasks.filter(function (t) {
        return t.id !== id;
    });
    saveTasks();
    renderTasks();
}

//Redraw the board whenever the search or category changes
searchInput.addEventListener("input", renderTasks);
categoryFilter.addEventListener("change", renderTasks);

//Check a task against the search box and the category dropdown
function matchesFilters(task) {
    //Lowercase both so "Logo" and "logo" match
    const search = searchInput.value.trim().toLowerCase();
    if (!task.title.toLowerCase().includes(search)) {
        return false;
    }
    const category = categoryFilter.value;
    if (category !== "all" && task.category !== category) {
        return false;
    }
    return true;
}

//Empty the columns and draw every task again
function renderTasks() {
    document.querySelectorAll(".task-list").forEach(function (list) {
        list.innerHTML = "";
    });

    tasks.forEach(function (task) {
        //Hidden tasks are only skipped here, they stay saved
        if (!matchesFilters(task)) {
            return;
        }
        //Status "todo" goes in "todo-list" and so on
        const list = document.getElementById(task.status + "-list");
        list.appendChild(createTaskCard(task));
    });
}

//Build the card for one task
function createTaskCard(task) {
    const card = document.createElement("li");
    card.className = "task-card priority-" + task.priority;

    //textContent so html typed by the user is shown as plain text
    const title = document.createElement("h3");
    title.textContent = task.title;
    card.appendChild(title);

    if (task.description !== "") {
        const description = document.createElement("p");
        description.textContent = task.description;
        card.appendChild(description);
    }

    const category = document.createElement("span");
    category.className = "task-category";
    category.textContent = task.category;
    card.appendChild(category);

    //Arrow and delete buttons
    const actions = document.createElement("div");
    actions.className = "task-actions";
    const position = columns.indexOf(task.status);

    const leftBtn = makeButton("←", "Move left", function () {
        moveTask(task.id, -1);
    });
    //Nothing is left of the first column
    leftBtn.disabled = position === 0;
    actions.appendChild(leftBtn);

    const rightBtn = makeButton("→", "Move right", function () {
        moveTask(task.id, 1);
    });
    //Nothing is right of the last column
    rightBtn.disabled = position === columns.length - 1;
    actions.appendChild(rightBtn);

    const deleteBtn = makeButton("Delete", "Delete task", function () {
        deleteTask(task.id);
    });
    deleteBtn.className = "delete-btn";
    actions.appendChild(deleteBtn);

    card.appendChild(actions);

    return card;
}

//Make a small button, label is read out by screen readers
function makeButton(text, label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.addEventListener("click", onClick);
    return button;
}

//Show the saved tasks when the page opens
renderTasks();
