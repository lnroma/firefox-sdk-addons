var body = document.getElementsByTagName('body');
body[0].innerHTML = '<div id="back-panel" style="z-index:9999;width: '+window.screen.availWidth+'px;height: '+window.screen.availHeight+'px;position:absolute;apacity:0.3"></div>'+body[0].innerHTML;
body[0].innerHTML = '<div class="js-overide" id="overide" ></div>'+body[0].innerHTML;

var canvas = document.getElementById('overide');
canvas.style.position = 'absolute';
canvas.style['z-index'] = '2147483647';
var leftTopCoord = {};
var color = 'red';

var flagDraw = false;

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
    // clear all panel
    canvas.style.display = 'none';
    document.getElementById('back-panel').style.zIndex = '-1';
    document.getElementById('back-panel').style.display = 'none';
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
    canvas.style.border = 'solid 1px '+color;
    canvas.style.top = leftTopCoord.y+"px";
    canvas.style.left = leftTopCoord.x+"px";
    canvas.style.width = rightBootom.x - leftTopCoord.x + 'px';
    canvas.style.height = rightBootom.y - leftTopCoord.y + 'px';
}