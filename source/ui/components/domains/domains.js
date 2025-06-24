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
        const folderSections = document.querySelectorAll('.folder-section');

        folderSections.forEach(section => {
            const domainName = section.querySelector('.folder-header h2')?.textContent.toLowerCase() || '';
            const subfolders = section.querySelectorAll('.subfolder');
            let anyVisible = false;

            // If domain name matches, show all subfolders
            if (domainName.includes(searchTerm) && searchTerm.length > 0) {
                subfolders.forEach(subfolder => {
                    subfolder.style.display = 'flex';
                });
                anyVisible = true;
            } else {
                // Otherwise, show only matching subfolders
                subfolders.forEach(subfolder => {
                    const text = subfolder.querySelector('span:last-child')?.textContent.toLowerCase() || '';
                    if (text.includes(searchTerm)) {
                        subfolder.style.display = 'flex';
                        anyVisible = true;
                    } else {
                        subfolder.style.display = 'none';
                    }
                });
            }

            // Show section if any subfolder is visible, otherwise hide
            section.style.display = anyVisible ? 'block' : 'none';
        });
    });
}

// Load domains when the page loads
loadDomains();
