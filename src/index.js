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
        <img src="{{photo_200}}">
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
    console.log(user.first_name.indexOf(value));
    return user.first_name.indexOf(value) != -1 || user.last_name.indexOf(value) != -1;
  });

  updateView(leftListData, newArray);
})

searchInputLeft.addEventListener('input', function (e) {
  var value = this.value;
  var newArray = leftListData.filter(function(user) {
    console.log(user.first_name.indexOf(value));
    return user.first_name.indexOf(value) != -1 || user.last_name.indexOf(value) != -1;
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
    for(var i=0; i < friendsLeft.length; i++) {

      var elemCenterX = friendsLeft[i].offsetLeft + friendsLeft[i].offsetWidth / 2;
      var elemCenterY = friendsLeft[i].offsetTop + friendsLeft[i].offsetHeight / 2;
      var distense = (elemCenterX - e.pageX) ^ 2 + (elemCenterY - e.pageY) ^ 2;

    }

      // var a = [1, 3, 5, 2];
      // var min = 999;
      // for (var i = 0; i < a.length; i++) {
      //   min = a[i];
      //   if (a[i] < min){
      //     return min;
      //   }
      // }
      // console.log(min);

      // if (leftListData[i].getBoundingClientRect() == userData.getBoundingClientRect()) {
      //
      // }

  } else if (isInRightRect) {
    rightListData.push(userData);
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
      var returnLeft = JSON.parse(localStorage.getItem("leftList"));
      var returnRight = JSON.parse(localStorage.getItem("rightList"));
      updateView(returnLeft, returnRight);
    }

    buttonClear.addEventListener('click', function() {
      window.localStorage.clear();
      location.reload();
      updateView();
    })
  })
  // .catch(e => alert('Ошибка: ' + e.message));

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