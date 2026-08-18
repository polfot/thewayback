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

TWB.T_GRASS1 = 0;
TWB.T_GRASS2 = 1;
TWB.T_GRASS3 = 2;
TWB.T_DIRT = 3;
TWB.T_WATER = 4;
TWB.T_WATER_DEEP = 5;
TWB.T_SHORE = 6;
TWB.T_FLOOR = 7;
TWB.T_WALL = 8;

TWB.INTERIOR_COLS = 12;
TWB.INTERIOR_ROWS = 10;

TWB.indoors = false;

TWB.getInteriorGround = function(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= TWB.INTERIOR_COLS || ty >= TWB.INTERIOR_ROWS) return TWB.T_WALL;
    if (tx === 0 || tx === TWB.INTERIOR_COLS - 1 || ty === 0 || ty === TWB.INTERIOR_ROWS - 1) return TWB.T_WALL;
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
TWB._startCabin = 0;
TWB._targetCabin = -1;

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

    var r1base = 200 + (h1 % 200);
    var r1amp1 = 20 + (h2 % 20);
    var r1freq1 = 0.02 + (h3 % 10) * 0.003;
    var r1amp2 = 8 + (h4 % 12);
    var r1freq2 = 0.06 + (h5 % 8) * 0.01;

    var r2base;
    if (r1base > 300) {
        r2base = 60 + (h6 % 140);
    } else {
        r2base = 320 + (h6 % 120);
    }
    var r2amp1 = 15 + (h7 % 15);
    var r2freq1 = 0.025 + (h8 % 8) * 0.003;
    var r2startY = 40 + (h9 % 90);
    var r2endY = 350 + (TWB.hash(10000, 10000) % 110);

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

TWB.getGround = function(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= TWB.COLS || ty >= TWB.ROWS) return TWB.T_GRASS1;

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

    for (var i = 0; i < TWB._cabinData.length; i++) {
        var c = TWB._cabinData[i];
        if (tx >= c.cx - 5 && tx <= c.cx + 5 && ty >= c.cy - 4 && ty <= c.cy + 4) return TWB.T_DIRT;
        if (tx >= c.cx - 2 && tx <= c.cx + 2 && ty >= c.cy + 4 && ty <= c.cy + 10) return TWB.T_DIRT;
    }

    var h = TWB.hash(tx, ty) % 100;
    if (h < 55) return TWB.T_GRASS1;
    if (h < 82) return TWB.T_GRASS2;
    return TWB.T_GRASS3;
};

TWB.isWalkable = function(wx, wy) {
    var tx = Math.floor(wx / TWB.TILE);
    var ty = Math.floor(wy / TWB.TILE);
    if (TWB.indoors) {
        return tx > 0 && ty > 0 && tx < TWB.INTERIOR_COLS - 1 && ty < TWB.INTERIOR_ROWS - 1;
    }
    if (tx < 0 || ty < 0 || tx >= TWB.COLS || ty >= TWB.ROWS) return false;
    var t = TWB.getGround(tx, ty);
    return t !== TWB.T_WATER && t !== TWB.T_WATER_DEEP;
};

// === CABIN IDENTITY SYSTEM ===

