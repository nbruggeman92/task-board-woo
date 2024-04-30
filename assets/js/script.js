let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

const generateTaskId = () => {
    if(nextId === null) {
        nextId = 1;
    } else {
        nextId += 1;
    }
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return nextId;
}

const createTaskCard = (task) => {
    const taskCard = $("<div>")
    .addClass("card w-75 task-card draggable my-3")
    .attr("data-task-id", task.id)
    const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
    const cardBody = $("<div>").addClass("card-body");
    const cardDescription = $("<p>").addClass("card-text").text(task.description);
    const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
    const cardDeleteButton = $("<button>").addClass("btn btn-danger delete").text("Delete").attr("data-task-id", task.id);
    cardDeleteButton.on("click", handleDeleteTask);

    if(task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");
        if(now.isSame(taskDueDate, 'day')) {
            taskCard.addClass("bg-warning");
        } else if(now.isAfter(taskDueDate)) {
            taskCard.addClass("bg-danger");
            cardDeleteButton.addClass("border-light")
        }
    }

    cardBody.append(cardDescription, cardDueDate, cardDeleteButton);
    taskCard.append(cardHeader, cardBody);

    return taskCard;
}

const renderTaskList = () => {
    if(!taskList) {
        taskList = [];
    }

    const todoList = $("#todo-cards");
    todoList.empty();
    

    const inProgressList = $("#in-progress-cards");
    inProgressList.empty();

    const doneList = $("#done-cards");
    doneList.empty();

    for(let index = 0; index < taskList.length; index++) {
        if(taskList[index].status === "to-do") {
            todoList.append(createTaskCard(taskList[index]));
        } else if(taskList[index].status === "in-progress") {
            inProgressList.append(createTaskCard(taskList[index]));
        } else if (taskList[index].status === "done") {
            doneList.append(createTaskCard(taskList[index]));
        }
    }

        $(".draggable").draggable({
            opacity: 0.7,
            zIndex: 100,

            helper: function(event) {
                let original;
                if($(event.target).hasClass("ui-draggable")) {
                    original = $(event.target);
                } else {
                    original = $(event.target).closest(".ui-draggable");
                }
                return original.clone().css({
                    maxWidth: original.outerWidth(),
                });
            }
        });
}

const handleAddTask = (event) => {
    event.preventDefault();

    const task = {
        id: generateTaskId(),
        title: $("#taskTitle").val(),
        description: $("#taskDescription").val(),
        dueDate: $("#taskDueDate").val(),
        status: 'to-do'
    }

    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();

    $("#taskTitle").val("");
    $("#taskDescription").val("");
    $("#taskDueDate").val("");

}

function handleDeleteTask(event) {
    event.preventDefault();
    let taskId = $(this).attr("data-task-id")
    console.log(taskId)
    console.log(taskList)
    taskList = taskList.filter(task => task.id !== parseInt(taskId));
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

const handleDrop = (event, ui) => {
    const taskId = ui.draggable[0].dataset.taskId;
    const newStatus = event.target.id

    for(let index = 0; index < taskList.length; index++) {
        if(taskList[index].id == parseInt(taskId)) {
            taskList[index].status = newStatus;
            
        }
    }
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

$(document).ready(() => {
    renderTaskList();

    $("#taskForm").on("submit", handleAddTask);

    $(".lane").droppable({
        accept: ".draggable",
        drop: handleDrop
    })

    $("#taskDueDate").datepicker({
        changeMonth: true,
        changeYear: true,
    });
});
