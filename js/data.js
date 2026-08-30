var TWB = window.TWB || {};

TWB.TILE = 32;
TWB.COLS = 500;
TWB.ROWS = 500;
TWB.WORLD_W = TWB.COLS * TWB.TILE;
TWB.WORLD_H = TWB.ROWS * TWB.TILE;
TWB.PLAYER_SPEED = 1.6;
TWB.WOLF_SPEED = 1.9;
TWB.WOLF_FOLLOW_DIST = 48;
TWB.PX = 2;

TWB.NOTIFY_SHORT = 180;
TWB.NOTIFY_TIME = 240;
TWB.NOTIFY_LONG = 360;
TWB.NOTIFY_XLNG = 600;

TWB.FONT_XS = '8px "Press Start 2P", monospace';
TWB.FONT_SM = '10px "Press Start 2P", monospace';
TWB.FONT_MD = '12px "Press Start 2P", monospace';
TWB.FONT_LG = '16px "Press Start 2P", monospace';
TWB.FONT_XL = '24px "Press Start 2P", monospace';

TWB.MSG_FULL = 'Backpack is full!';
TWB.MSG_TIRED = 'Too tired...';

TWB.PLAYER_COMMENTS = [
    'Getting colder... need to find shelter soon.',
    'This fog is thick. Can barely see ahead.',
    'The wind cuts right through me.',
    'At least the rain stopped.',
    'Stars are out tonight. Beautiful, if I wasn\'t freezing.',
    'The shadows move differently here.',
    'These mountains feel like they go on forever.',
    'The trees are so dense here. Easy to get lost.',
    'My legs are getting heavy.',
    'Stomach\'s growling. Need to eat something.',
    'Can\'t remember the last time I slept properly.',
    'Just keep moving. One step at a time.',
    'I don\'t know how much longer I can go.',
    'Water... I need water.',
    'Hands are shaking. From cold or hunger, I can\'t tell.',
    'There has to be a way out of here.',
    'Smoke on the horizon. A cabin maybe?',
    'If I can reach the river, I can find the way.',
    'We\'ll make it home. We have to.',
    'Something doesn\'t feel right about this place.',
    'Quiet. Too quiet.'
];

TWB.DOG_COMMENTS = [
    'stay close out here.',
    'you sense it too, don\'t you?',
    'we\'ll get through this.',
    'what are you sniffing at?',
    'I\'d be lost without you.'
];

TWB.SHEPHERD_COMMENTS = [
    'What... what is that?',
    'He\'s just standing there. Watching.',
    'The old men weren\'t lying. He\'s real.',
    'I can\'t move. I can\'t look away.',
    'He\'s taller than any man I\'ve ever seen.',
    'Is he... protecting us?',
    'Those eyes. I\'ve seen them in my dreams.',
    'He doesn\'t move like something alive.'
];

TWB.SHADOW_COMMENTS = [
    'What is that in the dark?',
    'Something\'s out there. I can feel it.',
    'The shadows... they\'re moving.',
    'That\'s not the wind. Something\'s watching us.',
    'I\'ve never seen darkness move like that.',
    'They\'re getting closer.',
    'Stay close. Don\'t look at them.',
    'The air just went cold. Ice cold.',
    'I can hear them. Like whispers.',
    'They don\'t have faces. Why don\'t they have faces?'
];

TWB.DOOR_KNOCK_COMMENTS = [
    'Could be someone who needs help... or something that wants in.',
    'Who would be out here at this hour?',
    'The knocking won\'t stop. I have to decide.',
    'Every instinct says don\'t open it.',
    'What if it\'s someone like me? Lost and cold.',
    'That knock doesn\'t sound... human.',
    'If I ignore it, can I live with that?',
    'Last time I trusted a stranger, it didn\'t end well.',
    'The dog is growling. That\'s never a good sign.',
    'Open the door and hope for the best?'
];

TWB.TUTORIAL_STEPS = [
    { id: 'welcome', prompt: '', check: 'acknowledged', lines: [
        'THE WAY BACK',
        '',
        'You are stranded in the wilderness with your dog.',
        'Your only guide is a hand-drawn map - no GPS, no markers.',
        'Find the target cabin to complete your quest.',
        '',
        'Three difficulty levels await:',
        'Hikers - Mountaineers - The Mists',
        'Each brings harsher weather, scarcer supplies,',
        'and darker nights.',
        '',
        'Click anywhere to begin.'
    ]},
    { id: 'intro', prompt: 'You are lost in the wilderness. Press M to open your map.', check: 'openedMap' },
    { id: 'mapClose', prompt: 'This is your only guide. No GPS. Find the marked cabin. Press M to close.', check: 'closedMap' },
    { id: 'move', prompt: 'Click on the ground to move.', check: 'moved' },
    { id: 'chop', prompt: 'Click the glowing tree to chop wood.', check: 'hasWood' },
    { id: 'gather', prompt: 'Click a tree again and choose Gather Sticks.', check: 'hasSticks' },
    { id: 'berries', prompt: 'Click the berry bush to pick berries.', check: 'hasBerries' },
    { id: 'backpack', prompt: 'Press TAB to check your backpack.', check: 'openedBackpack' },
    { id: 'closeBackpack', prompt: 'Press TAB again to close it.', check: 'closedBackpack' },
    { id: 'craft', prompt: 'Press C to open crafting. Craft a Torch for the night.', check: 'craftedTorch' },
    { id: 'cabin', prompt: 'Click the cabin to go inside.', check: 'enteredCabin' },
    { id: 'search', prompt: 'Search the cabinet - find a lighter and supplies.', check: 'searched' },
    { id: 'fireplace', prompt: 'Click the fireplace and add wood to light a fire.', check: 'litFire' },
    { id: 'sleep', prompt: 'Click the bed to rest.', check: 'slept' },
    { id: 'exit', prompt: 'Go outside. Night brings shadows - stay near fire or light.', check: 'exited' },
    { id: 'done', prompt: 'Survive. Navigate. Find your way back.', check: 'complete' }
];

TWB.CLR_GOLD = '#d4a44a';
TWB.CLR_GOLD_DARK = '#c08820';
TWB.CLR_GOLD_LIGHT = '#ffe080';
TWB.CLR_GOLD_DIM = '#c09030';
TWB.CLR_GOLD_SHADOW = '#5a4020';

TWB.CLR_RED = '#c04040';
TWB.CLR_RED_BRIGHT = '#d04040';
TWB.CLR_RED_LIGHT = '#e06060';
TWB.CLR_RED_DARK = '#a03030';
TWB.CLR_RED_MED = '#a04040';
TWB.CLR_RED_DEEP = '#b83030';
TWB.CLR_RED_BG = '#802020';
TWB.CLR_RED_BG_DARK = '#3a2020';
TWB.CLR_RED_BG_DEEP = '#4a1010';
TWB.CLR_RED_BG_BLACK = '#1a1018';

TWB.CLR_GREEN = '#40c060';
TWB.CLR_GREEN_LIGHT = '#60e080';
TWB.CLR_GREEN_MED = '#20a040';
TWB.CLR_GREEN_PALE = '#80c080';
TWB.CLR_GREEN_MUTED = '#60a060';
TWB.CLR_GREEN_DARK = '#1a4a24';
TWB.CLR_GREEN_BG = '#103a18';
TWB.CLR_GREEN_BG_DARK = '#0a3a18';
TWB.CLR_GREEN_FOREST = '#3a6830';
TWB.CLR_GREEN_FOREST_DARK = '#2d5428';

