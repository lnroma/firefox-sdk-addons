var ui = require('sdk/ui');
var {ActionButton} = require('sdk/ui/button/action');
var {Toolbar} = require('sdk/ui/toolbar');
var {Sidebar} = require('sdk/ui/sidebar');
var {Frame} = require("sdk/ui/frame");
var tabs = require("sdk/tabs");

var myscreenshots = ui.ActionButton({
    id: "my-screens-button",
    label: "Show files",
    icon: {
        "16": "./image/screens/icon16.png",
        "32": "./image/screens/icon32.png",
        "64": "./image/screens/icon64.png"
    },
    onClick: showScreens
});

var button = ui.ActionButton({
    id: "mozilla-link",
    label: "Make screenshot",
    icon: {
        "16": "./image/camera16.png",
        "32": "./image/camera32.png",
        "64": "./image/camera64.png"
    },
    onClick: makeScreen
});

var edit = ui.ActionButton({
    id: "edit-page",
    label: "Edit page",
    icon: {
        "16": "./image/pencil/icon16.png",
        "32": "./image/pencil/icon32.png",
        "64": "./image/pencil/icon64.png"
    },
    onClick: editPage
});

var toolbar = ui.Toolbar({
    title: "Develop toolbar",
    items: [button, myscreenshots, edit]
});

var sidebar = ui.Sidebar({
    id: 'my-video',
    title: 'My video',
    url: require("sdk/self").data.url("./html/sidebar.html")
});

var sidebarColor = ui.Sidebar({
    id:'sidebar-color',
    title: 'Настройка рисования',
    url: require("sdk/self").data.url('./html/draw.html')
});

var workerArr = [];

/**
 * sidebar logics
 */
var sidebarScreens = ui.Sidebar({
    id: 'my-screen',
    title: 'My screenshots',
    url: require("sdk/self").data.url("./html/screens.html"),
    onAttach: function (worker) {
        worker.port.on("ping", function (data) {
           require('./lib/Yandex/Disk').getPublicScreens(function (response) {
               var result = JSON.parse(response.text);
               var resultHtml = '';
               result.items.forEach(function (value) {
                   resultHtml += '<tr><td><a href="' + value.public_url + '" >' + value.public_url + '</a></td></tr>';
               });
               worker.port.emit("pong", resultHtml);
           })
        });
    }
});

var { attach, detach } = require('sdk/content/mod');
var { Style } = require('sdk/stylesheet/style');

var style = Style({
    uri: data.url('html/css/content.css')
});
/**
 * mark page place
 */
function editPage() {
    // sidebarColor.show();
    var tabs = require('sdk/tabs');
    var data = require("sdk/self").data;
    attach(style,tabs.activeTab);
    tabs.activeTab.attach({
        contentScriptFile: data.url('html/scripts/content.js'),
    });
}

/**
 * show all screens
 */
function showScreens() {
    console.log('show screen');
    sidebarScreens.show();
}

/**
 * click to button :screenshot
 * @param state
 */
function makeScreen(state) {
    var date = new Date();
    var fileScreen = date.getTime().toString() + '_screen.png';
    var Yandex = require('./lib/Yandex/Disk');
    var args = ["-s", "/tmp/" + fileScreen];

    system(
        '/usr/bin/scrot',
        args
    );

    Yandex.uploadToYandex(fileScreen);
}

/**
 * call system request
 * @param shell
 * @param args
 */
function system(shell, args) {
    const {Cc, Ci} = require("chrome");

    var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    file.initWithPath(shell);

    var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
    process.init(file);
    process.run(true, args, args.length);
}

/**
 * get client oauth token
 */
var sp = require("sdk/simple-prefs");
sp.on("getYaToken", function () {
    tabs.open('https://oauth.yandex.ru/authorize'
        + '?response_type=token'
        + '&client_id='
        + require('sdk/simple-prefs').prefs['hClientId']);
});
