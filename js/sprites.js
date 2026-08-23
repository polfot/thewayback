var TWB = window.TWB || {};

TWB.Sprites = {};

function makeCanvas(w, h, fn) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    fn(c.getContext('2d'));
    return c;
}

function flipH(src) {
    var c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    var ctx = c.getContext('2d');
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, 0);
    return c;
}

var P = 2;
function px(ctx, x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x * P, y * P, w * P, h * P);
}

function shadow(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, y, w, h);
}

// === GROUND TILES ===

function drawGrass(ctx, v) {
    var bases = ['#4a4a38', '#464632', '#42422e'];
    ctx.fillStyle = bases[v] || bases[0];
    ctx.fillRect(0, 0, 32, 32);

    var darks = ['#3a3a2c', '#363628', '#323224'];
    var mids  = ['#52523e', '#4e4e3a', '#4a4a36'];
    for (var i = 0; i < 40; i++) {
        var gx = TWB.hash(i + v * 100, 0) % 30;
        var gy = TWB.hash(0, i + v * 100) % 30;
        ctx.fillStyle = (i % 3 === 0) ? darks[v] : mids[v];
        ctx.fillRect(gx, gy, 2, 2);
    }
    if (v === 0) {
        ctx.fillStyle = '#3a3a2c';
        ctx.fillRect(8, 14, 4, 2);
        ctx.fillRect(20, 24, 4, 2);
    }
    if (v === 2) {
        ctx.fillStyle = '#565640';
        ctx.fillRect(14, 10, 2, 2);
        ctx.fillStyle = '#42422e';
        ctx.fillRect(14, 12, 2, 2);
    }
}

function drawDirt(ctx) {
    ctx.fillStyle = '#504838';
    ctx.fillRect(0, 0, 32, 32);
    for (var i = 0; i < 20; i++) {
        var dx = (i * 11 + 3) % 28;
        var dy = (i * 7 + 5) % 28;
        ctx.fillStyle = (i % 3 === 0) ? '#443c2e' : '#5a5242';
        ctx.fillRect(dx, dy, 2, 2);
    }
    ctx.fillStyle = '#443c2e';
    ctx.fillRect(2, 8, 4, 2);
    ctx.fillRect(22, 20, 4, 2);
}

function drawWater(ctx, deep) {
    ctx.fillStyle = deep ? '#1a3050' : '#203858';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = deep ? '#1e3456' : '#243c5e';
    for (var i = 0; i < 4; i++) {
        ctx.fillRect(0, 4 + i * 8, 32, 2);
    }
    ctx.fillStyle = 'rgba(40,70,100,0.3)';
    ctx.fillRect(6, 2, 8, 2);
    ctx.fillRect(18, 18, 10, 2);
}

function drawSnow(ctx, v) {
    var bases = ['#c8c8d0', '#bbbbc4'];
    ctx.fillStyle = bases[v] || bases[0];
    ctx.fillRect(0, 0, 32, 32);
    var darks = ['#a8a8b4', '#a0a0ac'];
    var lights = ['#d8d8e0', '#d0d0d8'];
    for (var i = 0; i < 35; i++) {
        var sx = TWB.hash(i + v * 200, 500) % 30;
        var sy = TWB.hash(500, i + v * 200) % 30;
        ctx.fillStyle = (i % 3 === 0) ? darks[v] : lights[v];
        ctx.fillRect(sx, sy, 2, 2);
    }
    if (v === 0) {
        ctx.fillStyle = '#b0b0bc';
        ctx.fillRect(10, 16, 4, 2);
        ctx.fillRect(22, 6, 3, 2);
    }
}

function drawSnowDirt(ctx) {
    ctx.fillStyle = '#9a9498';
    ctx.fillRect(0, 0, 32, 32);
    for (var i = 0; i < 20; i++) {
        var dx = (i * 11 + 3) % 28;
        var dy = (i * 7 + 5) % 28;
        ctx.fillStyle = (i % 3 === 0) ? '#8a8490' : '#aaa4a8';
        ctx.fillRect(dx, dy, 2, 2);
    }
    ctx.fillStyle = '#b8b4bc';
    ctx.fillRect(4, 12, 4, 2);
    ctx.fillRect(18, 22, 5, 2);
}

function drawShore(ctx) {
    ctx.fillStyle = '#504838';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#443c2e';
    for (var i = 0; i < 10; i++) {
        ctx.fillRect((i * 7) % 28, (i * 11) % 28, 2, 2);
    }
    ctx.fillStyle = '#4a4a38';
    ctx.fillRect(24, 0, 8, 32);
    ctx.fillStyle = '#42422e';
    ctx.fillRect(26, 0, 2, 32);
}

function drawFloor(ctx) {
    ctx.fillStyle = '#5c4a32';
    ctx.fillRect(0, 0, 32, 32);
    for (var i = 0; i < 4; i++) {
        ctx.fillStyle = '#50402a';
        ctx.fillRect(0, i * 8 + 7, 32, 1);
    }
    for (var j = 0; j < 6; j++) {
        var fx = (j * 13 + 5) % 28;
        var fy = (j * 9 + 3) % 28;
        ctx.fillStyle = '#6a5438';
        ctx.fillRect(fx, fy, 4, 2);
    }
}

function drawWall(ctx) {
    ctx.fillStyle = '#3a3028';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#443828';
    ctx.fillRect(0, 0, 32, 2);
    ctx.fillRect(0, 15, 32, 2);
    ctx.fillStyle = '#322820';
    ctx.fillRect(0, 8, 32, 1);
    ctx.fillRect(0, 24, 32, 1);
}

// === CHARACTER ===