TWB.CLR_BLUE = '#4090c0';
TWB.CLR_BLUE_LIGHT = '#60b0e0';
TWB.CLR_BLUE_DARK = '#4060a0';
TWB.CLR_BLUE_MED = '#2080c0';
TWB.CLR_BLUE_BG = '#203848';
TWB.CLR_BLUE_BG_DARK = '#18283a';
TWB.CLR_BLUE_BG_DEEP = '#0a2a3a';

TWB.CLR_PURPLE = '#6a4a90';
TWB.CLR_PURPLE_DARK = '#5a3a80';
TWB.CLR_PURPLE_BG = '#2a1a40';
TWB.CLR_PURPLE_BG_DARK = '#0a0010';

TWB.CLR_PANEL = '#1a120c';
TWB.CLR_PANEL_DARK = '#0e0a06';
TWB.CLR_BORDER = '#3a3a4a';
TWB.CLR_BORDER_DARK = '#2a2a3a';

TWB.CLR_TEXT = '#d4a44a';
TWB.CLR_TEXT_DIM = '#888';
TWB.CLR_TEXT_MUTED = '#8a9098';
TWB.CLR_TEXT_GRAY = '#606068';
TWB.CLR_TEXT_LIGHT = '#a0a0a8';
TWB.CLR_TEXT_HOVER = '#8a8a9a';
TWB.CLR_TEXT_ICON = '#6a6a7a';
TWB.CLR_TEXT_WHITE = '#fff';
TWB.CLR_TEXT_DARK = '#555';

TWB.CLR_BG_DARK = '#0e0e0c';
TWB.CLR_BROWN = '#8a7050';
TWB.CLR_BROWN_DARK = '#8a7040';
TWB.CLR_BROWN_WARM = '#a06030';
TWB.CLR_BROWN_DEEP = '#6a5030';
TWB.CLR_BROWN_MED = '#6a5a40';
TWB.CLR_BROWN_PANEL = '#2e2018';
TWB.CLR_BROWN_PANEL_DARK = '#241a12';
TWB.CLR_BAR_GOLD_BG = '#3a2a08';
TWB.CLR_BAR_FIRE_BG = '#1a0a04';

TWB.CURSOR_DEFAULT = "url('resources/icons/mouse.png'), auto";
TWB.CURSOR_POINTER = "url('resources/icons/hover-action.png'), pointer";

TWB.T_GRASS1 = 0;
TWB.T_GRASS2 = 1;
TWB.T_GRASS3 = 2;
TWB.T_DIRT = 3;
TWB.T_WATER = 4;
TWB.T_WATER_DEEP = 5;
TWB.T_SHORE = 6;
TWB.T_FLOOR = 7;
TWB.T_WALL = 8;
TWB.T_SNOW1 = 9;
TWB.T_SNOW2 = 10;
TWB.T_SNOW_DIRT = 11;

TWB.INTERIOR_COLS = 8;
TWB.INTERIOR_ROWS = 6;

TWB.indoors = false;

TWB.getInteriorGround = function(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= TWB.INTERIOR_COLS || ty >= TWB.INTERIOR_ROWS) return TWB.T_WALL;
    return TWB.T_FLOOR;
};

TWB.mapSeed = Math.floor(Math.random() * 100000);

TWB.hash = function(x, y) {
    var s = TWB.mapSeed;
    var h = ((x + s) * 374761393 + (y + s) * 668265263) | 0;
    h = ((h ^ (h >> 13)) * 1274126177) | 0;
    return (h & 0x7FFFFFFF);
};

// === RANDOMIZED WORLD GENERATION ===

TWB._riverParams = null;
TWB._tributaries = [];
TWB._cabinData = [];
TWB._lakeData = [];
TWB._startCabin = 0;
TWB._targetCabin = -1;
TWB._scenario = 'RESCUE';
TWB._scenarioData = {};

TWB.initRivers = function() {
    var h1 = TWB.hash(1000, 1000);
    var h2 = TWB.hash(2000, 2000);
    var h3 = TWB.hash(3000, 3000);
    var h4 = TWB.hash(4000, 4000);
    var h5 = TWB.hash(5000, 5000);
    var h6 = TWB.hash(6000, 6000);
    var h7 = TWB.hash(7000, 7000);
    var h8 = TWB.hash(8000, 8000);
    var h9 = TWB.hash(9000, 9000);

    var mapScale = TWB.COLS / 500;
    var r1base = Math.round((200 + (h1 % 200)) * mapScale);
    var r1amp1 = Math.round((20 + (h2 % 20)) * mapScale);
    var r1freq1 = (0.02 + (h3 % 10) * 0.003) / mapScale;
    var r1amp2 = Math.round((8 + (h4 % 12)) * mapScale);
    var r1freq2 = (0.06 + (h5 % 8) * 0.01) / mapScale;

    var r2base;
    if (r1base > 300 * mapScale) {
        r2base = Math.round((60 + (h6 % 140)) * mapScale);
    } else {
        r2base = Math.round((320 + (h6 % 120)) * mapScale);
    }
    var r2amp1 = Math.round((15 + (h7 % 15)) * mapScale);
    var r2freq1 = (0.025 + (h8 % 8) * 0.003) / mapScale;
    var r2startY = Math.round((40 + (h9 % 90)) * mapScale);
    var r2endY = Math.round((350 + (TWB.hash(10000, 10000) % 110)) * mapScale);

    TWB._riverParams = {
        r1base: r1base, r1amp1: r1amp1, r1freq1: r1freq1,
        r1amp2: r1amp2, r1freq2: r1freq2,
        r2base: r2base, r2amp1: r2amp1, r2freq1: r2freq1,
        r2startY: r2startY, r2endY: r2endY
    };
};

TWB.getRiverCenter = function(ty) {
    var r = TWB._riverParams;
    if (!r) return 250;
    var val = r.r1base + Math.round(
        Math.sin(ty * r.r1freq1) * r.r1amp1 +
        Math.sin(ty * r.r1freq2) * r.r1amp2 +
        Math.cos(ty * 0.02) * 10
    );
    return Math.max(15, Math.min(TWB.COLS - 15, val));
};

TWB.getSecondRiver = function(ty) {
    var r = TWB._riverParams;
    if (!r) return 150;
    var val = r.r2base + Math.round(
        Math.sin(ty * r.r2freq1 + 2) * r.r2amp1 +
        Math.cos(ty * 0.07) * 8
    );
    return Math.max(15, Math.min(TWB.COLS - 15, val));
};

