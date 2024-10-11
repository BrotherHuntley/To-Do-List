// List class, keeps track of all items
class List {
    constructor() {
        this.tasks = [];
    };

    // Function returning task object based on id input
    find(identifier) {
        for (let task of this.tasks) {
            if (task.id == identifier) { return task }
        }
    }

    // Function to display an individual class
    displayNew(task) {

        // Build and append parent div
        let rowDiv = $('<div class="row py-2 justify-content-between task" id="task' + task.id + '">'); 
        $('#tasks').append(rowDiv);

        // Append children div with task ids and content
        rowDiv.append($('<div class="col form-check mx-3"><input class="form-check-input check" type="checkbox" value="" id="taskCheck' + task.id + '"><label class="form-check-label" for="taskCheck' + task.id + '">' + task.content + '</label></div>')); // content and check box
        rowDiv.append($('<div class="col-sm-auto"><button class="btn edit" type="button" onclick="editTask(' + task.id + ')">Edit</button></div>')); // Edit button
        rowDiv.append($('<div class="input-group mx-3 hide"><input type="text" class="form-control" placeholder="Task name" id="newName' + task.id + '"><button class="btn confirm" type="button" onclick="confirmEdit(' + task.id + ')">Confirm</button></div></div>')); // Editor input and confirmation button
        listener();
    };

    // Function to handle displaying all tasks on startup
    displayStartup() {
        for (let task of this.tasks) {
            this.displayNew(task);
        };
    };
};

// Builds the mast list
let list = new List();

// Task class to build an individual task object
class Task {
    constructor(id, content, completed) {
        this.id = id;
        this.content = content;
        this.completed = completed;
    };
};

// Event listener listening for checkboxes
let listener = function () {
    $(document).ready(function () {
        $(".check").change(function () {

            // Get id of checked task
            let identifier = this.id.replace('taskCheck', '');

            // Get boolean of check mark and select correct url message for API
            let status = $('#' + this.id).prop('checked');
            let urlStatus = status ? 'mark_complete' : 'mark_active';

            // Change completed status in server, if successful update object
            $.ajax({
                type: 'PUT',
                url: 'https://fewd-todolist-api.onrender.com/tasks/' + identifier + '/' + urlStatus + '?api_key=1319',
                success: function (response, textStatus) {
                    let thisTask = list.find(identifier)
                    thisTask.completed = status;
                },
                error: function (request, textStatus, errorMessage) {
                    console.log(errorMessage);
                }
            });


        });
    });
};

// Function handling when edit is selected
let editTask = function (identifier) {
    $('#newName' + identifier).val($('#taskCheck' + identifier).next().html());
    editToggle(identifier);
};

// Function handling when confirm is selected
let confirmEdit = function (identifier) {
    editToggle(identifier);
    let newName = $('#newName' + identifier).val();
    let thisTask = list.find(identifier);
    thisTask.content = newName;

    // Change content name in server, if successful change content name in browser
    $.ajax({
        type: 'PUT',
        url: 'https://fewd-todolist-api.onrender.com/tasks/' + thisTask.id + '?api_key=1319',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            task: {
                content: newName,
            }
        }),
        success: function (response, textStatus) {
            $('#taskCheck' + identifier).next().html(newName)
        },
        error: function (request, textStatus, errorMessage) {
            console.log(errorMessage);
        }
    });
};

// Function to toggle between divs for the edit function
let editToggle = function (identifier) {
    let children = $('#task' + identifier)[0].children
    for (child of children) {
        child.classList.toggle("hide");
    };
};

//Function to handle when an it is added
let addItem = function () {

    // Get content value
    let newTask = $('#postID').val();

    // Check if content exists, if not display error
    if (newTask === '') {
        $('.error').removeClass('hide')

    } else {
        $('.error').removeClass('hide')
        $('.error').addClass('hide')

        // Post new task to server and create new object if successfully posted
        $.ajax({
            type: 'POST',
            url: 'https://fewd-todolist-api.onrender.com/tasks?api_key=1319',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                task: {
                    content: newTask
                }
            }),
            success: function (response, textStatus) {
                let createTask = new Task(response.task.id, response.task.content, response.task.completed);
                list.displayNew(createTask)
                list.tasks.push(createTask)
            },
            error: function (request, textStatus, errorMessage) {
                console.log(errorMessage)
            }
        });
    }
};

// Get all tasks on initial page load
$.ajax({
    type: 'GET',
    url: 'https://fewd-todolist-api.onrender.com/tasks?api_key=1319',
    contentType: 'application/json',
    dataType: 'json',
    success: function (response, textStatus) {

        // For each task create object
        for (let task of response.tasks) {
            if (!task.completed) {
                let createTask = new Task(task.id, task.content, task.completed);
                list.tasks.push(createTask);
            }
        }

        // Display all tasks on startup
        list.displayStartup()

        // Activate listener function for the new elements
        listener();
    },
    error: function (request, textStatus, errorMessage) {
        console.log(errorMessage)
    }
});

// Function to remove all complete items from list
let clearComplete = function () {
    for (let task of list.tasks) {
        if (task.completed) {
            $('#task' + task.id).remove()
        }
    }
};