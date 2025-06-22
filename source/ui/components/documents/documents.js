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
                        <button class="action-btn edit" onclick="documentsManager.editDocument('${doc.id}')">
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

    async editDocument(docId) {
        try {
            Loader.show();
            // Fetch the document data
            const result = await Firebase.read(this.collection, { docId });
            const doc = result.data && result.data[0];
            if (!doc) {
                this.showError('Document not found');
                Loader.hide();
                return;
            }
            // Remove id from editable content
            const { id, ...docContent } = doc;
            // Fill textarea with pretty JSON
            const textarea = document.getElementById('editDocumentTextarea');
            textarea.value = JSON.stringify(docContent, null, 2);
            // Set modal title to EDIT {document id}
            const title = document.getElementById('editDocumentModalLabel');
            if (title) title.textContent = `EDIT ${docId}`;
            // Store current docId for update
            this._editingDocId = docId;
            // Show modal (custom JS)
            this.showEditModal();
        } catch (error) {
            console.error('Error loading document for edit:', error);
            this.showError('Failed to load document');
        } finally {
            Loader.hide();
        }
    }

    // Minimal modal show/hide logic
    showEditModal() {
        const modal = document.getElementById('editDocumentModal');
        const backdrop = document.getElementById('editModalBackdrop');
        modal.classList.add('show');
        modal.style.display = 'block';
        modal.removeAttribute('inert');
        modal.removeAttribute('aria-hidden');
        // Focus textarea for accessibility
        const textarea = document.getElementById('editDocumentTextarea');
        if (textarea) textarea.focus();
        if (backdrop) {
            backdrop.classList.add('show');
            backdrop.style.display = 'block';
        }
    }
    hideEditModal() {
        const modal = document.getElementById('editDocumentModal');
        const backdrop = document.getElementById('editModalBackdrop');
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('inert', '');
        modal.setAttribute('aria-hidden', 'true');
        // Move focus to body to avoid focus on hidden element
        document.body.focus();
        if (backdrop) {
            backdrop.classList.remove('show');
            backdrop.style.display = 'none';
        }
    }

    showError(message) {
        // Implement error notification
        console.error(message);
    }
}

window.documentsManager = new DocumentsManager();

// Attach update and modal close handlers after DOMContentLoaded
load = function() {
    const updateBtn = document.getElementById('updateDocumentBtn');
    const closeBtn = document.getElementById('closeEditModalBtn');
    const cancelBtn = document.getElementById('cancelEditModalBtn');
    const backdrop = document.getElementById('editModalBackdrop');
    if (updateBtn) {
        updateBtn.onclick = async () => {
            const textarea = document.getElementById('editDocumentTextarea');
            let json;
            try {
                json = JSON.parse(textarea.value);
            } catch (e) {
                alert('Invalid JSON!');
                return;
            }
            if (!documentsManager._editingDocId || !documentsManager.collection) {
                alert('Missing document or collection info.');
                return;
            }
            Loader.show();
            try {
                await Firebase.write(documentsManager.collection, documentsManager._editingDocId, json);
                // Hide modal
                documentsManager.hideEditModal();
                // Refresh documents list
                await documentsManager.loadCollection();
            } catch (err) {
                alert('Failed to update document.');
                console.error(err);
            } finally {
                Loader.hide();
            }
        };
    }
    // Close/cancel/backdrop click handlers
    const closeModal = () => documentsManager.hideEditModal();
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (backdrop) backdrop.onclick = closeModal;
    // Optional: ESC key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') documentsManager.hideEditModal();
    });
    
};

load();