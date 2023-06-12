const assert = require('assert');
const {JSDOM} = require('jsdom');
const {LocalStorage} = require('node-localstorage');
const Blob = require('blob-polyfill').Blob; // Import the Blob polyfill
const {window} = new JSDOM('');
require('jsdom-global')()

// Create a new instance of LocalStorage
const localStorage = new LocalStorage('./scratch');
const sinon = require('sinon');

// Load the HTML file using JSDOM
const dom = new JSDOM(`
    <html>
        <body>
            <ul class="task-element"></ul>
            <form id="todo-form">
                <input id="task-input" type="text" />
            </form>
            <span id="remaining-tasks"></span>
            <button id="extract"></button>
        </body>
    </html>
`);

// Assign the JSDOM window to the global object
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = localStorage;
global.Blob = Blob; // Assign the Blob polyfill

// Include your JavaScript code
const {
    createTask,
    removeTask,
    editTask,
    countTasks,
    exportData,
} = require('./script.js');

describe('Task Management', function () {
    beforeEach(function () {
        // Reset tasks before each test
        localStorage.clear();
        tasks = [];
    });

    describe('createTask', function () {
        it('should create a new task element in the DOM', function () {
            const task = {
                id: 1,
                name: 'Task 1',
                isCompleted: false,
            };

            createTask(task);

            const taskElement = dom.window.document.getElementById('1');
            assert.ok(taskElement);
        });
    });

    describe('exportData', function () {
        it('should export tasks to a JSON file', function () {
            const task = {
                id: 1,
                name: 'Task 1',
                isCompleted: false,
            };

            tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));

            // Mock the URL object
            const URLMock = {
                createObjectURL: sinon.stub(),
                revokeObjectURL: sinon.stub(),
            };
            global.URL = URLMock;

            exportData();

            // Verify that createObjectURL is called with the correct arguments
            sinon.assert.calledOnceWithExactly(
                URLMock.createObjectURL,
                sinon.match.instanceOf(Blob)
            );

            // Verify that revokeObjectURL is called
            sinon.assert.calledOnce(URLMock.revokeObjectURL);
        });
    });

    describe('countTasks', function () {
        it('should update the remaining task count', function () {
            const task1 = {
                id: 1,
                name: 'Task 1',
                isCompleted: false,
            };

            const task2 = {
                id: 2,
                name: 'Task 2',
                isCompleted: true,
            };

            tasks.push(task1);
            tasks.push(task2);
            localStorage.setItem('tasks', JSON.stringify(tasks));

            countTasks();

            // Verify that the remaining task count is updated correctly
            const incompleteTasks = tasks.filter(task => !task.isCompleted);
            assert.strictEqual(incompleteTasks.length, 1);
        });
    });

    describe('removeTask', function () {
        it('should remove a task in localStorage', function () {

            tasks = tasks.filter((task) => task.id !== Number(e.id));
            localStorage.setItem("tasks", JSON.stringify(tasks));

            removeTask();
        });
    });

    describe('editTask', function () {
        it('should edit the name of a task', function () {
            const task = {
                id: 1,
                name: 'Task 1',
                isCompleted: false,
            };

            tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));

            // Create a task element in the DOM
            createTask(task);

            // Retrieve the task element
            const taskElement = dom.window.document.getElementById(task.id);

            // Simulate clicking the edit button
            const editButton = taskElement.querySelector('.edit-task');
            editTask(editButton.parentElement);

            // Retrieve the updated task element
            const updatedTaskElement = dom.window.document.getElementById(task.id);

            // Verify that the input field is displayed
            const inputElement = updatedTaskElement.querySelector('.editControlWrapper input');
            assert.ok(inputElement);

            // Simulate entering a new task name
            inputElement.value = 'Updated Task 1';

            // Simulate clicking the confirm button
            const confirmButton = updatedTaskElement.querySelector('.editControlWrapper button');
            confirmButton.parentElement.querySelector('button').click();

            // Verify that the task name is updated in the DOM
            const taskNameElement = updatedTaskElement.querySelector('.content-editable');
            assert.strictEqual(taskNameElement.textContent, 'Updated Task 1');

            // Verify that the task name is updated in localStorage
            const updatedTasks = JSON.parse(localStorage.getItem('tasks'));
            const updatedTask = updatedTasks.find(t => t.id === task.id);
            assert.strictEqual(updatedTask.name, 'Updated Task 1');
        });
    });

});
