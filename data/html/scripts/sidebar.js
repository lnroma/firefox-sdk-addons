addon.port.emit("ping");

addon.port.on("pong", function(data) {
    var list = document.getElementById('screens');
    list.innerHTML = data;
});

