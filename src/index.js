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

function updateView() {
  leftListView.innerHTML = templateFn(leftListData);
  rightListView.innerHTML = templateFn(rightListData);
}

function getDataByUserId (id) {
  for (var i = 0; i < leftListData.length; i++) {
    console.log(leftListData[i], 'левый');
    if(leftListData[i].items.id === id) {
      return leftListData.splice(i, 1);
    }
  }

  for (var i = 0; i < rightListData.length; i++) {
    console.log(rightListData[i], 'правый');
    if(rightListData[i].items.id === id) {
      return rightListData.splice(i, 1);
    }
  }
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
var selectedElem;
var selectedElemDeltaX = 0;
var selectedElemDeltaY = 0;
var leftListData = [];
var rightListData = [];

window.addEventListener('mousemove', function (e) {
  if (!selectedElem) return;

  e.preventDefault();
  selectedElem.style.left = e.pageX - selectedElemDeltaX + 'px';
  selectedElem.style.top = e.pageY - selectedElemDeltaY + 'px';
})

window.addEventListener('mouseup', function(e) {
  if (!selectedElem) return;

  var leftRect = leftListView.getBoundingClientRect();
  var rightRect = rightListView.getBoundingClientRect();
  var selectedCenterX = e.pageX;
  var selectedCenterY = e.pageY;
  var isInLeftRect = selectedCenterX > leftRect.left && selectedCenterX < leftRect.right && selectedCenterY > leftRect.top &&  selectedCenterY < leftRect.bottom;
  var isInRightRect = selectedCenterX > rightRect.left && selectedCenterX < rightRect.right && selectedCenterY > rightRect.top &&  selectedCenterY < rightRect.bottom;
  var idSelected = selectedElem.getAttribute('data-id');

  if (isInLeftRect) {
    leftListData.push(getDataByUserId(idSelected));
  } else if (isInRightRect) {
    rightListData.push(getDataByUserId(idSelected));
  }


})

new Promise(resolve => window.onload = resolve)
  .then(() => vkInit())
  .then(() => vkApi('friends.get', {fields: 'photo_200'}))
  .then(function(response) {
    leftListData = response;
    updateView();
  })
  .then(function() {
    var friendElem = leftListView.getElementsByClassName('friend');
    for(var i=0; i<friendElem.length; i++){
      friendElem[i].addEventListener('mousedown', function(e) {
        var elem = e.currentTarget;
        elem.style.width = '300px';
        elem.style.position = 'absolute';
        elem.style.zIndex = '100';

        selectedElem = elem;
        selectedElemDeltaX = e.pageX - selectedElem.offsetLeft;
        selectedElemDeltaY = e.pageY - selectedElem.offsetTop;

      })
    }
  })
  // .catch(e => alert('Ошибка: ' + e.message));