function drawCharBody(ctx, dir) {
    var dk = '#0a0a0a';
    var md = '#141414';
    var lt = '#1e1e1e';
    if (dir === 0) {
        px(ctx, 4, 0, 6, 1, md);
        px(ctx, 3, 1, 8, 3, dk);
        px(ctx, 4, 1, 6, 2, md);
        px(ctx, 3, 4, 8, 1, dk);
        px(ctx, 2, 5, 10, 4, dk);
        px(ctx, 3, 5, 8, 3, md);
        px(ctx, 1, 9, 2, 4, dk);
        px(ctx, 3, 9, 8, 4, dk);
        px(ctx, 11, 9, 2, 4, dk);
        px(ctx, 4, 9, 6, 3, md);
        px(ctx, 3, 13, 8, 1, dk);
    } else if (dir === 1) {
        px(ctx, 4, 0, 6, 1, md);
        px(ctx, 3, 1, 8, 3, dk);
        px(ctx, 4, 1, 6, 2, md);
        px(ctx, 3, 4, 8, 1, dk);
        px(ctx, 2, 5, 10, 4, dk);
        px(ctx, 3, 5, 8, 3, lt);
        px(ctx, 1, 9, 2, 4, dk);
        px(ctx, 3, 9, 8, 4, dk);
        px(ctx, 11, 9, 2, 4, dk);
        px(ctx, 4, 9, 6, 3, lt);
        px(ctx, 3, 13, 8, 1, dk);
    } else if (dir === 2) {
        px(ctx, 5, 0, 5, 1, md);
        px(ctx, 4, 1, 6, 3, dk);
        px(ctx, 5, 1, 4, 2, md);
        px(ctx, 4, 4, 5, 1, dk);
        px(ctx, 3, 5, 7, 4, dk);
        px(ctx, 4, 5, 5, 3, md);
        px(ctx, 2, 9, 1, 4, dk);
        px(ctx, 3, 9, 6, 4, dk);
        px(ctx, 4, 9, 4, 3, md);
        px(ctx, 3, 13, 6, 1, dk);
    }
}

function drawCharLegs(ctx, dir, frame) {
    var dk = '#0a0a0a';
    var md = '#141414';
    if (dir === 0 || dir === 1) {
        if (frame === 0) {
            px(ctx, 4, 14, 2, 4, dk);
            px(ctx, 8, 14, 2, 4, md);
            px(ctx, 4, 18, 2, 1, dk);
            px(ctx, 8, 18, 2, 1, dk);
        } else if (frame === 1) {
            px(ctx, 3, 14, 2, 4, dk);
            px(ctx, 3, 18, 3, 1, dk);
            px(ctx, 9, 14, 2, 3, md);
            px(ctx, 9, 17, 2, 1, dk);
        } else {
            px(ctx, 4, 14, 2, 3, md);
            px(ctx, 4, 17, 2, 1, dk);
            px(ctx, 8, 14, 2, 4, dk);
            px(ctx, 8, 18, 3, 1, dk);
        }
    } else if (dir === 2) {
        if (frame === 0) {
            px(ctx, 5, 14, 2, 4, dk);
            px(ctx, 7, 14, 2, 4, md);
            px(ctx, 5, 18, 2, 1, dk);
            px(ctx, 7, 18, 2, 1, dk);
        } else if (frame === 1) {
            px(ctx, 4, 14, 2, 4, dk);
            px(ctx, 4, 18, 2, 1, dk);
            px(ctx, 7, 14, 2, 3, md);
            px(ctx, 7, 17, 2, 1, dk);
        } else {
            px(ctx, 5, 14, 2, 3, md);
            px(ctx, 5, 17, 2, 1, dk);
            px(ctx, 8, 14, 2, 4, dk);
            px(ctx, 8, 18, 2, 1, dk);
        }
    }
}

function makeCharSprite(dir, frame) {
    return makeCanvas(28, 40, function(ctx) {
        shadow(ctx, 4, 34, 20, 4);
        drawCharBody(ctx, dir);
        drawCharLegs(ctx, dir, frame);
    });
}

// === WOLF ===

function drawWolfBody(ctx, dir) {
    var dk = '#080808';
    var md = '#121212';
    var lt = '#1a1a1a';
    if (dir === 0) {
        px(ctx, 3, 0, 2, 2, dk);
        px(ctx, 9, 0, 2, 2, dk);
        px(ctx, 4, 1, 6, 1, md);
        px(ctx, 3, 2, 8, 6, dk);
        px(ctx, 4, 3, 6, 4, md);
        px(ctx, 2, 3, 1, 4, dk);
        px(ctx, 11, 3, 1, 4, dk);
    } else if (dir === 1) {
        px(ctx, 3, 0, 2, 1, dk);
        px(ctx, 9, 0, 2, 1, dk);
        px(ctx, 3, 1, 8, 2, dk);
        px(ctx, 4, 1, 6, 1, md);
        px(ctx, 3, 3, 8, 5, dk);
        px(ctx, 4, 3, 6, 4, md);
        px(ctx, 2, 4, 1, 3, dk);
        px(ctx, 11, 4, 1, 3, dk);
        px(ctx, 6, 8, 2, 2, dk);
    } else if (dir === 2) {
        px(ctx, 1, 0, 2, 2, dk);
        px(ctx, 1, 2, 10, 5, dk);
        px(ctx, 2, 3, 8, 3, md);
        px(ctx, 11, 4, 2, 2, dk);
    }
}

