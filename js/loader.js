var TWB = window.TWB || {};

TWB.Resources = {};

TWB.RESOURCE_LIST = [
    { name: 'face_human', src: 'resources/face_human.png', tw: 48, ax: 0.5, ay: 0.5 },
    { name: 'face_dog', src: 'resources/face_dog.png', tw: 48, ax: 0.5, ay: 0.5 }
];

TWB._imageAnchors = {};

TWB.WindowViews = {};
TWB.WINDOW_VIEW_LIST = [
    'w-view-mountain-day-1',
    'w-view-mountain-day-2',
    'w-view-mountain-night-1',
    'w-view-river-1',
    'w-view-river-2'
];

TWB.loadResources = function(callback) {
    var total = TWB.RESOURCE_LIST.length + TWB.WINDOW_VIEW_LIST.length;
    var loaded = 0;

    if (total === 0) { callback(); return; }

    var done = function() { loaded++; if (loaded >= total) callback(); };

    TWB.RESOURCE_LIST.forEach(function(res) {
        var img = new Image();
        img.onload = function() {
            var scale = res.tw / img.width;
            var w = res.tw;
            var h = Math.round(img.height * scale);
            var c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            var ctx = c.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, w, h);
            TWB.Resources[res.name] = c;
            TWB._imageAnchors[res.name] = {
                x: Math.floor(w * res.ax),
                y: Math.floor(h * res.ay)
            };
            done();
        };
        img.onerror = done;
        img.src = res.src;
    });

    TWB.WINDOW_VIEW_LIST.forEach(function(name) {
        var img = new Image();
        img.onload = function() { TWB.WindowViews[name] = img; done(); };
        img.onerror = done;
        img.src = 'resources/' + name + '.png';
    });
};

window.TWB = TWB;
