function FileHandler() {
    this.dirEntry = undefined;
    this.checkDirectoryState = function () {
        var _this=this;

        chrome.storage.local.get('chosenFile', function (items) {
            if (items.chosenFile) {
                // if an entry was retained earlier, see if it can be restored
                chrome.fileSystem.isRestorable(items.chosenFile, function (bIsRestorable) {
                    // the entry is still there, load the content
                    console.info("Restoring " + items.chosenFile);
                    chrome.fileSystem.restoreEntry(items.chosenFile, function (chosenEntry) {
                        if (chosenEntry) {
                            this.dirEntry = chosenEntry;
                        } else {
                            _this.selectWorkingDir();
                        }
                    });
                });
            } else {
                this.selectWorkingDir();
            }
        });


    };


    this.selectWorkingDir = function () {
        //    prompt("workingdir not set. you must select directory before proceed");
        chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function (theEntry) {
            if (!theEntry) {
                console.log('No Directory selected.');
                this.checkDirectoryState();
                return;
            }
            // use local storage to retain access to this file
            chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(theEntry)});
        });
    };

    this.createFile = function (fileName, blobContent) {
        theEntry.getFile(fileName, {create: true}, function (fentry) {
            fentry.createWriter(function (writer) {
                writer.onerror = this.errorHandler;
                writer.onwriteend = function (e) {
                    console.log('write complete');
                };
                writer.write(blobContent);
            }, this.errorHandler);

        });
    };


    this.readFile = function (fileName) {
//TODO

    };
    this.errorHandler = function (err) {
        console.log("FileHandlerError:" + err);
    };
}