function drawWolfLegs(ctx, dir, frame) {
    var dk = '#080808';
    var md = '#121212';
    if (dir === 0 || dir === 1) {
        if (frame === 0) {
            px(ctx, 4, 7, 2, 3, dk);
            px(ctx, 8, 7, 2, 3, md);
            px(ctx, 4, 10, 2, 1, dk);
            px(ctx, 8, 10, 2, 1, dk);
        } else if (frame === 1) {
            px(ctx, 3, 7, 2, 3, dk);
            px(ctx, 3, 10, 2, 1, dk);
            px(ctx, 9, 7, 2, 2, md);
            px(ctx, 9, 9, 2, 1, dk);
        } else {
            px(ctx, 4, 7, 2, 2, md);
            px(ctx, 4, 9, 2, 1, dk);
            px(ctx, 8, 7, 2, 3, dk);
            px(ctx, 8, 10, 2, 1, dk);
        }
    } else if (dir === 2) {
        if (frame === 0) {
            px(ctx, 3, 7, 2, 3, dk);
            px(ctx, 7, 7, 2, 3, md);
            px(ctx, 3, 10, 2, 1, dk);
            px(ctx, 7, 10, 2, 1, dk);
        } else if (frame === 1) {
            px(ctx, 2, 7, 2, 3, dk);
            px(ctx, 2, 10, 2, 1, dk);
            px(ctx, 8, 7, 2, 2, md);
            px(ctx, 8, 9, 2, 1, dk);
        } else {
            px(ctx, 3, 7, 2, 2, md);
            px(ctx, 3, 9, 2, 1, dk);
            px(ctx, 7, 7, 2, 3, dk);
            px(ctx, 7, 10, 2, 1, dk);
        }
    }
}

function makeWolfSprite(dir, frame) {
    return makeCanvas(28, 24, function(ctx) {
        shadow(ctx, 4, 20, 20, 4);
        drawWolfBody(ctx, dir);
        drawWolfLegs(ctx, dir, frame);
    });
}

// === TREES (pure pixel art - rectangles only) ===

function drawPine(ctx) {
    shadow(ctx, 10, 68, 28, 6);
    var dk = '#080808';
    var md = '#101010';
    var lt = '#161616';

    px(ctx, 11, 30, 2, 10, '#0c0c0c');

    px(ctx, 7, 26, 10, 2, dk);
    px(ctx, 8, 24, 8, 2, md);
    px(ctx, 9, 22, 6, 2, md);
    px(ctx, 8, 28, 8, 2, dk);

    px(ctx, 6, 20, 12, 2, dk);
    px(ctx, 7, 18, 10, 2, md);
    px(ctx, 8, 16, 8, 2, lt);

    px(ctx, 7, 14, 10, 2, dk);
    px(ctx, 8, 12, 8, 2, md);
    px(ctx, 9, 10, 6, 2, lt);

    px(ctx, 9, 8, 6, 2, md);
    px(ctx, 10, 6, 4, 2, lt);
    px(ctx, 11, 4, 2, 2, lt);
}

function drawOak(ctx) {
    shadow(ctx, 8, 54, 32, 6);
    var dk = '#060606';
    var md = '#0e0e0e';
    var lt = '#141414';

    px(ctx, 11, 28, 2, 12, '#0a0a0a');

    px(ctx, 5, 14, 14, 4, dk);
    px(ctx, 4, 10, 16, 4, md);
    px(ctx, 6, 6, 12, 4, md);
    px(ctx, 7, 4, 10, 2, lt);
    px(ctx, 3, 16, 4, 2, dk);
    px(ctx, 17, 16, 4, 2, dk);

    px(ctx, 6, 8, 2, 2, lt);
    px(ctx, 14, 6, 2, 2, lt);
    px(ctx, 4, 12, 2, 2, dk);
    px(ctx, 16, 10, 2, 2, dk);
}

// === CABIN ===

function drawCabinSprite(ctx) {
    var dk = '#0a0a0a';
    var md = '#121212';
    var lt = '#1a1a1a';

    shadow(ctx, 6, 66, 84, 6);

    px(ctx, 4, 16, 40, 18, dk);
    for (var i = 0; i < 6; i++) {
        var ly = 16 + i * 3;
        px(ctx, 4, ly, 40, 2, (i % 2 === 0) ? md : dk);
        px(ctx, 4, ly + 2, 40, 1, '#050505');
    }

    px(ctx, 3, 15, 2, 19, lt);
    px(ctx, 43, 15, 2, 19, lt);
    px(ctx, 3, 34, 42, 1, lt);

    px(ctx, 9, 22, 6, 12, '#030303');
    px(ctx, 8, 21, 8, 1, md);
    px(ctx, 8, 21, 1, 13, md);
    px(ctx, 15, 21, 1, 13, md);
    px(ctx, 14, 27, 1, 1, lt);

    px(ctx, 27, 21, 8, 6, '#060a10');
    px(ctx, 26, 20, 10, 1, md);
    px(ctx, 26, 27, 10, 1, md);
    px(ctx, 26, 20, 1, 8, md);
    px(ctx, 36, 20, 1, 8, md);
    px(ctx, 31, 20, 1, 8, md);
    px(ctx, 26, 23, 10, 1, md);

    for (var r = 0; r < 12; r++) {
        var p = r / 12;
        var halfW = 2 + p * 22;
        var rc = (Math.floor(r / 3) % 2 === 0) ? '#080808' : '#060606';
        px(ctx, Math.floor(24 - halfW), 4 + r, Math.ceil(halfW * 2), 1, rc);
    }
    px(ctx, 1, 16, 46, 1, '#0c0c0c');

    px(ctx, 36, 0, 4, 8, md);
    px(ctx, 35, 0, 6, 2, lt);
    px(ctx, 37, 2, 2, 5, lt);
}

// === PROPS ===

function drawCampfireSprite(ctx) {
    px(ctx, 2, 6, 2, 2, '#121212');
    px(ctx, 4, 8, 2, 2, '#121212');
    px(ctx, 8, 8, 2, 2, '#121212');
    px(ctx, 10, 6, 2, 2, '#121212');
    px(ctx, 3, 10, 2, 1, '#0e0e0e');
    px(ctx, 9, 10, 2, 1, '#0e0e0e');
    px(ctx, 5, 4, 1, 2, '#101010');
    px(ctx, 8, 4, 1, 2, '#101010');

    px(ctx, 5, 6, 4, 2, '#0a0a0a');
    px(ctx, 6, 5, 2, 1, '#0a0a0a');
}