TWB.CABIN_TYPES = [
    {
        name: 'Old Shelter',
        note: null,
        loot: ['bandage', 'sticks', 'berries'],
        maxSearch: 2,
        interior: [
            { type: 'fireplace', gx: 3, gy: 2 },
            { type: 'bed', gx: 9, gy: 2 },
            { type: 'cabinet', gx: 2, gy: 6 },
            { type: 'cabin_window', gx: 6, gy: 1 }
        ]
    },
    {
        name: "Hunter's Cabin",
        note: 'Back before dark.',
        loot: ['meat', 'meat', 'knife', 'trap', 'bandage', 'rope'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 3, gy: 2 },
            { type: 'bed', gx: 9, gy: 2 },
            { type: 'table', gx: 6, gy: 4, desc: 'Knife marks cover the surface. Dried blood.' },
            { type: 'cabinet', gx: 2, gy: 5 },
            { type: 'note', gx: 7, gy: 3 },
            { type: 'cabin_window', gx: 6, gy: 1 }
        ]
    },
    {
        name: "Shepherd's Cabin",
        note: 'The flock grows restless at night.\nSomething watches from the ridge.',
        loot: ['meat', 'canned_food', 'bandage', 'canteen', 'rope', 'olive_oil'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 3, gy: 2 },
            { type: 'bed', gx: 9, gy: 2 },
            { type: 'table', gx: 6, gy: 5, desc: 'A tin cup. Half-empty. A dog bowl on the floor.' },
            { type: 'shelf', gx: 2, gy: 3 },
            { type: 'note', gx: 6, gy: 4 },
            { type: 'cabin_window', gx: 6, gy: 1 }
        ]
    },
    {
        name: 'Abandoned Family Cabin',
        note: 'Mama says we go on a trip.\nI don\'t want to leave.',
        loot: ['canned_food', 'canned_food', 'bandage', 'canteen', 'expired_food', 'olive_oil'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 3, gy: 2 },
            { type: 'bed', gx: 9, gy: 2 },
            { type: 'bed', gx: 9, gy: 5 },
            { type: 'cabinet', gx: 2, gy: 5 },
            { type: 'note', gx: 4, gy: 4 },
            { type: 'cabin_window', gx: 6, gy: 1 }
        ]
    },
    {
        name: "Ranger's Cabin",
        note: 'Trail markers north of the ridge\nare gone. Third time this month.',
        loot: ['bandage', 'bandage', 'canteen', 'canned_food', 'torch'],
        maxSearch: 4,
        interior: [
            { type: 'fireplace', gx: 3, gy: 2 },
            { type: 'bed', gx: 9, gy: 2 },
            { type: 'table', gx: 5, gy: 3, desc: 'An open map. Red circles near the northern ridge.' },
            { type: 'cabinet', gx: 2, gy: 5 },
            { type: 'shelf', gx: 9, gy: 5 },
            { type: 'note', gx: 5, gy: 4 },
            { type: 'cabin_window', gx: 7, gy: 1 }
        ]
    },
    {
        name: "Hermit's Cabin",
        note: 'They won\'t understand.\nThe mountain speaks\nif you listen long enough.',
        loot: ['berries', 'berries', 'sticks', 'torch', 'bandage', 'olive_oil'],
        maxSearch: 2,
        interior: [
            { type: 'fireplace', gx: 9, gy: 2 },
            { type: 'bed', gx: 2, gy: 2 },
            { type: 'shelf', gx: 2, gy: 5 },
            { type: 'table', gx: 6, gy: 5, desc: 'Strange symbols scratched into the wood.' },
            { type: 'note', gx: 5, gy: 4 },
            { type: 'cabin_window', gx: 6, gy: 1 }
        ]
    },
    {
        name: "Woodcutter's Cabin",
        note: 'Axe needs sharpening.\nStorm coming.',
        loot: ['wood', 'wood', 'firewood', 'rope', 'sticks'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 3, gy: 2 },
            { type: 'bed', gx: 9, gy: 2 },
            { type: 'crate', gx: 2, gy: 5 },
            { type: 'table', gx: 6, gy: 4, desc: 'Sawdust everywhere. A sharpening stone.' },
            { type: 'note', gx: 7, gy: 3 },
            { type: 'cabin_window', gx: 6, gy: 1 }
        ]
    },
    {
        name: "Poacher's Cabin",
        note: 'If anyone asks,\nwe were never here.',
        loot: ['meat', 'meat', 'trap', 'trap', 'rope'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 9, gy: 2 },
            { type: 'bed', gx: 2, gy: 2 },
            { type: 'crate', gx: 2, gy: 5 },
            { type: 'crate', gx: 3, gy: 7 },
            { type: 'note', gx: 5, gy: 4 },
            { type: 'cabin_window', gx: 6, gy: 1 }
        ]
    },
    {
        name: "Traveler's Rest",
        note: 'Day 4. Still no signal.\nFollowing the river south.',
        loot: ['canned_food', 'canteen', 'bandage', 'pasta', 'rice', 'olive_oil'],
        maxSearch: 3,
        interior: [
            { type: 'fireplace', gx: 3, gy: 2 },
            { type: 'bed', gx: 9, gy: 2 },
            { type: 'table', gx: 6, gy: 5, desc: 'An empty water bottle. Torn map pieces.' },
            { type: 'note', gx: 6, gy: 4 },
            { type: 'cabin_window', gx: 6, gy: 1 }
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
    objs.push({ type: 'cabin_door', x: 6 * 32, y: 8 * 32, solid: false });
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
    if (Math.abs(startCx - rc) < 12) startCx = (rc > 250) ? rc - 18 : rc + 18;
    TWB._cabinData.push({ cx: startCx, cy: startCy });

    for (var i = 1; i < 24; i++) {
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

TWB.initWorld = function() {
    TWB.initRivers();
    TWB.generateTributaries();
    TWB.generateCabins();
};

// === OBJECT GENERATION ===

TWB.generateObjects = function() {
    TWB.initWorld();

    var objs = [];

    TWB._targetCabin = 1 + Math.floor(Math.random() * (TWB._cabinData.length - 1));

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

    var berryCount = 60;
    for (var bi = 0; bi < berryCount; bi++) {
        var bx = 8 + Math.floor(TWB.hash(bi * 11, 500) % (TWB.COLS - 16));
        var by = 8 + Math.floor(TWB.hash(500, bi * 11) % (TWB.ROWS - 16));
        var bg = TWB.getGround(bx, by);
        if (bg !== TWB.T_WATER && bg !== TWB.T_SHORE) {
            objs.push({ type: 'bush_berry', x: bx * TWB.TILE, y: by * TWB.TILE, solid: false, berries: 3 });
        }
    }

    for (var bui = 0; bui < 20; bui++) {
        var bux = 8 + Math.floor(TWB.hash(bui * 13, 600) % (TWB.COLS - 16));
        var buy = 8 + Math.floor(TWB.hash(600, bui * 13) % (TWB.ROWS - 16));
        objs.push({ type: 'bush', x: bux * TWB.TILE, y: buy * TWB.TILE, solid: false });
    }

    return objs;
};

window.TWB = TWB;
