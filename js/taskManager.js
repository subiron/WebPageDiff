function TaskManager() {
    //var job = new Job();
    //job.steps.push("screen");
    //job.urls.push("http://onet.pl");
    //job.urls.push("http://wykop.pl");

    var worker = new DebuggerSession(this);

    this.steps = [
        {operation: "navigate", params: {url: "http://wykop.pl"}},
        {operation: "screengrab", params: {}, result: this.saveFile},
    ];


    this.currentStep = 0;

    this.nextStep = function () {
        worker.navigateTo("http://wykop.pl");
    };

    this.notify = function (status) {
        switch (status) {
            case "ready":
                this.nextStep();
                break;
            case "finish":
                this.finish();
                break;
            default:
                this.nextStep();
        }
    };


    this.finish = function () {
        console.log("job done");

    };

    worker.connect();
}