function drawRockSprite(ctx) {
    shadow(ctx, 2, 14, 20, 4);
    var dk = '#1a1816';
    var md = '#242220';
    var lt = '#302c28';
    var hi = '#3a3630';
    px(ctx, 1, 4, 10, 6, md);
    px(ctx, 2, 3, 8, 2, lt);
    px(ctx, 2, 5, 4, 3, lt);
    px(ctx, 0, 8, 2, 2, dk);
    px(ctx, 10, 6, 1, 3, dk);
    px(ctx, 4, 4, 3, 2, hi);
}

function drawBoulderSprite(ctx) {
    shadow(ctx, 6, 44, 52, 8);
    var dk = '#1a1816';
    var md = '#282420';
    var lt = '#343028';
    var hi = '#403830';
    var hi2 = '#4a4238';
    px(ctx, 8, 8, 48, 36, md);
    px(ctx, 12, 4, 40, 8, md);
    px(ctx, 16, 2, 28, 4, lt);
    px(ctx, 4, 16, 8, 24, dk);
    px(ctx, 52, 16, 4, 20, dk);
    px(ctx, 10, 6, 18, 10, lt);
    px(ctx, 14, 4, 12, 4, hi);
    px(ctx, 30, 8, 16, 8, lt);
    px(ctx, 34, 6, 10, 4, hi);
    px(ctx, 12, 18, 2, 16, dk);
    px(ctx, 36, 14, 2, 20, dk);
    px(ctx, 24, 10, 2, 28, dk);
    px(ctx, 8, 26, 48, 2, dk);
    px(ctx, 16, 16, 6, 8, hi);
    px(ctx, 40, 12, 8, 6, hi);
    px(ctx, 28, 20, 6, 6, lt);
    px(ctx, 6, 38, 52, 6, dk);
    px(ctx, 10, 40, 44, 4, md);
    px(ctx, 20, 2, 4, 2, hi2);
    px(ctx, 42, 6, 4, 2, hi2);
    px(ctx, 48, 20, 6, 4, dk);
    px(ctx, 6, 12, 4, 6, dk);
    px(ctx, 16, 8, 4, 2, hi2);
    px(ctx, 38, 10, 6, 2, hi2);
    px(ctx, 22, 14, 4, 4, hi);
    px(ctx, 44, 18, 4, 4, lt);
}

function drawLogPileSprite(ctx) {
    shadow(ctx, 2, 22, 44, 4);
    var dk = '#080808';
    var md = '#101010';
    var lt = '#161616';
    for (var row = 0; row < 3; row++) {
        for (var i = 0; i < 4 - row; i++) {
            var lx = 2 + i * 5 + row * 3;
            var ly = 10 - row * 4;
            px(ctx, lx, ly, 5, 3, dk);
            px(ctx, lx + 1, ly + 1, 3, 1, md);
            px(ctx, lx, ly + 1, 1, 1, dk);
        }
    }
}

function drawStumpSprite(ctx) {
    shadow(ctx, 2, 16, 18, 4);
    var dk = '#080808';
    var md = '#101010';
    var lt = '#181818';
    px(ctx, 2, 5, 7, 5, dk);
    px(ctx, 3, 4, 5, 1, md);
    px(ctx, 3, 3, 5, 1, lt);
    px(ctx, 4, 3, 3, 1, lt);
    px(ctx, 5, 3, 1, 1, md);

    px(ctx, 9, 0, 1, 6, '#101010');
    px(ctx, 8, 0, 3, 2, '#141414');
}

function drawBushSprite(ctx) {
    shadow(ctx, 4, 18, 22, 4);
    var dk = '#060606';
    var md = '#0e0e0e';
    var lt = '#141414';
    px(ctx, 2, 5, 11, 5, dk);
    px(ctx, 3, 3, 9, 2, md);
    px(ctx, 4, 2, 7, 1, lt);
    px(ctx, 1, 8, 3, 2, dk);
    px(ctx, 11, 7, 3, 2, dk);
}

function drawBushBerrySprite(ctx) {
    shadow(ctx, 4, 18, 22, 4);
    var dk = '#060606';
    var md = '#0e0e0e';
    var lt = '#141414';
    px(ctx, 2, 5, 11, 5, dk);
    px(ctx, 3, 3, 9, 2, md);
    px(ctx, 4, 2, 7, 1, lt);
    px(ctx, 1, 8, 3, 2, dk);
    px(ctx, 11, 7, 3, 2, dk);
    px(ctx, 4, 4, 1, 1, '#8b3030');
    px(ctx, 7, 3, 1, 1, '#9a3838');
    px(ctx, 10, 5, 1, 1, '#8b3030');
    px(ctx, 5, 6, 1, 1, '#9a3838');
    px(ctx, 9, 7, 1, 1, '#8b3030');
    px(ctx, 3, 8, 1, 1, '#9a3838');
    px(ctx, 12, 6, 1, 1, '#8b3030');
    px(ctx, 6, 5, 1, 1, '#923232');
}

function drawHerbVikosSprite(ctx) {
    shadow(ctx, 6, 18, 12, 3);
    px(ctx, 7, 16, 1, 3, '#2a4a1a');
    px(ctx, 4, 13, 3, 2, '#3a6a28');
    px(ctx, 8, 12, 3, 2, '#3a6a28');
    px(ctx, 6, 10, 3, 2, '#3a6a28');
    px(ctx, 4, 12, 1, 1, '#4a8a38');
    px(ctx, 9, 11, 1, 1, '#4a8a38');
    px(ctx, 7, 9, 1, 1, '#4a8a38');
}

// === INTERIOR OBJECTS ===

