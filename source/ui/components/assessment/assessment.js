let assessment = null;
let currentQuestion = 0;
let seconds = 0;
let timerInterval = null;
let timeTaken = 0;

function formatTime(secs) {
    const min = String(Math.floor(secs/60)).padStart(2, '0');
    const sec = String(secs%60).padStart(2, '0');
    return `${min}:${sec}`;
}

async function loadAssessment() {
    const res = await fetch('../resources/assessment.json');
    assessment = await res.json();
    document.title = assessment.title || 'Assessment';
    document.querySelector('h6.title').textContent = assessment.title || 'Assessment';
    if (timerInterval) clearInterval(timerInterval);
    const timerEl = document.getElementById('timer');
    const timelimit = assessment.timelimit || 0;
    seconds = timelimit;
    timerEl.textContent = formatTime(seconds);
    timerInterval = setInterval(() => {
        seconds--;
        timerEl.textContent = formatTime(seconds);
        if (seconds <= 0) {
            clearInterval(timerInterval);
            timerEl.textContent = 'Time Up!';
            showResult();
        }
    }, 1000);
    renderQuestion();
}

function renderQuestion() {
    if (!assessment) return;
    const q = assessment.questions[currentQuestion];
    document.getElementById('question').textContent = q.text;
    const form = document.querySelector('.options-list');
    form.innerHTML = '';
    q.options.forEach(opt => {
        const label = document.createElement('label');
        label.className = 'option';
        label.innerHTML = `<input type=\"radio\" name=\"mcq\" value=\"${opt.id}\"><span>${opt.text}</span>`;
        form.appendChild(label);
    });
    // Restore selected answer if needed
    const selected = q.selected;
    if (selected) {
        const input = form.querySelector(`input[value=\"${selected}\"]`);
        if (input) input.checked = true;
    }
    // Disable prev/next as needed
    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    // Show/hide next/submit
    const isLast = currentQuestion === assessment.questions.length - 1;
    document.getElementById('nextBtn').style.display = isLast ? 'none' : '';
    document.getElementById('submitBtn').style.display = isLast ? '' : 'none';
}

function showResult() {
    if (timerInterval) clearInterval(timerInterval);
    // Calculate score
    let score = 0;
    assessment.questions.forEach(q => {
        if (q.selected && q.selected === q.answer) score++;
    });
    // Time taken = original timelimit - seconds left
    const timelimit = assessment.timelimit || 0;
    timeTaken = timelimit - seconds;
    // Calculate percentage
    const percent = (score / assessment.questions.length) * 100;
    const isPass = percent >= 80;
    const statusText = isPass ? 'PASS' : 'FAIL';
    const statusClass = isPass ? 'result-status-pass' : 'result-status-fail';
    // Hide assessment-container, show result
    document.querySelector('.assessment-container').style.display = 'none';
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class='result-card'>
        <div class='result-title'>Assessment Complete</div>
        <div class='result-score'>Score: <span>${score} / ${assessment.questions.length}</span></div>
        <div class='result-time'>Time Taken: <span>${formatTime(timeTaken)}</span></div>
        <div class='result-status ${statusClass}'>${statusText}</div>
    </div>`;
}

function load(){
    loadAssessment();
    document.querySelector('.options-list').addEventListener('change', e => {
        if (e.target.name === 'mcq') {
            assessment.questions[currentQuestion].selected = e.target.value;
        }
    });
    document.getElementById('prevBtn').addEventListener('click', e => {
        e.preventDefault();
        if (currentQuestion > 0) {
            currentQuestion--;
            renderQuestion();
        }
    });
    document.getElementById('nextBtn').addEventListener('click', e => {
        e.preventDefault();
        if (currentQuestion < assessment.questions.length - 1) {
            currentQuestion++;
            renderQuestion();
        }
    });
    document.getElementById('submitBtn').addEventListener('click', e => {
        e.preventDefault();
        showResult();
    });
}

load();