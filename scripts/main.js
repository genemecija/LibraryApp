const btn_addBook = document.querySelector("#addBook");
btn_addBook.addEventListener("click", () => showAddBookDialogBox('Add Book'));

let myLibrary = {};
let editingBookId = ''

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "",
    authDomain: "top-libraryapp.firebaseapp.com",
    databaseURL: "https://top-libraryapp.firebaseio.com",
    projectId: "top-libraryapp",
    storageBucket: "top-libraryapp.appspot.com",
    messagingSenderId: "273001893707",
    appId: ""
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

class Book {
    constructor(title, author, genre, status) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.status = status;
    }
}

function createCard(book, id) {
    let card = document.createElement('div')
    card.setAttribute('class', 'card')
    card.setAttribute('id', id)
    card.innerHTML = `<div id='title' class='bookInfo'>${book.title}</div>
                    <div id='author' class='bookInfo'>${book.author}</div>
                    <div id='genre' class='bookInfo'>${book.genre}</div>
                    <div id='status' class='bookInfo'>${book.status}</div>
                    
                    <div class='configSection'>
                        <input type='button' id='edit${id}' value='Edit'>
                        <input type='button' id='delete${id}' value='Delete'>
                    </div>`
    return card
}

function addBookToLibrary(title, author, genre, status) {
    book = new Book(title, author, genre, status)

    db.collection("books").add({
        title: book.title,
        author: book.author,
        genre: book.genre,
        status: book.status
    })
}

function showAddBookDialogBox(title) {
    let dialogContainer = document.createElement('div')
    dialogContainer.setAttribute('id','dialogContainer')
    let dialog = document.createElement('div')
    dialog.setAttribute('id','addBookDialogBox')
    dialog.innerHTML = `
    <div id="addBookDialogTitle"><h2>${title}</h2></div>
    <div id="inputSection">
        <div class='input' id='titleSection'>
            <div class='inputDescriptor'>Title:</div>
            <div class='inputField'><input type="text" name="bookInfo_title" id="title"></div>
        </div>
        <div class='input' id='authorSection'>
            <div class='inputDescriptor'>Author:</div>
            <div class='inputField'><input type="text" name="bookInfo_author" id="author"></div>
        </div>
        <div class='input' id='genreSection'>
            <div class='inputDescriptor'>Genre:</div>
            <div class='inputField'><input type="text" name="bookInfo_genre" id="genre"></div>
        </div>
        <div class='input' id='statusSection'>
            <div class='inputDescriptor'>Status:</div>
            <div id="statusSelection">
                <input type="radio" name="bookInfo_status" id="notStarted" value="Not Started"> Not Started
                <input type="radio" name="bookInfo_status" id="inProgress" value="In Progress"> In Progress
                <input type="radio" name="bookInfo_status" id="read" value="Read"> Read
            </div>
        </div>
    </div>
    <div id="dialogControls">
        <button id="submit">Submit</button>
        <button id="cancel">Cancel</button>
    </div>`
    dialogContainer.appendChild(dialog)
    let body = document.querySelector('body')
    body.append(dialogContainer)
    const btn_addBook_submit = document.querySelector("#submit");
    btn_addBook_submit.addEventListener("click", submit);
    const btn_addBook_cancel = document.querySelector("#cancel");
    btn_addBook_cancel.addEventListener("click", cancel);
}


function submit() {
    const mode = document.querySelector('#addBookDialogTitle')
    if (mode.textContent == 'Edit Book') {
        db.collection("books").doc(editingBookId).delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
        editingBook = ''
    }
    const title = document.querySelector('input#title').value
    const author = document.querySelector('input#author').value
    const genre = document.querySelector('input#genre').value
    const statusOptions = document.getElementsByName('bookInfo_status')
    let status = 'Not Started'
    for (let i = 0; i < statusOptions.length; i++) {
        if (statusOptions[i].checked) {
            status = statusOptions[i].value;
        }
    }

    addBookToLibrary(title, author, genre, status)
    let body = document.querySelector('body')
    body.removeChild(document.querySelector('#dialogContainer'))
    render()
}
function cancel() {
    let body = document.querySelector('body')
    body.removeChild(document.querySelector('#dialogContainer'))
}


function editCard(e) {
    showAddBookDialogBox('Edit Book')
    const titleField = document.querySelector('input#title')
    const authorField = document.querySelector('input#author')
    const genreField = document.querySelector('input#genre')
    const statusOptions = document.getElementsByName('bookInfo_status')

    const book = db.collection("books").doc(e.target.id.slice(4))
    book.get().then(function(doc) {
        if (doc.exists) {
            editingBookId = e.target.id.slice(4)
            titleField.value = doc.data().title
            authorField.value = doc.data().author
            genreField.value = doc.data().genre
            status = doc.data().status
            for (let i = 0; i < statusOptions.length; i++) {
                if (statusOptions[i].value == status) {
                    statusOptions[i].checked = true;
                }
            }
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

}

function deleteCard(e) {
    const doc = e.target.id.slice(6)
    db.collection("books").doc(doc).delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
    render()
}

function render() {
    let books = document.querySelectorAll('.card')
    let container = document.querySelector('#main')
    
    books.forEach((book) => container.removeChild(book))

    db.collection("books").get().then(function(queryResult) {
        if (queryResult.size < 1) {
            addBookToLibrary("Harry Potter", "J.K. Rowling", "Fantasy", "Not Started")
            addBookToLibrary("Ender's Game", "Orson Scott Card", "Science Fiction", "Read")
            addBookToLibrary("The Shining", "Stephen King", "Horror", "Not Started")
        } else {
            queryResult.forEach(function(doc) {
                let book = doc.data();
                let card = createCard(book, doc.id)
                container.appendChild(card)
                const editButton = document.querySelector(`#edit${doc.id}`)
                editButton.addEventListener('click', editCard);
                const deleteButton = document.querySelector(`#delete${doc.id}`)
                deleteButton.addEventListener('click', deleteCard);
            })
        }
    })
}

render()