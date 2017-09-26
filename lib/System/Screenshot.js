exports.captureTab = captureTab;
exports.saveTmpFile = saveTmpFile;

const {window: {document}} = require('sdk/addon/window');
const {getTabContentWindow, getActiveTab} = require('sdk/tabs/utils');
const {getMostRecentBrowserWindow} = require('sdk/window/utils');

function captureTab(filename) {
    // var Screenshoter = require('./System/Screenshot/');
    //var flag = true;
    return new Promise(function (resolve, reject) {
        var i = 0;

        tab = getActiveTab(getMostRecentBrowserWindow());
        var contentWindow = getTabContentWindow(tab);
        var tabs = require("sdk/tabs");

        var {document} = contentWindow;

        var w = contentWindow.innerWidth;
        var h = contentWindow.innerHeight;
        var x = contentWindow.scrollX;
        var y = contentWindow.scrollY;



        var mouseDownFlag = false;
        var mouseUpFlag = true;


        var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

        document.addEventListener('mousedown', function (event) {
            mouseDownFlag = true;
            x = event.clientX;
            y = event.clientY;
        });

        document.addEventListener('mouseup', function () {
            mouseDownFlag = false;
            mouseUpFlag = true;
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.drawWindow(contentWindow, x, y, w, h, '#000000');
            return resolve(canvas.toDataURL());
        });

        document.addEventListener('mousemove', function (event) {
            if(mouseDownFlag) {
                w = event.clientX-x;
                h = event.clientY-y;
            }
        });
    });
}

function saveTmpFile(imageDataUri, tmpFileName) {
    return new Promise(function (resolve, reject) {
        const {Cu, components} = require("chrome");
        Cu.import("resource://gre/modules/NetUtil.jsm");
        Cu.import("resource://gre/modules/FileUtils.jsm");
        var file = FileUtils.getFile("TmpD", [tmpFileName]);
        NetUtil.asyncFetch(imageDataUri, function (inputstream, status) {

            if (!inputstream || !components.isSuccessCode(status)) {
                return reject('error not save tmp file');
            }

            var ostream = FileUtils.openSafeFileOutputStream(file);

            // The last argument (the callback) is optional.
            NetUtil.asyncCopy(inputstream, ostream, function (status) {
                if (!components.isSuccessCode(status)) {
                    return reject('error not save tmp file');
                }
                return resolve(tmpFileName);
            });
        });
    });
}
