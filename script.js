//All tasks are kept in this array
let tasks = [];

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
    renderTasks();
    taskDialog.close();
});

//Empty the columns and draw every task again
function renderTasks() {
    document.querySelectorAll(".task-list").forEach(function (list) {
        list.innerHTML = "";
    });

    tasks.forEach(function (task) {
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

    return card;
}
