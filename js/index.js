onload = function () {
    var fh = new FileHandler();
    var port = document.getElementById("port");
    var startJob = document.getElementById("startJob");
    var debyg = document.getElementById("debug");
    var capture = document.getElementById("capture");
    var img = document.getElementById("img");
    var logger = document.getElementById("logger");

    fh.checkDirectoryState();

    var startWork = function () {
        var taskManager = new TaskManager();
    };

    startJob.onclick = function () {
        startWork();
    };

    debug.onclick = function () {
        getScreenshot();
    };
};