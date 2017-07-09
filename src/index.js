function vkApi(method, options) {
  if (!options.v) {
    options.v = '5.64';
  }

  return new Promise((resolve, reject) => {
    VK.api(method, options, data => {
      if (data.error) {
        reject(new Error(data.error.error_msg));
      } else {
        resolve(data.response);
      }
    });
  });
}

function vkInit() {
  return new Promise((resolve, reject) => {
    VK.init({
      apiId: 6090606
    });

    VK.Auth.login(data => {
      if (data.session) {
        resolve();
      } else {
        reject(new Error('Не удалось авторизоваться'));
      }
    }, 2);
  });
}


var template = `
{{#each items}}
    <div class="friend" data-id="{{id}}">
        {{#if photo_200}}
        <img src="{{photo_200}}">
        {{else}}
        <img src="no-photo-cat.jpg">
        {{/if}}
        <div class="name">{{first_name}} {{last_name}}</div>
        <button class="button">+</button>
    </div>
{{/each}}
`;

var templateFn = Handlebars.compile(template);
var buttonSave = document.querySelector('.button-save');
var buttonClear = document.querySelector('.button-clear');
var leftListView = document.querySelector('.content-all');
var rightListView = document.querySelector('.content-selected');
var searchInputRight = document.querySelector('.search__input--right');
var searchInputLeft = document.querySelector('.search__input--left');
var wasInRight = false;
var selectedElem;
var selectedElemDeltaX = 0;
var selectedElemDeltaY = 0;
var leftListData = [];
var rightListData = [];

searchInputRight.addEventListener('input', function () {
  var value = this.value;
  var newArray = rightListData.filter(function(user) {
    return isMatching(user.first_name, value) || isMatching(user.last_name, value);
  });

  updateView(leftListData, newArray);
})

searchInputLeft.addEventListener('input', function (e) {
  var value = this.value;
  var newArray = leftListData.filter(function(user) {
    return isMatching(user.first_name, value) || isMatching(user.last_name, value);
  });

  updateView(newArray, rightListData);
})

window.addEventListener('mousemove', function (e) {
  if (!selectedElem) return;

  e.preventDefault();
  selectedElem.style.left = e.pageX - selectedElemDeltaX + 'px';
  selectedElem.style.top = e.pageY - selectedElemDeltaY + 'px';
})

window.addEventListener('mouseup', function(e) {
  if (!selectedElem) return;

  var selectedCenterX = e.pageX;
  var body = document.querySelector('body');
  var friendsLeft = leftListView.children;
  var friendsRight = rightListView.children;
  var isInLeftRect = selectedCenterX < body.offsetWidth /2;
  var isInRightRect = selectedCenterX > body.offsetWidth /2;
  var idSelected = selectedElem.getAttribute('data-id');
  var userData = getDataByUserId(idSelected);

  if (isInLeftRect) {
    var elemIndexLeftList = elemIndexMinDistance(e, friendsLeft);
    console.log(elemIndexMinDistance(e, friendsLeft));

    leftListData.splice(elemIndexLeftList,0, userData);

  } else if (isInRightRect) {
    var elemIndexRightList = elemIndexMinDistance(e, friendsRight);
    console.log(elemIndexMinDistance(e, friendsRight));
    rightListData.splice(elemIndexRightList,0, userData);
  }

  updateView();
  selectedElem = null;
})

new Promise(resolve => window.onload = resolve)
  .then(() => vkInit())
  .then(() => vkApi('friends.get', {fields: 'photo_200'}))
  .then(function(response) {
    leftListData = response.items;
    updateView();
  })
  .then(function() {
    buttonSave.addEventListener('click', function() {
      var serialLeftList = JSON.stringify(leftListData);
      var seriaRightList = JSON.stringify(rightListData);
      localStorage.setItem('leftList', serialLeftList);
      localStorage.setItem('rightList', seriaRightList);
      buttonClear.style.opacity = 1;
    })

    if (localStorage.getItem('leftList') || localStorage.getItem('rightList')) {
      buttonClear.style.opacity = 1;
      leftListData = JSON.parse(localStorage.getItem("leftList"));
      rightListData = JSON.parse(localStorage.getItem("rightList"));
      updateView();
    }

    buttonClear.addEventListener('click', function() {
      window.localStorage.clear();
      location.reload();
      updateView();
    })
  })
  .catch(e => alert('Ошибка: ' + e.message));

function updateView(arrayLeft, arrayRight) {
  leftListView.innerHTML = templateFn({items: arrayLeft || leftListData});
  rightListView.innerHTML = templateFn({items: arrayRight || rightListData});

  var buttonPlus = document.querySelectorAll('.button');
  for (var i=0; i <  buttonPlus.length; i++) {
    buttonPlus[i].addEventListener('mousedown', function(e) {
      e.stopPropagation();
    })
    buttonPlus[i].addEventListener('click', function(e) {
      var thisButton = e.target;
      var elemSelected = thisButton.parentNode;
      var idSelected = elemSelected.getAttribute('data-id');
      var userData = getDataByUserId(idSelected);

      if (!wasInRight) {
        rightListData.push(userData);
      } else {
        leftListData.push(userData);
      }

      updateView();
      selectedElem = null;
    });
  }

  var friendElem = document.getElementsByClassName('friend');
  for(var i=0; i<friendElem.length; i++){
    friendElem[i].addEventListener('mousedown', function(e) {
      var elem = e.currentTarget;
      elem.style.width = '400px';
      elem.style.position = 'absolute';
      elem.style.zIndex = '100';

      selectedElem = elem;
      selectedElemDeltaX = e.pageX - selectedElem.offsetLeft;
      selectedElemDeltaY = e.pageY - selectedElem.offsetTop;
    })
  }
}

function getDataByUserId (id) {
  var resultIndex = -1;
  for (var i = 0; i < leftListData.length; i++) {
    if (leftListData[i].id == id) {
      resultIndex = i;
      break;
    }
  }

  if (resultIndex != -1) {
    wasInRight = false;
    return leftListData.splice(resultIndex, 1)[0];
  }

  resultIndex = -1;

  for (var i = 0; i < rightListData.length; i++) {
    if (rightListData[i].id == id) {
      resultIndex = i;
      break;
    }
  }

  if (resultIndex != -1) {
    wasInRight = true;
    return rightListData.splice(resultIndex, 1)[0];
  }
}

function isMatching (full, chunk) {
  full = full.toLowerCase();
  chunk = chunk.toLowerCase();
  return full.indexOf(chunk) >= 0;
}

function elemIndexMinDistance (event, array) {
  var minDistance = Number.MAX_VALUE;
  var elemIndex;
  for(var i=0; i < array.length; i++) {
    var elemCenterX = array[i].offsetLeft + array[i].offsetWidth / 2;
    var elemCenterY = array[i].offsetTop + array[i].offsetHeight / 2;
    var distance = Math.sqrt((elemCenterX - event.pageX)*(elemCenterX - event.pageX) + (elemCenterY - event.pageY)*(elemCenterY - event.pageY));

    if (minDistance > distance) {
      minDistance = distance;
      elemIndex = i + 1;
    }
  }
  return elemIndex;
}