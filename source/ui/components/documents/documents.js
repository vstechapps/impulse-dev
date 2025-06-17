class DocumentsManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.collection = '';
        this.documents = [];
        this.lastDoc = null;
        this.hasMore = false;

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
        Loader.show();
        const result = await Firebase.read(this.collection, { size: this.itemsPerPage });
        this.documents = result.data;
        this.lastDoc = result.lastDoc;
        this.hasMore = result.hasMore;
        this.currentPage = 1;
        this.updatePagination();
        this.renderDocuments();
        Loader.hide();
    }

    async changePage(delta) {
        if (delta > 0 && !this.hasMore) return;
        if (delta < 0 && this.currentPage === 1) return;

        Loader.show();
        try {
            if (delta > 0) {
                // Load next page
                const result = await Firebase.read(this.collection, {
                    size: this.itemsPerPage,
                    lastDoc: this.lastDoc
                });
                this.documents = result.data;
                this.lastDoc = result.lastDoc;
                this.hasMore = result.hasMore;
                this.currentPage++;
            } else {
                // For previous page, we need to reload from start
                // This is a limitation of cursor-based pagination
                const result = await Firebase.read(this.collection, { size: this.itemsPerPage });
                this.documents = result.data;
                this.lastDoc = result.lastDoc;
                this.hasMore = result.hasMore;
                this.currentPage = 1;
            }
            this.updatePagination();
            this.renderDocuments();
        } catch (error) {
            console.error('Error changing page:', error);
            this.showError('Failed to load documents');
        } finally {
            Loader.hide();
        }
    }

    updatePagination() {
        this.currentPageSpan.textContent = this.currentPage;
        this.totalPagesSpan.textContent = this.hasMore ? '...' : this.currentPage;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = !this.hasMore;
    }

    renderDocuments() {
        if (!Array.isArray(this.documents)) {
            console.error('Documents is not an array:', this.documents);
            this.documents = [];
        }

        this.tableBody.innerHTML = this.documents.map(doc => {
            const docName = doc.name || doc.id || 'Unnamed Document';
            return `
                <tr>
                    <td>${docName}</td>
                    <td>
                        <button class="action-btn edit" onclick="window.location.href='/document/${doc.id}/edit'">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="action-btn delete" onclick="documentsManager.deleteDocument('${doc.id}')">
                            <span class="material-icons">delete</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async deleteDocument(docId) {
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                Loader.show();
                await Firebase.write(this.collection, docId, { deleted: true });
                this.documents = this.documents.filter(doc => doc.id !== docId);
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