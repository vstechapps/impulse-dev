// Function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to create topic section HTML
function createTopicSection(topic) {
    return `
        <div class="topic-section">
            <div class="topic-header">
                <span class="material-icons">school</span>
                <h2>${topic.name}</h2>
            </div>
            <div class="topic-content">
                <div class="assessments-list">
                    ${topic.assessments.map(assessment => `
                        <div class="assessment-item ${assessment.locked ? 'locked' : ''}">
                            <div class="assessment-header">
                                <span class="material-icons">${assessment.locked ? 'lock' : 'quiz'}</span>
                                <h3>${assessment.name}</h3>
                                <span class="level-badge">Level ${assessment.level}</span>
                            </div>
                            <div class="assessment-details">
                                <p>${assessment.title}</p>
                                <div class="assessment-meta">
                                    <span class="time-limit">
                                        <span class="material-icons">timer</span>
                                        ${assessment.timelimit / 60} minutes
                                    </span>
                                    <span class="questions-count">
                                        <span class="material-icons">help_outline</span>
                                        ${assessment.questions.length} questions
                                    </span>
                                </div>
                            </div>
                            ${!assessment.locked ? `
                                <a href="/assessment?id=${assessment.id}" class="start-assessment-btn" onclick="localStorage.setItem('currentAssessment', JSON.stringify(${JSON.stringify(assessment)}));">
                                    <span class="material-icons">play_arrow</span>
                                    Start Assessment
                                </a>
                            ` : `
                                <button class="locked-btn" disabled>
                                    <span class="material-icons">lock</span>
                                    Complete Previous Level
                                </button>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Function to show error message
function showError(message) {
    const container = document.getElementById('topicsContainer');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <span class="material-icons">error_outline</span>
                <p>${message}</p>
                <a href="/" class="home-button">
                    <span class="material-icons">home</span>
                    Return to Home
                </a>
            </div>
        `;
    }
}

// Function to load and display topics
async function loadTopics() {
    try {
        const topicId = getUrlParameter('id');
        if (!topicId) {
            throw new Error('No topic ID provided');
        }

        // Fetch topics data
        const response = await fetch(`/resources/topics/${topicId}.json`);
        if (!response.ok) {
            throw new Error('Subject not found');
        }
        
        const data = await response.json();
        
        // Update page title
        document.title = `${topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} - Topics`;
        document.querySelector('.title').textContent = topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        // Render topics
        const container = document.getElementById('topicsContainer');
        if (!container) {
            throw new Error('Topics container not found');
        }

        container.innerHTML = data.topics.map(topic => createTopicSection(topic)).join('');

        // Initialize search functionality
        initializeSearch();
    } catch (error) {
        console.error('Error loading topics:', error);
        showError(error.message);
    }
}

// Function to initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const topicSections = document.querySelectorAll('.topic-section');
        
        topicSections.forEach(section => {
            const text = section.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    });
}

// Load topics when the page loads
loadTopics();
