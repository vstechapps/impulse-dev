// Function to create domain section HTML
function createDomainSection(domain) {
    return `
        <div class="folder-section">
            <div class="folder-header">
                <span class="material-icons">${domain.icon}</span>
                <h2>${domain.name}</h2>
            </div>
            <div class="subfolders">
                ${domain.subjects.map(subject => `
                    <a href="/topics?id=${domain.id}-${subject.id}" class="subfolder">
                        <span class="material-icons">folder</span>
                        <span>${subject.name}</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}

// Function to load and display domains
async function loadDomains() {
    try {
        // Fetch domains data
        const response = await fetch('/resources/domains.json');
        if (!response.ok) {
            throw new Error('Failed to load domains');
        }
        
        const { domains } = await response.json();

        // Render domains
        const container = document.getElementById('domainsContainer');
        if (!container) {
            throw new Error('Domains container not found');
        }

        container.innerHTML = domains.map(domain => createDomainSection(domain)).join('');

        // Initialize search functionality
        initializeSearch();
    } catch (error) {
        console.error('Error loading domains:', error);
        const container = document.getElementById('domainsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <span class="material-icons">error_outline</span>
                    <p>Failed to load domains. Please try again later.</p>
                    <a href="/" class="home-button">
                        <span class="material-icons">home</span>
                        Return to Home
                    </a>
                </div>
            `;
        }
    }
}

// Function to initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const subfolders = document.querySelectorAll('.subfolder');
        
        subfolders.forEach(subfolder => {
            const text = subfolder.querySelector('span:last-child')?.textContent.toLowerCase() || '';
            const parentSection = subfolder.closest('.folder-section');
            
            if (text.includes(searchTerm)) {
                subfolder.style.display = 'flex';
                parentSection.style.display = 'block';
            } else {
                subfolder.style.display = 'none';
            }
            
            // Hide empty sections
            const visibleSubfolders = parentSection.querySelectorAll('.subfolder[style="display: flex"]');
            if (visibleSubfolders.length === 0) {
                parentSection.style.display = 'none';
            }
        });
    });
}

// Load domains when the page loads
loadDomains();
