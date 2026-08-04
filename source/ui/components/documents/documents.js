class DocumentsManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.collection = '';
        this.documents = [];
        this.lastDoc = null;
        this.hasMore = false;
        var user = sessionStorage.getItem("user");
        if(user==null) {goto(""); return;}
        user = JSON.parse(user);
        if(user.role!="ADMIN"){goto(""); return;}
        this.initialize();
        this.listen();
    }

    initialize() { 
        console.log("DocumentsManager:initialize");
        this.tableBody = document.getElementById('documentsTableBody');
        this.collectionInput = document.getElementById('collectionInput');
        this.searchKeyInput = document.getElementById('searchKeyInput');
        this.searchValueInput = document.getElementById('searchValueInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.addDocumentBtn = document.getElementById('addDocumentBtn');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
    }

    listen() {
        console.log("DocumentsManager:listen");
        this.collectionInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') this.loadCollection();
        });
        this.searchKeyInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') this.loadCollection();
        });
        this.searchValueInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') this.loadCollection();
        });
        this.searchBtn.addEventListener('click', () => this.loadCollection());
        this.addDocumentBtn.addEventListener('click', () => this.showAddModal());
        this.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.nextPageBtn.addEventListener('click', () => this.changePage(1));
    }

    getReadOptions(extra = {}) {
        const options = { size: this.itemsPerPage, ...extra };
        const searchKey = this.searchKeyInput?.value?.trim();
        const searchValue = this.searchValueInput?.value?.trim();

        if (searchKey && searchValue !== '') {
            options.search = { key: searchKey, value: searchValue };
        }

        return options;
    }

    async loadCollection() {
        this.collection = this.collectionInput.value.trim().toLowerCase();
        if (!this.collection) {
            this.showError('Please enter a collection name');
            return;
        }

        Loader.show();
        try {
            const result = await Firebase.read(this.collection, this.getReadOptions());
            this.documents = result.data;
            this.lastDoc = result.lastDoc;
            this.hasMore = result.hasMore;
            this.currentPage = 1;
            this.updatePagination();
            this.renderDocuments();
        } catch (error) {
            console.error('Error loading collection:', error);
            this.showError('Failed to load documents');
        } finally {
            Loader.hide();
        }
    }

    async changePage(delta) {
        if (delta > 0 && !this.hasMore) return;
        if (delta < 0 && this.currentPage === 1) return;

        Loader.show();
        try {
            if (delta > 0) {
                const result = await Firebase.read(this.collection, this.getReadOptions({
                    lastDoc: this.lastDoc
                }));
                this.documents = result.data;
                this.lastDoc = result.lastDoc;
                this.hasMore = result.hasMore;
                this.currentPage++;
            } else {
                const result = await Firebase.read(this.collection, this.getReadOptions());
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
                await Firebase.delete(this.collection, docId);
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
            const result = await Firebase.read(this.collection, { docId });
            const doc = result.data && result.data[0];
            if (!doc) {
                this.showError('Document not found');
                Loader.hide();
                return;
            }
            const { id, ...docContent } = doc;
            const textarea = document.getElementById('editDocumentTextarea');
            textarea.value = JSON.stringify(docContent, null, 2);
            const title = document.getElementById('editDocumentModalLabel');
            if (title) title.textContent = `EDIT ${docId}`;
            this._editingDocId = docId;
            this.showEditModal();
        } catch (error) {
            console.error('Error loading document for edit:', error);
            this.showError('Failed to load document');
        } finally {
            Loader.hide();
        }
    }

    showEditModal() {
        this.hideAddModal();
        const modal = document.getElementById('editDocumentModal');
        const backdrop = document.getElementById('editModalBackdrop');
        if (!modal || !backdrop) return;
        modal.classList.add('show');
        modal.style.display = 'block';
        modal.removeAttribute('inert');
        modal.removeAttribute('aria-hidden');
        const textarea = document.getElementById('editDocumentTextarea');
        if (textarea) textarea.focus();
        backdrop.classList.add('show');
        backdrop.style.display = 'block';
    }

    hideEditModal() {
        const modal = document.getElementById('editDocumentModal');
        const backdrop = document.getElementById('editModalBackdrop');
        if (!modal || !backdrop) return;
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('inert', '');
        modal.setAttribute('aria-hidden', 'true');
        document.body.focus();
        backdrop.classList.remove('show');
        backdrop.style.display = 'none';
    }

    showAddModal() {
        this.hideEditModal();
        const modal = document.getElementById('addDocumentModal');
        const backdrop = document.getElementById('addModalBackdrop');
        if (!modal || !backdrop) return;
        const collectionInput = document.getElementById('addCollectionInput');
        const docIdInput = document.getElementById('addDocumentIdInput');
        const textarea = document.getElementById('addDocumentTextarea');
        if (collectionInput) collectionInput.value = this.collection || '';
        if (docIdInput) docIdInput.value = '';
        if (textarea) textarea.value = '{\n  \"name\": \"example\"\n}';
        modal.classList.add('show');
        modal.style.display = 'block';
        modal.removeAttribute('inert');
        modal.removeAttribute('aria-hidden');
        if (collectionInput) collectionInput.focus();
        backdrop.classList.add('show');
        backdrop.style.display = 'block';
    }

    hideAddModal() {
        const modal = document.getElementById('addDocumentModal');
        const backdrop = document.getElementById('addModalBackdrop');
        if (!modal || !backdrop) return;
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('inert', '');
        modal.setAttribute('aria-hidden', 'true');
        document.body.focus();
        backdrop.classList.remove('show');
        backdrop.style.display = 'none';
    }

    async saveNewDocument() {
        const collectionInput = document.getElementById('addCollectionInput');
        const docIdInput = document.getElementById('addDocumentIdInput');
        const textarea = document.getElementById('addDocumentTextarea');

        const collection = collectionInput?.value?.trim().toLowerCase();
        const docId = docIdInput?.value?.trim();
        let json;

        if (!collection || !docId) {
            alert('Please provide a collection name and document ID.');
            return;
        }

        try {
            json = JSON.parse(textarea.value);
        } catch (error) {
            alert('Invalid JSON!');
            return;
        }

        Loader.show();
        try {
            await Firebase.write(collection, docId, json);
            this.collectionInput.value = collection;
            this.hideAddModal();
            await this.loadCollection();
        } catch (error) {
            console.error('Error creating document:', error);
            alert('Failed to save document.');
        } finally {
            Loader.hide();
        }
    }

    showError(message) {
        console.error(message);
    }
}

