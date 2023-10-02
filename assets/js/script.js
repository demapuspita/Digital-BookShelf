/*
{
  id: string | number,
  title: string,
  author: string,
  year: number,
  isComplete: boolean,
}
*/

const booksApp = [];
const RENDER_EVENT = 'render-bookshelf';

function generateId() {
    return +new Date();
}

function generateBookShelfObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        isComplete
    };
}

function findBookShelf(bookShelfId) {
    for (const bookShelfItem of booksApp) {
        if (bookShelfItem.id === bookShelfId) {
            return bookShelfItem;
        }
    }
    return null;
}

function findBookShelfIndex(bookShelfId) {
    for (const index in booksApp) {
        if (booksApp[index].id === bookShelfId) {
            return index;
        }
    }
    return -1;
}

function makeBookShelf(bookShelfObject) {
    const { id, title, author, year, isComplete } = bookShelfObject;

    const textTitle = document.createElement('h2');
    textTitle.innerText = title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('action');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('book_item');
    container.append(textContainer);
    container.setAttribute('id', `bookshelf-${id}`);

    const editButton = document.createElement('button');
    editButton.classList.add('blue');
    editButton.innerHTML = '<i class="fas fa-edit"></i>'; // Edit icon
    editButton.addEventListener('click', function () {
        openEditForm(bookShelfObject);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('red')
    trashButton.innerHTML = '<i class="fas fa-trash"></i>'; // Trash icon
    trashButton.addEventListener('click', function () {
        removeTaskFromCompleted(id);
    });

    if (isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerHTML = '<i class="fas fa-undo"></i>'; // Undo icon
        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(id);
        });

        textContainer.append(editButton, trashButton, undoButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('green');
        checkButton.innerHTML = '<i class="fas fa-check"></i>'; // Check icon
        checkButton.addEventListener('click', function () {
            addTaskToCompleted(id);
        });

        textContainer.append(editButton, trashButton, checkButton);
    }

    return container;
}

const inputBookIsCompleteCheckbox = document.getElementById('inputBookIsComplete');
inputBookIsCompleteCheckbox.addEventListener('change', function () {
    const bookSubmitButton = document.getElementById('bookSubmit');
    if (inputBookIsCompleteCheckbox.checked) {
        bookSubmitButton.innerText = 'Masukkan Buku ke rak yang sudah selesai dibaca';
    } else {
        bookSubmitButton.innerText = 'Masukkan Buku ke rak Belum selesai dibaca';
    }
});

function addBookShelf() {
    const textBookShelf = document.getElementById('inputBookTitle').value;
    const textBookShelfAuthor = document.getElementById('inputBookAuthor').value;
    const textBookShelfYear = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookShelfObject = generateBookShelfObject(generatedID, textBookShelf, textBookShelfAuthor, textBookShelfYear, isComplete);
    booksApp.push(bookShelfObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function addTaskToCompleted(bookShelfId) {
    const bookShelfTarget = findBookShelf(bookShelfId);
    if (bookShelfTarget == null) return;
    bookShelfTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTaskFromCompleted(bookShelfId) {
    const bookShelfTarget = findBookShelfIndex(bookShelfId);
    if (bookShelfTarget === -1) return;  
    const confirmRemove = confirm(`Apakah Anda yakin ingin menghapus buku "${booksApp[bookShelfTarget].title}"?`);
    if (confirmRemove) {
        booksApp.splice(bookShelfTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function undoTaskFromCompleted(bookShelfId) {
    const bookShelfTarget = findBookShelf(bookShelfId);
    if (bookShelfTarget == null) return;
    bookShelfTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(booksApp);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'save-bookshelf';
const STORAGE_KEY = 'Bookshelf-APPS';

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const bookshelf of data) {
            booksApp.push(bookshelf);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener('DOMContentLoaded', function () {
    if (isStorageExist()) {
        loadDataFromStorage();
    }
    const submitForm = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBookShelf();
    });
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedTODOList = document.getElementById('incompleteBookshelfList');
    const listCompleted = document.getElementById('completeBookshelfList');

    uncompletedTODOList.innerHTML = '';
    listCompleted.innerHTML = '';

    for (const bookShelfItem of booksApp) {
        const bookShelfElement = makeBookShelf(bookShelfItem);
        if (bookShelfItem.isComplete) {
            listCompleted.append(bookShelfElement);
        } else {
            uncompletedTODOList.append(bookShelfElement);
        }
    }
});

function openEditForm(bookShelfItem) {
    const modal = document.getElementById('editModal');
    const modalContent = modal.querySelector('.modal-content');

    // Create the edit form
    const editForm = document.createElement('form');

    const headerEdit = document.createElement('h2');
    headerEdit.innerText = 'Edit Buku';

    const editTitleInput = document.createElement('input');
    editTitleInput.classList.add('input_edit');
    editTitleInput.type = 'text';
    editTitleInput.value = bookShelfItem.title;
    editTitleInput.required = true;

    const editAuthorInput = document.createElement('input');
    editAuthorInput.classList.add('input_edit');
    editAuthorInput.type = 'text';
    editAuthorInput.value = bookShelfItem.author;
    editAuthorInput.required = true;

    const editYearInput = document.createElement('input');
    editYearInput.classList.add('input_edit');
    editYearInput.type = 'number';
    editYearInput.value = bookShelfItem.year;
    editYearInput.required = true;

    const saveEditButton = document.createElement('button');
    saveEditButton.classList.add('edit');
    saveEditButton.innerText = 'Simpan';

    editForm.addEventListener('submit', function (event) {
        event.preventDefault();

        bookShelfItem.title = editTitleInput.value;
        bookShelfItem.author = editAuthorInput.value;
        bookShelfItem.year = editYearInput.value;

        modal.style.display = 'none'; // Hide the modal
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    });

    editForm.append(
        headerEdit,
        editTitleInput,
        editAuthorInput,
        editYearInput,
        saveEditButton
    );

    modalContent.innerHTML = ''; // Clear previous content
    modalContent.appendChild(editForm);

    // Display the modal
    modal.style.display = 'block';
}


const searchBookForm = document.getElementById('searchBook');
searchBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchBookTitleInput = document.getElementById('searchBookTitle').value;
    searchBooksByTitle(searchBookTitleInput);
});

function searchBooksByTitle(title) {
    const filteredBooks = booksApp.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    
    const uncompletedTODOList = document.getElementById('incompleteBookshelfList');
    const listCompleted = document.getElementById('completeBookshelfList');
    
    uncompletedTODOList.innerHTML = '';
    listCompleted.innerHTML = '';
    
    for (const bookShelfItem of filteredBooks) {
        const bookShelfElement = makeBookShelf(bookShelfItem);
        if (bookShelfItem.isComplete) {
            listCompleted.append(bookShelfElement);
        } else {
            uncompletedTODOList.append(bookShelfElement);
        }
    }
}
