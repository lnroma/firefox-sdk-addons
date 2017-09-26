/**
 * Created by roman on 26.09.16.
 */
exports.uploadToYandex = uploadToYandex;
exports.getPublicScreens = getPublicScreens;

var tabs = require("sdk/tabs");

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

function getPublicScreens(callback) {
    var Request = require('sdk/request').Request;
    Request({
        url: "https://cloud-api.yandex.net/v1/disk/resources/public?",
        headers: getHeaders(),
        onComplete: function (response) {
            callback(response);
        }
    }).get();
}