function drawFireplaceSprite(ctx) {
    px(ctx, 0, 0, 16, 2, '#1e1c18');
    px(ctx, 1, 0, 14, 1, '#242018');
    px(ctx, 0, 2, 16, 12, '#161614');
    px(ctx, 1, 3, 14, 10, '#121210');
    px(ctx, 1, 4, 2, 3, '#1a1a18');
    px(ctx, 13, 4, 2, 3, '#1a1a18');
    px(ctx, 1, 8, 2, 3, '#181816');
    px(ctx, 13, 8, 2, 3, '#181816');
    px(ctx, 3, 4, 10, 8, '#040404');
    px(ctx, 4, 3, 8, 1, '#060606');
    px(ctx, 5, 10, 6, 1, '#2a1808');
    px(ctx, 6, 9, 4, 1, '#3a2010');
    px(ctx, 7, 8, 2, 1, '#4a2810');
    px(ctx, 6, 7, 1, 2, '#3a2010');
    px(ctx, 9, 7, 1, 2, '#3a2010');
    px(ctx, 8, 6, 1, 2, '#4a2810');
    px(ctx, 7, 9, 1, 1, '#5a3018');
    px(ctx, 2, 12, 12, 1, '#181816');
    px(ctx, 0, 13, 16, 1, '#1e1c18');
}

function drawBedSprite(ctx) {
    px(ctx, 0, 0, 20, 3, '#121008');
    px(ctx, 1, 0, 18, 1, '#1a1610');
    px(ctx, 0, 2, 20, 1, '#0c0a06');
    px(ctx, 1, 3, 18, 8, '#161210');
    px(ctx, 2, 3, 7, 3, '#2a2820');
    px(ctx, 3, 3, 5, 1, '#302e26');
    px(ctx, 2, 5, 7, 1, '#222018');
    px(ctx, 1, 6, 18, 5, '#141008');
    px(ctx, 2, 7, 16, 1, '#1a1610');
    px(ctx, 2, 9, 16, 1, '#1a1610');
    px(ctx, 0, 11, 20, 1, '#0e0c08');
    px(ctx, 0, 3, 1, 9, '#0e0c08');
    px(ctx, 19, 3, 1, 9, '#0e0c08');
}

function drawCabinetSprite(ctx) {
    px(ctx, 0, 0, 14, 2, '#181410');
    px(ctx, 1, 0, 12, 1, '#1c1a14');
    px(ctx, 0, 2, 14, 9, '#0e0c08');
    px(ctx, 1, 2, 5, 8, '#0a0808');
    px(ctx, 8, 2, 5, 8, '#0a0808');
    px(ctx, 1, 2, 5, 1, '#141210');
    px(ctx, 8, 2, 5, 1, '#141210');
    px(ctx, 1, 9, 5, 1, '#141210');
    px(ctx, 8, 9, 5, 1, '#141210');
    px(ctx, 5, 5, 1, 2, '#1e1c18');
    px(ctx, 8, 5, 1, 2, '#1e1c18');
    px(ctx, 6, 2, 2, 8, '#121010');
    px(ctx, 0, 10, 14, 2, '#121010');
    px(ctx, 1, 11, 12, 1, '#0e0c08');
}

function drawCabinDoorSprite(ctx) {
    var md = '#141210';
    var lt = '#1c1a14';
    px(ctx, 2, 0, 8, 12, md);
    px(ctx, 1, 0, 1, 12, lt);
    px(ctx, 10, 0, 1, 12, lt);
    px(ctx, 1, 0, 10, 1, lt);
    px(ctx, 8, 5, 1, 2, '#1e1e1e');
}

function drawTableSprite(ctx) {
    px(ctx, 0, 0, 16, 2, '#201c14');
    px(ctx, 1, 0, 14, 1, '#241e16');
    px(ctx, 3, 0, 8, 1, '#201a12');
    px(ctx, 1, 2, 14, 1, '#161008');
    px(ctx, 1, 3, 2, 7, '#161008');
    px(ctx, 13, 3, 2, 7, '#161008');
    px(ctx, 1, 3, 2, 1, '#1a1410');
    px(ctx, 13, 3, 2, 1, '#1a1410');
    px(ctx, 3, 7, 10, 1, '#121008');
}

function drawShelfSprite(ctx) {
    px(ctx, 0, 0, 14, 10, '#0c0a08');
    px(ctx, 0, 4, 14, 1, '#1a1610');
    px(ctx, 0, 8, 14, 1, '#1a1610');
    px(ctx, 1, 4, 1, 4, '#141210');
    px(ctx, 12, 4, 1, 4, '#141210');
    px(ctx, 2, 1, 2, 3, '#181614');
    px(ctx, 2, 1, 2, 1, '#201c18');
    px(ctx, 5, 2, 3, 2, '#141210');
    px(ctx, 6, 1, 1, 1, '#1a1814');
    px(ctx, 9, 1, 3, 3, '#101010');
    px(ctx, 10, 1, 1, 1, '#181818');
    px(ctx, 2, 5, 2, 3, '#161412');
    px(ctx, 2, 5, 2, 1, '#1c1a16');
    px(ctx, 5, 6, 4, 2, '#121010');
    px(ctx, 5, 6, 1, 2, '#161412');
    px(ctx, 7, 6, 1, 2, '#141210');
    px(ctx, 10, 5, 2, 3, '#181614');
}

function drawCrateSprite(ctx) {
    px(ctx, 0, 1, 12, 9, '#141008');
    px(ctx, 0, 0, 12, 2, '#1a1610');
    px(ctx, 1, 0, 10, 1, '#201c14');
    px(ctx, 0, 3, 12, 1, '#100c06');
    px(ctx, 0, 6, 12, 1, '#100c06');
    px(ctx, 5, 1, 2, 9, '#1a1610');
    px(ctx, 1, 1, 1, 1, '#1e1c18');
    px(ctx, 10, 1, 1, 1, '#1e1c18');
    px(ctx, 1, 9, 1, 1, '#1e1c18');
    px(ctx, 10, 9, 1, 1, '#1e1c18');
    px(ctx, 0, 10, 12, 1, '#0e0a06');
}

function drawNoteSprite(ctx) {
    px(ctx, 0, 0, 7, 5, '#2a2820');
    px(ctx, 1, 1, 5, 1, '#1e1c14');
    px(ctx, 1, 3, 4, 1, '#1e1c14');
}

