var TWB = window.TWB || {};

TWB.Resources = {};

TWB.RESOURCE_LIST = [
    { name: 'face_human', src: 'resources/face_human.png', tw: 48, ax: 0.5, ay: 0.5 },
    { name: 'face_dog', src: 'resources/face_dog.png', tw: 48, ax: 0.5, ay: 0.5 },
    { name: 'spr_cabin', src: 'resources/canteen/canteen-house_1.png', tw: 96, ax: 0.5, ay: 0.85 },
    { name: 'spr_bed', src: 'resources/canteen/canteen-bed-1.png', tw: 40, ax: 0.5, ay: 0.5 },
    { name: 'spr_door', src: 'resources/canteen/canteen-door-1.png', tw: 24, ax: 0.5, ay: 0.5 },
    { name: 'spr_table', src: 'resources/canteen/canteen-table-1.png', tw: 32, ax: 0.5, ay: 0.5 },
    { name: 'spr_cabinet', src: 'resources/canteen/canteen-savespace-1.png', tw: 28, ax: 0.5, ay: 0.5 }
];

TWB.HudIcons = {};
TWB.HUD_ICON_LIST = [
    { name: 'backpack', src: 'resources/icons/icon-backpack.png' },
    { name: 'map', src: 'resources/icons/icon-map.png' },
    { name: 'craft', src: 'resources/icons/icon-craft.png' },
    { name: 'light', src: 'resources/icons/icon-light.png' },
    { name: 'settings', src: 'resources/icons/settings.png' }
];

TWB._imageAnchors = {};

TWB.WindowViews = {};
TWB.WINDOW_VIEW_LIST = [
    'w-view-mountain-day-1',
    'w-view-mountain-day-2',
    'w-view-mountain-day-3',
    'w-view-mountain-day-4',
    'w-view-mountain-night-1',
    'w-view-mountain-night-3',
    'w-view-mountain-night-4',
    'w-view-river-1',
    'w-view-river-2'
];

TWB.AudioBuffers = {};
TWB.AUDIO_LIST = [
    { name: 'rain_loop', src: 'resources/sound-efx/rain_loop.wav' },
    { name: 'wind_loop', src: 'resources/sound-efx/wind_loop.wav' },
    { name: 'chop_stick', src: 'resources/sound-efx/chop-stick.wav' },
    { name: 'door_knock', src: 'resources/sound-efx/door-knock.wav' },
    { name: 'door_opening', src: 'resources/sound-efx/door-opening.wav' },
    { name: 'footstep', src: 'resources/sound-efx/footstep.wav' },
    { name: 'backpack_open', src: 'resources/sound-efx/backpack-open.wav' },
    { name: 'backpack_close', src: 'resources/sound-efx/backpack-close.wav' },
    { name: 'clicker', src: 'resources/sound-efx/clicker.wav' },
    { name: 'craft', src: 'resources/sound-efx/craft.wav' },
    { name: 'dog_bark', src: 'resources/sound-efx/dog-bark.wav' },
    { name: 'drink', src: 'resources/sound-efx/drink.wav' },
    { name: 'eat', src: 'resources/sound-efx/eat.wav' },
    { name: 'fire', src: 'resources/sound-efx/fire.wav' },
    { name: 'flashlight', src: 'resources/sound-efx/flashlight.wav' },
    { name: 'item_pickup', src: 'resources/sound-efx/item-pickup.wav' },
    { name: 'map_open_close', src: 'resources/sound-efx/map-open-close.wav' },
    { name: 'notification', src: 'resources/sound-efx/notification.wav' }
];

TWB.CutsceneImages = {};
TWB.CUTSCENE_LIST = [
    'shep-man-cut-scene-day-1',
    'shep-man-cut-scene-day-2',
    'shep-man-cut-scene-night-1',
    'shep-man-cut-scene-night-2',
    'cut-scene-shadows-night-1',
    'cut-scene-shadows-night-2',
    'cut-scene-shadows-night-3',
    'cut-scene-shadows-night-4',
    'cut-scene-door-knock-1',
    'cut-scene-door-knock-2',
    'cut-scene-win-radio-1',
    'cut-scene-win-hiker-1',
    'cut-scene-win-curse-1',
    'cute-scene-fate-1',
    'cut-scene-night-1',
    'cut-scene-night-2'
];

TWB.MapSprites = {};
TWB.MAP_SPRITE_LIST = [
    'pine_tree', 'deciduous_tree', 'dead_tree', 'cabin', 'relay_station', 'windmill',
    'boulder_cluster', 'bush', 'berry_bush', 'herb_flower', 'mushroom', 'cairn',
    'lake', 'well', 'bridge', 'broken_bridge', 'stepping_stones', 'shrine_cross', 'campfire',
    'player_marker', 'dog_marker', 'compass_rose', 'x_marker', 'question_marker',
    'checkmark', 'backpack', 'grass_tuft_1', 'grass_tuft_2', 'grass_tuft_3',
    'mountain_silhouette', 'trail_segment'
];

TWB.loadResources = function(callback) {
    var visualTotal = TWB.RESOURCE_LIST.length + TWB.WINDOW_VIEW_LIST.length + TWB.CUTSCENE_LIST.length + TWB.HUD_ICON_LIST.length + TWB.MAP_SPRITE_LIST.length;
    var visualLoaded = 0;

    if (visualTotal === 0) { callback(); return; }

    var visualDone = function() { visualLoaded++; if (visualLoaded >= visualTotal) callback(); };

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
            visualDone();
        };
        img.onerror = visualDone;
        img.src = res.src;
    });

    TWB.WINDOW_VIEW_LIST.forEach(function(name) {
        var img = new Image();
        img.onload = function() { TWB.WindowViews[name] = img; visualDone(); };
        img.onerror = visualDone;
        img.src = 'resources/' + name + '.png';
    });

    TWB.CUTSCENE_LIST.forEach(function(name) {
        var img = new Image();
        img.onload = function() { TWB.CutsceneImages[name] = img; visualDone(); };
        img.onerror = visualDone;
        img.src = 'resources/' + name + '.png';
    });

    TWB.HUD_ICON_LIST.forEach(function(icon) {
        var img = new Image();
        img.onload = function() { TWB.HudIcons[icon.name] = img; visualDone(); };
        img.onerror = visualDone;
        img.src = icon.src;
    });

    TWB.MAP_SPRITE_LIST.forEach(function(name) {
        var img = new Image();
        img.onload = function() { TWB.MapSprites[name] = img; visualDone(); };
        img.onerror = visualDone;
        img.src = 'resources/map-assets/' + name + '.png';
    });

    var audioIdx = 0;
    function loadNextAudio() {
        if (audioIdx >= TWB.AUDIO_LIST.length) return;
        var snd = TWB.AUDIO_LIST[audioIdx];
        audioIdx++;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', snd.src, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (xhr.status === 200) {
                TWB.AudioBuffers[snd.name] = xhr.response;
                var ctx = TWB.Audio.ctx;
                if (ctx) {
                    ctx.decodeAudioData(xhr.response.slice(0), function(decoded) {
                        TWB.AudioBuffers[snd.name + '_decoded'] = decoded;
                        loadNextAudio();
                    }, function() { loadNextAudio(); });
                } else {
                    loadNextAudio();
                }
            } else {
                loadNextAudio();
            }
        };
        xhr.onerror = function() { loadNextAudio(); };
        xhr.send();
    }
    loadNextAudio();
};

window.TWB = TWB;