window.documentsManager = new DocumentsManager();

load = function() {
    const updateBtn = document.getElementById('updateDocumentBtn');
    const closeEditBtn = document.getElementById('closeEditModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditModalBtn');
    const editBackdrop = document.getElementById('editModalBackdrop');
    const saveAddBtn = document.getElementById('saveAddDocumentBtn');
    const closeAddBtn = document.getElementById('closeAddModalBtn');
    const cancelAddBtn = document.getElementById('cancelAddModalBtn');
    const addBackdrop = document.getElementById('addModalBackdrop');

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
                documentsManager.hideEditModal();
                await documentsManager.loadCollection();
            } catch (err) {
                alert('Failed to update document.');
                console.error(err);
            } finally {
                Loader.hide();
            }
        };
    }

    if (saveAddBtn) {
        saveAddBtn.onclick = () => documentsManager.saveNewDocument();
    }

    const closeEditModal = () => documentsManager.hideEditModal();
    const closeAddModal = () => documentsManager.hideAddModal();

    if (closeEditBtn) closeEditBtn.onclick = closeEditModal;
    if (cancelEditBtn) cancelEditBtn.onclick = closeEditModal;
    if (editBackdrop) editBackdrop.onclick = closeEditModal;
    if (closeAddBtn) closeAddBtn.onclick = closeAddModal;
    if (cancelAddBtn) cancelAddBtn.onclick = closeAddModal;
    if (addBackdrop) addBackdrop.onclick = closeAddModal;

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            documentsManager.hideEditModal();
            documentsManager.hideAddModal();
        }
    });
};

load();