TWB.generateTributaries = function() {
    TWB._tributaries = [];
    var numTrib = 3 + (TWB.hash(500, 500) % 4);
    var r = TWB._riverParams;

    for (var i = 0; i < numTrib; i++) {
        var h1 = TWB.hash(i * 23 + 100, 5000);
        var h2 = TWB.hash(i * 29 + 100, 5100);
        var h3 = TWB.hash(i * 31 + 100, 5200);
        var h4 = TWB.hash(i * 37 + 100, 5300);
        var h5 = TWB.hash(i * 41 + 100, 5400);
        var h6 = TWB.hash(i * 43 + 100, 5500);

        var fromMain = ((h1 >>> 4) % 2 === 0);
        var ry;
        if (fromMain || r.r2endY - r.r2startY < 60) {
            fromMain = true;
            ry = 30 + ((h2 >>> 4) % (TWB.ROWS - 60));
        } else {
            ry = r.r2startY + 20 + ((h2 >>> 4) % Math.max(1, r.r2endY - r.r2startY - 40));
        }

        var rx = fromMain ? TWB.getRiverCenter(ry) : TWB.getSecondRiver(ry);
        var dir = ((h3 >>> 4) % 2 === 0) ? -1 : 1;
        var length = 20 + ((h4 >>> 4) % 50);
        var curve = 0.05 + ((h5 >>> 4) % 10) * 0.01;
        var slope = ((h6 >>> 4) % 40 - 20) * 0.01;

        TWB._tributaries.push({
            rx: rx, ry: ry, dir: dir, length: length, curve: curve, slope: slope
        });
    }
};

TWB.isOnTributary = function(tx, ty) {
    for (var i = 0; i < TWB._tributaries.length; i++) {
        var t = TWB._tributaries[i];
        var d = (tx - t.rx) * t.dir;
        if (d < 1 || d > t.length) continue;
        var expectedY = t.ry + Math.round(Math.sin(d * t.curve) * 4 + d * t.slope);
        if (ty === expectedY) return true;
    }
    return false;
};

TWB.generateLakes = function() {
    TWB._lakeData = [];
    var lakeScale = Math.round((TWB.COLS * TWB.ROWS) / (500 * 500));
    var numLakes = (5 + (TWB.hash(11000, 11000) % 4)) * lakeScale;
    for (var i = 0; i < numLakes; i++) {
        var h1 = TWB.hash(i * 47 + 200, 12000);
        var h2 = TWB.hash(12000, i * 47 + 200);
        var cx = 35 + ((h1 >>> 4) % (TWB.COLS - 70));
        var cy = 35 + ((h2 >>> 4) % (TWB.ROWS - 70));
        var rc = TWB.getRiverCenter(cy);
        if (Math.abs(cx - rc) < 18) continue;
        var r = TWB._riverParams;
        if (r && cy > r.r2startY && cy < r.r2endY) {
            var rc2 = TWB.getSecondRiver(cy);
            if (Math.abs(cx - rc2) < 18) continue;
        }
        var skip = false;
        for (var j = 0; j < TWB._cabinData.length; j++) {
            var c = TWB._cabinData[j];
            if (Math.abs(cx - c.cx) < 16 && Math.abs(cy - c.cy) < 16) { skip = true; break; }
        }
        if (skip) continue;
        for (var j = 0; j < TWB._lakeData.length; j++) {
            var l = TWB._lakeData[j];
            if (Math.abs(cx - l.cx) < 28 && Math.abs(cy - l.cy) < 28) { skip = true; break; }
        }
        if (skip) continue;
        var h3 = TWB.hash(i * 53 + 300, 12100);
        var h4 = TWB.hash(12100, i * 53 + 300);
        var rx = 4 + (h3 % 5);
        var ry = 3 + (h4 % 4);
        var rot = (TWB.hash(i * 59, 12200) % 628) / 100.0;
        TWB._lakeData.push({ cx: cx, cy: cy, rx: rx, ry: ry, rot: rot });
    }
};

TWB.isOnLake = function(tx, ty) {
    for (var i = 0; i < TWB._lakeData.length; i++) {
        var l = TWB._lakeData[i];
        var dx = tx - l.cx;
        var dy = ty - l.cy;
        var cos = Math.cos(l.rot);
        var sin = Math.sin(l.rot);
        var rdx = dx * cos + dy * sin;
        var rdy = -dx * sin + dy * cos;
        var dist = (rdx * rdx) / (l.rx * l.rx) + (rdy * rdy) / (l.ry * l.ry);
        var noise = (TWB.hash(tx * 7 + i * 100, ty * 7) % 100) / 250.0;
        if (dist < 0.6 + noise) {
            if (dist < 0.35) return TWB.T_WATER_DEEP;
            return TWB.T_WATER;
        }
        if (dist < 1.0 + noise * 0.6) return TWB.T_SHORE;
    }
    return 0;
};

TWB.getGround = function(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= TWB.COLS || ty >= TWB.ROWS) return TWB.T_GRASS1;

    if (TWB._isTutorial) {
        for (var ci = 0; ci < TWB._cabinData.length; ci++) {
            var c = TWB._cabinData[ci];
            if (tx >= c.cx - 5 && tx <= c.cx + 5 && ty >= c.cy - 4 && ty <= c.cy + 4) return TWB.T_DIRT;
            if (tx >= c.cx - 2 && tx <= c.cx + 2 && ty >= c.cy + 4 && ty <= c.cy + 10) return TWB.T_DIRT;
        }
        var h = TWB.hash(tx, ty) % 100;
        if (h < 55) return TWB.T_GRASS1;
        if (h < 82) return TWB.T_GRASS2;
        return TWB.T_GRASS3;
    }

    var rc = TWB.getRiverCenter(ty);
    if (tx >= rc - 1 && tx <= rc + 1) {
        if (tx === rc) return TWB.T_WATER;
        return TWB.T_SHORE;
    }

    var r = TWB._riverParams;
    if (r && ty > r.r2startY && ty < r.r2endY) {
        var rc2 = TWB.getSecondRiver(ty);
        if (tx === rc2) return TWB.T_WATER;
        if (tx === rc2 - 1 || tx === rc2 + 1) return TWB.T_SHORE;
    }

    if (TWB._tributaries.length > 0 && TWB.isOnTributary(tx, ty)) return TWB.T_WATER;

    if (TWB._lakeData.length > 0) {
        var lakeT = TWB.isOnLake(tx, ty);
        if (lakeT) return lakeT;
    }

    for (var i = 0; i < TWB._cabinData.length; i++) {
        var c = TWB._cabinData[i];
        if (tx >= c.cx - 5 && tx <= c.cx + 5 && ty >= c.cy - 4 && ty <= c.cy + 4) {
            return TWB.getSnowLevel(tx, ty) > 0 ? TWB.T_SNOW_DIRT : TWB.T_DIRT;
        }
        if (tx >= c.cx - 2 && tx <= c.cx + 2 && ty >= c.cy + 4 && ty <= c.cy + 10) {
            return TWB.getSnowLevel(tx, ty) > 0 ? TWB.T_SNOW_DIRT : TWB.T_DIRT;
        }
    }

    var snowLvl = TWB.getSnowLevel(tx, ty);

    var h = TWB.hash(tx, ty) % 100;
    if (snowLvl === 2) return (h < 60) ? TWB.T_SNOW1 : TWB.T_SNOW2;
    if (snowLvl === 1) {
        if (h < 40) return TWB.T_SNOW1;
        if (h < 65) return TWB.T_GRASS1;
        return TWB.T_GRASS2;
    }

    if (h < 55) return TWB.T_GRASS1;
    if (h < 82) return TWB.T_GRASS2;
    return TWB.T_GRASS3;
};

