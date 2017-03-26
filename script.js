var CRETE_TASK_TEXT = 'Create new task';

var categories = [];
var tasks = [];
var showCompleted = false;

$(document).ready(function () {
  var mainContent = $('#mainContent');
  var createNewCategoryForm = $('#createNewCategory');
  var showCompletedElement = $('#showCompleted');

  // Load data from local storage
  categories = getCategoriesFromLocalStorage() || [];
  tasks = getTasksFromLocalStorage() || [];

  categories.forEach(function (category) {
    createCategory(category, true)
  });
  tasks.forEach(function (task) {
    createTask(task, true)
  });

  createNewCategoryForm.submit(function (event) {
    event.preventDefault();
    var name = createNewCategoryForm.serializeArray()[0].value;

    var category = {
      name: name
    };

    createCategory(category);
  });

  showCompletedElement.bind('click', function () {
    showCompleted = !showCompleted;
    if (showCompleted) {
      $('body').addClass('showCompleted');
      showCompletedElement.text('Hide completed')
    }
    else {
      $('body').removeClass('showCompleted');
      showCompletedElement.text('Show completed')
    }
  })
});


/**
 * Create Category
 * @param params
 * @param firstLoad
 */
function createCategory(params, firstLoad) {
  var name = params.name;
  var id = params.id || getRandomInt(1, 1000000);

  var category = {
    id: id,
    name: name
  };

  createCategoryElement(category);

  createNewTaskElementListeners(id);

  if (!firstLoad) {
    categories.push(category);
    storeCategoriesToLocalStorage(categories);
  }
}

/**
 * Create Task
 * @param params
 * @param firstLoad
 */
function createTask(params, firstLoad) {
  var content = params.content;
  var id = params.id || getRandomInt(1, 1000000);
  var categoryId = params.categoryId;
  var done = params.done || false;

  var task = {
    id: id,
    content: content,
    categoryId: categoryId,
    done: done
  };

  var categoryElement = $('*[data-category-id="' + categoryId + '"] .list');

  createTaskElement(task, categoryElement);
  createTaskDoneElementListeners(id, categoryId);

  if (!firstLoad) {
    tasks.push(task);
    storeTasksToLocalStorage(tasks);
  }

  updateTaskCounter(categoryId);
}

/**
 * Create event listeners for NewTask (for specific category)
 * @param categoryId
 */
function createNewTaskElementListeners(categoryId) {
  var content = $('*[data-category-id="' + categoryId + '"] .newTaskContent');
  var saveButton = $('*[data-category-id="' + categoryId + '"] .newTaskSave');

  saveButton.bind('click', function () {

    var task = {
      content: content.text(),
      categoryId: categoryId
    };

    content.text(CRETE_TASK_TEXT);

    createTask(task)
  })
}

/**
 * Create Task Element
 * @param params
 * @param categoryElement
 */
function createTaskElement(params, categoryElement) {
  var content = params.content;
  var taskId = params.id;
  var done = params.done ? 'done' : '';

  $('<div class="item ' + done +'" data-task-id="' + taskId + '">' +
    '<p>' + content + '</p><div class="options" ><button class="taskDone">Done</button>' +
    '</div></div>')
  .appendTo(categoryElement)
}

/**
 * Create task done listeners
 * @param taskId
 * @param categoryId
 */
function createTaskDoneElementListeners(taskId, categoryId) {
  var taskDoneButton = $('*[data-task-id="' + taskId + '"] .taskDone');

  taskDoneButton.bind('click', function () {
    var key = findKeyOfTask(tasks, taskId);

    tasks[key].done = true;

    var taskElement = $('*[data-task-id="' + taskId + '"]');
    taskElement.addClass('done');

    updateTaskCounter(categoryId);
    storeTasksToLocalStorage(tasks);
  })
}

/**
 * Create Category Element
 * @param params
 */
function createCategoryElement(params) {
  var name = params.name;
  var categoryId = params.id;

  return $('<section data-category-id="' + categoryId + '"><header><h3>' + name + '</h3><small class="taskCount">0/0</small></header>' +
    '<div class="list"><div class="newTask item"> ' +
    '<p class="newTaskContent" contenteditable="true">' + CRETE_TASK_TEXT + '</p>' +
    '<div class="options"><button class="newTaskSave">Save</button></div> ' +
    '</div></div></section>')
  .appendTo(mainContent)
}

/**
 * Update task counter
 * @param categoryId
 */
function updateTaskCounter(categoryId) {
  var taskCount = $('*[data-category-id="' + categoryId + '"] .taskCount');
  var allCount = tasks.filter(function (task) {
    return task.categoryId === categoryId
  }).length;
  var doneCount = tasks.filter(function (task) {
    return task.categoryId === categoryId && task.done
  }).length;

  taskCount.text(doneCount + '/' + allCount)
}

/**
 * LOCAL STORAGE
 */
function getCategoriesFromLocalStorage() {
  return JSON.parse(localStorage.getItem('categories'))
}

function getTasksFromLocalStorage() {
  return JSON.parse(localStorage.getItem('tasks'))
}

function storeCategoriesToLocalStorage(categories) {
  localStorage.setItem('categories', JSON.stringify(categories))
}

function storeTasksToLocalStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

/**
 * Helper functions
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function findKeyOfTask(tasks, taskId) {
  var found = null;
  tasks.forEach(function (_task, key) {
    if (_task.id === taskId) found = key;
  });
  return found
}