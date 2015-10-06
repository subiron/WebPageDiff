window.onload = function() {
    document.querySelector('#greeting').innerText =
        'Hello, World! It is ' + new Date();
};



$(document).ready(function() {

    $("#fullscreenbutton").bind("click", function() {
        console.log('going fullscrenn..');
        chrome.app.window.current().fullscreen();
    });

    $("#capturebutton").bind("click", function() {
   
        var webview=document.getElementById("webview");
        webview.captureVisibleRegion(null, 
          function(dataUrl) { 
            var image = new Image();
            image.src = dataUrl;
            document.body.appendChild(image);
        });

    });

});




var cats = {};

Leap.loop(function(frame) {

    frame.hands.forEach(function(hand, index) {

        var cat = (cats[index] || (cats[index] = new Cat()));
        cat.setTransform(hand.screenPosition(), hand.roll());

    });

}).use('screenPosition', {
    scale: 0.25
});


var Cat = function() {
    var cat = this;
    var img = document.createElement('img');
    img.src = 'meow.png';
    img.style.position = 'absolute';
    img.onload = function() {
        cat.setTransform([window.innerWidth / 2, window.innerHeight / 2], 0);
        document.body.appendChild(img);
    };

    cat.setTransform = function(position, rotation) {

        img.style.left = position[0] - img.width / 2 + 'px';
        img.style.top = position[1] - img.height / 2 + 'px';

        img.style.transform = 'rotate(' + -rotation + 'rad)';

        img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
            img.style.OTransform = img.style.transform;

    };

};

cats[0] = new Cat();

// This allows us to move the cat even whilst in an iFrame.
Leap.loopController.setBackground(true);