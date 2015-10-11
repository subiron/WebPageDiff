function DebuggerSession(_observer) {
    var _this = this;
    this.observer = _observer;

    this.tabUrlId = undefined;
    this.events = [];
    this.ws = undefined;

    var msgId = 1;
    this.clearAll = function () {
    };


    this.isAlive = function () {
    };

    this.close = function () {

    };

    this.connect = function (_host, _port) {
        var host = typeof _host !== 'undefined' ? _host : "localhost";
        var port = typeof _port !== 'undefined' ? _port : "9222";
        $.get("http://" + host + ":" + port + "/json/new", newTabCreatedHandler).fail(function () {
            console.log("Unable to connect  to chrome debugger check host and port");
        });
    };

    this.navigateTo = function (url) {
        msgId++;
        this.ws.send('{"id":' + msgId + ', "method":"Page.navigate","params":{"url":"' + url + '"}}');
    };

    this.waitForPageLoad = function () {

    };

    this.captureScreen = function () {
        msgId++;
        this.ws.send('{"id":' + msgId + ', "method":"Page.captureScreenshot","params":{}}');
    }


    var onOpen = function () {
        console.log('OPENED: ');
        _observer.notify("ready");
    };

    var onClose = function () {
        console.log('CLOSED: ' + serverUrl.val());
        this.ws = null;
    };


    this.do = function (method, params, callback) {
        var id = this.msgId++;
        if (typeof params === 'function') {
            callback = params;
            params = undefined;
        }

        var message = {'id': id, 'method': method, 'params': params};
        this.ws.send(JSON.stringify(message));
        // register a command response callback or use a dummy callback to ensure
        // that the 'ready' event is correctly fired
        if (typeof callback === 'undefined') {
            callback = this.defaultCallback;
        }
        this.callbacks[id] = callback;
    };

    this.defaultCallback = function () {
    };

    var onMessage = function (event) {
        var data = event.data;
        var message = JSON.parse(data);
        // command response
        if (message.id) {
            var callback = this.callbacks[message.id];
            if (callback) {
                if (message.result) {
                    callback(false, message.result);
                } else if (message.error) {
                    callback(true, message.error);
                }
                // unregister command response callback
                delete this.callbacks[message.id];
                // notify when there are no more pending commands
                if (Object.keys(this.callbacks).length === 0) {
                    // TODO: REUSE
                    _observer.nextStep();
//                    self.emit('ready');
                }
            }
        }
        // event
        else if (message.method) {
            events.push(message);
        }
    };


    var onError = function (event) {
        console.log("error");
        console.log(event.data);

    };

    var newTabCreatedHandler = function (data) {

        _this.tabUrlId = data["webSocketDebuggerUrl"];
        _this.ws = new WebSocket(_this.tabUrlId);
        _this.ws.onopen = onOpen;
        _this.ws.onclose = onClose;
        _this.ws.onmessage = onMessage;
        _this.ws.onerror = onError;
    };
}