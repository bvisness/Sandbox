var keyUtil = {};

keyUtil.shift = false;
keyUtil.ctrl = false;
keyUtil.cmd = false;

document.addEventListener('keydown', function(e) {
    var key = e.keyCode;
    switch (key) {
        case 16: {
            keyUtil.shift = true;
            break;
        }
        case 17: {
            keyUtil.ctrl = true;
            break;
        }
        case 91: {
            keyUtil.cmd = true;
            break;
        }
    }
}, false);

document.addEventListener('keyup', function(e) {
    var key = e.keyCode;
    switch (key) {
        case 16: {
            keyUtil.shift = false;
            break;
        }
        case 17: {
            keyUtil.ctrl = false;
            break;
        }
        case 91: {
            keyUtil.cmd = false;
            break;
        }
    }
}, false);
