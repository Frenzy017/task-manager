const taskWrapper = document.getElementById('todo-form')
const taskInputField = document.getElementById('task-input');
const remainingTaskElement = document.getElementById('remaining-tasks');
const extractButtonData = document.getElementById('extract');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

extractButtonData.addEventListener('click', () => {
    exportData()
})

if (localStorage.getItem('tasks')) {
    tasks.map((task => {
        createTask(task);
    }))
}

taskWrapper.addEventListener('submit', (e) => {
    e.preventDefault()
    const inputValue = taskInputField.value;

    if (inputValue === '') {
        return;
    }

    const task = {
        id: new Date().getTime(),
        name: inputValue,
        isCompleted: false
    }

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks))

    createTask(task);

    taskWrapper.reset();
    taskInputField.focus();
})

function createTask(task) {
    const unorderedListElement = document.querySelector('.task-element');
    const taskElement = document.createElement('li');
    const newTaskElement = document.createElement('div');
    newTaskElement.classList.add('taskWrapper');
    taskElement.setAttribute('id', task.id);

    if (task.isCompleted) {
        taskElement.classList.add('complete');
    }

    newTaskElement.innerHTML = `
     <input type="checkbox" name="tasks" class="${task.id}" onclick="checkBoxControl(this)">
      <span class="${!task.isCompleted ? 'content-editable' : ''}">${task.name}</span>
      <button onclick="removeTask(this.parentElement.parentElement)" title="Remove task ${task.name}" class="remove-task">Delete</button>
     <button onclick="editTask(this.parentElement)" title="Edit task ${task.name}" class="edit-task">Edit</button>
     `
    taskElement.append(newTaskElement);
    unorderedListElement.append(taskElement);

    countTasks()
}

function checkBoxControl(e) {
    const liElement = e.parentElement.parentElement
    const taskSpanElement = e.parentElement.getElementsByTagName('span')[0];
    taskSpanElement.style.textDecoration = e.checked ? 'line-through' : 'none';

    const taskToEdit = tasks.find((item) => item.id === Number(liElement.id));
    taskToEdit.isCompleted = e.checked;


    // Editing the data in localStorage by spreading so we can modify the id's
    localStorage.setItem("tasks", JSON.stringify(
        [...tasks]
    ));

    countTasks();
}

function removeTask(e) {
    // removing the current event which is the li value with ID
    if (e instanceof Element && e.parentElement) {
        // Removing the current event which is the li value with ID
        e.remove();

        // Removing the event in localStorage
        tasks = tasks.filter((task) => task.id !== Number(e.id));
        localStorage.setItem("tasks", JSON.stringify(tasks));
        countTasks();
    }
}

function editTask(e) {
    const inputElement = document.createElement('input');
    const confirmButton = document.createElement('button');
    const editControlWrapper = document.createElement('div');
    editControlWrapper.classList.add('editControlWrapper');

    const liElement = e.parentElement;
    confirmButton.textContent = 'Confirm';

    const taskSpanElement = e.getElementsByTagName('span')[0];
    const taskValue = taskSpanElement.textContent;
    e.style.display = 'none';

    confirmButton.addEventListener('click', (e) => {
        const newTaskValue = inputElement.value;
        const taskToEdit = tasks.find((item) => item.id === Number(liElement.id));
        taskToEdit.name = newTaskValue;

        taskSpanElement.textContent = newTaskValue;

        const taskWrapperElement = e.target.parentElement.parentElement.querySelector('.taskWrapper');
        taskWrapperElement.style.display = 'flex';

        editControlWrapper.remove();

        // Editing the data in localStorage by spreading so we can modify the id's

        localStorage.setItem("tasks", JSON.stringify(
            [...tasks]
        ));
    });
    inputElement.defaultValue = taskValue;

    editControlWrapper.append(inputElement);
    editControlWrapper.append(confirmButton);
    liElement.append(editControlWrapper);


}

function countTasks() {
    const remainingTasks = tasks.filter(task => !task.isCompleted).length;
    remainingTaskElement.textContent = remainingTasks.toString();
}

function exportData() {
    const data = localStorage.getItem('tasks');

    if (tasks.length === 0) {
        alert('No data found in localStorage.');
        return;
    }

    const dataObj = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(dataObj);
    const anchorElement = document.createElement('a');

    // Setting the anchorElement to the url value so we can download the data from localStorage

    anchorElement.href = url;
    anchorElement.download = 'tasks.json';
    document.body.appendChild(anchorElement);
    anchorElement.click();

    // Once download is completed we remove the saved data in anchorElement
    // Afterwards free up the system resources

    document.body.removeChild(anchorElement);
    URL.revokeObjectURL(url);
}

module.exports = {
    createTask,
    removeTask,
    exportData,
    countTasks,
    editTask
}