var body = document.getElementsByTagName('body');
body[0].innerHTML = '<div id="back-panel" style="z-index:9999;width: '+window.screen.availWidth+'px;height: '+window.screen.availHeight+'px;position:absolute;apacity:0.3"></div>'+body[0].innerHTML;
body[0].innerHTML = '<div class="js-overide" id="overide" ></div>'+body[0].innerHTML;

body[0].innerHTML = '<div id="panel" class="testing" style="position: absolute;border-radius:10px; z-index: 9999999; width: auto;height: auto">' +
    '<fieldset style="border: solid 2px red; background: #f7fcc8; color: blue;;">' +
    '<legend>Настройка карандаша</legend>' +
    'Цвет карандаша:<input type="color" id="color"><br/>' +
    'Текст подсказки:<input type="text" id="text"><br/>' +
    '<button id="button-acept">Применить</button> ' +
    '<button id="button-cancel">Отмена</button> ' +
    '</fieldset>' +
    '</div>'+
    body[0].innerHTML;

var canvas = document.getElementById('overide');
canvas.style.position = 'absolute';
canvas.style['z-index'] = '99999';
var leftTopCoord = {};
var color = 'red';

var flagDraw = false;
var message = false;
var flagNoDraw = false;

var colorPicker = document.getElementById('color');

document.getElementById('button-acept').onclick = function (e) {
    color = colorPicker.value;
    message = document.getElementById('text').value;
};

document.getElementById('button-cancel').onclick = function (e) {
    document.getElementById('panel').style.display = 'none';
    canvas.style.display = 'none';
    document.getElementById('back-panel').style.zIndex = '-1';
    document.getElementById('back-panel').style.display = 'none';
    flagNoDraw = true;
};

document.onmousedown = function (e) {
    leftTopCoord = {
        x:e.clientX,
        y:e.clientY
    };
    flagDraw = true;
};

/**
 * draw
 * @param e
 */
document.onmousemove = function (e) {
    draw(e);
};

document.onmouseup = function (e) {
    flagDraw = false;
};

function draw(e) {

    if(!flagDraw) {
        return false;
    }

    var rightBootom = {
        x:e.clientX,
        y:e.clientY
    };

    canvas.style.position = 'absolute';
    canvas.style.border = 'solid 2px '+color;
    canvas.style.top = leftTopCoord.y+"px";
    canvas.style.left = leftTopCoord.x+"px";
    canvas.style.width = rightBootom.x - leftTopCoord.x + 'px';
    canvas.style.height = rightBootom.y - leftTopCoord.y + 'px';
    canvas.innerText = message;
}