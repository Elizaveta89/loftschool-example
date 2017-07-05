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

searchInputRight.addEventListener('input', function (e) {
  var value = this.value;

  rightListData = rightListData.filter(function(user) {
    return user.indexOf(value) !== -1;
  });

  updateView();

})

searchInputLeft.addEventListener('input', function (e) {
  var value = this.value;


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
  var isInLeftRect = selectedCenterX < body.offsetWidth /2;
  var isInRightRect = selectedCenterX > body.offsetWidth /2;
  var idSelected = selectedElem.getAttribute('data-id');
  var userData = getDataByUserId(idSelected);

  if (isInLeftRect) {
    leftListData.push(userData);
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
  // .catch(e => alert('Ошибка: ' + e.message));

function updateView() {
  leftListView.innerHTML = templateFn({items: leftListData});
  rightListView.innerHTML = templateFn({items: rightListData});

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