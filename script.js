// --- Positive Quotes ---
const fallbackQuotes = [
  "Every day is a fresh start.",
  "You are capable of amazing things.",
  "Stay positive, work hard, make it happen.",
  "Small steps every day.",
  "Believe in yourself and all that you are."
];

async function showRandomQuote() {
  const quoteEl = document.getElementById('quote');
  quoteEl.textContent = "Loading positive vibes...";
  try {
    const res = await fetch('https://api.quotable.io/random?tags=motivational|inspirational|happiness');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    quoteEl.textContent = `"${data.content}" — ${data.author}`;
  } catch (err) {
    // Fallback to a random local quote if API fails
    const random = Math.floor(Math.random() * fallbackQuotes.length);
    quoteEl.textContent = fallbackQuotes[random];
  }
}

// --- Goals Logic ---
const goalsList = document.getElementById('goals-list');
const goalInput = document.getElementById('goal-input');
const addGoalBtn = document.getElementById('add-goal');
const presetGoal = document.getElementById('preset-goal');

// --- Streak Tracker ---
const streakEl = document.getElementById('streak');

function getTodayDateStr() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

function updateStreakDisplay() {
  const streakData = JSON.parse(localStorage.getItem('streakData') || '{"streak":0,"lastDate":""}');
  streakEl.textContent = `Streak: ${streakData.streak} day${streakData.streak === 1 ? '' : 's'}`;
}

function checkAndUpdateStreak() {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  const allCompleted = goals.length > 0 && goals.every(g => g.completed);
  const todayStr = getTodayDateStr();
  let streakData = JSON.parse(localStorage.getItem('streakData') || '{"streak":0,"lastDate":""}');

  if (allCompleted && streakData.lastDate !== todayStr) {
    // If yesterday was last streak day, increment; else reset to 1
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (streakData.lastDate === yesterdayStr) {
      streakData.streak += 1;
    } else {
      streakData.streak = 1;
    }
    streakData.lastDate = todayStr;
    localStorage.setItem('streakData', JSON.stringify(streakData));
  } else if (!allCompleted && streakData.lastDate === todayStr) {
    // If you un-complete a goal today, remove today's streak
    streakData.streak -= 1;
    streakData.lastDate = '';
    localStorage.setItem('streakData', JSON.stringify(streakData));
  }
  updateStreakDisplay();
}

function renderGoals() {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  goalsList.innerHTML = '';
  goals.forEach((goal, idx) => {
    const li = document.createElement('li');
    li.textContent = goal.text;
    if (goal.completed) li.style.textDecoration = 'line-through';

    // Actions container
    const actions = document.createElement('span');
    actions.className = 'goal-actions';

    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.textContent = goal.completed ? 'Undo' : 'Done';
    completeBtn.className = 'button tiny success';
    completeBtn.onclick = () => toggleGoal(idx);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'button tiny alert';
    deleteBtn.onclick = () => deleteGoal(idx);

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    // Replace li.textContent with a span for the goal text
    li.textContent = '';
    const goalText = document.createElement('span');
    goalText.textContent = goal.text;
    if (goal.completed) goalText.style.textDecoration = 'line-through';
    li.appendChild(goalText);
    li.appendChild(actions);

    goalsList.appendChild(li);
  });
  checkAndUpdateStreak();
}

function addGoal() {
  let text = presetGoal.value;
  if (!text) {
    text = goalInput.value.trim();
  }
  if (!text) return;
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  goals.push({ text, completed: false });
  localStorage.setItem('goals', JSON.stringify(goals));
  goalInput.value = '';
  presetGoal.selectedIndex = 0;
  renderGoals();
}

function toggleGoal(idx) {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  goals[idx].completed = !goals[idx].completed;
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
}

function deleteGoal(idx) {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  goals.splice(idx, 1);
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
}

addGoalBtn.addEventListener('click', addGoal);
goalInput.addEventListener('keydown', e => { if (e.key === 'Enter') addGoal(); });

// --- Gratitude Note Logic ---
const gratitudeInput = document.getElementById('gratitude-input');
const gratitudeCustom = document.getElementById('gratitude-custom');
const saveGratitudeBtn = document.getElementById('save-gratitude');
const gratitudeList = document.getElementById('gratitude-list');

function renderGratitudeNotes() {
  const notes = JSON.parse(localStorage.getItem('gratitudeNotes') || '[]');
  gratitudeList.innerHTML = '';
  notes.forEach((note, idx) => {
    const li = document.createElement('li');
    li.textContent = note;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'button tiny alert';
    deleteBtn.onclick = () => deleteGratitude(idx);

    li.appendChild(deleteBtn);
    gratitudeList.appendChild(li);
  });
}

function addGratitude() {
  let note = gratitudeInput.value;
  if (!note) note = gratitudeCustom.value.trim();
  if (!note) return;
  const notes = JSON.parse(localStorage.getItem('gratitudeNotes') || '[]');
  notes.push(note);
  localStorage.setItem('gratitudeNotes', JSON.stringify(notes));
  gratitudeInput.selectedIndex = 0;
  gratitudeCustom.value = '';
  renderGratitudeNotes();
}

function deleteGratitude(idx) {
  const notes = JSON.parse(localStorage.getItem('gratitudeNotes') || '[]');
  notes.splice(idx, 1);
  localStorage.setItem('gratitudeNotes', JSON.stringify(notes));
  renderGratitudeNotes();
}

const refreshQuoteBtn = document.getElementById('refresh-quote');
refreshQuoteBtn.addEventListener('click', showRandomQuote);

saveGratitudeBtn.addEventListener('click', addGratitude);
gratitudeCustom.addEventListener('keydown', e => { if (e.key === 'Enter') addGratitude(); });

// --- On Page Load ---
showRandomQuote();
renderGoals();
renderGratitudeNotes();