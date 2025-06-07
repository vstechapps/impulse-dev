class DocumentsManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalDocuments = 0;
        this.collection = ''
        this.documents = [];

        this.initialize();
        this.listen();
    }

    initialize() {
        console.log("DocumentsManager:initialize");
        this.tableBody = document.getElementById('documentsTableBody');
        this.collectionInput = document.getElementById('collectionInput');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
    }

    listen() {
        console.log("DocumentsManager:listen");
        this.collectionInput.addEventListener('change', () => this.loadCollection());
        this.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.nextPageBtn.addEventListener('click', () => this.changePage(1));
    }

    async loadCollection() {
        this.collection = this.collectionInput.value.toLowerCase();
        this.documents = await Firebase.read(this.collection);
        this.currentPage = 1;
        this.updatePagination();
        this.renderDocuments();
    }

    changePage(delta) {
        const newPage = this.currentPage + delta;
        if (newPage >= 1 && newPage <= this.getTotalPages()) {
            this.currentPage = newPage;
            this.updatePagination();
            this.renderDocuments();
        }
    }

    updatePagination() {
        const totalPages = this.getTotalPages();
        this.currentPageSpan.textContent = this.currentPage;
        this.totalPagesSpan.textContent = totalPages;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === totalPages;
    }

    getTotalPages() {
        return Math.ceil(this.documents.length / this.itemsPerPage);
    }

    renderDocuments() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageDocuments = this.documents.slice(start, end);

        this.tableBody.innerHTML = pageDocuments.map(doc => `
            <tr>
                <td>${doc.name || doc.id}</td>
                <td>
                    <button class="action-btn edit" onclick="window.location.href='/document/${doc.id}/edit'">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="action-btn delete" onclick="documentsManager.deleteDocument('${doc.id}')">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async deleteDocument(docId) {
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                Loader.show();
                // Implement delete functionality
                await Firebase.write('documents', docId, { deleted: true });
                this.documents = this.documents.filter(doc => doc.id !== docId);
                this.filteredDocuments = this.filteredDocuments.filter(doc => doc.id !== docId);
                this.updatePagination();
                this.renderDocuments();
            } catch (error) {
                console.error('Error deleting document:', error);
                this.showError('Failed to delete document');
            } finally {
                Loader.hide();
            }
        }
    }

    showError(message) {
        // Implement error notification
        console.error(message);
    }
}

new DocumentsManager();