function drawBridgeSprite(ctx) {
    var dk = '#141008'; var md = '#1c1610'; var lt = '#241e14';
    // planks horizontal
    for (var i = 0; i < 5; i++) {
        var py = i * 6 + 1;
        px(ctx, 0, py, 16, 5, (i % 2 === 0) ? md : dk);
        px(ctx, 1, py, 14, 4, (i % 2 === 0) ? lt : md);
        px(ctx, 0, py + 4, 16, 1, '#0c0806');
    }
    // side rails
    px(ctx, 0, 0, 1, 32, '#1a1410');
    px(ctx, 15, 0, 1, 32, '#1a1410');
    // nail highlights
    px(ctx, 1, 2, 1, 1, '#302820');
    px(ctx, 14, 8, 1, 1, '#302820');
    px(ctx, 1, 14, 1, 1, '#302820');
    px(ctx, 14, 20, 1, 1, '#302820');
}

function drawBrokenBridgeSprite(ctx) {
    var dk = '#141008'; var md = '#1c1610'; var lt = '#241e14';
    // partial planks with gaps
    px(ctx, 0, 1, 16, 5, md);
    px(ctx, 1, 1, 14, 4, lt);
    px(ctx, 0, 5, 16, 1, '#0c0806');
    px(ctx, 0, 7, 8, 5, dk);
    px(ctx, 1, 7, 6, 4, md);
    // gap in middle
    px(ctx, 0, 13, 6, 5, md);
    px(ctx, 1, 13, 4, 4, lt);
    px(ctx, 12, 15, 4, 4, dk);
    // more planks
    px(ctx, 0, 25, 16, 5, md);
    px(ctx, 1, 25, 14, 4, lt);
    // rails broken
    px(ctx, 0, 0, 1, 12, '#1a1410');
    px(ctx, 15, 0, 1, 8, '#1a1410');
    px(ctx, 15, 24, 1, 8, '#1a1410');
}

function drawSteppingStonesSprite(ctx) {
    var dk = '#1a1816'; var md = '#282420'; var lt = '#343028';
    // stones in water
    px(ctx, 2, 2, 4, 3, md);
    px(ctx, 3, 2, 2, 2, lt);
    px(ctx, 10, 6, 5, 3, dk);
    px(ctx, 11, 6, 3, 2, md);
    px(ctx, 4, 11, 4, 3, md);
    px(ctx, 5, 11, 2, 2, lt);
    px(ctx, 11, 15, 3, 3, dk);
    px(ctx, 12, 15, 2, 2, md);
    px(ctx, 3, 20, 5, 3, md);
    px(ctx, 4, 20, 3, 2, lt);
    px(ctx, 10, 25, 4, 3, dk);
    px(ctx, 11, 25, 2, 2, md);
}

function drawShrineSprite(ctx) {
    shadow(ctx, 4, 38, 24, 4);
    var dk = '#1a1816'; var md = '#242220'; var lt = '#302c28';
    var hi = '#3a3630'; var hi2 = '#484440';
    // base platform
    px(ctx, 2, 34, 12, 2, dk);
    px(ctx, 1, 32, 14, 2, md);
    px(ctx, 2, 30, 12, 2, lt);
    // pillar body
    px(ctx, 4, 14, 8, 16, md);
    px(ctx, 5, 14, 6, 16, lt);
    px(ctx, 3, 28, 10, 2, dk);
    // glass niche (dark recess)
    px(ctx, 5, 18, 6, 6, '#060808');
    px(ctx, 6, 19, 4, 4, '#081010');
    // niche frame
    px(ctx, 5, 17, 6, 1, hi);
    px(ctx, 5, 24, 6, 1, hi);
    px(ctx, 5, 18, 1, 6, hi);
    px(ctx, 10, 18, 1, 6, hi);
    // roof / cap
    px(ctx, 3, 12, 10, 2, lt);
    px(ctx, 4, 10, 8, 2, hi);
    px(ctx, 5, 8, 6, 2, hi);
    // cross on top
    px(ctx, 7, 2, 2, 6, hi2);
    px(ctx, 5, 4, 6, 2, hi2);
    // highlights
    px(ctx, 6, 14, 1, 4, hi);
    px(ctx, 5, 30, 1, 2, hi);
    px(ctx, 10, 16, 1, 10, dk);
}

function drawCurseShrineSprite(ctx) {
    shadow(ctx, 4, 38, 24, 4);
    var dk = '#1a1020'; var md = '#221828'; var lt = '#2e2234';
    var hi = '#3a2e40'; var hi2 = '#4a3e50';
    px(ctx, 2, 34, 12, 2, dk);
    px(ctx, 1, 32, 14, 2, md);
    px(ctx, 2, 30, 12, 2, lt);
    px(ctx, 4, 14, 8, 16, md);
    px(ctx, 5, 14, 6, 16, lt);
    px(ctx, 3, 28, 10, 2, dk);
    px(ctx, 5, 18, 6, 6, '#0a0412');
    px(ctx, 6, 19, 4, 4, '#120820');
    px(ctx, 5, 17, 6, 1, hi);
    px(ctx, 5, 24, 6, 1, hi);
    px(ctx, 5, 18, 1, 6, hi);
    px(ctx, 10, 18, 1, 6, hi);
    px(ctx, 3, 12, 10, 2, lt);
    px(ctx, 4, 10, 8, 2, hi);
    px(ctx, 5, 8, 6, 2, hi);
    px(ctx, 7, 2, 2, 6, hi2);
    px(ctx, 5, 4, 6, 2, hi2);
    px(ctx, 6, 14, 1, 4, hi);
    px(ctx, 5, 30, 1, 2, hi);
    px(ctx, 10, 16, 1, 10, dk);
}