TWB.isWalkable = function(wx, wy) {
    var tx = Math.floor(wx / TWB.TILE);
    var ty = Math.floor(wy / TWB.TILE);
    if (TWB.indoors) {
        return wx >= 8 && wy >= 8 && wx < TWB.INTERIOR_COLS * TWB.TILE - 8 && wy < TWB.INTERIOR_ROWS * TWB.TILE - 8;
    }
    if (tx < 0 || ty < 0 || tx >= TWB.COLS || ty >= TWB.ROWS) return false;
    var t = TWB.getGround(tx, ty);
    return t !== TWB.T_WATER && t !== TWB.T_WATER_DEEP;
};

// === CABIN IDENTITY SYSTEM ===

TWB.CABIN_TYPES = [
    {
        name: 'Old Shelter',
        note: 'Found black wool near the door.\nNo sheep around here.',
        loot: ['bandage', 'sticks', 'berries'],
        maxSearch: 2,
        interior: [
            { type: 'fireplace', gx: 1, gy: 1 },
            { type: 'bed', gx: 6, gy: 3 },
            { type: 'cabinet', gx: 1, gy: 3 },
            { type: 'table', gx: 6, gy: 5 },
            { type: 'note', gx: 4, gy: 2 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    },
    {
        name: "Hunter's Cabin",
        note: 'Back before dark.',
        loot: ['meat', 'meat', 'knife', 'trap', 'bandage', 'rope'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 1, gy: 1 },
            { type: 'bed', gx: 6, gy: 3 },
            { type: 'table', gx: 6, gy: 5, desc: 'Knife marks cover the surface. Dried blood.' },
            { type: 'cabinet', gx: 1, gy: 3 },
            { type: 'note', gx: 5, gy: 2 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    },
    {
        name: "Shepherd's Cabin",
        note: 'The flock grows restless at night.\nSomething watches from the ridge.\nThe wolves haven\'t come since he appeared.',
        loot: ['meat', 'canned_food', 'bandage', 'canteen', 'rope', 'olive_oil'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 1, gy: 1 },
            { type: 'bed', gx: 6, gy: 3 },
            { type: 'table', gx: 2, gy: 5, desc: 'A tin cup. Half-empty. A dog bowl on the floor.' },
            { type: 'shelf', gx: 1, gy: 3 },
            { type: 'note', gx: 3, gy: 2 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    },
    {
        name: 'Abandoned Family Cabin',
        note: 'Mama says we go on a trip.\nI don\'t want to leave.',
        loot: ['canned_food', 'canned_food', 'bandage', 'canteen', 'expired_food', 'olive_oil'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 1, gy: 1 },
            { type: 'bed', gx: 6, gy: 3 },
            { type: 'bed', gx: 6, gy: 3 },
            { type: 'cabinet', gx: 1, gy: 3 },
            { type: 'note', gx: 3, gy: 2 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    },
    {
        name: "Ranger's Cabin",
        note: 'Trail markers north of the ridge\nare gone. Third time this month.',
        loot: ['bandage', 'bandage', 'canteen', 'canned_food', 'torch'],
        maxSearch: 4,
        interior: [
            { type: 'fireplace', gx: 1, gy: 1 },
            { type: 'bed', gx: 6, gy: 3 },
            { type: 'table', gx: 2, gy: 4, desc: 'An open map. Red circles near the northern ridge.' },
            { type: 'cabinet', gx: 1, gy: 3 },
            { type: 'shelf', gx: 6, gy: 3 },
            { type: 'note', gx: 4, gy: 3 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    },
    {
        name: "Hermit's Cabin",
        note: 'They won\'t understand.\nThe mountain speaks\nif you listen long enough.\nI saw him again on the ridge.\nHe was watching the valley.',
        loot: ['berries', 'berries', 'sticks', 'torch', 'bandage', 'olive_oil'],
        maxSearch: 2,
        interior: [
            { type: 'fireplace', gx: 6, gy: 1 },
            { type: 'bed', gx: 1, gy: 3 },
            { type: 'shelf', gx: 3, gy: 3 },
            { type: 'table', gx: 6, gy: 5, desc: 'Strange symbols scratched into the wood.' },
            { type: 'note', gx: 3, gy: 2 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    },
    {
        name: "Woodcutter's Cabin",
        note: 'Axe needs sharpening.\nStorm coming.',
        loot: ['wood', 'wood', 'firewood', 'rope', 'sticks'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 1, gy: 1 },
            { type: 'bed', gx: 6, gy: 3 },
            { type: 'crate', gx: 1, gy: 3 },
            { type: 'table', gx: 6, gy: 5, desc: 'Sawdust everywhere. A sharpening stone.' },
            { type: 'note', gx: 5, gy: 2 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    },
    {
        name: "Poacher's Cabin",
        note: 'If anyone asks,\nwe were never here.',
        loot: ['meat', 'meat', 'trap', 'trap', 'rope'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 6, gy: 1 },
            { type: 'bed', gx: 1, gy: 3 },
            { type: 'crate', gx: 3, gy: 3 },
            { type: 'crate', gx: 4, gy: 3 },
            { type: 'note', gx: 4, gy: 2 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    },
    {
        name: "Traveler's Rest",
        note: 'Day 4. Still no signal.\nFollowing the river south.\nSaw something tall on the ridge at dusk.\nNot a man. Not an animal.',
        loot: ['canned_food', 'canteen', 'bandage', 'pasta', 'rice', 'olive_oil'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 1, gy: 1 },
            { type: 'bed', gx: 6, gy: 3 },
            { type: 'table', gx: 6, gy: 5, desc: 'An empty water bottle. Torn map pieces.' },
            { type: 'note', gx: 3, gy: 2 },
            { type: 'cabin_window', gx: 2, gy: 5 }
        ]
    }
];

TWB.buildCabinInterior = function(cabinIdx) {
    var ct = TWB.CABIN_TYPES[TWB._cabinData[cabinIdx].type];
    var objs = [];
    for (var i = 0; i < ct.interior.length; i++) {
        var def = ct.interior[i];
        var obj = { type: def.type, x: def.gx * 32, y: def.gy * 32 };
        switch (def.type) {
            case 'fireplace': obj.solid = true; obj.colR = 18; break;
            case 'bed': obj.solid = true; obj.colW = 40; obj.colH = 24; obj.colOx = -20; obj.colOy = -12; break;
            case 'cabinet': obj.solid = true; obj.colR = 16; break;
            case 'shelf': obj.solid = true; obj.colR = 14; break;
            case 'crate': obj.solid = true; obj.colR = 12; break;
            case 'table': obj.solid = true; obj.colR = 14; if (def.desc) obj.desc = def.desc; break;
            case 'note': obj.solid = false; obj.noteText = ct.note; break;
            case 'cabin_window': obj.solid = true; obj.colR = 14; break;
        }
        objs.push(obj);
    }
    objs.push({ type: 'cabin_door', x: 4 * 32, y: TWB.INTERIOR_ROWS * 32 - 6, solid: false });
    return objs;
};

// === CABIN PLACEMENT ===

TWB.generateCabins = function() {
    TWB._cabinData = [];
    var margin = 20;
    var minDist = 45;
    var r = TWB._riverParams;

    var startCx = 40 + ((TWB.hash(1, 6000) >>> 4) % 80);
    var startCy = 25 + ((TWB.hash(6000, 1) >>> 4) % 40);
    var rc = TWB.getRiverCenter(startCy);
    if (Math.abs(startCx - rc) < 12) startCx = (rc > TWB.COLS / 2) ? rc - 18 : rc + 18;
    TWB._cabinData.push({ cx: startCx, cy: startCy });

    var cabinCount = TWB.CABIN_COUNT || 24;
    for (var i = 1; i < cabinCount; i++) {
        var placed = false;
        for (var att = 0; att < 100; att++) {
            var cx = margin + ((TWB.hash(i * 17 + att * 3, 7000 + i) >>> 4) % (TWB.COLS - margin * 2));
            var cy = margin + ((TWB.hash(7000 + i, i * 17 + att * 3) >>> 4) % (TWB.ROWS - margin * 2));

            var tooClose = false;
            for (var j = 0; j < TWB._cabinData.length; j++) {
                var dx = cx - TWB._cabinData[j].cx;
                var dy = cy - TWB._cabinData[j].cy;
                if (Math.abs(dx) + Math.abs(dy) < minDist) { tooClose = true; break; }
            }
            if (tooClose) continue;

            var r1 = TWB.getRiverCenter(cy);
            if (Math.abs(cx - r1) < 10) continue;
            if (r && cy > r.r2startY && cy < r.r2endY) {
                var r2 = TWB.getSecondRiver(cy);
                if (Math.abs(cx - r2) < 10) continue;
            }

            var onTrib = false;
            for (var ti = 0; ti < TWB._tributaries.length; ti++) {
                var t = TWB._tributaries[ti];
                var td = (cx - t.rx) * t.dir;
                if (td >= 0 && td <= t.length) {
                    var ey = t.ry + Math.round(Math.sin(td * t.curve) * 4 + td * t.slope);
                    if (Math.abs(cy - ey) < 6) { onTrib = true; break; }
                }
            }
            if (onTrib) continue;

            TWB._cabinData.push({ cx: cx, cy: cy });
            placed = true;
            break;
        }
        if (!placed) {
            TWB._cabinData.push({
                cx: margin + ((TWB.hash(i * 31, 8000) >>> 4) % (TWB.COLS - margin * 2)),
                cy: margin + ((TWB.hash(8000, i * 31) >>> 4) % (TWB.ROWS - margin * 2))
            });
        }
    }
};

TWB._snowZones = [];

TWB.generateSnowZones = function() {
    TWB._snowZones = [];
    var snowScale = Math.round((TWB.COLS * TWB.ROWS) / (500 * 500));
    var count = (4 + TWB.hash(777, 888) % 4) * snowScale;
    for (var i = 0; i < count; i++) {
        var cx = 40 + TWB.hash(i * 53, 9001) % (TWB.COLS - 80);
        var cy = 40 + TWB.hash(9001, i * 53) % (TWB.ROWS - 80);
        var rx = 15 + TWB.hash(i * 37, 9002) % 25;
        var ry = 12 + TWB.hash(9002, i * 37) % 20;
        var ok = true;
        for (var j = 0; j < TWB._snowZones.length; j++) {
            var s = TWB._snowZones[j];
            var ddx = cx - s.cx, ddy = cy - s.cy;
            if (Math.sqrt(ddx * ddx + ddy * ddy) < (rx + s.rx) * 0.6) { ok = false; break; }
        }
        if (!ok) continue;
        TWB._snowZones.push({ cx: cx, cy: cy, rx: rx, ry: ry });
    }
};

TWB.getSnowLevel = function(tx, ty) {
    for (var i = 0; i < TWB._snowZones.length; i++) {
        var s = TWB._snowZones[i];
        var dx = (tx - s.cx) / s.rx;
        var dy = (ty - s.cy) / s.ry;
        var dist = dx * dx + dy * dy;
        if (dist < 0.6) return 2;
        if (dist < 1.0) return 1;
    }
    return 0;
};

TWB.initWorld = function() {
    TWB.initRivers();
    TWB.generateTributaries();
    TWB.generateCabins();
    TWB.generateLakes();
    TWB.generateSnowZones();
};

// === DYNAMIC NOTE GENERATOR ===

TWB.getCabinLandmark = function(cabinIdx) {
    var c = TWB._cabinData[cabinIdx];
    var cx = c.cx, cy = c.cy;
    var r1 = TWB.getRiverCenter(cy);
    if (Math.abs(cx - r1) < 30) return 'near the river';
    var r = TWB._riverParams;
    if (r && cy > r.r2startY && cy < r.r2endY) {
        var r2 = TWB.getSecondRiver(cy);
        if (Math.abs(cx - r2) < 30) return 'near the river';
    }
    if (cx < 30 || cx > TWB.COLS - 30 || cy < 30 || cy > TWB.ROWS - 30) return 'at the edge of the mountains';
    var snow = TWB.getSnowLevel(cx, cy);
    if (snow > 0) return 'in the snowy highlands';
    return 'deep in the forest';
};

TWB.getCabinDirection = function(fromIdx, toIdx) {
    var from = TWB._cabinData[fromIdx];
    var to = TWB._cabinData[toIdx];
    var dx = to.cx - from.cx;
    var dy = to.cy - from.cy;
    var dir = '';
    if (Math.abs(dy) > Math.abs(dx) * 0.3) dir += dy < 0 ? 'north' : 'south';
    if (Math.abs(dx) > Math.abs(dy) * 0.3) dir += (dir ? '-' : '') + (dx > 0 ? 'east' : 'west');
    if (!dir) dir = 'nearby';
    return dir;
};

TWB.generateDynamicNote = function(fromIdx, toIdx, itemName, stepIndex) {
    var dir = TWB.getCabinDirection(fromIdx, toIdx);
    var landmark = TWB.getCabinLandmark(toIdx);
    var templates = [
        'The radio is broken. I hid the\n' + itemName + ' in a cabin to the\n' + dir + ', ' + landmark + '.\nGet it before the storm.',
        'If you find this: the ' + itemName + '\nis in a shelter ' + dir + ' of here,\n' + landmark + '.\nI couldn\'t carry it all.',
        'The shadows are closer now.\nI left the ' + itemName + ' in a\ncabin ' + dir + ', ' + landmark + '.\nDon\'t look back.'
    ];
    return templates[stepIndex % templates.length];
};

TWB.generateFinalNote = function(fromIdx, targetIdx) {
    var dir = TWB.getCabinDirection(fromIdx, targetIdx);
    var landmark = TWB.getCabinLandmark(targetIdx);
    return 'The relay station is ' + dir + ',\n' + landmark + '.\nBring all parts there.\nIt\'s our only way out.';
};

TWB.generateRescueNote = function(fromIdx, toIdx, itemName, stepIndex) {
    var dir = TWB.getCabinDirection(fromIdx, toIdx);
    var landmark = TWB.getCabinLandmark(toIdx);
    var templates = [
        'Found tracks heading ' + dir + '.\nThe hiker left gear behind.\nThere\'s a cabin ' + landmark + '.\nMaybe more clues there.',
        'A torn page from a journal.\nMentions a shelter ' + dir + ',\n' + landmark + '.\nThey were heading that way.',
        'Bootprints in the mud lead\n' + dir + '. A cabin ' + landmark + '\nmight hold the last clue.\nHurry - the weather\'s turning.'
    ];
    return templates[stepIndex % templates.length];
};

TWB.generateRescueFinalNote = function(fromIdx, targetIdx) {
    var dir = TWB.getCabinDirection(fromIdx, targetIdx);
    var landmark = TWB.getCabinLandmark(targetIdx);
    return 'The hiker\'s trail leads ' + dir + ',\n' + landmark + '.\nUse the flare when you arrive.\nRescue will see it.';
};

// === SCENARIO SYSTEM ===

TWB.initScenario = function() {
    var scenarios = ['RESCUE', 'RELAY', 'CURSE'];
    TWB._scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    TWB._scenarioData = {};

    var cabins = TWB._cabinData;
    var start = TWB._startCabin;
    var sd = TWB._scenarioData;

    if (TWB._scenario === 'RESCUE') {
        var farthest = -1, farthestDist = 0;
        for (var i = 1; i < cabins.length; i++) {
            var dx = cabins[i].cx - cabins[start].cx;
            var dy = cabins[i].cy - cabins[start].cy;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d > farthestDist) { farthestDist = d; farthest = i; }
        }
        sd.targetCabin = farthest;
        TWB._targetCabin = farthest;

        var midCabins = [];
        for (var i = 1; i < cabins.length; i++) {
            if (i === farthest) continue;
            midCabins.push(i);
        }
        midCabins.sort(function(a, b) {
            var da = Math.sqrt(Math.pow(cabins[a].cx - cabins[start].cx, 2) + Math.pow(cabins[a].cy - cabins[start].cy, 2));
            var db = Math.sqrt(Math.pow(cabins[b].cx - cabins[start].cx, 2) + Math.pow(cabins[b].cy - cabins[start].cy, 2));
            return da - db;
        });
        var third = Math.floor(midCabins.length / 3);
        sd.clueCabins = [
            midCabins[Math.floor(Math.random() * third)],
            midCabins[third + Math.floor(Math.random() * third)],
            midCabins[third * 2 + Math.floor(Math.random() * (midCabins.length - third * 2))]
        ];
        sd.cluesFound = [false, false, false];
        sd.clueNotes = [
            TWB.generateRescueNote(sd.clueCabins[0], sd.clueCabins[1], 'clue', 0),
            TWB.generateRescueNote(sd.clueCabins[1], sd.clueCabins[2], 'clue', 1),
            TWB.generateRescueFinalNote(sd.clueCabins[2], farthest)
        ];
        sd.clueNotesRead = [false, false, false];
        sd.revealedCabins = [sd.clueCabins[0]];
        sd.objectiveText = 'Search nearby cabins for clues.';

    } else if (TWB._scenario === 'RELAY') {
        var farthest = -1, farthestDist = 0;
        for (var i = 1; i < cabins.length; i++) {
            var dx = cabins[i].cx - cabins[start].cx;
            var dy = cabins[i].cy - cabins[start].cy;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d > farthestDist) { farthestDist = d; farthest = i; }
        }
        sd.relayCabin = farthest;
        TWB._targetCabin = farthest;

        var candidates = [];
        for (var i = 1; i < cabins.length; i++) {
            if (i === farthest) continue;
            var dx = cabins[i].cx - cabins[start].cx;
            var dy = cabins[i].cy - cabins[start].cy;
            candidates.push({ idx: i, dist: Math.sqrt(dx * dx + dy * dy) });
        }
        candidates.sort(function(a, b) { return a.dist - b.dist; });
        var third = Math.floor(candidates.length / 3);
        sd.partCabins = [
            candidates[Math.floor(Math.random() * Math.max(1, third))].idx,
            candidates[third + Math.floor(Math.random() * Math.max(1, third))].idx,
            candidates[third * 2 + Math.floor(Math.random() * Math.max(1, candidates.length - third * 2))].idx
        ];
        for (var ci = 1; ci < sd.partCabins.length; ci++) {
            if (sd.partCabins[ci] === sd.partCabins[ci - 1]) {
                for (var fi = 0; fi < candidates.length; fi++) {
                    if (sd.partCabins.indexOf(candidates[fi].idx) === -1) {
                        sd.partCabins[ci] = candidates[fi].idx;
                        break;
                    }
                }
            }
        }
        sd.partsFound = [false, false, false];
        sd.partNames = ['Battery', 'Antenna Wire', 'Power Fuse'];
        sd.partNotes = [
            TWB.generateDynamicNote(sd.partCabins[0], sd.partCabins[1], 'Antenna Wire', 0),
            TWB.generateDynamicNote(sd.partCabins[1], sd.partCabins[2], 'Power Fuse', 1),
            TWB.generateFinalNote(sd.partCabins[2], farthest)
        ];
        sd.notesRead = [false, false, false];
        sd.revealedCabins = [sd.partCabins[0]];
        sd.objectiveText = 'Search nearby cabins for radio parts.';

    } else if (TWB._scenario === 'CURSE') {
        var farthest = -1, farthestDist = 0;
        for (var i = 1; i < cabins.length; i++) {
            var dx = cabins[i].cx - cabins[start].cx;
            var dy = cabins[i].cy - cabins[start].cy;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d > farthestDist) { farthestDist = d; farthest = i; }
        }
        sd.shrineCabin = farthest;
        TWB._targetCabin = farthest;

        sd.curseShrines = [];
        for (var si = 0; si < 3; si++) {
            var sx, sy, attempts = 0;
            do {
                sx = 30 + Math.floor(Math.random() * (TWB.COLS - 60));
                sy = 30 + Math.floor(Math.random() * (TWB.ROWS - 60));
                var valid = true;
                for (var ci = 0; ci < cabins.length; ci++) {
                    if (Math.abs(sx - cabins[ci].cx) < 8 && Math.abs(sy - cabins[ci].cy) < 8) { valid = false; break; }
                }
                for (var sj = 0; sj < sd.curseShrines.length; sj++) {
                    if (Math.abs(sx - sd.curseShrines[sj].tx) < 20 && Math.abs(sy - sd.curseShrines[sj].ty) < 20) { valid = false; break; }
                }
                var gt = TWB.getGround(sx, sy);
                if (gt === TWB.T_WATER || gt === TWB.T_WATER_DEEP) valid = false;
                attempts++;
            } while (!valid && attempts < 100);
            sd.curseShrines.push({ tx: sx, ty: sy, lit: false, relicTaken: false });
        }
        sd.relicsPlaced = 0;
        sd.objectiveText = 'Light 3 shrines and collect the Relics.';
    }
};

TWB.generateTutorialObjects = function() {
    TWB._cabinData = [];
    TWB._cabinData.push({ cx: 15, cy: 10, type: 0, damaged: false, repaired: false });
    TWB._cabinData.push({ cx: 24, cy: 20, type: 1, damaged: false, repaired: false });
    TWB._startCabin = 0;
    TWB._targetCabin = 1;
    TWB._scenario = 'RESCUE';
    TWB._scenarioData = { objectiveText: 'Complete the tutorial.', cluesFound: [false, false, false] };
    TWB._riverParams = { r1base: -100, r1amp1: 0, r1amp2: 0, r1freq1: 0, r1freq2: 0, r2startY: -100, r2endY: -100 };
    TWB._tributaries = [];
    TWB._lakeData = [];
    TWB._snowZones = [];
    TWB._isTutorial = true;

    var objs = [];
    objs.push({ type: 'cabin', x: 15 * TWB.TILE, y: 10 * TWB.TILE, solid: true, colW: 80, colH: 28, colOx: -40, colOy: -20 });
    objs.push({ type: 'cabin', x: 24 * TWB.TILE, y: 20 * TWB.TILE, solid: true, colW: 80, colH: 28, colOx: -40, colOy: -20 });
    objs.push({ type: 'tree_pine', x: 20 * TWB.TILE, y: 16 * TWB.TILE, solid: true, colR: 6 });
    objs.push({ type: 'tree_oak', x: 22 * TWB.TILE, y: 17 * TWB.TILE, solid: true, colR: 6 });
    objs.push({ type: 'bush_berry', x: 18 * TWB.TILE, y: 18 * TWB.TILE, solid: false, berries: 3 });
    objs.push({ type: 'rock', x: 12 * TWB.TILE, y: 17 * TWB.TILE, solid: true, colR: 10 });

    for (var ty = 0; ty < TWB.ROWS; ty++) {
        for (var tx = 0; tx < TWB.COLS; tx++) {
            if (tx >= 9 && tx <= 25 && ty >= 6 && ty <= 22) continue;
            var border = ty <= 2 || ty >= TWB.ROWS - 3 || tx >= TWB.COLS - 3 || tx <= 2;
            var edge = ty <= 5 || ty >= TWB.ROWS - 5 || tx >= TWB.COLS - 5 || tx <= 5;
            if (border || (edge && TWB.hash(tx, ty) % 3 === 0)) {
                objs.push({ type: 'tree_pine', x: tx * TWB.TILE, y: ty * TWB.TILE, solid: true, colR: 6 });
            }
        }
    }

    return objs;
};

// === OBJECT GENERATION ===

TWB.generateObjects = function() {
    TWB._isTutorial = false;
    TWB.initWorld();

    var objs = [];

    TWB._targetCabin = 1 + Math.floor(Math.random() * (TWB._cabinData.length - 1));
    TWB.initScenario();

    TWB._cabinData[0].type = 0;
    TWB._cabinData[0].damaged = false;
    TWB._cabinData[0].repaired = false;
    for (var ai = 1; ai < TWB._cabinData.length; ai++) {
        var ch = TWB.hash(TWB._cabinData[ai].cx, TWB._cabinData[ai].cy);
        TWB._cabinData[ai].type = 1 + (((ch >>> 4) ^ (ch >>> 12) ^ ai) % 8);
        TWB._cabinData[ai].damaged = ((ch >>> 8) % 3) === 0;
        TWB._cabinData[ai].repaired = false;
    }

    for (var ty = 0; ty < TWB.ROWS; ty++) {
        for (var tx = 0; tx < TWB.COLS; tx++) {
            var nearCabin = false;
            for (var ci = 0; ci < TWB._cabinData.length; ci++) {
                var c = TWB._cabinData[ci];
                if (tx >= c.cx - 6 && tx <= c.cx + 6 && ty >= c.cy - 5 && ty <= c.cy + 12) {
                    nearCabin = true;
                    break;
                }
            }
            if (nearCabin) continue;

            var ground = TWB.getGround(tx, ty);
            if (ground === TWB.T_WATER || ground === TWB.T_WATER_DEEP || ground === TWB.T_SHORE) continue;

            var h = TWB.hash(tx, ty) % 100;
            var border = ty <= 3 || ty >= TWB.ROWS - 4 || tx >= TWB.COLS - 4 || tx <= 3;
            var edge = ty <= 8 || ty >= TWB.ROWS - 8 || tx >= TWB.COLS - 8 || tx <= 8;
            var density = border ? 75 : (edge ? 50 : 20);

            if (h < density) {
                var ox = tx * TWB.TILE + (TWB.hash(tx + 99, ty) % 16) - 8;
                var oy = ty * TWB.TILE + (TWB.hash(tx, ty + 99) % 16) - 8;
                var isPine = TWB.hash(tx + 50, ty + 50) % 3 !== 0;
                objs.push({
                    type: isPine ? 'tree_pine' : 'tree_oak',
                    x: ox, y: oy,
                    solid: true,
                    colR: 6,
                });
            }
        }
    }

    for (var ci = 0; ci < TWB._cabinData.length; ci++) {
        var c = TWB._cabinData[ci];
        var ch = TWB.hash(c.cx, c.cy) % 100;
        objs.push({ type: 'cabin', x: c.cx * TWB.TILE, y: c.cy * TWB.TILE, solid: true, colW: 80, colH: 28, colOx: -40, colOy: -20 });

        if (ch % 3 === 0) {
            objs.push({ type: 'campfire', x: (c.cx + 3) * TWB.TILE, y: (c.cy + 5) * TWB.TILE, solid: true, colR: 10 });
        } else if (ch % 3 === 1) {
            objs.push({ type: 'campfire', x: (c.cx - 3) * TWB.TILE, y: (c.cy + 4) * TWB.TILE, solid: true, colR: 10 });
        }

        if (ch % 5 < 2) {
            objs.push({ type: 'stump', x: (c.cx + 4 + ch % 3) * TWB.TILE, y: (c.cy + 3) * TWB.TILE, solid: true, colR: 8 });
        }
        if (ch % 7 < 3) {
            objs.push({ type: 'rock', x: (c.cx - 3 + ch % 4) * TWB.TILE, y: (c.cy + 5 + ch % 2) * TWB.TILE, solid: true, colR: 10 });
        }
        if (ch % 4 === 0) {
            objs.push({ type: 'bush_berry', x: (c.cx + 5) * TWB.TILE, y: (c.cy + 4) * TWB.TILE, solid: false, berries: 3 });
        }
        if (ch % 6 < 2) {
            objs.push({ type: 'bush', x: (c.cx - 4) * TWB.TILE, y: (c.cy + 3 + ch % 3) * TWB.TILE, solid: false });
        }
    }

    for (var ri = 0; ri < 200; ri++) {
        var rx = 10 + Math.floor(TWB.hash(ri * 7, 300) % (TWB.COLS - 20));
        var ry = 10 + Math.floor(TWB.hash(300, ri * 7) % (TWB.ROWS - 20));
        var rg = TWB.getGround(rx, ry);
        if (rg !== TWB.T_WATER && rg !== TWB.T_SHORE) {
            objs.push({ type: 'rock', x: rx * TWB.TILE, y: ry * TWB.TILE, solid: true, colR: 10 });
        }
    }

    for (var bli = 0; bli < 40; bli++) {
        var blx = 12 + Math.floor(TWB.hash(bli * 13, 700) % (TWB.COLS - 24));
        var bly = 12 + Math.floor(TWB.hash(700, bli * 13) % (TWB.ROWS - 24));
        var blg = TWB.getGround(blx, bly);
        if (blg === TWB.T_WATER || blg === TWB.T_WATER_DEEP || blg === TWB.T_SHORE) continue;
        var nearCab = false;
        for (var bci = 0; bci < TWB._cabinData.length; bci++) {
            var bc = TWB._cabinData[bci];
            if (Math.abs(blx - bc.cx) < 8 && Math.abs(bly - bc.cy) < 8) { nearCab = true; break; }
        }
        if (nearCab) continue;
        objs.push({ type: 'boulder', x: blx * TWB.TILE, y: bly * TWB.TILE, solid: true, colW: 56, colH: 32, colOx: -28, colOy: -24 });
    }

    for (var cni = 0; cni < TWB._cabinData.length - 1; cni++) {
        var ca = TWB._cabinData[cni];
        var cb = TWB._cabinData[(cni + 1) % TWB._cabinData.length];
        var midX = Math.floor((ca.cx + cb.cx) / 2) + ((TWB.hash(cni * 19, 900) % 16) - 8);
        var midY = Math.floor((ca.cy + cb.cy) / 2) + ((TWB.hash(900, cni * 19) % 16) - 8);
        midX = Math.max(5, Math.min(TWB.COLS - 5, midX));
        midY = Math.max(5, Math.min(TWB.ROWS - 5, midY));
        var cng = TWB.getGround(midX, midY);
        if (cng !== TWB.T_WATER && cng !== TWB.T_WATER_DEEP && cng !== TWB.T_SHORE) {
            objs.push({ type: 'cairn', x: midX * TWB.TILE, y: midY * TWB.TILE, solid: true, colR: 8 });
        }
    }

    for (var bri = 0; bri < 8; bri++) {
        var brY = 30 + Math.floor(TWB.hash(bri * 29, 1200) % (TWB.ROWS - 60));
        var brRc = TWB.getRiverCenter(brY);
        var isBroken = TWB.hash(bri * 13, 1300) % 3 === 0;
        objs.push({
            type: isBroken ? 'broken_bridge' : 'bridge',
            x: brRc * TWB.TILE,
            y: brY * TWB.TILE,
            solid: false,
            colR: 14
        });
    }

    for (var sti = 0; sti < 6; sti++) {
        var stY = 25 + Math.floor(TWB.hash(sti * 37, 1400) % (TWB.ROWS - 50));
        var stRc = TWB.getRiverCenter(stY);
        objs.push({
            type: 'stepping_stones',
            x: stRc * TWB.TILE,
            y: stY * TWB.TILE,
            solid: false,
            colR: 14
        });
    }

    for (var shi = 0; shi < 14; shi++) {
        var shx = 15 + Math.floor(TWB.hash(shi * 23, 1100) % (TWB.COLS - 30));
        var shy = 15 + Math.floor(TWB.hash(1100, shi * 23) % (TWB.ROWS - 30));
        var shg = TWB.getGround(shx, shy);
        if (shg === TWB.T_WATER || shg === TWB.T_WATER_DEEP || shg === TWB.T_SHORE) continue;
        var nearCab2 = false;
        for (var sci = 0; sci < TWB._cabinData.length; sci++) {
            var sc2 = TWB._cabinData[sci];
            if (Math.abs(shx - sc2.cx) < 8 && Math.abs(shy - sc2.cy) < 8) { nearCab2 = true; break; }
        }
        if (nearCab2) continue;
        objs.push({ type: 'shrine', x: shx * TWB.TILE, y: shy * TWB.TILE, solid: true, colR: 12, lit: false, litFuel: 0 });
    }

    if (TWB._scenario === 'CURSE') {
        var cs = TWB._scenarioData.curseShrines;
        for (var csi = 0; csi < cs.length; csi++) {
            objs.push({
                type: 'curse_shrine',
                x: cs[csi].tx * TWB.TILE,
                y: cs[csi].ty * TWB.TILE,
                solid: true,
                colR: 12,
                lit: false,
                litFuel: 0,
                relicTaken: false,
                shrineIdx: csi
            });
        }
    }

    var berryCount = 60;
    for (var bi = 0; bi < berryCount; bi++) {
        var bx = 8 + Math.floor(TWB.hash(bi * 11, 500) % (TWB.COLS - 16));
        var by = 8 + Math.floor(TWB.hash(500, bi * 11) % (TWB.ROWS - 16));
        var bg = TWB.getGround(bx, by);
        if (bg !== TWB.T_WATER && bg !== TWB.T_SHORE) {
            objs.push({ type: 'bush_berry', x: bx * TWB.TILE, y: by * TWB.TILE, solid: false, berries: 3 });
        }
    }

    var fountainCount = 2 + (TWB.hash(4200, 4200) % 2);
    for (var fti = 0; fti < fountainCount; fti++) {
        var ftx = 20 + Math.floor(TWB.hash(fti * 41, 4300) % (TWB.COLS - 40));
        var fty = 20 + Math.floor(TWB.hash(4300, fti * 41) % (TWB.ROWS - 40));
        var ftg = TWB.getGround(ftx, fty);
        if (ftg === TWB.T_WATER || ftg === TWB.T_WATER_DEEP || ftg === TWB.T_SHORE) continue;
        var nearCabFt = false;
        for (var fci = 0; fci < TWB._cabinData.length; fci++) {
            var fc = TWB._cabinData[fci];
            if (Math.abs(ftx - fc.cx) < 10 && Math.abs(fty - fc.cy) < 10) { nearCabFt = true; break; }
        }
        if (nearCabFt) continue;
        objs.push({ type: 'fountain', x: ftx * TWB.TILE, y: fty * TWB.TILE, solid: true, colR: 12 });
    }

    for (var bui = 0; bui < 20; bui++) {
        var bux = 8 + Math.floor(TWB.hash(bui * 13, 600) % (TWB.COLS - 16));
        var buy = 8 + Math.floor(TWB.hash(600, bui * 13) % (TWB.ROWS - 16));
        objs.push({ type: 'bush', x: bux * TWB.TILE, y: buy * TWB.TILE, solid: false });
    }

    for (var li = 0; li < TWB._lakeData.length; li++) {
        var lake = TWB._lakeData[li];
        var herbCount = 2 + (TWB.hash(li * 61, 13000) % 3);
        for (var hi = 0; hi < herbCount; hi++) {
            var hAngle = (TWB.hash(li * 17 + hi * 31, 13100) % 628) / 100.0;
            var hDist = lake.rx + 2 + (TWB.hash(13200, li * 19 + hi * 37) % 3);
            var hx = Math.round(lake.cx + Math.cos(hAngle) * hDist);
            var hy = Math.round(lake.cy + Math.sin(hAngle) * hDist);
            if (hx < 5 || hy < 5 || hx >= TWB.COLS - 5 || hy >= TWB.ROWS - 5) continue;
            var hg = TWB.getGround(hx, hy);
            if (hg === TWB.T_WATER || hg === TWB.T_WATER_DEEP || hg === TWB.T_SHORE) continue;
            objs.push({ type: 'herb_vikos', x: hx * TWB.TILE, y: hy * TWB.TILE, solid: false, picked: false });
        }
    }

    return objs;
};

window.TWB = TWB;
