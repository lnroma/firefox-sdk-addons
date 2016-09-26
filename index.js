var ui = require('sdk/ui');
var {ActionButton} = require('sdk/ui/button/action');
var {Toolbar} = require('sdk/ui/toolbar');
var {Sidebar} = require('sdk/ui/sidebar');

var tabs = require("sdk/tabs");

var myscreenshots = ui.ActionButton({
    id: "my-screens-button",
    label:"Show files",
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

var toolbar = ui.Toolbar({
    title: "Develop toolbar",
    items: [button,myscreenshots]
});

var sidebar = ui.Sidebar({
    id: 'my-video',
    title: 'My video',
    url: require("sdk/self").data.url("./html/sidebar.html")
});

var sidebarScreens = ui.Sidebar({
    id: 'my-screen',
    title: 'My screenshots',
    url: require("sdk/self").data.url("./html/screens.html")
})

// sidebarScreens
// sidebar.show();

function showScreens()
{
    sidebarScreens.show();
}

/**
 * click to button screenshot
 * @param state
 */
function makeScreen(state)
{
    var date = new Date();
    var fileScreen = date.getTime().toString() + '_screen.png';

    var args = ["-s", "/tmp/" + fileScreen];

    system(
        '/usr/bin/scrot',
        args
    );

    uploadToYandex(fileScreen);
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
 * header for request
 * @returns {{Authorization: string}}
 */
function getHeaders() {
    return {
        Authorization: "OAuth " + require('sdk/simple-prefs').prefs['oauthKey']
    };
}

/**
 * upload screenshot to yandex
 * @param name
 */
function uploadToYandex(name) {
    var Request = require('sdk/request').Request;
    const fileIO = require("sdk/io/file");
    var file = fileIO.open('/tmp/' + name, "b");

    Request({
        url: "https://cloud-api.yandex.net/v1/disk/resources/upload?path=" + name,
        headers: getHeaders(),
        onComplete: function (response) {
            var result = JSON.parse(response.text);
            if (result.method == "PUT") {
                putRequest(result.href, '/tmp/' + name);
                // publicate file
                publicateFile(name);
            }
        }
    }).get();
}

/**
 * publicate file on yandex disk
 * @param name
 */
function publicateFile(name) {
    var Request = require('sdk/request').Request;
    var result;
    Request({
        url: "https://cloud-api.yandex.net/v1/disk/resources/publish?path=" + name,
        headers: getHeaders(),
        onComplete: function (responsePublic) {
            result = JSON.parse(responsePublic.text);
            if (result.method == "GET") {
                Request({
                    url: result.href,
                    headers: getHeaders(),
                    onComplete: function (resp) {
                        result = JSON.parse(resp.text);
                        if (require('sdk/simple-prefs').prefs['autoCopy']) {
                            var clipboard = require("sdk/clipboard");
                            clipboard.set(result.public_url);
                        }
                        tabs.open(result.public_url);
                    }
                }).get();
            }
        }
    }).put();
}

/**
 * put request to yandex api
 * @param url
 * @param file
 */
function putRequest(url, file) {
    const {Cc, Ci} = require("chrome");
    // Make a stream from a file.
    var stream = Cc["@mozilla.org/network/file-input-stream;1"]
        .createInstance(Ci.nsIFileInputStream);

    var fileIo = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    fileIo.initWithPath(file);

    stream.init(fileIo, 0x04 | 0x08, 0644, 0x04); // file is an nsIFile instance

    var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Ci.nsIXMLHttpRequest);

    req.open('PUT', url, false);
    req.setRequestHeader('Content-Type', "application/binary");
    req.send(stream);
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
