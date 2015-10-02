onload = function() {
    var port = document.getElementById("port");
    var restart = document.getElementById("restart");
    var logger = document.getElementById("logger");
    var tcpServer = chrome.sockets.tcpServer;
    var tcpSocket = chrome.sockets.tcp;
    var serverSocketId = null;

    var destroySocketById = function(socketId) {
        tcpSocket.disconnect(socketId, function() {
            tcpSocket.close(socketId);
        });
    };

    var closeServerSocket = function() {
        if (serverSocketId) {
            tcpServer.close(serverSocketId, function() {
                if (chrome.runtime.lastError) {
                    console.warn("chrome.sockets.tcpServer.close:", chrome.runtime.lastError);
                }
            });
        }

        tcpServer.onAccept.removeListener(onAccept);
        tcpSocket.onReceive.removeListener(onReceive);
    };

    var sendReplyToSocket = function(socketId, buffer, keepAlive) {
        // verify that socket is still connected before trying to send data
        tcpSocket.getInfo(socketId, function(socketInfo) {
            if (!socketInfo.connected) {
                destroySocketById(socketId);
                return;
            }

            tcpSocket.setKeepAlive(socketId, keepAlive, 1, function() {
                if (!chrome.runtime.lastError) {
                    tcpSocket.send(socketId, buffer, function(writeInfo) {
                        console.log("WRITE", writeInfo);

                        if (!keepAlive || chrome.runtime.lastError) {
                            destroySocketById(socketId);
                        }
                    });
                } else {
                    console.warn("chrome.sockets.tcp.setKeepAlive:", chrome.runtime.lastError);
                    destroySocketById(socketId);
                }
            });
        });
    };

    var getSimpleResponseHeader = function(_contentType, errorCode, keepAlive, contentLength) {
        var httpStatus = "HTTP/1.0 200 OK";
        var contentType = "text/plain";
        if (_contentType) {
            contentType = _contentType;
        }

        if (errorCode) {
            httpStatus = "HTTP/1.0 " + (errorCode || 404);
        }
        var lines = [
            httpStatus,
            "Content-length: " + contentLength,
            "Content-type:" + contentType
        ];

        if (keepAlive) {
            lines.push("Connection: keep-alive");
        }

        return stringToUint8Array(lines.join("\n") + "\n\n");
    };

    var onAccept = function(acceptInfo) {
        tcpSocket.setPaused(acceptInfo.clientSocketId, false);

        if (acceptInfo.socketId != serverSocketId)
            return;

        console.log("ACCEPT", acceptInfo);
    };

    var onReceive = function(receiveInfo) {
        console.log("READ", receiveInfo);
        var socketId = receiveInfo.socketId;
        var data = arrayBufferToString(receiveInfo.data);

        if (data.indexOf("POST ") === 0) {
            processPost(data, socketId);
            return;
        }

        if (data.indexOf("GET ") === 0) {
            //TODO
            return;
        }

        destroySocketById(socketId);
    };

    var processPost = function(data, socketId) {
        var keepAlive = false;
        var text = data;
        try {
            text = data.substring(data.indexOf("<--json") + 7, data.indexOf("--json>"));
        } catch (e) {
            //do nothing for now
        }
        var u8at = stringToUint8Array(text);
        var header = getSimpleResponseHeader(null, null, true, u8at.byteLength);
        var outputBuffer = new ArrayBuffer(header.byteLength + u8at.byteLength);
        var view = new Uint8Array(outputBuffer);
        view.set(header, 0);
        view.set(u8at, header.byteLength);
        sendReplyToSocket(socketId, outputBuffer, keepAlive);
    };

    var startserver = function() {
        tcpServer.create({}, function(socketInfo) {
            serverSocketId = socketInfo.socketId;
            tcpServer.listen(serverSocketId, "127.0.0.1", parseInt(port.value, 10), 50, function(result) {
                console.log("LISTENING:", result);
                tcpServer.onAccept.addListener(onAccept);
                tcpSocket.onReceive.addListener(onReceive);
            });
        });
    };

    var stringToUint8Array = function(string) {
        var buffer = new ArrayBuffer(string.length);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < string.length; i++) {
            view[i] = string.charCodeAt(i);
        }
        return view;
    };

    var arrayBufferToString = function(buffer) {
        var str = '';
        var uArrayVal = new Uint8Array(buffer);
        for (var s = 0; s < uArrayVal.length; s++) {
            str += String.fromCharCode(uArrayVal[s]);
        }
        return str;
    };

    var logToScreen = function(log) {
        logger.textContent += log + "\n";
        logger.scrollTop = logger.scrollHeight;
    };

    restart.onclick = function() {
        closeServerSocket();
        startserver();
    };

    startserver();
};