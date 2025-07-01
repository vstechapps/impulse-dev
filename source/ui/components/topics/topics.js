class Topics {
    static async init() {
        const instance = new Topics();
        await instance.loadTopics();
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    createTopicSection(topic) {
        const template = document.getElementById('topic-section-template');
        const section = template.content.firstElementChild.cloneNode(true);
        section.querySelector('.topic-name').textContent = topic.name;
        const assessmentsList = section.querySelector('.assessments-list');
        topic.assessments.forEach(assessment => {
            const assessmentElem = this.createAssessmentItem(assessment);
            assessmentsList.appendChild(assessmentElem);
        });
        return section;
    }

    createAssessmentItem(assessment) {
        const template = document.getElementById('assessment-item-template');
        const item = template.content.firstElementChild.cloneNode(true);
        if (assessment.locked) {
            item.classList.add('locked');
        }
        item.querySelector('.assessment-icon').textContent = assessment.locked ? 'lock' : 'quiz';
        item.querySelector('.assessment-name').textContent = assessment.name;
        item.querySelector('.level-badge').textContent = `Level ${assessment.level}`;
        item.querySelector('.assessment-title').textContent = assessment.title;
        item.querySelector('.time-value').textContent = `${assessment.timelimit / 60} minutes`;
        item.querySelector('.questions-value').textContent = `${assessment.questions.length} questions`;
        const actionContainer = item.querySelector('.assessment-action');
        if (!assessment.locked) {
            const link = document.createElement('a');
            link.href = `/assessment?id=${assessment.id}`;
            link.className = 'start-assessment-btn';
            link.innerHTML = '<span class="material-icons">play_arrow</span>Start Assessment';
            link.onclick = () => {
                localStorage.setItem('currentAssessment', JSON.stringify(assessment));
            };
            actionContainer.appendChild(link);
        } else {
            const btn = document.createElement('button');
            btn.className = 'locked-btn';
            btn.disabled = true;
            btn.innerHTML = '<span class="material-icons">lock</span>Complete Previous Level';
            actionContainer.appendChild(btn);
        }
        return item;
    }

    showError(message) {
        const container = document.getElementById('topicsContainer');
        if (container) {
            const template = document.getElementById('error-message-template');
            const errorElem = template.content.firstElementChild.cloneNode(true);
            errorElem.querySelector('.error-text').textContent = message;
            container.innerHTML = '';
            container.appendChild(errorElem);
        }
    }

    async loadTopics() {
        try {
            const topicId = this.getUrlParameter('id');
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
            container.innerHTML = '';
            data.topics.forEach(topic => {
                const section = this.createTopicSection(topic);
                container.appendChild(section);
            });

            // Initialize search functionality
            this.initializeSearch();
        } catch (error) {
            console.error('Error loading topics:', error);
            this.showError(error.message);
        }
    }

    initializeSearch() {
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
}

// Initialize Topics on page load
Topics.init();
