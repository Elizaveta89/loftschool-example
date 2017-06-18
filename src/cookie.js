/**
 * ДЗ 7.2 - Создать редактор cookie с возможностью фильтрации
 *
 * На странице должна быть таблица со списком имеющихся cookie:
 * - имя
 * - значение
 * - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)
 *
 * На странице должна быть форма для добавления новой cookie:
 * - имя
 * - значение
 * - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)
 *
 * Если добавляется cookie с именем уже существующией cookie, то ее значение в браузере и таблице должно быть обновлено
 *
 * На странице должно быть текстовое поле для фильтрации cookie
 * В таблице должны быть только те cookie, в имени или значении которых есть введенное значение
 * Если в поле фильтра пусто, то должны выводиться все доступные cookie
 * Если дабавляемая cookie не соответсвуте фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 * Если добавляется cookie, с именем уже существующией cookie и ее новое значение не соответствует фильтру,
 * то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена
 *
 * Для более подробной информации можно изучить код тестов
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');
let filterNameInput = homeworkContainer.querySelector('#filter-name-input');
let addNameInput = homeworkContainer.querySelector('#add-name-input');
let addValueInput = homeworkContainer.querySelector('#add-value-input');
let addButton = homeworkContainer.querySelector('#add-button');
let listTable = homeworkContainer.querySelector('#list-table tbody');

window.onload = updateView;

filterNameInput.addEventListener('keyup', function() {
});

addButton.addEventListener('click', () => {
    addCookie(addNameInput.value, addValueInput.value);
    removeContent(listTable);
    updateView();
});

function addCookie(name, value) {
    document.cookie = name + '=' + value;
}

function deleteCookie(name) {
    var date = new Date();
    date.setTime(date.getTime() - 1);

    document.cookie = name += '=; expires=' + date.toGMTString();
}


function updateView () {

    var cookies = document.cookie;
    var cookiesArr = cookies.split(';');

    for (var i=0; i < cookiesArr.length; i++) {
        var cookieNameValue = cookiesArr[i].split('=');
        var cookieName = cookieNameValue[0];
        var cookieValue = cookieNameValue[1];
        var tr = listTable.insertRow(-1);
        addTable(tr, cookieName);
        addTable(tr, cookieValue);

        var buttonRemove = document.createElement('button');
        buttonRemove.setAttribute('id', 'delete-button');
        buttonRemove.innerText = 'Удалить';
        buttonRemove.addEventListener('click', () => {
            deleteCookie(cookieName);
            removeContent(listTable, buttonRemove);
            updateView();
        });
        addTable(tr, buttonRemove);
    }

    function addTable(tr, elem) {
        var td = tr.insertCell(-1);
        if(typeof elem === 'object') {
            td.appendChild(elem);
        } else {
            td.innerHTML = elem;
        }
    }
}

function removeContent (parent, button) {
    if (button) {
        button.removeEventListener('click', () => {
            deleteCookie(cookieName);
            updateView();
        })
    }
    parent.innerHTML = '';
}

