var myMap;
var myPlacemark;

new Promise(resolve => window.onload = resolve)

ymaps.ready(init);

function init() {
    myMap = new ymaps.Map('map', {
        center: [55.753994, 37.622093],
        zoom: 12
    }, {
        searchControlProvider: 'yandex#search'
    });

    myMap.events.add('click', function (e) {
        var coords = e.get('coords');

        myPlacemark = createPlacemark(coords);
        myMap.geoObjects.add(myPlacemark);

        getAddress(coords);
        console.log( getAddress(coords))
    });

    // Создание метки.
    function createPlacemark(coords) {
        return new ymaps.Placemark(coords,{
            preset: 'islands#violetDotIconWithCaption',
            draggable: true
        });
    }

    // Определяем адрес по координатам (обратное геокодирование).
    function getAddress(coords) {
        ymaps.geocode(coords).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);

            myPlacemark.properties
                .set({
                    // Формируем строку с данными об объекте.
                    iconCaption: [
                        // Название населенного пункта или вышестоящее административно-территориальное образование.
                        firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                        // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                        firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                    ].filter(Boolean).join(', '),
                    // В качестве контента балуна задаем строку с адресом объекта.
                    balloonContent: firstGeoObject.getAddressLine()
                });
            return firstGeoObject.getAddressLine();
        });
    }
}