function drawCairnSprite(ctx) {
    shadow(ctx, 3, 26, 18, 4);
    var dk = '#1a1816'; var md = '#242220'; var lt = '#302c28';
    var hi = '#3a3630'; var hi2 = '#484440';
    px(ctx, 2, 20, 8, 3, dk);
    px(ctx, 1, 18, 10, 2, md);
    px(ctx, 3, 22, 6, 2, dk);
    px(ctx, 3, 16, 8, 2, md);
    px(ctx, 2, 14, 8, 2, lt);
    px(ctx, 4, 12, 6, 2, md);
    px(ctx, 3, 10, 6, 2, lt);
    px(ctx, 5, 8, 4, 2, md);
    px(ctx, 4, 6, 4, 2, lt);
    px(ctx, 5, 4, 2, 2, hi);
    px(ctx, 2, 18, 1, 2, hi);
    px(ctx, 4, 14, 1, 2, hi);
    px(ctx, 5, 10, 1, 2, hi2);
    px(ctx, 5, 6, 1, 1, hi2);
    px(ctx, 9, 16, 1, 2, dk);
    px(ctx, 8, 12, 1, 2, dk);
}

function drawWindowSprite(ctx) {
    px(ctx, 0, 0, 14, 11, '#161412');
    px(ctx, 1, 1, 5, 4, '#0c1420');
    px(ctx, 8, 1, 5, 4, '#0c1420');
    px(ctx, 1, 6, 5, 4, '#0a1018');
    px(ctx, 8, 6, 5, 4, '#0a1018');
    px(ctx, 6, 0, 2, 11, '#1a1816');
    px(ctx, 0, 5, 14, 1, '#1a1816');
    px(ctx, 2, 2, 2, 1, '#142030');
    px(ctx, 9, 2, 2, 1, '#142030');
    px(ctx, 0, 10, 14, 1, '#1e1c18');
}

function drawShadowSprite(ctx) {
    px(ctx, 3, 0, 4, 3, '#0a0a14');
    px(ctx, 2, 3, 6, 2, '#08080f');
    px(ctx, 3, 5, 4, 4, '#0a0a14');
    px(ctx, 2, 7, 6, 5, '#06060c');
    px(ctx, 1, 10, 8, 4, '#08080f');
    px(ctx, 2, 14, 2, 5, '#06060c');
    px(ctx, 6, 14, 2, 5, '#06060c');
    px(ctx, 3, 14, 4, 3, '#04040a');
    px(ctx, 3, 1, 1, 1, '#1a1a30');
    px(ctx, 5, 1, 1, 1, '#1a1a30');
}

function drawFatesSprite(ctx) {
    for (var fi = 0; fi < 3; fi++) {
        var ox = fi * 14;
        px(ctx, ox + 5, 0, 4, 3, '#1a1a1a');
        px(ctx, ox + 4, 1, 6, 2, '#1a1a1a');
        px(ctx, ox + 5, 1, 4, 2, '#3a3028');
        px(ctx, ox + 5, 3, 4, 2, '#1a1a1a');
        px(ctx, ox + 4, 5, 6, 8, '#0e0e0e');
        px(ctx, ox + 3, 7, 8, 6, '#0e0e0e');
        px(ctx, ox + 3, 13, 2, 5, '#0e0e0e');
        px(ctx, ox + 9, 13, 2, 5, '#0e0e0e');
        px(ctx, ox + 5, 13, 4, 5, '#0a0a0a');
        px(ctx, ox + 2, 16, 10, 2, '#0a0a0a');
        px(ctx, ox + 6, 1, 1, 1, '#c8b8a0');
        px(ctx, ox + 8, 1, 1, 1, '#c8b8a0');
    }
}

// === INIT ===

