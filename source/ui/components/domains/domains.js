class Domains {
    
    constructor() {
        // Placeholder for future instance-level initialization if needed
    }
    static async init() {
        const instance = new Domains();
        await instance.loadDomains();
    }

    createDomainSection(domain) {
        const template = document.getElementById('domain-section-template');
        const section = template.content.firstElementChild.cloneNode(true);
        section.querySelector('.domain-icon').textContent = domain.icon;
        section.querySelector('.domain-name').textContent = domain.name;
        const subfoldersContainer = section.querySelector('.subfolders');
        domain.subjects.forEach(subject => {
            const subfolderTemplate = document.getElementById('subfolder-template');
            const subfolder = subfolderTemplate.content.firstElementChild.cloneNode(true);
            subfolder.href = `/topics?id=${domain.id}-${subject.id}`;
            subfolder.querySelector('.subfolder-name').textContent = subject.name;
            subfoldersContainer.appendChild(subfolder);
        });
        return section;
    }

    async loadDomains() {
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
            container.innerHTML = '';
            domains.forEach(domain => {
                const section = this.createDomainSection(domain);
                container.appendChild(section);
            });

            // Initialize search functionality
            this.initializeSearch();
        } catch (error) {
            console.error('Error loading domains:', error);
            this.showError('Failed to load domains. Please try again later.');
        }
    }

    showError(message) {
        const container = document.getElementById('domainsContainer');
        if (container) {
            const template = document.getElementById('error-message-template');
            const errorElem = template.content.firstElementChild.cloneNode(true);
            errorElem.querySelector('.error-text').textContent = message;
            container.innerHTML = '';
            container.appendChild(errorElem);
        }
    }

    initializeSearch() {
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
}

// Initialize Domains on page load
Domains.init();
