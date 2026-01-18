const WORK = 45 * 60;
const BREAK = 15 * 60;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTask = null;
let timeLeft = WORK;
let timer;
let running = false;
let isWork = true;

const taskList = document.getElementById("taskList");
const timerDisplay = document.getElementById("timer");
const modeDisplay = document.getElementById("mode");
const currentTaskTitle = document.getElementById("currentTask");
const alarm = document.getElementById("alarm");

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((t, i) => {
    taskList.innerHTML += `
      <li class="bg-slate-800 p-4 rounded flex justify-between items-center">
        <div>
          <b>${t.name}</b>
          <div class="text-sm text-slate-400">
            ${t.remaining} min • ${t.mode}
          </div>
        </div>
        <button onclick="selectTask(${i})"
          class="bg-green-500 text-black px-3 py-1 rounded">▶</button>
      </li>
    `;
  });
}

document.getElementById("taskForm").onsubmit = e => {
  e.preventDefault();

  tasks.push({
    name: taskName.value,
    total: +taskTime.value,
    remaining: +taskTime.value,
    mode: taskMode.value
  });

  save();
  renderTasks();
  e.target.reset();
};

function selectTask(i) {
  currentTask = tasks[i];
  isWork = true;
  timeLeft = currentTask.mode === "pomodoro"
    ? WORK
    : currentTask.remaining * 60;

  currentTaskTitle.innerText = currentTask.name;
  updateDisplay();
}

function updateDisplay() {
  let m = Math.floor(timeLeft / 60);
  let s = timeLeft % 60;
  timerDisplay.innerText =
    `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  modeDisplay.innerText = isWork ? "Work" : "Break";
}

function startTimer() {
  if (running || !currentTask) return;
  running = true;

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      alarm.play();
      clearInterval(timer);
      running = false;

      if (currentTask.mode === "normal") {
        finishTask();
      } else {
        if (isWork) {
          currentTask.remaining -= 45;
          if (currentTask.remaining <= 0) {
            finishTask();
            return;
          }
          isWork = false;
          timeLeft = BREAK;
        } else {
          isWork = true;
          timeLeft = WORK;
        }
        updateDisplay();
        startTimer();
      }
    }
  }, 1000);
}

function finishTask() {
  alert("✅ Task Completed");
  tasks = tasks.filter(t => t !== currentTask);
  currentTask = null;
  resetTimer();
  save();
  renderTasks();
  currentTaskTitle.innerText = "No task selected";
}

function pauseTimer() {
  clearInterval(timer);
  running = false;
}

function resetTimer() {
  pauseTimer();
  timeLeft = WORK;
  isWork = true;
  updateDisplay();
}

renderTasks();
updateDisplay();
