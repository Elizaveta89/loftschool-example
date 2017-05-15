/* ДЗ 3 - работа с массивами и объеектами */

/*
 Задача 1:
 Напишите аналог встроенного метода forEach для работы с массивами
 */
function forEach(array, fn) {

    if(!Array.isArray(array)) {
        return;
    }
    for (var i=0; i < array.length; i++) {
        fn(array[i], i, array);
    }

}

/*
 Задача 2:
 Напишите аналог встроенного метода map для работы с массивами
 */
function map(array, fn) {

    var result = [];

    if(!Array.isArray(array)) {
        return;
    }

    for (var i=0; i<array.length; i++) {
        result.push(fn(array[i], i, array));
    }

    return result;
}

/*
 Задача 3:
 Напишите аналог встроенного метода reduce для работы с массивами
 */
function reduce(array, fn, initial) {

    if(!Array.isArray(array)) {
        return;
    }

    for (var i=0; i < array.length; i++) {
        var result;

        if(i === 0) {

            if(initial) {
                result = fn(initial, array[i], i, array);
            } else {
                initial = array[i];
                result = fn(initial, array[i], i, array);
            }

        } else {
            result = fn(result, array[i], i, array);
        }
    }

    return result;
}


/*
 Задача 4:
 Функция принимает объект и имя свойства, которое необходиом удалить из объекта
 Функция должна удалить указанное свойство из указанного объекта
 */
function deleteProperty(obj, prop) {
    delete obj[prop];
}

/*
 Задача 5:
 Функция принимает объект и имя свойства и возвращает true или false
 Функция должна проверить существует ли укзаанное свойство в указанном объекте
 */
function hasProperty(obj, prop) {

    return prop in obj;

}


/*
 Задача 6:
 Функция должна получить все перечисляемые свойства объекта и вернуть их в виде массива
 */
function getEnumProps(obj) {

    var result = [];

     for (var key in obj) {
         result.push(key);
     }

     return result;
}

/*
 Задача 7:
 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистра и вернуть в виде массива
 */
function upperProps(obj) {

    var result = [];

    for (var key in obj) {
        var uppKey = key.toUpperCase();
        result.push(uppKey);
    }

    return result;
}

/*
 Задача 8 *:
 Напишите аналог встроенного метода slice для работы с массивами
 */
function slice(array, from, to) {

    var result = [];

    if (!from) {
        from = 0;
    } else if (from < 0){
        from = array.length + from;
    }

    if (!to) {
        to = array.length;
    } else if (to < 0) {
        to = array.length + to;
    }

    if (array.length < to) {
        throw new Error('длина массива меньше');
    }

    for (from; from < to; from++) {
        result.push(array[from]);
    }

    return result;
}


/*
 Задача 9 *:
 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {

}

// export {
//     forEach,
//     map,
//     reduce,
//     deleteProperty,
//     hasProperty,
//     getEnumProps,
//     upperProps,
//     slice,
//     createProxy
// };