TWB.initSprites = function() {
    var i;
    TWB.Sprites.ground = {};
    TWB.Sprites.ground[TWB.T_GRASS1] = makeCanvas(32, 32, function(c) { drawGrass(c, 0); });
    TWB.Sprites.ground[TWB.T_GRASS2] = makeCanvas(32, 32, function(c) { drawGrass(c, 1); });
    TWB.Sprites.ground[TWB.T_GRASS3] = makeCanvas(32, 32, function(c) { drawGrass(c, 2); });
    TWB.Sprites.ground[TWB.T_DIRT] = makeCanvas(32, 32, drawDirt);
    TWB.Sprites.ground[TWB.T_WATER] = makeCanvas(32, 32, function(c) { drawWater(c, false); });
    TWB.Sprites.ground[TWB.T_WATER_DEEP] = makeCanvas(32, 32, function(c) { drawWater(c, true); });
    TWB.Sprites.ground[TWB.T_SHORE] = makeCanvas(32, 32, drawShore);
    TWB.Sprites.ground[TWB.T_FLOOR] = makeCanvas(32, 32, drawFloor);
    TWB.Sprites.ground[TWB.T_WALL] = makeCanvas(32, 32, drawWall);
    TWB.Sprites.ground[TWB.T_SNOW1] = makeCanvas(32, 32, function(c) { drawSnow(c, 0); });
    TWB.Sprites.ground[TWB.T_SNOW2] = makeCanvas(32, 32, function(c) { drawSnow(c, 1); });
    TWB.Sprites.ground[TWB.T_SNOW_DIRT] = makeCanvas(32, 32, drawSnowDirt);

    TWB.Sprites.charDown = [];
    TWB.Sprites.charUp = [];
    TWB.Sprites.charLeft = [];
    TWB.Sprites.charRight = [];
    TWB.Sprites.wolfDown = [];
    TWB.Sprites.wolfUp = [];
    TWB.Sprites.wolfLeft = [];
    TWB.Sprites.wolfRight = [];

    for (i = 0; i < 3; i++) {
        TWB.Sprites.charDown.push(makeCharSprite(0, i));
        TWB.Sprites.charUp.push(makeCharSprite(1, i));
        TWB.Sprites.charLeft.push(makeCharSprite(2, i));
        TWB.Sprites.wolfDown.push(makeWolfSprite(0, i));
        TWB.Sprites.wolfUp.push(makeWolfSprite(1, i));
        TWB.Sprites.wolfLeft.push(makeWolfSprite(2, i));
    }
    for (i = 0; i < 3; i++) {
        TWB.Sprites.charRight.push(flipH(TWB.Sprites.charLeft[i]));
        TWB.Sprites.wolfRight.push(flipH(TWB.Sprites.wolfLeft[i]));
    }

    TWB.Sprites.tree_pine = makeCanvas(48, 80, drawPine);
    TWB.Sprites.tree_oak = makeCanvas(48, 64, drawOak);
    TWB.Sprites.cabin = TWB.Resources.spr_cabin || makeCanvas(96, 72, drawCabinSprite);
    TWB.Sprites.campfire = makeCanvas(28, 24, drawCampfireSprite);
    TWB.Sprites.rock = makeCanvas(24, 20, drawRockSprite);
    TWB.Sprites.boulder = makeCanvas(64, 52, drawBoulderSprite);
    TWB.Sprites.log_pile = makeCanvas(48, 28, drawLogPileSprite);
    TWB.Sprites.stump = makeCanvas(22, 20, drawStumpSprite);
    TWB.Sprites.bush = makeCanvas(30, 24, drawBushSprite);
    TWB.Sprites.bush_berry = makeCanvas(30, 24, drawBushBerrySprite);
    TWB.Sprites.herb_vikos = makeCanvas(16, 22, drawHerbVikosSprite);
    TWB.Sprites.trap = makeCanvas(20, 16, function(ctx) {
        shadow(ctx, 3, 12, 14, 3);
        px(ctx, 1, 4, 8, 1, '#2a2a20');
        px(ctx, 1, 5, 1, 3, '#2a2a20');
        px(ctx, 8, 5, 1, 3, '#2a2a20');
        px(ctx, 3, 2, 4, 2, '#1a1a14');
        px(ctx, 2, 6, 6, 1, '#1a1a14');
    });
    TWB.Sprites.fireplace = makeCanvas(32, 28, drawFireplaceSprite);
    TWB.Sprites.bed = TWB.Resources.spr_bed || makeCanvas(40, 24, drawBedSprite);
    TWB.Sprites.cabinet = TWB.Resources.spr_cabinet || makeCanvas(28, 24, drawCabinetSprite);
    TWB.Sprites.cabin_door = TWB.Resources.spr_door || makeCanvas(24, 24, drawCabinDoorSprite);
    TWB.Sprites.table = TWB.Resources.spr_table || makeCanvas(32, 22, drawTableSprite);
    TWB.Sprites.shelf = makeCanvas(28, 20, drawShelfSprite);
    TWB.Sprites.crate = makeCanvas(24, 22, drawCrateSprite);
    TWB.Sprites.note = makeCanvas(14, 10, drawNoteSprite);
    TWB.Sprites.cabin_window = makeCanvas(28, 22, drawWindowSprite);
    TWB.Sprites.cairn = makeCanvas(24, 30, drawCairnSprite);
    TWB.Sprites.shrine = makeCanvas(32, 44, drawShrineSprite);
    TWB.Sprites.curse_shrine = makeCanvas(32, 44, drawCurseShrineSprite);
    TWB.Sprites.bridge = makeCanvas(32, 32, drawBridgeSprite);
    TWB.Sprites.broken_bridge = makeCanvas(32, 32, drawBrokenBridgeSprite);
    TWB.Sprites.stepping_stones = makeCanvas(32, 32, drawSteppingStonesSprite);
    TWB.Sprites.fates = makeCanvas(84, 36, drawFatesSprite);
    TWB.Sprites.shadow = makeCanvas(20, 38, drawShadowSprite);

    for (var name in TWB.Resources) {
        if (TWB.Resources.hasOwnProperty(name)) {
            TWB.Sprites[name] = TWB.Resources[name];
        }
    }
};

TWB.getSpriteAnchor = function(type) {
    if (TWB._imageAnchors && TWB._imageAnchors[type]) {
        return TWB._imageAnchors[type];
    }
    switch (type) {
        case 'tree_pine': return { x: 24, y: 72 };
        case 'tree_oak': return { x: 24, y: 56 };
        case 'cabin': return TWB.Resources.spr_cabin ? { x: 48, y: 100 } : { x: 48, y: 64 };
        case 'campfire': return { x: 14, y: 18 };
        case 'rock': return { x: 12, y: 16 };
        case 'boulder': return { x: 32, y: 44 };
        case 'log_pile': return { x: 24, y: 24 };
        case 'stump': return { x: 11, y: 16 };
        case 'bush': return { x: 15, y: 18 };
        case 'bush_berry': return { x: 15, y: 18 };
        case 'herb_vikos': return { x: 8, y: 18 };
        case 'trap': return { x: 10, y: 12 };
        case 'fireplace': return { x: 16, y: 26 };
        case 'bed': return TWB.Resources.spr_bed ? { x: 20, y: 53 } : { x: 20, y: 20 };
        case 'cabinet': return TWB.Resources.spr_cabinet ? { x: 14, y: 22 } : { x: 14, y: 20 };
        case 'cabin_door': return TWB.Resources.spr_door ? { x: 12, y: 30 } : { x: 12, y: 20 };
        case 'table': return TWB.Resources.spr_table ? { x: 16, y: 16 } : { x: 16, y: 18 };
        case 'shelf': return { x: 14, y: 16 };
        case 'crate': return { x: 12, y: 18 };
        case 'note': return { x: 7, y: 8 };
        case 'cabin_window': return { x: 14, y: 18 };
        case 'cairn': return { x: 12, y: 26 };
        case 'shrine': return { x: 16, y: 38 };
        case 'curse_shrine': return { x: 16, y: 38 };
        case 'bridge': return { x: 16, y: 16 };
        case 'broken_bridge': return { x: 16, y: 16 };
        case 'stepping_stones': return { x: 16, y: 16 };
        default: return { x: 0, y: 0 };
    }
};

window.TWB = TWB;
