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
    <div class="friend">
        <img src="{{photo_200}}">
        <div class="name">{{first_name}} {{last_name}}</div>
        <button class="button">+</button>
    </div>
{{/each}}
`;
var templateFn = Handlebars.compile(template);

var friends = document.querySelector('.content-all');

new Promise(resolve => window.onload = resolve)
  .then(() => vkInit())
  .then(() => vkApi('users.get', {name_case: 'gen'}))
  .then(() => vkApi('friends.get', {fields: 'photo_200'}))
  .then(response => friends.innerHTML = templateFn(response))
  .catch(e => alert('Ошибка: ' + e.message));
