var TWB = window.TWB || {};

// === CAMERA ===

TWB.Camera = function(vw, vh) {
    this.x = 0;
    this.y = 0;
    this.vw = vw;
    this.vh = vh;
};

TWB.Camera.prototype.follow = function(tx, ty) {
    var dx = (tx - this.vw / 2) - this.x;
    var dy = (ty - this.vh / 2) - this.y;
    this.x += dx * 0.08;
    this.y += dy * 0.08;
    this.x = Math.max(0, Math.min(TWB.WORLD_W - this.vw, this.x));
    this.y = Math.max(0, Math.min(TWB.WORLD_H - this.vh, this.y));
};

TWB.Camera.prototype.screenToWorld = function(sx, sy) {
    return { x: sx + this.x, y: sy + this.y };
};

// === ENTITY ===

TWB.Entity = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.tx = x;
    this.ty = y;
    this.dir = 0;
    this.frame = 0;
    this.animTimer = 0;
    this.moving = false;
};

TWB.Entity.prototype.setTarget = function(wx, wy) {
    this.tx = wx;
    this.ty = wy;
    this.moving = true;
};

TWB.Entity.prototype.update = function(objects) {
    var dx = this.tx - this.x;
    var dy = this.ty - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3) {
        this.moving = false;
        this.frame = 0;
        return;
    }

    this.moving = true;
    var nx = dx / dist;
    var ny = dy / dist;
    var newX = this.x + nx * this.speed;
    var newY = this.y + ny * this.speed;

    var canX = TWB.isWalkable(newX, this.y) && !this.hitsObject(newX, this.y, objects);
    var canY = TWB.isWalkable(this.x, newY) && !this.hitsObject(this.x, newY, objects);

    if (canX) this.x = newX;
    if (canY) this.y = newY;

    if (!canX && !canY) {
        this.moving = false;
        this.frame = 0;
        this.tx = this.x;
        this.ty = this.y;
        return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
        this.dir = dx > 0 ? 3 : 2;
    } else {
        this.dir = dy > 0 ? 0 : 1;
    }

    this.animTimer++;
    if (this.animTimer >= 10) {
        this.animTimer = 0;
        this.frame = this.frame === 1 ? 2 : 1;
    }
};

TWB.Entity.prototype.hitsObject = function(wx, wy, objects) {
    for (var i = 0; i < objects.length; i++) {
        var o = objects[i];
        if (!o.solid) continue;
        if (this.noTreeCollision && (o.type === 'tree_pine' || o.type === 'tree_oak' || o.type === 'bush' || o.type === 'bush_berry' || o.type === 'rock' || o.type === 'stump')) continue;
        if (o.colR) {
            var dx = wx - o.x;
            var dy = wy - o.y;
            if (dx * dx + dy * dy < o.colR * o.colR) return true;
        } else if (o.colW) {
            var ox = o.x + (o.colOx || 0);
            var oy = o.y + (o.colOy || 0);
            if (wx > ox && wx < ox + o.colW && wy > oy && wy < oy + o.colH) return true;
        }
    }
    return false;
};

// === INTERACTIONS ===

TWB.INTERACT_RANGE = 128;

TWB.ACTIONS = {
    tree_pine: [
        { label: 'Chop wood', action: 'chop' },
        { label: 'Gather sticks', action: 'gather' }
    ],
    tree_oak: [
        { label: 'Chop wood', action: 'chop' },
        { label: 'Gather acorns', action: 'gather' }
    ],
    rock: [
        { label: 'Mine stone', action: 'mine' }
    ],
    boulder: [
        { label: 'Mine stone', action: 'mine_boulder' }
    ],
    bush: [
        { label: 'Search bush', action: 'search' }
    ],
    bush_berry: [
        { label: 'Pick berries', action: 'pick_berries' }
    ],
    campfire: [
        { label: 'Cook food', action: 'cook' },
        { label: 'Add wood', action: 'addwood' },
        { label: 'Rest', action: 'rest' }
    ],
    log_pile: [],
    stump: [
        { label: 'Dig out roots', action: 'dig' }
    ],
    cabin: [
        { label: 'Enter cabin', action: 'enter_cabin' },
        { label: 'Search outside', action: 'search' }
    ],
    fireplace: [
        { label: 'Add wood', action: 'add_fp_wood' },
        { label: 'Cook food', action: 'cook_fp' }
    ],
    bed: [
        { label: 'Sleep', action: 'sleep' }
    ],
    cabinet: [
        { label: 'Search cabinets', action: 'search_cabinet' }
    ],
    cabin_door: [
        { label: 'Go outside', action: 'exit_cabin' },
        { label: 'Barricade door', action: 'barricade' },
        { label: 'Open to stranger', action: 'open_stranger' }
    ],
    table: [
        { label: 'Examine', action: 'examine' }
    ],
    shelf: [
        { label: 'Search shelf', action: 'search_cabinet' }
    ],
    crate: [
        { label: 'Open crate', action: 'search_cabinet' }
    ],
    note: [
        { label: 'Read', action: 'read_note' }
    ],
    cabin_window: [
        { label: 'Look outside', action: 'look_window' },
        { label: 'Throw meat out', action: 'throw_meat' },
        { label: 'Repair cabin', action: 'repair_cabin' }
    ],
    river_spot: [
        { label: 'Drink water', action: 'drink' },
        { label: 'Fill canteen', action: 'fill' },
        { label: 'Wolf drinks', action: 'wolf_drink' }
    ],
    trap: [
        { label: 'Check trap', action: 'check_trap' },
        { label: 'Pick up trap', action: 'pickup_trap' }
    ],
    cairn: [
        { label: 'Read markings', action: 'read_cairn' }
    ],
    shrine: [
        { label: 'Light kandili', action: 'light_kandili' },
        { label: 'Pray', action: 'pray_shrine' }
    ],
    broken_bridge: [
        { label: 'Repair bridge', action: 'repair_bridge' }
    ],
    bridge: [
        { label: 'Cross bridge', action: 'cross_bridge' }
    ],
    stepping_stones: [
        { label: 'Cross stones', action: 'cross_stones' }
    ]
};

// === GAME ===

TWB.Game = function(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.camera = new TWB.Camera(canvas.width, canvas.height);
    this.objects = TWB.generateObjects();

    var sc = TWB._cabinData[TWB._startCabin];
    var startX = sc.cx * TWB.TILE;
    var startY = (sc.cy + 4) * TWB.TILE;
    this.player = new TWB.Entity(startX, startY, TWB.PLAYER_SPEED);
    this.wolf = new TWB.Entity(startX + 30, startY + 20, TWB.WOLF_SPEED);
    this.wolf.noTreeCollision = true;

    this.camera.x = startX - canvas.width / 2;
    this.camera.y = startY - canvas.height / 2;

    this.fireTime = 0;
    this.menu = null;
    this.hoverObj = null;
    this.notification = null;

    this.stats = { energy: 100, health: 100, hunger: 100, thirst: 100 };
    this.wolfStats = { energy: 80, health: 100, hunger: 80, thirst: 80, mood: 'Loyal' };
    this.backpack = [null, null, null, null, null, null, null, null, null, null];
    this.backpackOpen = false;
    this.backpackHover = -1;
    this.backpackBtnHover = null;
    this.indoors = false;
    this.outdoorState = null;
    this.cabinSearches = {};
    this.currentCabinIdx = -1;
    this.readingNote = null;
    this.windowView = null;
    this.lighterFound = false;
    this.mapOpen = false;
    this.fireplaceFuel = 0;
    this.gameTime = 8 * 3600;
    this.fireFuel = 80;
    this.craftingOpen = false;
    this.craftHover = -1;
    this.flashlightOn = true;
    this.logPileTakes = 0;
    this.raining = false;
    this.rainTimer = 3600 + Math.floor(Math.random() * 7200);
    this.rainDrops = [];
    this.rainDay = -1;

    this.wildlife = [];
    this.wildlifeTimer = 600 + Math.floor(Math.random() * 1200);
    this.wolfHunting = null;
    this.predator = null;
    this.fleeing = false;
    this.victory = false;
    this.victoryTimer = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.deathCause = '';
    this.cheatBuffer = '';

    this.shadows = [];
    this.shadowSpawnTimer = 0;
    this.nightActive = false;
    this.barricaded = false;
    this.cabinEvent = null;
    this.cabinEventTimer = 0;
    this.doorShake = 0;

    this.nightType = null;
    this.nightDay = -1;
    this.stranger = null;
    this.strangerUsed = {};
    this.wolfSiege = false;
    this.wolfSiegePack = [];
    this.windowShadowTimer = 0;
    this.shadowBreaching = false;

    this.wetness = 0;
    this.windSpeed = 0;
    this.windTimer = 0;
    this.dogSense = null;

    this.foggy = false;
    this.fogTimer = 7200 + Math.floor(Math.random() * 10800);
    this.fogDensity = 0;
    this.lastKnownMapPos = null;

    this.fates = null;
    this.fatesTimer = 3600 + Math.floor(Math.random() * 7200);
    this.fatesCooldown = 0;
    this.fatesQuestions = [
        { q: 'What has roots that nobody sees,\nis taller than trees?', a: ['A mountain', 'The sea'], correct: 0 },
        { q: 'I speak without a mouth\nand hear without ears.\nWhat am I?', a: ['An echo', 'The wind'], correct: 0 },
        { q: 'The more you take,\nthe more you leave behind.\nWhat are they?', a: ['Footsteps', 'Memories'], correct: 0 },
        { q: 'What can fill a room\nbut takes no space?', a: ['Light', 'Silence'], correct: 0 },
        { q: 'I have cities but no houses,\nforests but no trees.\nWhat am I?', a: ['A map', 'A dream'], correct: 0 },
        { q: 'What walks on four legs at dawn,\ntwo at noon, three at dusk?', a: ['Man', 'Time'], correct: 0 },
        { q: 'I am not alive, but I grow.\nI have no lungs, but I need air.\nWhat am I?', a: ['Fire', 'A shadow'], correct: 0 },
        { q: 'What is always coming\nbut never arrives?', a: ['Tomorrow', 'Death'], correct: 0 },
        { q: 'What can travel the world\nwhile staying in a corner?', a: ['A stamp', 'A thought'], correct: 0 },
        { q: 'What breaks but never falls,\nand falls but never breaks?', a: ['Day and night', 'Hope and rain'], correct: 0 }
    ];

    this.setupInput();
};

TWB.Game.prototype.setupInput = function() {
    var self = this;

    this.canvas.addEventListener('mousemove', function(e) {
        var rect = self.canvas.getBoundingClientRect();
        var sx = (e.clientX - rect.left) * (self.canvas.width / rect.width);
        var sy = (e.clientY - rect.top) * (self.canvas.height / rect.height);

        if (self.fates && self.fates.fade >= 1) {
            var fw = 340, fh = 220;
            var fx = (self.canvas.width - fw) / 2;
            var fy = (self.canvas.height - fh) / 2;
            var btnW = 140, btnH = 30;
            var btnY = fy + fh - 52;
            var btn1x = fx + fw / 2 - btnW - 10;
            var btn2x = fx + fw / 2 + 10;
            self.fates.hovered = -1;
            if (sy >= btnY && sy <= btnY + btnH) {
                if (sx >= btn1x && sx <= btn1x + btnW) self.fates.hovered = 0;
                if (sx >= btn2x && sx <= btn2x + btnW) self.fates.hovered = 1;
            }
            self.canvas.style.cursor = self.fates.hovered >= 0 ? 'pointer' : 'default';
            return;
        }

        if (self.backpackOpen) {
            var si = self.getBackpackSlotAt(sx, sy);
            if (si >= 0 || self.getBackpackBtnAt(sx, sy)) {
                self.canvas.style.cursor = 'pointer';
            } else {
                self.canvas.style.cursor = 'default';
            }
            if (self.backpackHover >= 0) {
                self.backpackBtnHover = self.getBackpackBtnAt(sx, sy);
            }
            return;
        }

        if (self.menu) {
            self.menu.hovered = self.getMenuItemAt(sx, sy);
            return;
        }

        var w = self.camera.screenToWorld(sx, sy);
        var obj = self.findObjectAt(w.x, w.y);
        if (obj && TWB.ACTIONS[obj.type] && self.isInRange(obj)) {
            self.hoverObj = obj;
            self.canvas.style.cursor = 'pointer';
        } else if (!TWB.indoors && self.isNearWater(w.x, w.y) && self.isInRange({ x: w.x, y: w.y })) {
            self.hoverObj = null;
            self.canvas.style.cursor = 'pointer';
        } else {
            self.hoverObj = null;
            self.canvas.style.cursor = 'crosshair';
        }
    });

    this.canvas.addEventListener('click', function(e) {
        if (self.windowView) { self.windowView = null; return; }
        if (self.readingNote) { self.readingNote = null; return; }
        if (self.victory || self.dead) return;
        var rect = self.canvas.getBoundingClientRect();
        var sx = (e.clientX - rect.left) * (self.canvas.width / rect.width);
        var sy = (e.clientY - rect.top) * (self.canvas.height / rect.height);

        if (self.fates && self.fates.fade >= 1) {
            var fw = 340, fh = 220;
            var fx = (self.canvas.width - fw) / 2;
            var fy = (self.canvas.height - fh) / 2;
            var btnW = 140, btnH = 30;
            var btnY = fy + fh - 52;
            var btn1x = fx + fw / 2 - btnW - 10;
            var btn2x = fx + fw / 2 + 10;
            if (sy >= btnY && sy <= btnY + btnH) {
                if (sx >= btn1x && sx <= btn1x + btnW) {
                    self.handleFatesAnswer(0);
                    return;
                }
                if (sx >= btn2x && sx <= btn2x + btnW) {
                    self.handleFatesAnswer(1);
                    return;
                }
            }
            return;
        }

        if (self.craftingOpen) {
            var ci = self.getCraftItemAt(sx, sy);
            if (ci >= 0) {
                self.tryCraft(ci);
            } else {
                self.craftingOpen = false;
            }
            return;
        }

        if (self.backpackOpen) {
            if (self.backpackHover >= 0 && self.backpack[self.backpackHover]) {
                var btnAction = self.getBackpackBtnAt(sx, sy);
                if (btnAction) {
                    var slot = self.backpack[self.backpackHover];
                    var label = TWB.ITEM_LABELS[slot.type] || slot.type;
                    var msg = '';
                    switch (btnAction) {
                        case 'eat':
                            var enGain = slot.type === 'food' ? 30 : (slot.type === 'canned_food' ? 20 : 5);
                            var hpGain = slot.type === 'food' ? 10 : (slot.type === 'canned_food' ? 8 : 2);
                            var hunGain = slot.type === 'food' ? 40 : (slot.type === 'canned_food' ? 30 : 8);
                            self.removeFromBackpack(slot.type, 1);
                            self.stats.energy = Math.min(100, self.stats.energy + enGain);
                            self.stats.health = Math.min(100, self.stats.health + hpGain);
                            self.stats.hunger = Math.min(100, self.stats.hunger + hunGain);
                            msg = 'Ate ' + label + ' (+' + hunGain + ' hunger)';
                            break;
                        case 'feed':
                            var wEnGain = slot.type === 'food' ? 25 : (slot.type === 'canned_food' ? 18 : 4);
                            var wHunGain = slot.type === 'food' ? 35 : (slot.type === 'canned_food' ? 25 : 6);
                            self.removeFromBackpack(slot.type, 1);
                            self.wolfStats.energy = Math.min(100, self.wolfStats.energy + wEnGain);
                            self.wolfStats.hunger = Math.min(100, self.wolfStats.hunger + wHunGain);
                            if (slot.type === 'food') self.wolfStats.mood = 'Happy';
                            msg = 'Fed ' + (self.dogName || 'wolf') + ' ' + label + ' (+' + wHunGain + ' hunger)';
                            break;
                        case 'drink_canteen':
                            self.removeFromBackpack('canteen_full', 1);
                            self.addToBackpack('canteen', 1);
                            self.stats.thirst = Math.min(100, self.stats.thirst + 35);
                            msg = 'Drank from canteen (+35 thirst)';
                            break;
                        case 'use_bandage':
                            self.removeFromBackpack('bandage', 1);
                            self.stats.health = Math.min(100, self.stats.health + 20);
                            msg = 'Used bandage (+20 HP)';
                            break;
                        case 'drop1':
                            self.removeFromBackpack(slot.type, 1);
                            msg = 'Dropped 1 ' + label;
                            break;
                        case 'dropall':
                            var count = slot.count;
                            self.removeFromBackpack(slot.type, count);
                            msg = 'Dropped ' + count + ' ' + label;
                            break;
                    }
                    self.notification = { text: msg, timer: 120 };
                    if (!self.backpack[self.backpackHover]) self.backpackHover = -1;
                    return;
                }
            }
            var si = self.getBackpackSlotAt(sx, sy);
            if (si >= 0) {
                self.backpackHover = (self.backpackHover === si) ? -1 : si;
                self.backpackBtnHover = null;
            } else {
                var l = self.getBackpackLayout();
                if (sx < l.px || sx > l.px + l.pw || sy < l.py || sy > l.py + l.ph) {
                    self.backpackOpen = false;
                    self.backpackHover = -1;
                }
            }
            return;
        }

        if (self.menu) {
            var idx = self.getMenuItemAt(sx, sy);
            if (idx >= 0) {
                self.executeAction(self.menu.obj, self.menu.items[idx]);
            }
            self.menu = null;
            return;
        }

        var w = self.camera.screenToWorld(sx, sy);

        var wolfDx = w.x - self.wolf.x;
        var wolfDy = w.y - self.wolf.y;
        if (Math.sqrt(wolfDx * wolfDx + wolfDy * wolfDy) < 20) {
            if (self.wolfHunting) {
                self.wolfHunting = null;
                self.wolfStats.mood = 'Loyal';
                self.notification = { text: 'Calm boy! ' + (self.dogName || 'Dog') + ' stopped hunting.', timer: 120 };
            } else {
                self.wolfStats.mood = 'Happy';
                self.wolfStats.energy = Math.min(100, self.wolfStats.energy + 5);
                self.notification = { text: 'You pet ' + (self.dogName || 'the dog') + '. Good boy!', timer: 120 };
            }
            return;
        }

        if (self.predator) {
            var pdx = w.x - self.predator.x;
            var pdy = w.y - self.predator.y;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < 30) {
                var pItems = [];
                if (self.getItemCount('knife') > 0) {
                    pItems.push({ label: 'Attack with knife', action: 'attack_knife' });
                }
                pItems.push({ label: 'Throw rock', action: 'throw_rock' });
                self.menu = {
                    obj: { type: 'predator_encounter', x: self.predator.x, y: self.predator.y },
                    items: pItems,
                    sx: sx, sy: sy,
                    hovered: -1
                };
                return;
            }
        }

        var obj = self.findObjectAt(w.x, w.y);

        if (obj && TWB.ACTIONS[obj.type] && self.isInRange(obj)) {
            self.openMenu(obj, sx, sy);
        } else if (!TWB.indoors && self.isNearWater(w.x, w.y)) {
            var waterObj = { type: 'river_spot', x: w.x, y: w.y, solid: false };
            if (self.isInRange(waterObj)) {
                self.openMenu(waterObj, sx, sy);
            } else {
                self.player.setTarget(w.x, w.y);
            }
        } else {
            self.player.setTarget(w.x, w.y);
        }
    });

    this.canvas.style.cursor = 'crosshair';

    this.canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (self.indoors || self.backpackOpen || self.menu || self.craftingOpen) return;
        var rect = self.canvas.getBoundingClientRect();
        var sx = (e.clientX - rect.left) * (self.canvas.width / rect.width);
        var sy = (e.clientY - rect.top) * (self.canvas.height / rect.height);
        var w = self.camera.screenToWorld(sx, sy);
        if (!self.isInRange({ x: w.x, y: w.y })) return;
        if (!TWB.isWalkable(w.x, w.y)) return;
        var obj = self.findObjectAt(w.x, w.y);
        if (obj && obj.type === 'trap') {
            self.openMenu(obj, sx, sy);
        } else {
            var items = [];
            if (self.getItemCount('trap') > 0) {
                items.push({ label: 'Place trap', action: 'place_trap' });
            }
            if (self.getItemCount('wood') > 0 || self.getItemCount('sticks') > 0) {
                items.push({ label: 'Light fire', action: 'light_fire' });
            }
            if (items.length > 0) {
                self.menu = {
                    obj: { type: 'ground_action', x: w.x, y: w.y },
                    items: items,
                    sx: sx, sy: sy,
                    hovered: -1
                };
            } else {
                self.notification = { text: 'Nothing to do here', timer: 60 };
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (self.windowView) {
            self.windowView = null;
            return;
        }
        if (self.readingNote) {
            self.readingNote = null;
            return;
        }
        if ((self.victory || self.dead) && (e.key === 'r' || e.key === 'R')) {
            location.reload();
            return;
        }
        if (self.victory || self.dead) return;
        if (e.key === 'Tab') {
            e.preventDefault();
            self.backpackOpen = !self.backpackOpen;
            self.backpackHover = -1;
            self.backpackBtnHover = null;
            if (self.backpackOpen) self.menu = null;
            if (self.backpackOpen) self.craftingOpen = false;
        }
        if (e.key === 'c' || e.key === 'C') {
            if (self.backpackOpen || self.menu) return;
            self.craftingOpen = !self.craftingOpen;
            self.craftHover = -1;
        }
        if (e.key === 'l' || e.key === 'L') {
            self.flashlightOn = !self.flashlightOn;
            self.notification = { text: 'Flashlight ' + (self.flashlightOn ? 'ON' : 'OFF'), timer: 60 };
        }
        if (e.key === 'm' || e.key === 'M') {
            if (self.backpackOpen || self.craftingOpen || self.menu) return;
            self.mapOpen = !self.mapOpen;
        }
        if (e.key >= '0' && e.key <= '9') {
            self.cheatBuffer = (self.cheatBuffer + e.key).slice(-6);
            if (self.cheatBuffer === '123456') {
                self.foggy = true;
                self.fogTimer = 9999;
                self.lastKnownMapPos = { x: self.player.x, y: self.player.y };
                self.notification = { text: 'Dense fog rolls in...', timer: 120 };
                self.cheatBuffer = '';
            }
        }
    });
};

TWB.Game.prototype.findObjectAt = function(wx, wy) {
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        if (!TWB.ACTIONS[obj.type]) continue;
        var dx = wx - obj.x;
        var dy = wy - obj.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var hitR = (obj.type === 'cabin') ? 60 :
                   (obj.type === 'boulder') ? 50 :
                   (obj.type === 'tree_oak') ? 50 :
                   (obj.type === 'tree_pine') ? 36 :
                   (obj.type === 'river_spot') ? 40 :
                   (obj.type === 'trap') ? 20 :
                   (obj.type === 'bush' || obj.type === 'bush_berry') ? 24 :
                   (obj.type === 'fireplace' || obj.type === 'cabinet' || obj.type === 'cabin_door') ? 28 :
                   (obj.type === 'bed') ? 32 :
                   (obj.type === 'table' || obj.type === 'shelf' || obj.type === 'crate') ? 28 :
                   (obj.type === 'note') ? 20 :
                   (obj.type === 'cabin_window') ? 28 :
                   (obj.type === 'cairn') ? 24 :
                   (obj.type === 'shrine') ? 28 :
                   (obj.type === 'bridge' || obj.type === 'broken_bridge' || obj.type === 'stepping_stones') ? 32 : 40;
        if (d < hitR && d < bestDist) {
            bestDist = d;
            best = obj;
        }
    }
    return best;
};

TWB.Game.prototype.isInRange = function(obj) {
    var dx = this.player.x - obj.x;
    var dy = this.player.y - obj.y;
    return Math.sqrt(dx * dx + dy * dy) < TWB.INTERACT_RANGE;
};

TWB.Game.prototype.isNearWater = function(wx, wy) {
    var tx = Math.floor(wx / TWB.TILE);
    var ty = Math.floor(wy / TWB.TILE);
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            var t = TWB.getGround(tx + dx, ty + dy);
            if (t === TWB.T_WATER) return true;
        }
    }
    return false;
};

TWB.Game.prototype.openMenu = function(obj, sx, sy) {
    var items = TWB.ACTIONS[obj.type];
    if (!items) return;
    var dn = this.dogName || 'Wolf';
    var resolved = [];
    for (var mi = 0; mi < items.length; mi++) {
        var it = items[mi];
        if (it.action === 'open_stranger' && !this.stranger) continue;
        if (it.action === 'throw_meat' && !this.wolfSiege) continue;
        if (it.action === 'repair_cabin') {
            if (this.currentCabinIdx < 0) continue;
            var cd = TWB._cabinData[this.currentCabinIdx];
            if (!cd.damaged || cd.repaired) continue;
        }
        resolved.push({ label: it.label.replace('Wolf', dn), action: it.action });
    }
    this.menu = {
        obj: obj,
        items: resolved,
        sx: sx,
        sy: sy,
        hovered: -1
    };
};

TWB.Game.prototype.getMenuItemAt = function(sx, sy) {
    if (!this.menu) return -1;
    var m = this.menu;
    var menuW = 130;
    var itemH = 22;
    var padY = 6;
    var mx = m.sx;
    var my = m.sy;
    if (mx + menuW > this.canvas.width) mx = this.canvas.width - menuW - 4;
    if (my + m.items.length * itemH + padY * 2 > this.canvas.height) my = this.canvas.height - m.items.length * itemH - padY * 2 - 4;

    if (sx < mx || sx > mx + menuW) return -1;
    var ry = sy - my - padY;
    if (ry < 0) return -1;
    var idx = Math.floor(ry / itemH);
    if (idx >= m.items.length) return -1;
    return idx;
};

TWB.Game.prototype.addToBackpack = function(type, count) {
    for (var i = 0; i < this.backpack.length; i++) {
        if (this.backpack[i] && this.backpack[i].type === type) {
            this.backpack[i].count += count;
            return true;
        }
    }
    for (var i = 0; i < this.backpack.length; i++) {
        if (!this.backpack[i]) {
            this.backpack[i] = { type: type, count: count };
            return true;
        }
    }
    return false;
};

TWB.Game.prototype.getItemCount = function(type) {
    for (var i = 0; i < this.backpack.length; i++) {
        if (this.backpack[i] && this.backpack[i].type === type) return this.backpack[i].count;
    }
    return 0;
};

TWB.Game.prototype.removeFromBackpack = function(type, count) {
    for (var i = 0; i < this.backpack.length; i++) {
        if (this.backpack[i] && this.backpack[i].type === type) {
            this.backpack[i].count -= count;
            if (this.backpack[i].count <= 0) this.backpack[i] = null;
            return true;
        }
    }
    return false;
};

TWB.ITEM_LABELS = {
    wood: 'Wood', stone: 'Stone', sticks: 'Sticks',
    berries: 'Berries', food: 'Food', firewood: 'Firewood',
    meat: 'Meat', rice: 'Rice', pasta: 'Pasta', canned_food: 'Canned Food', expired_food: 'Expired Food',
    trap: 'Trap', canteen: 'Canteen', canteen_full: 'Canteen (full)',
    rope: 'Rope', knife: 'Knife', torch: 'Torch', bandage: 'Bandage',
    fishing_rod: 'Fishing Rod', lighter: 'Lighter',
    olive_oil: 'Olive Oil'
};

TWB.EDIBLE = { berries: true, food: true, canned_food: true };

TWB.COOKABLE = { meat: true, rice: true, pasta: true };

TWB.RECIPES = [
    { name: 'trap', label: 'Trap', needs: [['stone', 1], ['wood', 2]], gives: 'trap' },
    { name: 'rope', label: 'Rope', needs: [['sticks', 4]], gives: 'rope' },
    { name: 'canteen', label: 'Canteen', needs: [['stone', 2], ['wood', 1]], gives: 'canteen' },
    { name: 'knife', label: 'Knife', needs: [['stone', 1], ['sticks', 2]], gives: 'knife' },
    { name: 'torch', label: 'Torch', needs: [['wood', 1], ['sticks', 1]], gives: 'torch' },
    { name: 'bandage', label: 'Bandage', needs: [['sticks', 2], ['berries', 1]], gives: 'bandage' },
    { name: 'fishing_rod', label: 'Fishing Rod', needs: [['sticks', 3], ['rope', 1]], gives: 'fishing_rod' }
];

TWB.TRAP_ANIMALS = [
    { name: 'Hare', meat: 2, rarity: 8 },
    { name: 'Rabbit', meat: 2, rarity: 10 },
    { name: 'Squirrel', meat: 1, rarity: 10 },
    { name: 'Hedgehog', meat: 1, rarity: 7 },
    { name: 'Fox', meat: 2, rarity: 3 },
    { name: 'Badger', meat: 2, rarity: 4 },
    { name: 'Marten', meat: 1, rarity: 5 },
    { name: 'Weasel', meat: 1, rarity: 6 },
    { name: 'Pheasant', meat: 2, rarity: 6 },
    { name: 'Partridge', meat: 2, rarity: 7 },
    { name: 'Quail', meat: 1, rarity: 9 },
    { name: 'Thrush', meat: 1, rarity: 8 },
    { name: 'Woodcock', meat: 1, rarity: 5 },
    { name: 'Wild Pigeon', meat: 1, rarity: 7 },
    { name: 'Tortoise', meat: 1, rarity: 4 },
    { name: 'Frog', meat: 1, rarity: 8 },
    { name: 'Lizard', meat: 1, rarity: 9 },
    { name: 'Jay', meat: 1, rarity: 6 },
    { name: 'Field Mouse', meat: 1, rarity: 10 },
    { name: 'Vole', meat: 1, rarity: 9 }
];

TWB.Game.prototype.getBackpackLayout = function() {
    var cols = 5;
    var rows = 2;
    var slotSize = 52;
    var gap = 8;
    var totalW = cols * slotSize + (cols - 1) * gap;
    var pw = totalW + 40;
    var ph = 50 + rows * (slotSize + gap) + 74;
    var px = Math.floor((this.canvas.width - pw) / 2);
    var py = Math.floor((this.canvas.height - ph) / 2) - 20;
    var slotsX = px + Math.floor((pw - totalW) / 2);
    var slotsY = py + 44;
    return { px: px, py: py, pw: pw, ph: ph, slotsX: slotsX, slotsY: slotsY, slotSize: slotSize, gap: gap, cols: cols };
};

TWB.Game.prototype.getBackpackSlotAt = function(sx, sy) {
    var l = this.getBackpackLayout();
    for (var i = 0; i < this.backpack.length; i++) {
        var col = i % l.cols;
        var row = Math.floor(i / l.cols);
        var bx = l.slotsX + col * (l.slotSize + l.gap);
        var by = l.slotsY + row * (l.slotSize + l.gap);
        if (sx >= bx && sx <= bx + l.slotSize && sy >= by && sy <= by + l.slotSize) return i;
    }
    return -1;
};

TWB.Game.prototype.getBackpackBtns = function() {
    if (this.backpackHover < 0 || !this.backpack[this.backpackHover]) return [];
    var slot = this.backpack[this.backpackHover];
    if (TWB.EDIBLE[slot.type]) return ['eat', 'feed', 'drop1', 'dropall'];
    if (slot.type === 'canteen_full') return ['drink_canteen', 'drop1', 'dropall'];
    if (slot.type === 'bandage') return ['use_bandage', 'drop1', 'dropall'];
    return ['drop1', 'dropall'];
};

TWB.Game.prototype.getBackpackBtnAt = function(sx, sy) {
    var btns = this.getBackpackBtns();
    if (btns.length === 0) return null;
    var l = this.getBackpackLayout();
    var totalRows = Math.ceil(this.backpack.length / l.cols);
    var baseY = l.slotsY + totalRows * (l.slotSize + l.gap) + 4;
    var btnW = 70;
    var btnH = 20;
    var gapX = 12;
    var gapY = 6;
    var startX = l.px + Math.floor((l.pw - btnW * 2 - gapX) / 2);
    for (var i = 0; i < btns.length; i++) {
        var col = i % 2;
        var row = Math.floor(i / 2);
        var bx = startX + col * (btnW + gapX);
        var by = baseY + row * (btnH + gapY);
        if (sx >= bx && sx <= bx + btnW && sy >= by && sy <= by + btnH) return btns[i];
    }
    return null;
};

TWB.Game.prototype.executeAction = function(obj, action) {
    var msg = '';
    var s = this.stats;
    switch (action.action) {
        case 'chop':
            if (s.energy < 10) { msg = 'Too tired...'; break; }
            if (!this.addToBackpack('wood', 1)) { msg = 'Backpack is full!'; break; }
            var idx = this.objects.indexOf(obj);
            if (idx >= 0) this.objects.splice(idx, 1);
            s.energy = Math.max(0, s.energy - 12);
            this.wolfStats.energy = Math.max(0, this.wolfStats.energy - 3);
            msg = '+1 Wood';
            break;
        case 'gather':
            if (s.energy < 3) { msg = 'Too tired...'; break; }
            if (!this.addToBackpack('sticks', 1)) { msg = 'Backpack is full!'; break; }
            s.energy = Math.max(0, s.energy - 4);
            msg = '+1 Sticks';
            break;
        case 'mine':
            if (s.energy < 10) { msg = 'Too tired...'; break; }
            if (!this.addToBackpack('stone', 1)) { msg = 'Backpack is full!'; break; }
            var idx2 = this.objects.indexOf(obj);
            if (idx2 >= 0) this.objects.splice(idx2, 1);
            s.energy = Math.max(0, s.energy - 15);
            this.wolfStats.energy = Math.max(0, this.wolfStats.energy - 3);
            msg = '+1 Stone';
            break;
        case 'mine_boulder':
            if (s.energy < 20) { msg = 'Too tired...'; break; }
            if (!obj.hits) obj.hits = 0;
            obj.hits++;
            s.energy = Math.max(0, s.energy - 20);
            this.wolfStats.energy = Math.max(0, this.wolfStats.energy - 5);
            if (obj.hits >= 3) {
                var added = this.addToBackpack('stone', 3);
                if (!added) { msg = 'Backpack is full!'; obj.hits--; break; }
                var idx3 = this.objects.indexOf(obj);
                if (idx3 >= 0) this.objects.splice(idx3, 1);
                this._mapCanvas = null;
                msg = '+3 Stone (boulder destroyed)';
            } else {
                this.addToBackpack('stone', 1);
                msg = '+1 Stone (hit ' + obj.hits + '/3)';
            }
            break;
        case 'pick_berries':
            if (s.energy < 2) { msg = 'Too tired...'; break; }
            if (!obj.berries || obj.berries <= 0) { msg = 'No berries left'; break; }
            if (!this.addToBackpack('berries', 1)) { msg = 'Backpack is full!'; break; }
            obj.berries--;
            s.energy = Math.max(0, s.energy - 2);
            if (obj.berries <= 0) {
                obj.type = 'bush';
                msg = '+1 Berries (bush empty)';
            } else {
                msg = '+1 Berries (' + obj.berries + ' left)';
            }
            break;
        case 'cook':
            var cookFuel = (obj.tempFuel !== undefined) ? obj.tempFuel : this.fireFuel;
            if (cookFuel <= 0) { msg = 'Fire is out!'; break; }
            var ingredient = null;
            var cookables = ['meat', 'rice', 'pasta'];
            for (var ci = 0; ci < cookables.length; ci++) {
                if (this.getItemCount(cookables[ci]) > 0) { ingredient = cookables[ci]; break; }
            }
            if (!ingredient) { msg = 'Need meat, rice or pasta'; break; }
            if (!this.addToBackpack('food', 1)) { msg = 'Backpack is full!'; break; }
            this.removeFromBackpack(ingredient, 1);
            for (var bi = 0; bi < this.backpack.length; bi++) {
                if (this.backpack[bi] && this.backpack[bi].type === 'food' && !this.backpack[bi].cookedAt) {
                    this.backpack[bi].cookedAt = this.gameTime; break;
                }
            }
            s.energy = Math.max(0, s.energy - 5);
            msg = 'Cooked ' + (TWB.ITEM_LABELS[ingredient] || ingredient);
            break;
        case 'addwood':
            var woodCount = this.getItemCount('wood');
            var fwCount = this.getItemCount('firewood');
            if (woodCount < 1 && fwCount < 1) { msg = 'No wood to add!'; break; }
            if (fwCount > 0) {
                this.removeFromBackpack('firewood', 1);
                if (obj.tempFuel !== undefined) { obj.tempFuel = Math.min(100, obj.tempFuel + 40); }
                else { this.fireFuel = Math.min(100, this.fireFuel + 40); }
                msg = 'Added firewood (+40 fuel)';
            } else {
                this.removeFromBackpack('wood', 1);
                if (obj.tempFuel !== undefined) { obj.tempFuel = Math.min(100, obj.tempFuel + 25); }
                else { this.fireFuel = Math.min(100, this.fireFuel + 25); }
                msg = 'Added wood (+25 fuel)';
            }
            break;
        case 'rest':
            s.energy = Math.min(100, s.energy + 30);
            s.health = Math.min(100, s.health + 10);
            this.wolfStats.energy = Math.min(100, this.wolfStats.energy + 20);
            msg = 'Rested by the fire';
            break;
        case 'take':
            if (this.logPileTakes >= 5) { msg = 'Log pile is empty'; break; }
            if (!this.addToBackpack('firewood', 2)) { msg = 'Backpack is full!'; break; }
            this.logPileTakes++;
            s.energy = Math.max(0, s.energy - 3);
            msg = '+2 Firewood (' + (5 - this.logPileTakes) + ' left)';
            break;
        case 'dig':
            if (s.energy < 8) { msg = 'Too tired...'; break; }
            if (!this.addToBackpack('sticks', 1)) { msg = 'Backpack is full!'; break; }
            s.energy = Math.max(0, s.energy - 8);
            msg = '+1 Sticks';
            break;
        case 'enter_cabin':
            this.enterCabin();
            return;
        case 'exit_cabin':
            if (this.wolfSiege) {
                msg = 'Wolves surround the cabin! Going outside means death!';
                break;
            }
            this.exitCabin();
            return;
        case 'barricade':
            if (this.barricaded) { msg = 'Door is already barricaded.'; break; }
            if (this.getItemCount('wood') < 2) { msg = 'Need 2 wood to barricade.'; break; }
            this.removeFromBackpack('wood', 2);
            this.barricaded = true;
            msg = 'Door barricaded for the night.';
            break;
        case 'open_stranger':
            if (!this.stranger) { msg = 'No one is at the door.'; break; }
            if (this.stranger.type === 'shadow') {
                this.stats.health = Math.max(0, this.stats.health - 25);
                this.wolfStats.mood = 'Terrified';
                this.stranger = null;
                this.barricaded = false;
                msg = 'A shadowy figure lunges in! It was a trap! You barely fight it off.';
            } else {
                var strangerLoot = ['knife', 'canteen', 'canned_food', 'bandage', 'torch'];
                var gift = strangerLoot[Math.floor(Math.random() * strangerLoot.length)];
                this.addToBackpack(gift, 1);
                this.stranger = null;
                msg = 'A lost hunter! He thanks you and gives you a ' + gift + '.';
            }
            break;
        case 'sleep':
            s.energy = Math.min(100, s.energy + 60);
            s.health = Math.min(100, s.health + 30);
            s.hunger = Math.max(0, s.hunger - 20);
            s.thirst = Math.max(0, s.thirst - 25);
            this.wolfStats.energy = Math.min(100, this.wolfStats.energy + 40);
            this.wolfStats.hunger = Math.max(0, this.wolfStats.hunger - 15);
            this.wolfStats.thirst = Math.max(0, this.wolfStats.thirst - 20);
            this.wolfStats.mood = 'Loyal';
            this.gameTime += 8 * 3600;
            this.fireFuel = Math.max(0, this.fireFuel - 30);
            this.fireplaceFuel = Math.max(0, this.fireplaceFuel - 30);
            msg = 'Slept 8 hours...';
            break;
        case 'search_cabinet':
            var searchKey = this.currentCabinIdx;
            var searchCount = this.cabinSearches[searchKey] || 0;
            var cabinType = TWB.CABIN_TYPES[TWB._cabinData[searchKey].type];
            if (searchCount >= cabinType.maxSearch) { msg = 'Nothing left to find'; break; }
            this.cabinSearches[searchKey] = searchCount + 1;
            s.energy = Math.max(0, s.energy - 3);
            if (!this.lighterFound) {
                this.lighterFound = true;
                if (!this.addToBackpack('lighter', 1)) {
                    msg = 'Backpack is full!';
                    this.cabinSearches[searchKey]--;
                    break;
                }
                msg = 'Found Lighter!';
                break;
            }
            var finds = cabinType.loot;
            var found = finds[Math.floor(Math.random() * finds.length)];
            if (!this.addToBackpack(found, 1)) {
                msg = 'Backpack is full!';
                this.cabinSearches[searchKey]--;
                break;
            }
            msg = 'Found ' + (TWB.ITEM_LABELS[found] || found) + '!';
            break;
        case 'add_fp_wood':
            var fpWood = this.getItemCount('wood');
            var fpFw = this.getItemCount('firewood');
            if (fpWood < 1 && fpFw < 1) { msg = 'No wood to add!'; break; }
            if (fpFw > 0) {
                this.removeFromBackpack('firewood', 1);
                this.fireplaceFuel = Math.min(100, this.fireplaceFuel + 40);
                msg = 'Added firewood (+40 fuel)';
            } else {
                this.removeFromBackpack('wood', 1);
                this.fireplaceFuel = Math.min(100, this.fireplaceFuel + 25);
                msg = 'Added wood (+25 fuel)';
            }
            break;
        case 'cook_fp':
            if (this.fireplaceFuel <= 0) { msg = 'Light the fireplace first!'; break; }
            var fpIngr = null;
            var fpCookables = ['meat', 'rice', 'pasta'];
            for (var fci = 0; fci < fpCookables.length; fci++) {
                if (this.getItemCount(fpCookables[fci]) > 0) { fpIngr = fpCookables[fci]; break; }
            }
            if (!fpIngr) { msg = 'Need meat, rice or pasta'; break; }
            if (!this.addToBackpack('food', 1)) { msg = 'Backpack is full!'; break; }
            this.removeFromBackpack(fpIngr, 1);
            for (var bi = 0; bi < this.backpack.length; bi++) {
                if (this.backpack[bi] && this.backpack[bi].type === 'food' && !this.backpack[bi].cookedAt) {
                    this.backpack[bi].cookedAt = this.gameTime; break;
                }
            }
            s.energy = Math.max(0, s.energy - 5);
            msg = 'Cooked ' + (TWB.ITEM_LABELS[fpIngr] || fpIngr);
            break;
        case 'drink':
            if (s.thirst >= 95) { msg = 'Not thirsty'; break; }
            if (Math.random() < 0.1) {
                s.health = Math.max(0, s.health - 15);
                s.thirst = Math.min(100, s.thirst + 30);
                msg = 'Water was contaminated! -15 HP';
            } else {
                s.thirst = Math.min(100, s.thirst + 40);
                msg = 'Drank fresh water (+40 thirst)';
            }
            break;
        case 'wolf_drink':
            var dn = this.dogName || 'Wolf';
            if (this.wolfStats.thirst >= 95) { msg = dn + ' not thirsty'; break; }
            if (Math.random() < 0.1) {
                this.wolfStats.health = Math.max(0, this.wolfStats.health - 10);
                this.wolfStats.thirst = Math.min(100, this.wolfStats.thirst + 30);
                msg = dn + ' drank bad water! -10 HP';
            } else {
                this.wolfStats.thirst = Math.min(100, this.wolfStats.thirst + 40);
                msg = dn + ' drank water (+40 thirst)';
            }
            break;
        case 'fill':
            if (this.getItemCount('canteen') < 1) { msg = 'No canteen! Craft one [C]'; break; }
            this.removeFromBackpack('canteen', 1);
            this.addToBackpack('canteen_full', 1);
            msg = 'Filled canteen with water';
            break;
        case 'check_trap':
            if (obj.caught) {
                var animal = obj.caught;
                if (!this.addToBackpack('meat', animal.meat)) { msg = 'Backpack is full!'; break; }
                msg = 'Caught a ' + animal.name + '! +' + animal.meat + ' Meat';
                obj.caught = null;
                obj.timer = 0;
            } else {
                msg = 'Nothing caught yet...';
            }
            break;
        case 'pickup_trap':
            if (!this.addToBackpack('trap', 1)) { msg = 'Backpack is full!'; break; }
            if (obj.caught) {
                this.addToBackpack('meat', obj.caught.meat);
                msg = 'Picked up trap (+' + obj.caught.name + ')';
            } else {
                msg = 'Picked up trap';
            }
            var ti = this.objects.indexOf(obj);
            if (ti >= 0) this.objects.splice(ti, 1);
            break;
        case 'stand_ground':
            msg = 'Standing ground... dog is fighting!';
            break;
        case 'attack_knife':
            if (this.predator && this.getItemCount('knife') > 0) {
                var dmg = 15 + Math.floor(Math.random() * 10);
                this.predator.hp -= dmg;
                s.energy = Math.max(0, s.energy - 8);
                if (this.predator.hp <= 0) {
                    this.addToBackpack('meat', 2);
                    msg = 'Killed the ' + this.predator.name + '! +2 Meat';
                    this.predator = null;
                } else {
                    var counterDmg = Math.floor(Math.random() * 8) + 3;
                    s.health = Math.max(0, s.health - counterDmg);
                    msg = 'Hit! -' + dmg + ' HP to it, took -' + counterDmg + ' HP';
                }
            }
            break;
        case 'throw_rock':
            if (this.predator) {
                if (this.getItemCount('stone') > 0) {
                    this.removeFromBackpack('stone', 1);
                    var rdmg = 5 + Math.floor(Math.random() * 5);
                    this.predator.hp -= rdmg;
                    this.predator.timer = Math.min(this.predator.timer, 120);
                    if (this.predator.hp <= 0) {
                        this.addToBackpack('meat', 1);
                        msg = 'The ' + this.predator.name + ' went down! +1 Meat';
                        this.predator = null;
                    } else {
                        msg = 'Threw rock! -' + rdmg + ' HP. It will retreat soon.';
                    }
                } else {
                    msg = 'No stones to throw!';
                }
            }
            break;
        case 'search':
            s.energy = Math.max(0, s.energy - 5);
            msg = 'Found nothing useful';
            break;
        case 'place_trap':
            if (this.getItemCount('trap') > 0) {
                this.removeFromBackpack('trap', 1);
                this.objects.push({ type: 'trap', x: obj.x, y: obj.y, solid: false, caught: null, timer: 0 });
                msg = 'Trap placed';
            }
            break;
        case 'light_fire':
            if (this.getItemCount('lighter') < 1) { msg = 'Need a lighter!'; break; }
            if (this.getItemCount('wood') > 0) {
                this.removeFromBackpack('wood', 1);
                this.objects.push({ type: 'campfire', x: obj.x, y: obj.y, solid: true, colR: 10, tempFuel: 60 });
                msg = 'Lit a fire!';
            } else if (this.getItemCount('sticks') > 0) {
                this.removeFromBackpack('sticks', 1);
                this.objects.push({ type: 'campfire', x: obj.x, y: obj.y, solid: true, colR: 10, tempFuel: 30 });
                msg = 'Lit a small fire!';
            }
            break;
        case 'examine':
            msg = obj.desc || 'Nothing remarkable.';
            break;
        case 'read_note':
            if (obj.noteText) {
                this.readingNote = obj.noteText;
                this.menu = null;
                return;
            }
            msg = 'Nothing written.';
            break;
        case 'look_window':
            this.openWindowView();
            this.menu = null;
            return;
        case 'throw_meat':
            if (!this.wolfSiege) { msg = 'No reason to waste food.'; break; }
            if (this.getItemCount('meat') < 1) { msg = 'You have no meat to throw.'; break; }
            this.removeFromBackpack('meat', 1);
            this.wolfSiege = false;
            this.wolfSiegePack = [];
            msg = 'You toss the meat outside. The wolves fight over it and scatter!';
            break;
        case 'repair_cabin':
            if (this.currentCabinIdx < 0) { msg = 'Nothing to repair here.'; break; }
            var cabData = TWB._cabinData[this.currentCabinIdx];
            if (!cabData.damaged || cabData.repaired) { msg = 'This cabin is in good shape.'; break; }
            if (this.getItemCount('wood') < 2 || this.getItemCount('stone') < 1) {
                msg = 'Need 2 wood and 1 stone to repair.'; break;
            }
            this.removeFromBackpack('wood', 2);
            this.removeFromBackpack('stone', 1);
            cabData.repaired = true;
            msg = 'You patch the walls and seal the windows. The cabin feels warmer.';
            break;
        case 'read_cairn':
            var hour2 = this.getGameHour();
            var dark = hour2 < 6 || hour2 >= 21;
            if (dark && !this.flashlightOn) {
                msg = 'Too dark to see the markings...';
                break;
            }
            var nearestDist = Infinity;
            var nearestCab = null;
            for (var nci = 0; nci < TWB._cabinData.length; nci++) {
                var nc = TWB._cabinData[nci];
                var ndx = nc.cx * TWB.TILE - obj.x;
                var ndy = nc.cy * TWB.TILE - obj.y;
                var nd = Math.sqrt(ndx * ndx + ndy * ndy);
                if (nd < nearestDist) { nearestDist = nd; nearestCab = nc; }
            }
            if (nearestCab) {
                var cdx = nearestCab.cx * TWB.TILE - obj.x;
                var cdy = nearestCab.cy * TWB.TILE - obj.y;
                var dir2 = '';
                if (Math.abs(cdy) > Math.abs(cdx) * 0.5) dir2 += cdy < 0 ? 'North' : 'South';
                if (Math.abs(cdx) > Math.abs(cdy) * 0.5) dir2 += cdx < 0 ? 'west' : 'east';
                if (!dir2) dir2 = 'nearby';
                var tiles = Math.floor(nearestDist / TWB.TILE);
                msg = 'Stones point ' + dir2 + '. Shelter ~' + tiles + ' steps.';
            } else {
                msg = 'Ancient stones. The markings are worn.';
            }
            break;
        case 'light_kandili':
            if (obj.lit) { msg = 'The kandili is already burning.'; break; }
            var hasOil = this.getItemCount('olive_oil') > 0;
            var hasWood2 = this.getItemCount('wood') > 0;
            if (!hasOil && !hasWood2) { msg = 'Need olive oil or wood to light it.'; break; }
            if (!this.getItemCount('lighter')) { msg = 'Need a lighter.'; break; }
            if (hasOil) {
                this.removeFromBackpack('olive_oil', 1);
                obj.lit = true;
                obj.litFuel = 600;
                msg = 'Lit the kandili with oil. A warm glow fills the air.';
            } else {
                this.removeFromBackpack('wood', 1);
                obj.lit = true;
                obj.litFuel = 300;
                msg = 'Lit the kandili with wood. It won\'t last as long.';
            }
            this._mapCanvas = null;
            break;
        case 'pray_shrine':
            if (!obj.lit) { msg = 'The shrine is cold and dark...'; break; }
            s.energy = Math.min(100, s.energy + 8);
            this.wolfStats.energy = Math.min(100, this.wolfStats.energy + 5);
            msg = 'A moment of peace. You feel rested.';
            break;
        case 'repair_bridge':
            var bWood = this.getItemCount('wood');
            if (bWood < 3) { msg = 'Need 3 wood to repair the bridge.'; break; }
            if (s.energy < 15) { msg = 'Too tired...'; break; }
            this.removeFromBackpack('wood', 3);
            s.energy = Math.max(0, s.energy - 15);
            obj.type = 'bridge';
            this._mapCanvas = null;
            msg = 'Bridge repaired! You can cross now.';
            break;
        case 'cross_bridge':
            var rcTx = Math.floor(obj.x / TWB.TILE);
            var rcTy = Math.floor(obj.y / TWB.TILE);
            var rc2 = TWB.getRiverCenter(rcTy);
            var otherSide = (Math.floor(this.player.x / TWB.TILE) <= rc2) ? (rc2 + 3) : (rc2 - 3);
            this.player.x = otherSide * TWB.TILE;
            this.player.y = obj.y;
            this.wolf.x = this.player.x + 20;
            this.wolf.y = this.player.y + 10;
            s.energy = Math.max(0, s.energy - 3);
            msg = 'Crossed the bridge.';
            break;
        case 'cross_stones':
            var stTx = Math.floor(obj.x / TWB.TILE);
            var stTy = Math.floor(obj.y / TWB.TILE);
            var stRc = TWB.getRiverCenter(stTy);
            var stOther = (Math.floor(this.player.x / TWB.TILE) <= stRc) ? (stRc + 3) : (stRc - 3);
            this.player.x = stOther * TWB.TILE;
            this.player.y = obj.y;
            this.wolf.x = this.player.x + 20;
            this.wolf.y = this.player.y + 10;
            this.wetness = Math.min(100, this.wetness + 60);
            s.energy = Math.max(0, s.energy - 8);
            if (Math.random() < 0.25) {
                s.health = Math.max(0, s.health - 3);
                msg = 'Slipped! Got soaked crossing the stones. -3 HP';
            } else {
                msg = 'Crossed the stones. Soaking wet...';
            }
            break;
        default:
            msg = action.label;
    }
    if (s.energy < 20) this.wolfStats.mood = 'Worried';
    else if (this.wolfStats.energy < 30) this.wolfStats.mood = 'Tired';
    else if (this.wolfStats.mood !== 'Happy') this.wolfStats.mood = 'Loyal';
    this.notification = { text: msg, timer: 120 };
};

TWB.Game.prototype.enterCabin = function() {
    var px = this.player.x;
    var py = this.player.y;
    var nearestIdx = -1;
    var nearestDist = Infinity;
    for (var ci = 0; ci < TWB._cabinData.length; ci++) {
        var c = TWB._cabinData[ci];
        var dx = px - c.cx * TWB.TILE;
        var dy = py - c.cy * TWB.TILE;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < nearestDist) { nearestDist = d; nearestIdx = ci; }
    }

    if (nearestIdx === TWB._targetCabin) {
        this.victory = true;
        this.victoryTimer = 0;
        this.menu = null;
        return;
    }

    this.player.speed = TWB.PLAYER_SPEED;
    this.wolf.speed = TWB.WOLF_SPEED;
    this.fleeing = false;
    this.predator = null;
    this.wolfHunting = null;
    this.dogSense = null;
    this.currentCabinIdx = nearestIdx;
    this.outdoorState = {
        objects: this.objects,
        px: this.player.x, py: this.player.y,
        wx: this.wolf.x, wy: this.wolf.y
    };
    this.objects = TWB.buildCabinInterior(nearestIdx);
    this.player.x = 6 * 32;
    this.player.y = 7 * 32;
    this.player.tx = this.player.x;
    this.player.ty = this.player.y;
    this.player.moving = false;
    this.wolf.x = 7 * 32;
    this.wolf.y = 7 * 32;
    this.wolf.tx = this.wolf.x;
    this.wolf.ty = this.wolf.y;
    this.wolf.moving = false;
    this.indoors = true;
    TWB.indoors = true;
    this.menu = null;
    this.barricaded = false;
    this.cabinEventTimer = 0;
    this.doorShake = 0;
    this.shadows = [];
    var cabinName = TWB.CABIN_TYPES[TWB._cabinData[nearestIdx].type].name;
    var cabDmg = TWB._cabinData[nearestIdx].damaged && !TWB._cabinData[nearestIdx].repaired;
    this.notification = { text: cabinName + (cabDmg ? ' (Damaged)' : ''), timer: 120 };
    if (this.wolfSiege) {
        this.wolfSiege = false;
        this.wolfSiegePack = [];
    }
};

TWB.Game.prototype.exitCabin = function() {
    var st = this.outdoorState;
    this.objects = st.objects;
    this.player.x = st.px;
    this.player.y = st.py;
    this.player.tx = st.px;
    this.player.ty = st.py;
    this.player.moving = false;
    this.wolf.x = st.wx;
    this.wolf.y = st.wy;
    this.wolf.tx = st.wx;
    this.wolf.ty = st.wy;
    this.wolf.moving = false;
    this.outdoorState = null;
    this.indoors = false;
    TWB.indoors = false;
    this.menu = null;
    this.notification = { text: 'Left the cabin', timer: 90 };
};

TWB.Game.prototype.update = function() {
    if (this.victory) { this.victoryTimer++; return; }
    if (this.dead) { this.deathTimer++; return; }
    if (this.fates && this.fates.fade >= 1) return;
    if (this.stats.health <= 0 && !this.dead) {
        this.dead = true;
        this.deathTimer = 0;
        this.deathCause = 'You succumbed to the wilderness.';
    }
    if (this.wolfStats.health <= 0 && !this.dead) {
        this.dead = true;
        this.deathTimer = 0;
        this.deathCause = (this.dogName || 'Your dog') + ' didn\'t make it...';
    }
    if (this.windowView) { this.windowView.frame++; return; }
    if (this.readingNote) return;
    this.player.update(this.objects);

    if (this.fleeing) {
        var cabin = null;
        var bestCabDist = Infinity;
        for (var ci = 0; ci < this.objects.length; ci++) {
            if (this.objects[ci].type === 'cabin') {
                var cd = Math.sqrt(Math.pow(this.player.x - this.objects[ci].x, 2) + Math.pow(this.player.y - this.objects[ci].y, 2));
                if (cd < bestCabDist) { bestCabDist = cd; cabin = this.objects[ci]; }
            }
        }
        if (cabin) {
            var dpc = Math.sqrt(Math.pow(this.player.x - cabin.x, 2) + Math.pow(this.player.y - cabin.y, 2));
            if (dpc < 50) {
                this.fleeing = false;
                this.predator = null;
                this.player.speed = TWB.PLAYER_SPEED;
                this.wolf.speed = TWB.WOLF_SPEED;
                this.enterCabin();
                this.notification = { text: 'Made it to safety!', timer: 120 };
            } else {
                this.player.setTarget(cabin.x, cabin.y + 30);
            }
        }
    }

    if (this.wolfHunting) {
        var prey = this.wolfHunting;
        var hdx = prey.x - this.wolf.x;
        var hdy = prey.y - this.wolf.y;
        var hdist = Math.sqrt(hdx * hdx + hdy * hdy);
        this.wolfHuntTimer--;
        if (hdist < 12) {
            var wi = this.wildlife.indexOf(prey);
            if (wi >= 0) this.wildlife.splice(wi, 1);
            this.wolfHunting = null;
            this.addToBackpack('meat', prey.meat);
            this.wolfStats.mood = 'Happy';
            this.notification = { text: (this.dogName || 'Dog') + ' caught a ' + prey.name + '! +' + prey.meat + ' meat', timer: 150 };
        } else if (this.wolfHuntTimer <= 0) {
            this.wolfHunting = null;
            this.wolfStats.mood = 'Loyal';
        } else {
            this.wolf.setTarget(prey.x, prey.y);
        }
        this.wolf.update(this.objects);
    } else if (this.predator) {
        var pdx = this.predator.x - this.wolf.x;
        var pdy = this.predator.y - this.wolf.y;
        var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist > 30) {
            this.wolf.setTarget(this.predator.x, this.predator.y);
        } else {
            this.wolf.moving = false;
            this.wolf.dir = Math.abs(pdx) > Math.abs(pdy) ? (pdx > 0 ? 3 : 2) : (pdy > 0 ? 0 : 1);
        }
        this.wolf.update(this.objects);

        var nearShrine = false;
        for (var psi = 0; psi < this.objects.length; psi++) {
            var ps = this.objects[psi];
            if (ps.type !== 'shrine' || !ps.lit) continue;
            var psdx = this.predator.x - ps.x;
            var psdy = this.predator.y - ps.y;
            if (Math.sqrt(psdx * psdx + psdy * psdy) < 120) { nearShrine = true; break; }
        }
        if (nearShrine) {
            this.predator.timer = Math.min(this.predator.timer, 60);
            this.predator.angle += Math.PI;
        }
        this.predator.x += Math.cos(this.predator.angle) * 0.4;
        this.predator.y += Math.sin(this.predator.angle) * 0.4;
        var ppd = Math.sqrt(Math.pow(this.predator.x - this.player.x, 2) + Math.pow(this.predator.y - this.player.y, 2));
        if (ppd < 40 && this.gameTime % 120 === 0 && !nearShrine) {
            this.stats.health = Math.max(0, this.stats.health - 5);
            this.wolfStats.health = Math.max(0, this.wolfStats.health - 3);
            this.notification = { text: this.predator.name + ' attacks! -5 HP', timer: 90 };
        }

        this.predator.timer--;
        if (this.predator.timer <= 0 || this.wolfStats.health <= 0) {
            if (this.predator.timer <= 0) {
                this.notification = { text: 'The ' + this.predator.name + ' retreated!', timer: 120 };
            }
            this.predator = null;
        }
    } else if (this.dogSense) {
        var ds = this.dogSense;
        ds.timer++;
        var senseDir = ds.angle < -Math.PI * 0.75 || ds.angle > Math.PI * 0.75 ? 2
            : ds.angle < -Math.PI * 0.25 ? 1
            : ds.angle < Math.PI * 0.25 ? 3 : 0;

        if (ds.phase === 0) {
            this.wolf.moving = false;
            this.wolf.dir = senseDir;
            this.wolfStats.mood = 'Alert';
            if (ds.timer > 120) { ds.phase = 1; ds.timer = 0; }
        } else if (ds.phase === 1) {
            this.wolf.moving = false;
            this.wolf.dir = senseDir;
            if (ds.timer === 1) {
                this.notification = { text: (this.dogName || 'Dog') + ' stopped... ears up.', timer: 90 };
            }
            if (ds.timer > 90) { ds.phase = 2; ds.timer = 0; }
        } else if (ds.phase === 2) {
            this.wolf.moving = false;
            if (ds.timer === 1) {
                this.notification = { text: 'GRRRR...', timer: 90 };
            }
            if (ds.timer % 20 < 10) {
                this.wolf.dir = senseDir;
            } else {
                this.wolf.dir = (senseDir + 1) % 4;
            }
            if (ds.timer > 90) { ds.phase = 3; ds.timer = 0; }
        } else {
            var playerNearShrine = false;
            for (var dsi = 0; dsi < this.objects.length; dsi++) {
                var dso = this.objects[dsi];
                if (dso.type !== 'shrine' || !dso.lit) continue;
                var dsdx = this.player.x - dso.x;
                var dsdy = this.player.y - dso.y;
                if (Math.sqrt(dsdx * dsdx + dsdy * dsdy) < 120) { playerNearShrine = true; break; }
            }
            if (playerNearShrine) {
                this.notification = { text: 'Something prowled nearby... the shrine\'s light kept it away.', timer: 150 };
                this.dogSense = null;
            } else {
            var pDist = 250 + Math.random() * 100;
            this.predator = {
                name: ds.pred.name, hp: ds.pred.hp, timer: ds.pred.timer,
                x: this.player.x + Math.cos(ds.angle) * pDist,
                y: this.player.y + Math.sin(ds.angle) * pDist,
                angle: ds.angle + Math.PI
            };
            this.wolfStats.mood = 'Alert';
            this.notification = { text: (this.dogName || 'Dog') + ' is barking! ' + ds.pred.name + '!', timer: 180 };
            this.dogSense = null;
            }
        }
    } else {
        var wdx = this.player.x - this.wolf.x;
        var wdy = this.player.y - this.wolf.y;
        var wdist = Math.sqrt(wdx * wdx + wdy * wdy);
        if (wdist > TWB.WOLF_FOLLOW_DIST) {
            var offsetX = this.player.x - (wdx / wdist) * TWB.WOLF_FOLLOW_DIST * 0.6;
            var offsetY = this.player.y - (wdy / wdist) * TWB.WOLF_FOLLOW_DIST * 0.6;
            this.wolf.setTarget(offsetX, offsetY);
        } else {
            this.wolf.moving = false;
            this.wolf.frame = 0;
            this.wolf.tx = this.wolf.x;
            this.wolf.ty = this.wolf.y;
        }
        this.wolf.update(this.objects);
    }

    if (this.indoors) {
        var iw = TWB.INTERIOR_COLS * TWB.TILE;
        var ih = TWB.INTERIOR_ROWS * TWB.TILE;
        this.camera.x = (iw - this.canvas.width) / 2;
        this.camera.y = (ih - (this.canvas.height - 80)) / 2;
    } else {
        this.camera.follow(this.player.x, this.player.y);
    }
    this.fireTime++;
    this.gameTime++;

    if (this.fireFuel > 0) {
        this.fireFuel = Math.max(0, this.fireFuel - 0.005);
    }
    var fpBurn = 0.005;
    if (this.nightType === 'freeze' && this.nightActive) fpBurn = 0.01;
    if (this.indoors && this.currentCabinIdx >= 0 && TWB._cabinData[this.currentCabinIdx].damaged && !TWB._cabinData[this.currentCabinIdx].repaired) fpBurn *= 1.5;
    if (this.fireplaceFuel > 0) {
        this.fireplaceFuel = Math.max(0, this.fireplaceFuel - fpBurn);
    }
    var nightBurnRate = this.nightActive ? 0.06 : 0.02;
    for (var tfi = this.objects.length - 1; tfi >= 0; tfi--) {
        if (this.objects[tfi].tempFuel !== undefined) {
            this.objects[tfi].tempFuel -= nightBurnRate;
            if (this.objects[tfi].tempFuel <= 0) {
                this.objects.splice(tfi, 1);
            }
        }
        if (this.objects[tfi] && this.objects[tfi].type === 'shrine' && this.objects[tfi].lit) {
            this.objects[tfi].litFuel -= 0.01;
            if (this.objects[tfi].litFuel <= 0) {
                this.objects[tfi].lit = false;
                this.objects[tfi].litFuel = 0;
                this._mapCanvas = null;
            }
        }
    }

    if (this.gameTime % 600 === 0) {
        this.stats.energy = Math.max(0, this.stats.energy - 1);
        this.wolfStats.energy = Math.max(0, this.wolfStats.energy - 0.5);
        this.stats.hunger = Math.max(0, this.stats.hunger - 0.8);
        this.wolfStats.hunger = Math.max(0, this.wolfStats.hunger - 0.6);
        this.stats.thirst = Math.max(0, this.stats.thirst - 1.0);
        this.wolfStats.thirst = Math.max(0, this.wolfStats.thirst - 0.7);
    }
    if (this.player.moving && this.gameTime % 300 === 0) {
        this.stats.energy = Math.max(0, this.stats.energy - 0.5);
        this.stats.thirst = Math.max(0, this.stats.thirst - 0.3);
    }
    if (!this.indoors && this.raining) {
        this.wetness = Math.min(100, this.wetness + 0.05);
    } else if (this.indoors || (!this.raining && this.wetness > 0)) {
        var dryRate = this.indoors ? 0.15 : 0.03;
        this.wetness = Math.max(0, this.wetness - dryRate);
    }

    this.windTimer--;
    if (this.windTimer <= 0) {
        this.windSpeed = Math.random() * Math.random() * 3;
        this.windTimer = 600 + Math.floor(Math.random() * 1800);
    }

    this.fogTimer--;
    if (this.fogTimer <= 0) {
        if (this.foggy) {
            this.foggy = false;
            this.fogTimer = 7200 + Math.floor(Math.random() * 14400);
            this.notification = { text: 'The fog is lifting...', timer: 120 };
        } else {
            var fHour = this.getGameHour();
            if (fHour >= 4 && fHour < 10 && !this.raining) {
                this.foggy = true;
                this.fogTimer = 1800 + Math.floor(Math.random() * 3600);
                this.lastKnownMapPos = { x: this.player.x, y: this.player.y };
                this.notification = { text: 'A thick fog rolls in...', timer: 150 };
            } else {
                this.fogTimer = 1800;
            }
        }
    }
    if (this.foggy) {
        this.fogDensity = Math.min(1, this.fogDensity + 0.008);
    } else {
        this.fogDensity = Math.max(0, this.fogDensity - 0.005);
    }

    if (this.fatesCooldown > 0) this.fatesCooldown--;
    if (!this.fates && this.fatesCooldown <= 0 && !this.indoors) {
        this.fatesTimer--;
        if (this.fatesTimer <= 0) {
            if (this.stats.energy < 35) {
                var qi = Math.floor(Math.random() * this.fatesQuestions.length);
                this.fates = {
                    question: this.fatesQuestions[qi],
                    x: this.player.x + (Math.random() > 0.5 ? 60 : -60),
                    y: this.player.y - 40,
                    hovered: -1,
                    fade: 0
                };
            }
            this.fatesTimer = 5400 + Math.floor(Math.random() * 7200);
        }
    }
    if (this.fates) {
        this.fates.fade = Math.min(1, this.fates.fade + 0.006);
    }

    var nightHour = this.getGameHour();
    var wasNight = this.nightActive;
    this.nightActive = nightHour >= 20 || nightHour < 6;

    var gameDay = Math.floor(this.gameTime / 86400);
    if (this.nightActive && !wasNight) {
        if (this.nightDay !== gameDay) {
            this.nightDay = gameDay;
            var ntRoll = Math.random();
            if (ntRoll < 0.4) this.nightType = 'calm';
            else if (ntRoll < 0.7) this.nightType = 'freeze';
            else this.nightType = 'shadow_surge';
            this.stranger = null;
            this.wolfSiege = false;
            this.wolfSiegePack = [];
            this.shadowBreaching = false;
        }
        if (!this.indoors) {
            var ntMsg = 'Darkness falls... find shelter!';
            if (this.nightType === 'freeze') ntMsg = 'A freezing storm approaches... find shelter!';
            else if (this.nightType === 'shadow_surge') ntMsg = 'The darkness feels alive tonight... find shelter!';
            this.notification = { text: ntMsg, timer: 200 };
        }
    }

    var isSurge = this.nightType === 'shadow_surge';
    var isFreeze = this.nightType === 'freeze';
    var maxShadows = isSurge ? 8 : 6;
    var shadowSpawnRate = isSurge ? 150 : 300;

    if (this.nightActive && !this.indoors) {
        this.shadowSpawnTimer++;
        if (this.shadowSpawnTimer > shadowSpawnRate && this.shadows.length < maxShadows) {
            var sAngle = Math.random() * Math.PI * 2;
            var sDist = 200 + Math.random() * 100;
            this.shadows.push({
                x: this.player.x + Math.cos(sAngle) * sDist,
                y: this.player.y + Math.sin(sAngle) * sDist,
                speed: isSurge ? (0.2 + Math.random() * 0.15) : (0.15 + Math.random() * 0.1),
                retreatTimer: 0,
                alpha: 0
            });
            this.shadowSpawnTimer = Math.floor(Math.random() * 120);
        }

        for (var si = this.shadows.length - 1; si >= 0; si--) {
            var sh = this.shadows[si];
            sh.alpha = Math.min(1, sh.alpha + 0.005);
            var sdx = this.player.x - sh.x;
            var sdy = this.player.y - sh.y;
            var sdist = Math.sqrt(sdx * sdx + sdy * sdy);

            if (this.flashlightOn) {
                var p = this.player;
                var fAngle;
                switch (p.dir) {
                    case 0: fAngle = Math.PI / 2; break;
                    case 1: fAngle = -Math.PI / 2; break;
                    case 2: fAngle = Math.PI; break;
                    default: fAngle = 0;
                }
                var toShadow = Math.atan2(-sdy, -sdx);
                var angleDiff = Math.abs(toShadow - fAngle);
                if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
                if (angleDiff < 0.8 && sdist < 150) {
                    sh.retreatTimer = 120;
                }
            }

            if (sh.retreatTimer > 0) {
                sh.retreatTimer--;
                sh.x -= (sdx / sdist) * 1.2;
                sh.y -= (sdy / sdist) * 1.2;
                sh.alpha = Math.max(0, sh.alpha - 0.02);
            } else if (sdist > 30) {
                sh.x += (sdx / sdist) * sh.speed;
                sh.y += (sdy / sdist) * sh.speed;
            }

            if (sdist < 35 && sh.retreatTimer <= 0) {
                this.stats.health = Math.max(0, this.stats.health - 0.05);
                this.wolfStats.health = Math.max(0, this.wolfStats.health - 0.03);
            }

            var psDist = Math.sqrt(Math.pow(sh.x - this.player.x, 2) + Math.pow(sh.y - this.player.y, 2));
            if (psDist > 400 || sh.alpha <= 0) {
                this.shadows.splice(si, 1);
            }
        }

        if (this.shadows.length > 0) {
            this.wolfStats.mood = 'Terrified';
        }
    } else {
        if (this.shadows.length > 0) {
            for (var sci = 0; sci < this.shadows.length; sci++) {
                this.shadows[sci].alpha -= 0.02;
            }
            this.shadows = this.shadows.filter(function(s) { return s.alpha > 0; });
        }
        this.shadowSpawnTimer = 0;
    }

    if (this.nightActive && this.indoors) {
        if (this.doorShake > 0) this.doorShake--;
        this.cabinEventTimer++;
        var eventInterval = isSurge ? 400 : 600;
        if (this.cabinEventTimer > eventInterval + Math.floor(Math.random() * 600)) {
            this.cabinEventTimer = 0;
            var evRoll = Math.random();
            if (isSurge && this.fireplaceFuel <= 0 && !this.shadowBreaching) {
                this.shadowBreaching = true;
                this.doorShake = 120;
                this.wolfStats.mood = 'Terrified';
                this.notification = { text: 'The shadows sense darkness inside... they push at the door!', timer: 180 };
            } else if (evRoll < 0.3) {
                this.doorShake = 60;
                this.wolfStats.mood = 'Alert';
                this.notification = { text: 'Something scratches at the door...', timer: 120 };
            } else if (evRoll < 0.5) {
                this.notification = { text: 'Shadows pass outside the window...', timer: 100 };
                this.wolfStats.mood = 'Alert';
            } else if (evRoll < 0.65 && !this.barricaded) {
                this.notification = { text: 'The door blows open! Cold rushes in!', timer: 150 };
                this.fireplaceFuel = Math.max(0, this.fireplaceFuel - 20);
                this.stats.health = Math.max(0, this.stats.health - 5);
                this.wolfStats.mood = 'Terrified';
            }
        }

        if (this.shadowBreaching) {
            if (this.fireplaceFuel > 0) {
                this.shadowBreaching = false;
                this.notification = { text: 'The fire pushes the shadows back...', timer: 120 };
            } else {
                this.stats.health = Math.max(0, this.stats.health - 0.02);
                this.wolfStats.health = Math.max(0, this.wolfStats.health - 0.01);
            }
        }

        if (this.fireplaceFuel <= 0 && nightHour >= 21) {
            this.stats.health = Math.max(0, this.stats.health - 0.01);
            if (this.gameTime % 600 === 0) {
                this.notification = { text: 'The fire is out... cold seeps in...', timer: 120 };
            }
        }

        if (!this.stranger && !this.wolfSiege) {
            var stHour = this.getGameHour();
            if (stHour >= 0.5 && stHour < 2 && Math.random() < 0.0003) {
                var cabKey = this.currentCabinIdx;
                if (!this.strangerUsed[cabKey]) {
                    this.strangerUsed[cabKey] = true;
                    var isShadowTrap = Math.random() < 0.35;
                    this.stranger = {
                        type: isShadowTrap ? 'shadow' : 'human',
                        timer: 0
                    };
                    this.doorShake = 90;
                    this.wolfStats.mood = isShadowTrap ? 'Terrified' : 'Alert';
                    this.notification = { text: 'Persistent knocking at the door...', timer: 200 };
                }
            }
        }

        if (!this.wolfSiege && !this.stranger && this.getItemCount('meat') > 0) {
            if (nightHour >= 22 && Math.random() < 0.0002) {
                this.wolfSiege = true;
                this.wolfStats.mood = 'Terrified';
                this.notification = { text: 'Wolves circle the cabin! They smell your meat!', timer: 200 };
            }
        }

        if (this.wolfSiege && this.gameTime % 900 === 0) {
            this.doorShake = 40;
            this.notification = { text: 'The wolves howl and scratch at the walls...', timer: 120 };
        }

        if (this.stranger) {
            this.stranger.timer++;
            if (this.stranger.timer > 1800) {
                this.notification = { text: 'The knocking stops... whoever it was is gone.', timer: 120 };
                this.stranger = null;
            } else if (this.stranger.timer % 600 === 0) {
                this.doorShake = 60;
                this.notification = { text: 'The knocking grows more desperate...', timer: 120 };
            }
        }
    }

    if (!this.nightActive) {
        this.barricaded = false;
        this.cabinEventTimer = 0;
        this.doorShake = 0;
        this.stranger = null;
        this.shadowBreaching = false;
        if (this.wolfSiege) {
            this.wolfSiege = false;
            this.wolfSiegePack = [];
            this.notification = { text: 'Dawn breaks. The wolves retreat.', timer: 150 };
        }
    }

    if (this.gameTime % 300 === 0) {
        var exposure = this.getExposureState();
        if (exposure.dmg > 0) {
            this.stats.health = Math.max(0, this.stats.health - exposure.dmg);
            this.wolfStats.health = Math.max(0, this.wolfStats.health - exposure.dmg * 0.6);
        }
    }
    if (this.stats.hunger <= 0 || this.stats.thirst <= 0) {
        this.stats.health = Math.max(0, this.stats.health - 0.02);
    }
    if (this.wolfStats.hunger <= 0 || this.wolfStats.thirst <= 0) {
        this.wolfStats.health = Math.max(0, this.wolfStats.health - 0.015);
    }
    if (this.gameTime % 600 === 0) {
        for (var bi = 0; bi < this.backpack.length; bi++) {
            var slot = this.backpack[bi];
            if (slot && slot.type === 'food' && slot.cookedAt && this.gameTime - slot.cookedAt > 86400) {
                slot.type = 'expired_food';
                delete slot.cookedAt;
                this.notification = { text: 'Food has expired!', timer: 120 };
            }
        }
    }

    if (this.wolfStats.mood !== 'Terrified' && this.wolfStats.mood !== 'Alert') {
        if (this.stats.energy < 20) this.wolfStats.mood = 'Worried';
        else if (this.wolfStats.hunger < 20 || this.wolfStats.thirst < 20) this.wolfStats.mood = 'Hungry';
        else if (this.wolfStats.energy < 30) this.wolfStats.mood = 'Tired';
        else if (this.wolfStats.mood !== 'Happy') this.wolfStats.mood = 'Loyal';
    }

    if (!this.indoors && this.gameTime % 1800 === 0) {
        for (var ti = 0; ti < this.objects.length; ti++) {
            var trap = this.objects[ti];
            if (trap.type !== 'trap' || trap.caught) continue;
            trap.timer++;
            if (trap.timer >= 2 && Math.random() < 0.35) {
                var totalRarity = 0;
                for (var ai = 0; ai < TWB.TRAP_ANIMALS.length; ai++) totalRarity += TWB.TRAP_ANIMALS[ai].rarity;
                var roll = Math.random() * totalRarity;
                var cum = 0;
                for (var ai = 0; ai < TWB.TRAP_ANIMALS.length; ai++) {
                    cum += TWB.TRAP_ANIMALS[ai].rarity;
                    if (roll < cum) { trap.caught = TWB.TRAP_ANIMALS[ai]; break; }
                }
            }
        }
    }

    if (!this.indoors) {
        for (var wi = this.wildlife.length - 1; wi >= 0; wi--) {
            var a = this.wildlife[wi];
            a.moveTimer--;
            if (a.moveTimer <= 0) {
                a.tx = a.x + (Math.random() - 0.5) * 80;
                a.ty = a.y + (Math.random() - 0.5) * 80;
                a.moveTimer = 60 + Math.floor(Math.random() * 120);
            }
            var adx = a.tx - a.x, ady = a.ty - a.y;
            var adist = Math.sqrt(adx * adx + ady * ady);
            if (adist > 2) {
                a.x += (adx / adist) * a.speed;
                a.y += (ady / adist) * a.speed;
            }
            var dpd = Math.sqrt(Math.pow(a.x - this.player.x, 2) + Math.pow(a.y - this.player.y, 2));
            if (dpd > 500) { this.wildlife.splice(wi, 1); continue; }
            if (dpd < 100 && !a.fleeing) {
                a.fleeing = true;
                a.tx = a.x + (a.x - this.player.x) * 2;
                a.ty = a.y + (a.y - this.player.y) * 2;
                a.speed = 1.8;
            }
            if (!this.wolfHunting && !this.predator && dpd < 150 && this.wolfStats.energy > 15) {
                this.wolfHunting = a;
                this.wolfHuntTimer = 300;
                this.wolfStats.mood = 'Hunting';
            }
        }

        this.wildlifeTimer--;
        if (this.wildlifeTimer <= 0 && this.wildlife.length < 3 && !this.predator) {
            this.wildlifeTimer = 900 + Math.floor(Math.random() * 1800);
            var hour = this.getGameHour();
            if (hour >= 6 && hour < 20) {
                var spAngle = Math.random() * Math.PI * 2;
                var spDist = 200 + Math.random() * 150;
                var spx = this.player.x + Math.cos(spAngle) * spDist;
                var spy = this.player.y + Math.sin(spAngle) * spDist;
                if (TWB.isWalkable(spx, spy)) {
                    var preyTypes = [
                        { name: 'Rabbit', meat: 1, speed: 1.2 },
                        { name: 'Hare', meat: 1, speed: 1.4 },
                        { name: 'Squirrel', meat: 1, speed: 1.6 },
                        { name: 'Pheasant', meat: 2, speed: 1.0 },
                        { name: 'Partridge', meat: 1, speed: 1.1 }
                    ];
                    var pt = preyTypes[Math.floor(Math.random() * preyTypes.length)];
                    this.wildlife.push({
                        name: pt.name, meat: pt.meat, speed: pt.speed,
                        x: spx, y: spy, tx: spx, ty: spy,
                        moveTimer: 30 + Math.floor(Math.random() * 60), fleeing: false
                    });
                }
            }

            if (Math.random() < 0.06 && !this.predator && !this.dogSense && hour >= 5 && hour < 22) {
                var pAngle = Math.random() * Math.PI * 2;
                var predTypes = [
                    { name: 'Wild Wolf', hp: 40, timer: 600 },
                    { name: 'Bear', hp: 60, timer: 900 }
                ];
                var pred = predTypes[Math.random() < 0.7 ? 0 : 1];
                this.dogSense = {
                    phase: 0,
                    timer: 0,
                    angle: pAngle,
                    pred: pred
                };
            }
        }
    }

    this.rainTimer--;
    if (this.rainTimer <= 0) {
        if (this.raining) {
            this.raining = false;
            this.rainTimer = 5400 + Math.floor(Math.random() * 10800);
            this.notification = { text: 'The rain stopped.', timer: 120 };
            for (var ri = 0; ri < this.objects.length; ri++) {
                if (this.objects[ri].type === 'bush' && Math.random() < 0.5) {
                    this.objects[ri].type = 'bush_berry';
                    this.objects[ri].berries = 2 + Math.floor(Math.random() * 2);
                }
            }
            var currentDay = Math.floor(this.gameTime / 86400);
            if (currentDay !== this.rainDay) {
                this.rainDay = currentDay;
                var newTrees = 2 + Math.floor(Math.random() * 3);
                for (var nt = 0; nt < newTrees; nt++) {
                    var ntx = 3 + Math.floor(Math.random() * (TWB.COLS - 6));
                    var nty = 3 + Math.floor(Math.random() * (TWB.ROWS - 6));
                    var nearCab = false;
                    for (var ci = 0; ci < TWB._cabinData.length; ci++) {
                        var cd = TWB._cabinData[ci];
                        if (ntx >= cd.cx - 6 && ntx <= cd.cx + 6 && nty >= cd.cy - 5 && nty <= cd.cy + 12) { nearCab = true; break; }
                    }
                    if (nearCab) continue;
                    var ng = TWB.getGround(ntx, nty);
                    if (ng === TWB.T_WATER || ng === TWB.T_SHORE) continue;
                    var isPine = Math.random() > 0.33;
                    this.objects.push({
                        type: isPine ? 'tree_pine' : 'tree_oak',
                        x: ntx * TWB.TILE + Math.floor(Math.random() * 16) - 8,
                        y: nty * TWB.TILE + Math.floor(Math.random() * 16) - 8,
                        solid: true, colR: 6
                    });
                }
            }
        } else {
            var hour = this.getGameHour();
            if (hour >= 6 && hour < 22) {
                this.raining = true;
                this.rainTimer = 1800 + Math.floor(Math.random() * 5400);
                this.notification = { text: 'It started raining...', timer: 120 };
            } else {
                this.rainTimer = 1800;
            }
        }
    }

    if (this.raining && !this.indoors && this.gameTime % 300 === 0) {
        this.stats.health = Math.max(0, this.stats.health - 0.8);
        this.wolfStats.health = Math.max(0, this.wolfStats.health - 0.6);
    }

    if (this.notification) {
        this.notification.timer--;
        if (this.notification.timer <= 0) this.notification = null;
    }

};

TWB.Game.prototype.render = function() {
    var ctx = this.ctx;
    var cam = this.camera;

    ctx.fillStyle = this.indoors ? '#060606' : '#0a1a2a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.indoors) {
        for (var ity = 0; ity < TWB.INTERIOR_ROWS; ity++) {
            for (var itx = 0; itx < TWB.INTERIOR_COLS; itx++) {
                var itile = TWB.getInteriorGround(itx, ity);
                var isprite = TWB.Sprites.ground[itile];
                if (isprite) {
                    ctx.drawImage(isprite, Math.floor(itx * TWB.TILE - cam.x), Math.floor(ity * TWB.TILE - cam.y));
                }
            }
        }
    } else {
        var sc = Math.floor(cam.x / TWB.TILE) - 1;
        var sr = Math.floor(cam.y / TWB.TILE) - 1;
        var ec = Math.ceil((cam.x + this.canvas.width) / TWB.TILE) + 1;
        var er = Math.ceil((cam.y + this.canvas.height) / TWB.TILE) + 1;

        for (var ty = sr; ty <= er; ty++) {
            for (var tx = sc; tx <= ec; tx++) {
                if (tx < 0 || ty < 0 || tx >= TWB.COLS || ty >= TWB.ROWS) continue;
                var tile = TWB.getGround(tx, ty);
                var sprite = TWB.Sprites.ground[tile];
                if (sprite) {
                    ctx.drawImage(sprite, Math.floor(tx * TWB.TILE - cam.x), Math.floor(ty * TWB.TILE - cam.y));
                }
            }
        }
    }

    var renderList = [];

    for (var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        if (obj.x > cam.x - 100 && obj.x < cam.x + this.canvas.width + 100 &&
            obj.y > cam.y - 100 && obj.y < cam.y + this.canvas.height + 100) {
            renderList.push({ kind: 'obj', data: obj, sortY: obj.y });
        }
    }

    renderList.push({ kind: 'player', sortY: this.player.y });
    renderList.push({ kind: 'wolf', sortY: this.wolf.y });

    renderList.sort(function(a, b) { return a.sortY - b.sortY; });

    for (var i = 0; i < renderList.length; i++) {
        var item = renderList[i];
        if (item.kind === 'obj') {
            this.drawObject(item.data);
        } else if (item.kind === 'player') {
            this.drawEntity(this.player, 'char');
        } else if (item.kind === 'wolf') {
            this.drawEntity(this.wolf, 'wolf');
        }
    }

    if (!this.indoors) this.drawWildlife();
    if (!this.indoors && this.shadows.length > 0) this.drawShadows();
    this.drawFire();
    this.drawLighting();
    if (this.indoors && this.doorShake > 0) this.drawDoorShake();
    if (this.indoors && this.stranger) this.drawStranger();
    if (this.raining && !this.indoors) this.drawRain();
    if (this.fogDensity > 0 && !this.indoors) this.drawFog();
    this.drawCold();
    this.drawClock();
    this.drawHUD();
    if (this.backpackOpen) this.drawBackpack();
    if (this.craftingOpen) this.drawCrafting();
    this.drawMenu();
    this.drawNotification();
    if (this.mapOpen) this.drawMap();
    if (this.readingNote) this.drawNote();
    if (this.windowView) this.drawWindowView();
    if (this.fates) this.drawFates();
    if (this.victory) this.drawVictory();
    if (this.dead) this.drawDeath();
};

TWB.Game.prototype.drawObject = function(obj) {
    var sprite = TWB.Sprites[obj.type];
    if (!sprite) return;
    var anchor = TWB.getSpriteAnchor(obj.type);
    var dx = Math.floor(obj.x - anchor.x - this.camera.x);
    var dy = Math.floor(obj.y - anchor.y - this.camera.y);
    var ctx = this.ctx;

    var swayTypes = { tree_pine: 0.025, tree_oak: 0.018, bush: 0.012 };
    var swayAmt = swayTypes[obj.type];
    if (swayAmt) {
        var phase = this.fireTime * 0.015 + obj.x * 0.05 + obj.y * 0.03;
        var shear = Math.sin(phase) * swayAmt + Math.sin(phase * 1.7) * swayAmt * 0.3;
        ctx.save();
        var baseX = dx + sprite.width / 2;
        var baseY = dy + sprite.height;
        ctx.translate(baseX, baseY);
        ctx.transform(1, 0, -shear, 1, 0, 0);
        ctx.translate(-baseX, -baseY);
        ctx.drawImage(sprite, dx, dy);
        ctx.restore();
    } else {
        ctx.drawImage(sprite, dx, dy);
    }

    if (obj.type === 'cairn' && this.flashlightOn) {
        var hour3 = this.getGameHour();
        var darkNow = hour3 < 6 || hour3 >= 19;
        if (darkNow) {
            var pDist = Math.sqrt(
                (this.player.x - obj.x) * (this.player.x - obj.x) +
                (this.player.y - obj.y) * (this.player.y - obj.y)
            );
            if (pDist < 140) {
                var glimmer = 0.3 + Math.sin(this.fireTime * 0.08) * 0.15;
                ctx.save();
                ctx.globalAlpha = glimmer * (1 - pDist / 140);
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = '#c0d0e0';
                ctx.fillRect(dx + 8, dy + 6, 4, 2);
                ctx.fillRect(dx + 6, dy + 12, 3, 2);
                ctx.fillRect(dx + 10, dy + 18, 3, 2);
                ctx.globalAlpha = 1;
                ctx.restore();
            }
        }
    }

    if (obj === this.hoverObj) {
        ctx.strokeStyle = 'rgba(212,164,74,0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(dx, dy, sprite.width, sprite.height);
    }
};

TWB.Game.prototype.drawEntity = function(ent, prefix) {
    var dirs = ['Down', 'Up', 'Left', 'Right'];
    var key = prefix + dirs[ent.dir];
    var sprites = TWB.Sprites[key];
    if (!sprites) return;
    var spr = sprites[ent.frame] || sprites[0];
    var dx = Math.floor(ent.x - spr.width / 2 - this.camera.x);
    var dy = Math.floor(ent.y - spr.height + 6 - this.camera.y);
    this.ctx.drawImage(spr, dx, dy);
};

TWB.Game.prototype.drawFire = function() {
    var ctx = this.ctx;
    var t = this.fireTime;

    for (var oi = 0; oi < this.objects.length; oi++) {
        var obj = this.objects[oi];
        var fuel = 0;
        if (obj.type === 'campfire') {
            fuel = obj.tempFuel !== undefined ? obj.tempFuel : this.fireFuel;
        } else if (obj.type === 'fireplace') {
            fuel = this.fireplaceFuel;
        } else {
            continue;
        }

        var fx = Math.floor(obj.x - this.camera.x);
        var yOff = obj.type === 'fireplace' ? -4 : -8;
        var fy = Math.floor(obj.y - this.camera.y) + yOff;
        var fuelPct = Math.min(1, fuel / 100);

        if (fuelPct <= 0) {
            ctx.fillStyle = 'rgba(60,30,10,0.3)';
            ctx.fillRect(fx - 4, fy - 2, 12, 4);
            continue;
        }

        var flameCount = Math.max(1, Math.floor(5 * fuelPct));
        var flameScale = 0.3 + 0.7 * fuelPct;
        var alpha = 0.2 + 0.5 * fuelPct;

        for (var i = 0; i < flameCount; i++) {
            var flick = Math.sin(t * 0.15 + i * 1.5 + oi) * 3;
            var h = (8 + Math.sin(t * 0.1 + i + oi) * 3) * flameScale;
            ctx.fillStyle = 'rgba(255,100,20,' + alpha + ')';
            ctx.fillRect(fx - 3 + i * 2 + flick, fy - h, 3, h);
            ctx.fillStyle = 'rgba(255,200,50,' + (alpha * 0.7) + ')';
            ctx.fillRect(fx - 2 + i * 2 + flick, fy - h * 0.6, 2, h * 0.4);
        }

        var glowR = 50 * fuelPct;
        var glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
        glow.addColorStop(0, 'rgba(255,150,50,' + (0.1 * fuelPct) + ')');
        glow.addColorStop(1, 'rgba(255,150,50,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(fx - glowR - 10, fy - glowR - 10, glowR * 2 + 20, glowR * 2 + 20);
    }

    for (var si = 0; si < this.objects.length; si++) {
        var shr = this.objects[si];
        if (shr.type !== 'shrine' || !shr.lit) continue;
        var sx = Math.floor(shr.x - this.camera.x);
        var sy = Math.floor(shr.y - this.camera.y) - 16;
        if (sx < -100 || sx > this.canvas.width + 100 || sy < -100 || sy > this.canvas.height + 100) continue;
        var sfPct = Math.min(1, shr.litFuel / 200);
        var flick2 = Math.sin(t * 0.12 + si * 2.3) * 2;
        ctx.fillStyle = 'rgba(255,160,40,' + (0.4 + sfPct * 0.3) + ')';
        ctx.fillRect(sx + 1 + flick2, sy - 6, 2, 4);
        ctx.fillStyle = 'rgba(255,200,80,' + (0.3 + sfPct * 0.2) + ')';
        ctx.fillRect(sx + flick2, sy - 4, 3, 2);
        var sGlowR = 40 + 20 * sfPct;
        var sGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sGlowR);
        sGlow.addColorStop(0, 'rgba(255,180,60,' + (0.08 + sfPct * 0.06) + ')');
        sGlow.addColorStop(1, 'rgba(255,180,60,0)');
        ctx.fillStyle = sGlow;
        ctx.fillRect(sx - sGlowR, sy - sGlowR, sGlowR * 2, sGlowR * 2);
    }
};

TWB.Game.prototype.getGameHour = function() {
    var totalMinutes = Math.floor(this.gameTime / 60);
    return (totalMinutes % 1440) / 60;
};

TWB.Game.prototype.getBaseTemperature = function() {
    var hour = this.getGameHour();
    var peak = 22;
    var low = 4;
    var base = 8;
    if (hour >= 6 && hour < 14.5) {
        var t = (hour - 6) / 8.5;
        return Math.round(low + t * (peak - low));
    } else if (hour >= 14.5 && hour < 21) {
        var t = (hour - 14.5) / 6.5;
        return Math.round(peak - t * (peak - base));
    }
    if (hour >= 20 || hour < 4) {
        var nightBase = -3 - Math.floor(Math.random() * 5);
        if (this.nightType === 'freeze') nightBase -= 5;
        return nightBase;
    }
    return low;
};

TWB.Game.prototype.getTemperatureBreakdown = function() {
    var base = this.getBaseTemperature();
    var wind = -Math.round(this.windSpeed * 3);
    var rain = (this.raining && !this.indoors) ? -4 : 0;
    var wet = -Math.round(this.wetness * 0.06);

    var fire = 0;
    if (!this.indoors) {
        var bestFire = 0;
        for (var i = 0; i < this.objects.length; i++) {
            var o = this.objects[i];
            if (o.type !== 'campfire' && o.type !== 'fireplace') continue;
            var fuel = o.tempFuel !== undefined ? o.tempFuel : this.fireFuel;
            if (fuel <= 0) continue;
            var dx = this.player.x - o.x;
            var dy = this.player.y - o.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                var warmth = Math.round((1 - dist / 120) * (fuel / 100) * 10);
                if (warmth > bestFire) bestFire = warmth;
            }
        }
        fire = bestFire;
    }

    var shelter = 0;
    if (this.indoors) {
        var cabDamaged = this.currentCabinIdx >= 0 && TWB._cabinData[this.currentCabinIdx].damaged && !TWB._cabinData[this.currentCabinIdx].repaired;
        shelter = cabDamaged ? 2 : 5;
        var maxHeat = cabDamaged ? 6 : 12;
        if (this.fireplaceFuel > 0) shelter += Math.round((this.fireplaceFuel / 100) * maxHeat);
    }

    var clothing = 0;
    if (this.getItemCount('coat') > 0) clothing += 3;

    var shrineWarmth = 0;
    if (!this.indoors) {
        for (var swi = 0; swi < this.objects.length; swi++) {
            var sw = this.objects[swi];
            if (sw.type !== 'shrine' || !sw.lit) continue;
            var swdx = this.player.x - sw.x;
            var swdy = this.player.y - sw.y;
            if (Math.sqrt(swdx * swdx + swdy * swdy) < 100) { shrineWarmth = 4; break; }
        }
    }

    return {
        base: base,
        wind: wind,
        rain: rain,
        wetness: wet,
        fire: fire,
        shelter: shelter,
        clothing: clothing,
        shrine: shrineWarmth,
        feelsLike: base + wind + rain + wet + fire + shelter + clothing + shrineWarmth
    };
};

TWB.Game.prototype.getTemperature = function() {
    return this.getTemperatureBreakdown().feelsLike;
};

TWB.Game.prototype.getExposureState = function() {
    var t = this.getTemperature();
    if (t > 7) return { level: 0, label: 'Comfortable', dmg: 0 };
    if (t > 4) return { level: 1, label: 'Chilled', dmg: 0.1 };
    if (t > 1) return { level: 2, label: 'Cold', dmg: 0.4 };
    if (t > 0) return { level: 3, label: 'Freezing', dmg: 1.0 };
    return { level: 4, label: 'Severe Freezing', dmg: 2.0 };
};

TWB.Game.prototype.drawCold = function() {
    var exposure = this.getExposureState();
    if (exposure.level === 0) return;
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var intensity = exposure.level / 4;

    ctx.fillStyle = 'rgba(30,50,120,' + (intensity * 0.2) + ')';
    ctx.fillRect(0, 0, w, h);

    var t = this.gameTime;
    var crystalCount = Math.floor(intensity * 16);
    for (var i = 0; i < crystalCount; i++) {
        var cx = (TWB.hash(i * 7 + Math.floor(t / 200), 888) % w);
        var cy = (TWB.hash(888, i * 11 + Math.floor(t / 200)) % h);
        var size = 2 + (TWB.hash(i, i) % 3);
        var alpha = 0.15 + intensity * 0.25;
        ctx.strokeStyle = 'rgba(180,210,255,' + alpha + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy);
        ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy + size);
        ctx.moveTo(cx - size * 0.7, cy - size * 0.7); ctx.lineTo(cx + size * 0.7, cy + size * 0.7);
        ctx.moveTo(cx + size * 0.7, cy - size * 0.7); ctx.lineTo(cx - size * 0.7, cy + size * 0.7);
        ctx.stroke();
    }

    if (exposure.level >= 3) {
        var pulseA = 0.05 + Math.sin(t * 0.02) * 0.03;
        ctx.fillStyle = 'rgba(40,60,140,' + pulseA + ')';
        ctx.fillRect(0, 0, w, h);
    }

    var edgeAlpha = intensity * 0.35;
    var grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.65);
    grad.addColorStop(0, 'rgba(100,150,220,0)');
    grad.addColorStop(1, 'rgba(100,150,220,' + edgeAlpha + ')');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
};

TWB.Game.prototype.drawClock = function() {
    var ctx = this.ctx;
    var totalMinutes = Math.floor(this.gameTime / 60);
    var hours = Math.floor(totalMinutes / 60) % 24;
    var minutes = totalMinutes % 60;
    var timeStr = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

    var hour = this.getGameHour();
    var period = hour < 6 ? 'NIGHT' : hour < 9 ? 'DAWN' : hour < 12 ? 'MORNING' : hour < 18 ? 'AFTERNOON' : hour < 21 ? 'DUSK' : 'NIGHT';

    var boxW = 90;
    var cx = this.canvas.width - boxW - 8;
    var cy = 12;

    ctx.fillStyle = 'rgba(6,6,10,0.8)';
    ctx.fillRect(cx - 6, cy - 4, boxW, 30);
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 6, cy - 4, boxW, 30);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#d4a44a';
    ctx.fillText(timeStr, cx, cy);

    ctx.font = '8px "Press Start 2P", monospace';
    var periodColor = hour < 5 ? '#4060a0' : hour < 7 ? '#d08040' : hour < 12 ? '#a0a060' : hour < 17 ? '#c0b060' : hour < 20 ? '#c08030' : '#4060a0';
    ctx.fillStyle = periodColor;
    var periodSuffix = this.raining ? ' RAIN' : '';
    if (this.nightActive && this.nightType === 'freeze') periodSuffix = ' STORM';
    else if (this.nightActive && this.nightType === 'shadow_surge') periodSuffix = ' DARK';
    ctx.fillText(period + periodSuffix, cx, cy + 16);

    var temp = this.getTemperature();
    var exposure = this.getExposureState();
    var expColors = ['#80c080', '#c0c060', '#d09040', '#6090d0', '#4060c0'];
    var tempBoxW = 52;
    var tx = 8;
    var ty = 12;
    var boxH = exposure.level > 0 ? 34 : 22;
    ctx.fillStyle = 'rgba(6,6,10,0.8)';
    ctx.fillRect(tx - 4, ty - 4, tempBoxW, boxH);
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx - 4, ty - 4, tempBoxW, boxH);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = expColors[exposure.level];
    ctx.fillText(temp + '°C', tx, ty);
    if (exposure.level > 0) {
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillText(exposure.label, tx, ty + 14);
    }

    ctx.textAlign = 'left';
};

TWB.Game.prototype.drawLighting = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var hour = this.getGameHour();

    var overlayR = 0, overlayG = 0, overlayB = 0, overlayA = 0;

    if (hour < 6) {
        overlayR = 6; overlayG = 6; overlayB = 20; overlayA = 0.75;
    } else if (hour < 9) {
        var t = (hour - 6) / 3;
        overlayR = Math.floor(6 + t * 50);
        overlayG = Math.floor(6 + t * 20);
        overlayB = Math.floor(20 - t * 15);
        overlayA = 0.75 - t * 0.70;
    } else if (hour < 14.5) {
        var t = (hour - 9) / 5.5;
        overlayA = 0.05 - t * 0.04;
    } else if (hour < 18) {
        var t = (hour - 14.5) / 3.5;
        overlayA = 0.01 + t * 0.04;
    } else if (hour < 21) {
        var t = (hour - 18) / 3;
        overlayR = Math.floor(40 * t);
        overlayG = Math.floor(20 * t);
        overlayB = Math.floor(5 + t * 15);
        overlayA = 0.05 + t * 0.70;
    } else {
        var t = Math.min(1, (hour - 21) / 2);
        overlayR = Math.floor(40 - t * 34);
        overlayG = Math.floor(20 - t * 14);
        overlayB = Math.floor(20);
        overlayA = 0.75;
    }

    if (this.nightActive && this.nightType === 'shadow_surge' && !this.indoors) {
        overlayR = 20; overlayG = 5; overlayB = 30;
    }

    if (this.indoors) {
        if (hour >= 8 && hour < 18) {
            overlayA = 0;
        } else if (hour >= 6 && hour < 21) {
            overlayA = Math.min(overlayA, 0.10);
        } else {
            overlayA = Math.min(overlayA, 0.45);
        }
    }

    if (overlayA < 0.02) {
        if (!this.indoors) {
            var cx = w / 2, cy = h / 2;
            var r = Math.max(w, h) * 0.6;
            var vig = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.1)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, w, h);
        }
        return;
    }

    if (!this._lightCanvas) {
        this._lightCanvas = document.createElement('canvas');
        this._lightCanvas.width = w;
        this._lightCanvas.height = h;
    }
    var lc = this._lightCanvas;
    var lctx = lc.getContext('2d');
    lctx.clearRect(0, 0, w, h);

    lctx.fillStyle = 'rgba(' + overlayR + ',' + overlayG + ',' + overlayB + ',' + overlayA + ')';
    lctx.fillRect(0, 0, w, h);

    var vigAlpha = this.indoors ? (hour < 6 || hour > 21 ? 0.4 : (hour < 8 || hour > 18 ? 0.15 : 0)) : (hour < 6 || hour > 21 ? 0.6 : (hour < 9 || hour > 18 ? 0.3 : 0.1));
    var cx = w / 2, cy = h / 2;
    var r = Math.max(w, h) * 0.6;
    var vig = lctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,' + vigAlpha + ')');
    lctx.fillStyle = vig;
    lctx.fillRect(0, 0, w, h);

    lctx.globalCompositeOperation = 'destination-out';

    if (this.flashlightOn) {
        var p = this.player;
        var px = Math.floor(p.x - this.camera.x);
        var py = Math.floor(p.y - this.camera.y);
        var angle;
        switch (p.dir) {
            case 0: angle = Math.PI / 2; break;
            case 1: angle = -Math.PI / 2; break;
            case 2: angle = Math.PI; break;
            case 3: angle = 0; break;
            default: angle = Math.PI / 2;
        }
        var reach = 140;
        var spread = 0.45;
        var strength = overlayA > 0.4 ? 0.85 : (overlayA > 0.1 ? 0.6 : 0.3);
        var grad = lctx.createRadialGradient(px, py, 4, px + Math.cos(angle) * 50, py + Math.sin(angle) * 50, reach);
        grad.addColorStop(0, 'rgba(0,0,0,' + strength + ')');
        grad.addColorStop(0.5, 'rgba(0,0,0,' + (strength * 0.6) + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.beginPath();
        lctx.moveTo(px, py);
        lctx.arc(px, py, reach, angle - spread, angle + spread);
        lctx.closePath();
        lctx.fillStyle = grad;
        lctx.fill();

        var glow = lctx.createRadialGradient(px, py, 0, px, py, 35);
        glow.addColorStop(0, 'rgba(0,0,0,' + (strength * 0.5) + ')');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = glow;
        lctx.fillRect(px - 35, py - 35, 70, 70);
    }

    if (!this.indoors && this.fireFuel > 0) {
        var campfire = null;
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].type === 'campfire') { campfire = this.objects[i]; break; }
        }
        if (campfire) {
            var fx = Math.floor(campfire.x - this.camera.x);
            var fy = Math.floor(campfire.y - this.camera.y);
            var fireR = 60 + (this.fireFuel / 100) * 40;
            var fireGrad = lctx.createRadialGradient(fx, fy, 0, fx, fy, fireR);
            fireGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
            fireGrad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
            fireGrad.addColorStop(1, 'rgba(0,0,0,0)');
            lctx.fillStyle = fireGrad;
            lctx.fillRect(fx - fireR, fy - fireR, fireR * 2, fireR * 2);
        }
    }

    if (this.indoors && this.fireplaceFuel > 0) {
        var fpx = 3 * TWB.TILE + 16;
        var fpy = 1 * TWB.TILE + 24;
        var spx = fpx - this.camera.x;
        var spy = fpy - this.camera.y;
        var fpR = 50 + (this.fireplaceFuel / 100) * 30;
        var fpGrad = lctx.createRadialGradient(spx, spy, 0, spx, spy, fpR);
        fpGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
        fpGrad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
        fpGrad.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = fpGrad;
        lctx.fillRect(spx - fpR, spy - fpR, fpR * 2, fpR * 2);
    }

    if (!this.indoors) {
        for (var sli = 0; sli < this.objects.length; sli++) {
            var sl = this.objects[sli];
            if (sl.type !== 'shrine' || !sl.lit) continue;
            var slx = Math.floor(sl.x - this.camera.x);
            var sly = Math.floor(sl.y - this.camera.y) - 10;
            var slR = 50 + Math.min(1, sl.litFuel / 200) * 30;
            var slGrad = lctx.createRadialGradient(slx, sly, 0, slx, sly, slR);
            slGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
            slGrad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
            slGrad.addColorStop(1, 'rgba(0,0,0,0)');
            lctx.fillStyle = slGrad;
            lctx.fillRect(slx - slR, sly - slR, slR * 2, slR * 2);
        }
    }

    lctx.globalCompositeOperation = 'source-over';

    ctx.drawImage(lc, 0, 0);

    if (this.flashlightOn && overlayA > 0.1) {
        var p = this.player;
        var px = Math.floor(p.x - this.camera.x);
        var py = Math.floor(p.y - this.camera.y);
        var angle;
        switch (p.dir) {
            case 0: angle = Math.PI / 2; break;
            case 1: angle = -Math.PI / 2; break;
            case 2: angle = Math.PI; break;
            case 3: angle = 0; break;
            default: angle = Math.PI / 2;
        }
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        var warmGrad = ctx.createRadialGradient(px, py, 4, px + Math.cos(angle) * 50, py + Math.sin(angle) * 50, 140);
        var warmA = overlayA > 0.4 ? 0.08 : 0.04;
        warmGrad.addColorStop(0, 'rgba(255,240,200,' + warmA + ')');
        warmGrad.addColorStop(0.5, 'rgba(255,230,180,' + (warmA * 0.5) + ')');
        warmGrad.addColorStop(1, 'rgba(255,220,160,0)');
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.arc(px, py, 140, angle - 0.45, angle + 0.45);
        ctx.closePath();
        ctx.fillStyle = warmGrad;
        ctx.fill();
        ctx.restore();
    }
};

TWB.Game.prototype.drawWildlife = function() {
    var ctx = this.ctx;
    var cam = this.camera;

    for (var i = 0; i < this.wildlife.length; i++) {
        var a = this.wildlife[i];
        var ax = Math.floor(a.x - cam.x);
        var ay = Math.floor(a.y - cam.y);
        if (ax < -20 || ax > this.canvas.width + 20 || ay < -20 || ay > this.canvas.height + 20) continue;
        ctx.fillStyle = '#1a1a12';
        ctx.fillRect(ax - 3, ay - 2, 6, 4);
        ctx.fillRect(ax - 1, ay - 4, 2, 2);
        ctx.fillStyle = '#0e0e0a';
        ctx.fillRect(ax + 3, ay, 2, 1);
    }

    if (this.predator) {
        var p = this.predator;
        var px = Math.floor(p.x - cam.x);
        var py = Math.floor(p.y - cam.y);
        var isBear = p.name === 'Bear';
        if (isBear) {
            ctx.fillStyle = '#0a0806';
            ctx.fillRect(px - 6, py + 6, 28, 4);
            ctx.fillStyle = '#1a120c';
            ctx.fillRect(px - 10, py - 10, 36, 18);
            ctx.fillRect(px - 12, py - 8, 40, 14);
            ctx.fillStyle = '#241a12';
            ctx.fillRect(px - 8, py - 8, 32, 14);
            ctx.fillStyle = '#2e2018';
            ctx.fillRect(px - 6, py - 6, 28, 10);
            ctx.fillStyle = '#1a120c';
            ctx.fillRect(px + 18, py - 16, 12, 12);
            ctx.fillRect(px + 20, py - 14, 10, 10);
            ctx.fillStyle = '#241a12';
            ctx.fillRect(px + 20, py - 14, 8, 8);
            ctx.fillStyle = '#1a120c';
            ctx.fillRect(px + 18, py - 22, 6, 6);
            ctx.fillRect(px + 26, py - 22, 6, 6);
            ctx.fillStyle = '#2e2018';
            ctx.fillRect(px + 20, py - 20, 2, 2);
            ctx.fillRect(px + 28, py - 20, 2, 2);
            ctx.fillStyle = '#382a1e';
            ctx.fillRect(px + 24, py - 10, 6, 4);
            ctx.fillStyle = '#0a0806';
            ctx.fillRect(px + 26, py - 12, 2, 2);
            ctx.fillRect(px + 22, py - 12, 2, 2);
            ctx.fillStyle = '#1a120c';
            ctx.fillRect(px - 10, py + 4, 6, 8);
            ctx.fillRect(px - 2, py + 4, 6, 8);
            ctx.fillRect(px + 10, py + 4, 6, 8);
            ctx.fillRect(px + 20, py + 2, 6, 8);
            ctx.fillStyle = '#0e0a06';
            ctx.fillRect(px - 10, py + 10, 6, 2);
            ctx.fillRect(px - 2, py + 10, 6, 2);
            ctx.fillRect(px + 10, py + 10, 6, 2);
            ctx.fillRect(px + 20, py + 8, 6, 2);
        } else {
            ctx.fillStyle = '#1a1a18';
            ctx.fillRect(px - 5, py - 3, 10, 6);
            ctx.fillRect(px - 2, py - 6, 4, 3);
            ctx.fillStyle = '#c04040';
            ctx.fillRect(px - 1, py - 5, 1, 1);
            ctx.fillRect(px + 1, py - 5, 1, 1);
        }

        if (this.gameTime % 40 < 20) {
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = '#c04040';
            ctx.textAlign = 'center';
            ctx.fillText('!', px, py - 12);
            ctx.textAlign = 'left';
        }
    }

    if (this.wolfHunting) {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#d4a44a';
        ctx.textAlign = 'center';
        var wsx = Math.floor(this.wolf.x - cam.x);
        var wsy = Math.floor(this.wolf.y - cam.y) - 14;
        ctx.fillText('*', wsx, wsy);
        ctx.textAlign = 'left';
    }

    if (this.predator && !this.fleeing) {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#c04040';
        ctx.textAlign = 'center';
        var dwx = Math.floor(this.wolf.x - cam.x);
        var dwy = Math.floor(this.wolf.y - cam.y) - 14;
        if (this.gameTime % 30 < 15) ctx.fillText('WOOF!', dwx, dwy);
        ctx.textAlign = 'left';
    }
};

TWB.Game.prototype.drawRain = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;

    while (this.rainDrops.length < 120) {
        this.rainDrops.push({
            x: Math.random() * w,
            y: Math.random() * h,
            len: 4 + Math.random() * 6,
            speed: 3 + Math.random() * 3
        });
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(160,180,200,0.25)';
    ctx.lineWidth = 1;
    for (var i = 0; i < this.rainDrops.length; i++) {
        var d = this.rainDrops[i];
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        d.x -= 0.3;
        if (d.y > h) {
            d.y = -d.len;
            d.x = Math.random() * w;
        }
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(30,40,60,0.08)';
    ctx.fillRect(0, 0, w, h);
};

TWB.Game.prototype.drawFog = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var d = this.fogDensity;
    var cx = w / 2, cy = h / 2;
    var t = this.fireTime;

    if (!this._fogCanvas) {
        this._fogCanvas = document.createElement('canvas');
        this._fogCanvas.width = w;
        this._fogCanvas.height = h;
    }
    var fc = this._fogCanvas.getContext('2d');
    fc.clearRect(0, 0, w, h);

    var clearR = 55 + (1 - d) * 60;

    fc.fillStyle = 'rgba(175,178,168,' + (d * 0.88) + ')';
    fc.fillRect(0, 0, w, h);

    fc.globalCompositeOperation = 'destination-out';
    var fogGrad = fc.createRadialGradient(cx, cy, 0, cx, cy, clearR * 1.8);
    fogGrad.addColorStop(0, 'rgba(0,0,0,' + Math.min(0.95, d * 0.95) + ')');
    fogGrad.addColorStop(0.25, 'rgba(0,0,0,' + (d * 0.85) + ')');
    fogGrad.addColorStop(0.5, 'rgba(0,0,0,' + (d * 0.5) + ')');
    fogGrad.addColorStop(0.75, 'rgba(0,0,0,' + (d * 0.15) + ')');
    fogGrad.addColorStop(1, 'rgba(0,0,0,0)');
    fc.fillStyle = fogGrad;
    fc.fillRect(0, 0, w, h);

    for (var gi = 0; gi < 20; gi++) {
        var seed = TWB.hash(gi * 31, Math.floor(t / 200) + gi * 7);
        var gx = seed % w;
        var gy = TWB.hash(seed, gi * 47) % h;
        var gr = 8 + seed % 18;
        var ga = d * (0.12 + (seed % 10) * 0.008);
        var gap = fc.createRadialGradient(gx, gy, 0, gx, gy, gr);
        gap.addColorStop(0, 'rgba(0,0,0,' + ga + ')');
        gap.addColorStop(1, 'rgba(0,0,0,0)');
        fc.fillStyle = gap;
        fc.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
    }

    fc.globalCompositeOperation = 'source-over';

    for (var i = 0; i < 14; i++) {
        var fx = (TWB.hash(i * 17, Math.floor(t / 150)) % w);
        var fy = (TWB.hash(Math.floor(t / 150), i * 23) % h);
        var fr = 70 + TWB.hash(i, i * 3) % 80;
        var fa = d * (0.1 + Math.sin(t * 0.002 + i * 0.7) * 0.04);
        var drift = fc.createRadialGradient(fx, fy, 0, fx, fy, fr);
        drift.addColorStop(0, 'rgba(185,185,178,' + fa + ')');
        drift.addColorStop(0.6, 'rgba(180,180,172,' + (fa * 0.4) + ')');
        drift.addColorStop(1, 'rgba(175,175,168,0)');
        fc.fillStyle = drift;
        fc.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
    }

    ctx.drawImage(this._fogCanvas, 0, 0);
};

TWB.Game.prototype.drawShadows = function() {
    var ctx = this.ctx;
    var cam = this.camera;
    var sprite = TWB.Sprites.shadow;
    if (!sprite) return;

    for (var i = 0; i < this.shadows.length; i++) {
        var sh = this.shadows[i];
        var sx = Math.floor(sh.x - cam.x) - 10;
        var sy = Math.floor(sh.y - cam.y) - 32;

        ctx.save();
        ctx.globalAlpha = sh.alpha * 0.7;
        ctx.drawImage(sprite, sx, sy);

        var sway = Math.sin(this.fireTime * 0.03 + i * 2) * 2;
        ctx.globalAlpha = sh.alpha * 0.3;
        ctx.drawImage(sprite, sx + sway, sy - 1);
        ctx.restore();
    }
};

TWB.Game.prototype.drawDoorShake = function() {
    var ctx = this.ctx;
    var cam = this.camera;
    var shake = Math.sin(this.doorShake * 0.5) * 2;

    for (var i = 0; i < this.objects.length; i++) {
        if (this.objects[i].type === 'cabin_door') {
            var obj = this.objects[i];
            var anchor = TWB.getSpriteAnchor('cabin_door');
            var dx = Math.floor(obj.x - anchor.x - cam.x + shake);
            var dy = Math.floor(obj.y - anchor.y - cam.y);
            var spr = TWB.Sprites.cabin_door;
            if (spr) {
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#1a0a0a';
                ctx.fillRect(dx - 2, dy - 2, spr.width + 4, spr.height + 4);
                ctx.restore();
            }
            break;
        }
    }
};

TWB.Game.prototype.drawStranger = function() {
    var ctx = this.ctx;
    var cam = this.camera;
    for (var i = 0; i < this.objects.length; i++) {
        if (this.objects[i].type === 'cabin_door') {
            var obj = this.objects[i];
            var dx = Math.floor(obj.x - cam.x);
            var dy = Math.floor(obj.y - cam.y - 30);
            var pulse = Math.sin(this.fireTime * 0.03) * 0.1;
            ctx.save();
            ctx.globalAlpha = 0.4 + pulse;
            ctx.fillStyle = this.stranger.type === 'shadow' ? '#0a0015' : '#1a1008';
            ctx.fillRect(dx - 5, dy - 20, 10, 24);
            ctx.fillRect(dx - 8, dy - 6, 16, 6);
            ctx.beginPath();
            ctx.arc(dx, dy - 24, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            break;
        }
    }
};

TWB.Game.prototype.canCraft = function(recipe) {
    for (var i = 0; i < recipe.needs.length; i++) {
        if (this.getItemCount(recipe.needs[i][0]) < recipe.needs[i][1]) return false;
    }
    return true;
};

TWB.Game.prototype.tryCraft = function(idx) {
    var recipe = TWB.RECIPES[idx];
    if (!recipe) return;
    if (!this.canCraft(recipe)) {
        this.notification = { text: 'Missing materials!', timer: 90 };
        return;
    }
    if (!this.addToBackpack(recipe.gives, 1)) {
        this.notification = { text: 'Backpack is full!', timer: 90 };
        return;
    }
    for (var i = 0; i < recipe.needs.length; i++) {
        this.removeFromBackpack(recipe.needs[i][0], recipe.needs[i][1]);
    }
    this.notification = { text: 'Crafted ' + recipe.label + '!', timer: 120 };
};

TWB.Game.prototype.getCraftItemAt = function(sx, sy) {
    var pw = 280;
    var ph = 30 + TWB.RECIPES.length * 24 + 10;
    var px = Math.floor((this.canvas.width - pw) / 2);
    var py = Math.floor((this.canvas.height - ph) / 2) - 20;
    for (var i = 0; i < TWB.RECIPES.length; i++) {
        var ry = py + 28 + i * 24;
        if (sx >= px + 8 && sx <= px + pw - 8 && sy >= ry && sy <= ry + 20) return i;
    }
    return -1;
};

TWB.Game.prototype.drawCrafting = function() {
    var ctx = this.ctx;
    var pw = 280;
    var ph = 30 + TWB.RECIPES.length * 24 + 10;
    var px = Math.floor((this.canvas.width - pw) / 2);
    var py = Math.floor((this.canvas.height - ph) / 2) - 20;

    ctx.fillStyle = 'rgba(6,6,10,0.92)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, pw, ph);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#d4a44a';
    ctx.fillText('CRAFTING [C]', px + 10, py + 8);

    ctx.font = '8px "Press Start 2P", monospace';
    for (var i = 0; i < TWB.RECIPES.length; i++) {
        var r = TWB.RECIPES[i];
        var ry = py + 28 + i * 24;
        var can = this.canCraft(r);

        ctx.fillStyle = can ? 'rgba(40,60,40,0.6)' : 'rgba(30,30,40,0.4)';
        ctx.fillRect(px + 8, ry, pw - 16, 20);
        if (can) {
            ctx.strokeStyle = '#406040';
            ctx.strokeRect(px + 8, ry, pw - 16, 20);
        }

        ctx.fillStyle = can ? '#c0c0a0' : '#555';
        ctx.fillText(r.label, px + 14, ry + 3);

        var needs = '';
        for (var j = 0; j < r.needs.length; j++) {
            if (j > 0) needs += ' + ';
            var have = this.getItemCount(r.needs[j][0]);
            var need = r.needs[j][1];
            needs += (TWB.ITEM_LABELS[r.needs[j][0]] || r.needs[j][0]) + ' ' + have + '/' + need;
        }
        ctx.fillStyle = can ? '#808060' : '#444';
        ctx.fillText(needs, px + 14, ry + 12);
    }
};

TWB.Game.prototype.drawMenu = function() {
    if (!this.menu) return;
    var ctx = this.ctx;
    var m = this.menu;
    var menuW = 130;
    var itemH = 22;
    var padX = 10;
    var padY = 6;
    var menuH = m.items.length * itemH + padY * 2;

    var mx = m.sx;
    var my = m.sy;
    if (mx + menuW > this.canvas.width) mx = this.canvas.width - menuW - 4;
    if (my + menuH > this.canvas.height) my = this.canvas.height - menuH - 4;

    ctx.fillStyle = 'rgba(8,8,12,0.92)';
    ctx.fillRect(mx - 1, my - 1, menuW + 2, menuH + 2);
    ctx.fillStyle = '#14141c';
    ctx.fillRect(mx, my, menuW, menuH);
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx, my, menuW, menuH);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';

    for (var i = 0; i < m.items.length; i++) {
        var iy = my + padY + i * itemH;

        if (i === m.hovered) {
            ctx.fillStyle = 'rgba(212,164,74,0.15)';
            ctx.fillRect(mx + 2, iy, menuW - 4, itemH);
            ctx.fillStyle = '#d4a44a';
        } else {
            ctx.fillStyle = '#a0a0a8';
        }

        ctx.fillText(m.items[i].label, mx + padX, iy + itemH / 2 + 1);
    }
};

TWB.Game.prototype.drawNotification = function() {
    if (!this.notification) return;
    var ctx = this.ctx;
    var n = this.notification;
    var alpha = Math.min(1, n.timer / 30);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var tx = this.canvas.width / 2;
    var ty = this.canvas.height - 82;

    var isWarning = n.text === 'Too tired...' || n.text === 'Backpack is full!';
    var color = isWarning ? '#e05050' : '#d4a44a';

    if (isWarning) {
        ctx.fillStyle = 'rgba(80,20,20,0.7)';
        var tw = ctx.measureText(n.text).width;
        ctx.fillRect(tx - tw / 2 - 8, ty - 10, tw + 16, 22);
    }

    ctx.fillStyle = '#000';
    ctx.fillText(n.text, tx + 1, ty + 1);
    ctx.fillStyle = color;
    ctx.fillText(n.text, tx, ty);

    ctx.restore();
};

TWB.Game.prototype.drawMap = function() {
    var ctx = this.ctx;
    var cw = this.canvas.width;
    var ch = this.canvas.height;

    if (!this._mapCanvas) {
        this._mapCanvas = document.createElement('canvas');
        this._mapCanvas.width = cw;
        this._mapCanvas.height = ch;
        this._renderMapStatic(this._mapCanvas.getContext('2d'), cw, ch);
    }
    ctx.drawImage(this._mapCanvas, 0, 0);

    if (this.fogDensity > 0.3) {
        var pad = 24, bw = 10;
        var mapX = pad + bw, mapY = pad + bw;
        var mapW = cw - (pad + bw) * 2, mapH = ch - (pad + bw) * 2;
        var fsx = mapW / TWB.COLS, fsy = mapH / TWB.ROWS;
        var pos = this.lastKnownMapPos || { x: this.player.x, y: this.player.y };
        var fpx = mapX + (pos.x / TWB.TILE) * fsx;
        var fpy = mapY + (pos.y / TWB.TILE) * fsy;
        var revealR = 60;

        ctx.save();
        ctx.fillStyle = 'rgba(180,175,160,' + Math.min(0.92, this.fogDensity * 0.95) + ')';
        ctx.fillRect(0, 0, cw, ch);
        ctx.globalCompositeOperation = 'destination-out';
        var fogClear = ctx.createRadialGradient(fpx, fpy, 0, fpx, fpy, revealR);
        fogClear.addColorStop(0, 'rgba(0,0,0,0.9)');
        fogClear.addColorStop(0.6, 'rgba(0,0,0,0.5)');
        fogClear.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fogClear;
        ctx.fillRect(fpx - revealR, fpy - revealR, revealR * 2, revealR * 2);
        ctx.globalCompositeOperation = 'source-over';

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6a5a40';
        ctx.fillText('Fog... last known position', cw / 2, ch - 30);
        ctx.restore();
    }
};

TWB.Game.prototype._renderMapStatic = function(ctx, cw, ch) {
    var pad = 24, bw = 10;
    var ink = '#5a4630', inkL = '#8a7a58', red = '#8a3020';

    ctx.fillStyle = '#d4c4a0';
    ctx.fillRect(0, 0, cw, ch);

    for (var i = 0; i < 800; i++) {
        var px = TWB.hash(i, 8000) % cw;
        var py = TWB.hash(8000, i) % ch;
        ctx.fillStyle = (i % 3 === 0) ? '#c8b890' : (i % 3 === 1) ? '#dcd0b0' : '#c0b080';
        ctx.fillRect(px, py, 1 + i % 2, 1 + (i >> 1) % 2);
    }

    for (var i = 0; i < 5; i++) {
        var sx = TWB.hash(i * 7, 8500) % cw;
        var sy = TWB.hash(8500, i * 7) % ch;
        var sr = 25 + TWB.hash(i * 11, 8600) % 35;
        var grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        grad.addColorStop(0, 'rgba(155,135,105,0.12)');
        grad.addColorStop(1, 'rgba(155,135,105,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    }

    var ox = pad, oy = pad;
    var ow = cw - pad * 2, oh = ch - pad * 2;
    var ix = pad + bw, iy = pad + bw;
    var iw = cw - (pad + bw) * 2, ih = ch - (pad + bw) * 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, ow, oh);
    ctx.moveTo(ix + iw, iy);
    ctx.lineTo(ix, iy);
    ctx.lineTo(ix, iy + ih);
    ctx.lineTo(ix + iw, iy + ih);
    ctx.closePath();
    ctx.clip('evenodd');
    ctx.fillStyle = '#b8a880';
    ctx.fillRect(ox, oy, ow, oh);
    ctx.strokeStyle = '#9a8a68';
    ctx.lineWidth = 0.5;
    for (var d = -ch; d < cw + ch; d += 4) {
        ctx.beginPath();
        ctx.moveTo(d, 0);
        ctx.lineTo(d + ch, ch);
        ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = '#6a5030';
    ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, ow, oh);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ix, iy, iw, ih);

    var corners = [[ox, oy], [ox + ow, oy], [ox, oy + oh], [ox + ow, oy + oh]];
    for (var ci = 0; ci < 4; ci++) {
        ctx.fillStyle = '#6a5030';
        ctx.beginPath();
        ctx.arc(corners[ci][0], corners[ci][1], 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d4c4a0';
        ctx.beginPath();
        ctx.arc(corners[ci][0], corners[ci][1], 2, 0, Math.PI * 2);
        ctx.fill();
    }

    var mapX = ix, mapY = iy, mapW = iw, mapH = ih;
    var sx = mapW / TWB.COLS, sy = mapH / TWB.ROWS;

    ctx.fillStyle = inkL;
    for (var i = 0; i < 45; i++) {
        var mtx, mty, edge = i % 4;
        if (edge === 0) { mtx = 10 + TWB.hash(i * 7, 9000) % (TWB.COLS - 20); mty = TWB.hash(i * 11, 9100) % 14; }
        else if (edge === 1) { mtx = 10 + TWB.hash(i * 7, 9000) % (TWB.COLS - 20); mty = TWB.ROWS - 14 + TWB.hash(i * 11, 9100) % 14; }
        else if (edge === 2) { mtx = TWB.hash(i * 7, 9000) % 14; mty = 10 + TWB.hash(i * 11, 9100) % (TWB.ROWS - 20); }
        else { mtx = TWB.COLS - 14 + TWB.hash(i * 7, 9000) % 14; mty = 10 + TWB.hash(i * 11, 9100) % (TWB.ROWS - 20); }
        var mmx = mapX + mtx * sx, mmy = mapY + mty * sy;
        var ms = 3 + TWB.hash(i * 13, 9200) % 4;
        ctx.fillStyle = inkL;
        ctx.beginPath();
        ctx.moveTo(mmx, mmy - ms);
        ctx.lineTo(mmx - ms * 0.7, mmy + ms * 0.3);
        ctx.lineTo(mmx + ms * 0.7, mmy + ms * 0.3);
        ctx.closePath();
        ctx.fill();
    }

    var treeStep = 10;
    for (var tty = 12; tty < TWB.ROWS - 12; tty += treeStep) {
        for (var ttx = 12; ttx < TWB.COLS - 12; ttx += treeStep) {
            var h = TWB.hash(ttx, tty) % 100;
            var isBorder = tty <= 8 || tty >= TWB.ROWS - 8 || ttx >= TWB.COLS - 8 || ttx <= 8;
            var isEdge = tty <= 15 || tty >= TWB.ROWS - 15 || ttx >= TWB.COLS - 15 || ttx <= 15;
            var threshold = isBorder ? 70 : (isEdge ? 40 : 20);
            if (h >= threshold) continue;

            var rc1 = TWB.getRiverCenter(tty);
            if (Math.abs(ttx - rc1) < 6) continue;
            var rp = TWB._riverParams;
            if (rp && tty > rp.r2startY && tty < rp.r2endY) {
                if (Math.abs(ttx - TWB.getSecondRiver(tty)) < 6) continue;
            }

            var tmx = mapX + ttx * sx, tmy = mapY + tty * sy;
            var dark = h < threshold / 2;
            ctx.fillStyle = dark ? ink : inkL;
            ctx.strokeStyle = dark ? ink : inkL;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.arc(tmx, tmy - 2, 2.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(tmx, tmy + 0.8);
            ctx.lineTo(tmx, tmy + 3.5);
            ctx.stroke();
        }
    }

    ctx.lineCap = 'round';

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#7a6a4a';
    ctx.beginPath();
    ctx.moveTo(mapX + TWB.getRiverCenter(0) * sx, mapY);
    for (var ty = 2; ty < TWB.ROWS; ty += 2) {
        ctx.lineTo(mapX + TWB.getRiverCenter(ty) * sx, mapY + ty * sy);
    }
    ctx.stroke();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#9a8a68';
    for (var side = -1; side <= 1; side += 2) {
        ctx.beginPath();
        ctx.moveTo(mapX + (TWB.getRiverCenter(0) + side * 3) * sx, mapY);
        for (var ty = 2; ty < TWB.ROWS; ty += 2) {
            ctx.lineTo(mapX + (TWB.getRiverCenter(ty) + side * 3) * sx, mapY + ty * sy);
        }
        ctx.stroke();
    }

    var rp = TWB._riverParams;
    if (rp) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#7a6a4a';
        ctx.beginPath();
        ctx.moveTo(mapX + TWB.getSecondRiver(rp.r2startY) * sx, mapY + rp.r2startY * sy);
        for (var ty = rp.r2startY + 2; ty < rp.r2endY; ty += 2) {
            ctx.lineTo(mapX + TWB.getSecondRiver(ty) * sx, mapY + ty * sy);
        }
        ctx.stroke();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#9a8a68';
        for (var side = -1; side <= 1; side += 2) {
            ctx.beginPath();
            ctx.moveTo(mapX + (TWB.getSecondRiver(rp.r2startY) + side * 2) * sx, mapY + rp.r2startY * sy);
            for (var ty = rp.r2startY + 2; ty < rp.r2endY; ty += 2) {
                ctx.lineTo(mapX + (TWB.getSecondRiver(ty) + side * 2) * sx, mapY + ty * sy);
            }
            ctx.stroke();
        }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = inkL;
    for (var ti = 0; ti < TWB._tributaries.length; ti++) {
        var t = TWB._tributaries[ti];
        ctx.beginPath();
        ctx.moveTo(mapX + t.rx * sx, mapY + t.ry * sy);
        for (var d = 1; d <= t.length; d++) {
            ctx.lineTo(mapX + (t.rx + t.dir * d) * sx, mapY + (t.ry + Math.sin(d * t.curve) * 4 + d * t.slope) * sy);
        }
        ctx.stroke();
    }

    for (var oi = 0; oi < this.objects.length; oi++) {
        var bo = this.objects[oi];
        if (bo.type !== 'boulder') continue;
        var bx = mapX + (bo.x / TWB.TILE) * sx;
        var by = mapY + (bo.y / TWB.TILE) * sy;
        ctx.fillStyle = '#4a3a20';
        ctx.beginPath();
        ctx.moveTo(bx - 5, by + 2);
        ctx.lineTo(bx - 3, by - 3);
        ctx.lineTo(bx + 1, by - 4);
        ctx.lineTo(bx + 5, by - 2);
        ctx.lineTo(bx + 6, by + 1);
        ctx.lineTo(bx + 3, by + 3);
        ctx.lineTo(bx - 4, by + 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#3a2a14';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.fillStyle = '#6a5a3a';
        ctx.fillRect(bx - 2, by - 2, 3, 2);
    }

    for (var cri = 0; cri < this.objects.length; cri++) {
        var crn = this.objects[cri];
        if (crn.type !== 'cairn') continue;
        var crx = mapX + (crn.x / TWB.TILE) * sx;
        var cry = mapY + (crn.y / TWB.TILE) * sy;
        ctx.fillStyle = '#706050';
        ctx.beginPath();
        ctx.arc(crx, cry, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#908070';
        ctx.fillRect(crx - 0.5, cry - 2, 1, 1.5);
    }

    for (var sri = 0; sri < this.objects.length; sri++) {
        var sro = this.objects[sri];
        if (sro.type !== 'shrine') continue;
        var srx = mapX + (sro.x / TWB.TILE) * sx;
        var sry = mapY + (sro.y / TWB.TILE) * sy;
        ctx.fillStyle = '#807060';
        ctx.fillRect(srx - 1, sry - 3, 2, 4);
        ctx.fillRect(srx - 2, sry - 1, 4, 1);
    }

    for (var bmi = 0; bmi < this.objects.length; bmi++) {
        var bmo = this.objects[bmi];
        if (bmo.type !== 'bridge' && bmo.type !== 'broken_bridge' && bmo.type !== 'stepping_stones') continue;
        var bmx = mapX + (bmo.x / TWB.TILE) * sx;
        var bmy = mapY + (bmo.y / TWB.TILE) * sy;
        if (bmo.type === 'bridge') {
            ctx.fillStyle = '#5a4a30';
            ctx.fillRect(bmx - 3, bmy - 1, 6, 2);
        } else if (bmo.type === 'broken_bridge') {
            ctx.fillStyle = '#8a3020';
            ctx.fillRect(bmx - 3, bmy - 1, 2, 2);
            ctx.fillRect(bmx + 1, bmy - 1, 2, 2);
        } else {
            ctx.fillStyle = '#6a6050';
            for (var bsi = 0; bsi < 3; bsi++) {
                ctx.fillRect(bmx - 1 + bsi * 2 - 2, bmy - 1 + bsi, 2, 1);
            }
        }
    }

    for (var ci = 0; ci < TWB._cabinData.length; ci++) {
        var c = TWB._cabinData[ci];
        var cx = mapX + c.cx * sx, cy = mapY + c.cy * sy;
        ctx.fillStyle = ink;
        ctx.fillRect(cx - 2.5, cy - 2.5, 5, 5);
    }

    var sc = TWB._cabinData[TWB._startCabin];
    var scx = mapX + sc.cx * sx, scy = mapY + sc.cy * sy;
    ctx.save();
    ctx.translate(scx, scy - 10);
    ctx.rotate(-0.06);
    ctx.font = 'italic 9px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2a1a08';
    ctx.fillText('You are here', 0, 0);
    ctx.restore();
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(scx - 2, scy - 6);
    ctx.lineTo(scx, scy - 3);
    ctx.lineTo(scx + 2, scy - 6);
    ctx.stroke();

    if (TWB._targetCabin >= 0) {
        var tc = TWB._cabinData[TWB._targetCabin];
        var tcx = mapX + tc.cx * sx, tcy = mapY + tc.cy * sy;
        ctx.strokeStyle = '#2a1a08';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        var nPts = 28;
        for (var pi = 0; pi <= nPts; pi++) {
            var ang = (pi / nPts) * Math.PI * 2 - 0.3;
            var wobble = Math.sin(pi * 1.7) * 1.8 + Math.cos(pi * 2.9) * 1.2;
            var rr = 9 + wobble;
            var px = tcx + Math.cos(ang) * rr;
            var py = tcy + Math.sin(ang) * rr;
            if (pi === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    var crx = mapX + mapW - 40, cry = mapY + mapH - 40, crs = 18;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(crx, cry, crs, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(crx, cry, crs + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(crx, cry, 2, 0, Math.PI * 2);
    ctx.fill();

    var mainA = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    for (var i = 0; i < 4; i++) {
        var a = mainA[i];
        var len = (i === 0) ? crs + 6 : crs;
        ctx.fillStyle = (i % 2 === 0) ? ink : inkL;
        ctx.beginPath();
        ctx.moveTo(crx + Math.cos(a) * len, cry + Math.sin(a) * len);
        ctx.lineTo(crx + Math.cos(a - 0.3) * crs * 0.2, cry + Math.sin(a - 0.3) * crs * 0.2);
        ctx.lineTo(crx + Math.cos(a + 0.3) * crs * 0.2, cry + Math.sin(a + 0.3) * crs * 0.2);
        ctx.closePath();
        ctx.fill();
    }
    var secA = [-Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4];
    for (var i = 0; i < 4; i++) {
        var a = secA[i];
        ctx.fillStyle = (i % 2 === 0) ? inkL : ink;
        ctx.beginPath();
        ctx.moveTo(crx + Math.cos(a) * crs * 0.55, cry + Math.sin(a) * crs * 0.55);
        ctx.lineTo(crx + Math.cos(a - 0.35) * crs * 0.15, cry + Math.sin(a - 0.35) * crs * 0.15);
        ctx.lineTo(crx + Math.cos(a + 0.35) * crs * 0.15, cry + Math.sin(a + 0.35) * crs * 0.15);
        ctx.closePath();
        ctx.fill();
    }
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = ink;
    ctx.fillText('N', crx, cry - crs - 8);

    var serpX = mapX + mapW - 100, serpY = mapY + 22;
    ctx.strokeStyle = '#9a8a68';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(serpX - 3, serpY + 2, 3, Math.PI, 0, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(serpX, serpY);
    for (var si = 1; si <= 28; si++) {
        ctx.lineTo(serpX + si * 1.8, serpY + Math.sin(si * 0.35) * 5);
    }
    ctx.stroke();
    var hx = serpX + 28 * 1.8, hy = serpY + Math.sin(28 * 0.35) * 5;
    ctx.fillStyle = '#9a8a68';
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + 6, hy - 3);
    ctx.lineTo(hx + 4, hy + 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(hx + 3, hy - 1, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = red;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(hx + 6, hy - 1.5);
    ctx.lineTo(hx + 9, hy - 3);
    ctx.moveTo(hx + 6, hy - 1.5);
    ctx.lineTo(hx + 9, hy);
    ctx.stroke();
    ctx.strokeStyle = '#9a8a68';
    ctx.lineWidth = 0.8;
    var wingX = serpX + 16, wingY = serpY + Math.sin(9 * 0.35) * 5;
    ctx.beginPath();
    ctx.moveTo(wingX, wingY);
    ctx.quadraticCurveTo(wingX + 3, wingY - 10, wingX + 8, wingY - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wingX + 8, wingY - 5);
    ctx.quadraticCurveTo(wingX + 5, wingY - 3, wingX + 2, wingY);
    ctx.stroke();

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6a5030';
    ctx.fillText('THE WAY BACK', cw / 2, pad - 6);
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = inkL;
    ctx.fillText('[M] Close', cw / 2, ch - pad + 14);
    ctx.textAlign = 'left';
};

TWB.Game.prototype.drawBackpack = function() {
    var ctx = this.ctx;
    var l = this.getBackpackLayout();

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = 'rgba(8,8,12,0.96)';
    ctx.fillRect(l.px - 2, l.py - 2, l.pw + 4, l.ph + 4);
    ctx.fillStyle = '#12121a';
    ctx.fillRect(l.px, l.py, l.pw, l.ph);
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(l.px, l.py, l.pw, l.ph);
    ctx.strokeStyle = '#d4a44a';
    ctx.strokeRect(l.px - 1, l.py - 1, l.pw + 2, l.ph + 2);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#d4a44a';
    ctx.fillText('BACKPACK', l.px + l.pw / 2, l.py + 10);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#606068';
    var used = 0;
    for (var c = 0; c < this.backpack.length; c++) { if (this.backpack[c]) used++; }
    ctx.fillText(used + '/10 slots · Tab to close', l.px + l.pw / 2, l.py + 28);

    for (var i = 0; i < this.backpack.length; i++) {
        var col = i % l.cols;
        var row = Math.floor(i / l.cols);
        var bx = l.slotsX + col * (l.slotSize + l.gap);
        var by = l.slotsY + row * (l.slotSize + l.gap);
        var slot = this.backpack[i];
        var selected = (i === this.backpackHover);

        ctx.fillStyle = selected ? '#1e1e2a' : '#0e0e16';
        ctx.fillRect(bx, by, l.slotSize, l.slotSize);
        ctx.strokeStyle = selected ? '#d4a44a' : '#2a2a3a';
        ctx.lineWidth = selected ? 2 : 1;
        ctx.strokeRect(bx, by, l.slotSize, l.slotSize);

        ctx.textAlign = 'center';
        if (slot) {
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = '#c0c0c8';
            ctx.fillText(slot.count.toString(), bx + l.slotSize / 2, by + 12);

            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = '#8a8a92';
            var label = TWB.ITEM_LABELS[slot.type] || slot.type;
            ctx.fillText(label, bx + l.slotSize / 2, by + 30);
        } else {
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = '#222230';
            ctx.fillText('Empty', bx + l.slotSize / 2, by + 22);
        }
    }

    var btns = this.getBackpackBtns();
    if (btns.length > 0) {
        var totalRows = Math.ceil(this.backpack.length / l.cols);
        var baseY = l.slotsY + totalRows * (l.slotSize + l.gap) + 4;
        var btnW = 70;
        var btnH = 20;
        var gapX = 12;
        var gapY = 6;
        var startX = l.px + Math.floor((l.pw - btnW * 2 - gapX) / 2);
        var btnLabels = { eat: 'Eat', feed: 'Feed ' + (this.dogName || 'Wolf'), drop1: 'Drop 1', dropall: 'Drop All', drink_canteen: 'Drink', use_bandage: 'Use' };
        var btnColors = { eat: ['#103a18', '#1a4a24', '#40c060', '#60e080'],
                          feed: ['#18283a', '#203848', '#4090c0', '#60b0e0'],
                          drop1: ['#1a1018', '#3a2020', '#a04040', '#e06060'],
                          dropall: ['#1a1018', '#3a2020', '#a04040', '#e06060'] };

        ctx.font = '8px "Press Start 2P", monospace';
        for (var bi = 0; bi < btns.length; bi++) {
            var col = bi % 2;
            var row = Math.floor(bi / 2);
            var bx = startX + col * (btnW + gapX);
            var by = baseY + row * (btnH + gapY);
            var hovered = this.backpackBtnHover === btns[bi];
            var c = btnColors[btns[bi]];
            ctx.fillStyle = hovered ? c[1] : c[0];
            ctx.fillRect(bx, by, btnW, btnH);
            ctx.strokeStyle = c[2];
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, by, btnW, btnH);
            ctx.fillStyle = hovered ? c[3] : c[2];
            ctx.fillText(btnLabels[btns[bi]], bx + btnW / 2, by + 6);
        }
    }

    ctx.textAlign = 'left';
};

TWB.Game.prototype.drawBar = function(ctx, x, y, w, h, pct, bg, fg) {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fg;
    ctx.fillRect(x, y, Math.floor(w * pct / 100), h);
    ctx.strokeStyle = '#0a0a10';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
};

TWB.WINDOW_QUOTES = {
    general: [
        'The mountain doesn\'t care if we make it.',
        'How many days now... I\'ve lost count.',
        'The trees are watching.',
        'I can\'t remember the way home.',
        'The wind sounds like voices.',
        'It\'s beautiful... and terrifying.',
        'We have to keep moving.',
        'Somewhere out there... the road home.',
        'The silence is deafening.',
        'Just one more cabin... then the next.'
    ],
    rain: [
        'The rain won\'t stop.',
        'Even the sky is crying.',
        'We can\'t go out in this.',
        'The glass is cold to the touch.',
        'Rain hammers the roof like fists.'
    ],
    night: [
        'Something moves between the trees.',
        'The darkness feels alive.',
        'I hear things... out there.',
        'Better not look too long.',
        'The stars don\'t comfort me anymore.'
    ],
    dawn: [
        'Another day. We\'re still alive.',
        'The light returns... barely.',
        'Maybe today we find the way.',
        'The fog hides everything.'
    ],
    river: [
        'The river knows the way... but I don\'t.',
        'If I follow the water...',
        'The current is strong today.'
    ]
};

TWB.WINDOW_FRAMES = [
    { cols: 2, rows: 3 },
    { cols: 2, rows: 2 },
    { cols: 3, rows: 2 },
    { cols: 1, rows: 2 },
    { cols: 2, rows: 3 }
];

TWB.Game.prototype.openWindowView = function() {
    var cabIdx = this.currentCabinIdx;
    var cab = TWB._cabinData[cabIdx];
    var hour = this.getGameHour();
    var nearRiver = false;
    var rc = TWB.getRiverCenter(cab.cy);
    if (Math.abs(cab.cx - rc) < 25) nearRiver = true;
    if (!nearRiver) {
        var r2 = TWB.getSecondRiver(cab.cy);
        if (r2 !== null && Math.abs(cab.cx - r2) < 25) nearRiver = true;
    }

    var quotes = [];
    if (this.raining) {
        quotes = quotes.concat(TWB.WINDOW_QUOTES.rain);
    }
    if (hour < 6 || hour >= 21) {
        quotes = quotes.concat(TWB.WINDOW_QUOTES.night);
    } else if (hour < 9) {
        quotes = quotes.concat(TWB.WINDOW_QUOTES.dawn);
    }
    if (nearRiver) {
        quotes = quotes.concat(TWB.WINDOW_QUOTES.river);
    }
    quotes = quotes.concat(TWB.WINDOW_QUOTES.general);
    var quote = quotes[Math.floor(Math.random() * quotes.length)];

    var frameStyle = TWB.WINDOW_FRAMES[cabIdx % TWB.WINDOW_FRAMES.length];
    var seed = TWB.hash(cab.cx, cab.cy);

    this.windowView = {
        cabinIdx: cabIdx,
        nearRiver: nearRiver,
        hour: hour,
        quote: quote,
        frame: 0,
        frameStyle: frameStyle,
        seed: seed,
        treeSeed: (seed >>> 8) & 0xFFFF,
        mtSeed: (seed >>> 4) & 0xFFFF
    };
};

TWB.Game.prototype.drawWindowView = function() {
    var ctx = this.ctx;
    var cw = this.canvas.width;
    var ch = this.canvas.height;
    var wv = this.windowView;
    var f = wv.frame;
    var H = TWB.hash;

    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, cw, ch);

    var vw = 480, vh = 340;
    var vx = Math.floor((cw - vw) / 2);
    var vy = Math.floor((ch - vh) / 2) - 30;

    var hour = wv.hour;
    var isNight = hour < 6 || hour >= 21;
    var isDusk = hour >= 18 && hour < 21;
    var isDawn = hour >= 6 && hour < 9;
    var isDay = !isNight && !isDusk && !isDawn;
    var showSun = !isNight;

    var frameCol = isNight ? '#0c0a08' : '#181410';
    var frameHi = isNight ? '#181614' : '#282220';
    var frameSh = isNight ? '#060504' : '#0e0c0a';
    var fs = wv.frameStyle;
    var barW = 7;
    var outerW = 10;

    ctx.fillStyle = frameSh;
    ctx.fillRect(vx - outerW - 1, vy - outerW - 1, vw + outerW * 2 + 2, vh + outerW * 2 + 2);

    var imgKey;
    if (wv.nearRiver) {
        if (isNight) imgKey = 'w-view-river-2';
        else if (isDusk || isDawn) imgKey = 'w-view-river-1';
        else imgKey = 'w-view-river-2';
    } else {
        if (isNight) imgKey = 'w-view-mountain-night-1';
        else if (isDusk || isDawn) imgKey = 'w-view-mountain-day-1';
        else imgKey = 'w-view-mountain-day-2';
    }

    var img = TWB.WindowViews[imgKey];
    if (img) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        var scale = vw / img.width;
        var srcH = Math.min(img.height, vh / scale);
        var cropOffset = imgKey.indexOf('river') >= 0 ? 0.35 : 0.2;
        var srcY = (img.height - srcH) * cropOffset;
        ctx.drawImage(img, 0, srcY, img.width, srcH, vx, vy, vw, vh);

        if (isNight && imgKey !== 'w-view-mountain-night-1') {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#040810';
            ctx.fillRect(vx, vy, vw, vh);
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    if (this.raining) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(vx, vy, vw, vh);
        ctx.clip();
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = isNight ? '#1a2030' : '#5a6070';
        ctx.fillRect(vx, vy, vw, vh);
        ctx.globalAlpha = 1;
        for (var ri2 = 0; ri2 < 120; ri2++) {
            var rdx = vx + ((ri2 * 37 + f * 4) % vw);
            var rdy = vy + ((ri2 * 53 + f * 9) % vh);
            var rLen = 3 + (ri2 % 5);
            ctx.strokeStyle = 'rgba(160,175,200,' + (isNight ? '0.1' : '0.18') + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rdx, rdy);
            ctx.lineTo(rdx - 1.5, rdy + rLen);
            ctx.stroke();
        }
        ctx.restore();
    }

    if (this.nightType === 'freeze' && this.nightActive) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(vx, vy, vw, vh);
        ctx.clip();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#a0c8e0';
        ctx.fillRect(vx, vy, vw, vh);
        ctx.globalAlpha = 1;
        for (var fi = 0; fi < 40; fi++) {
            var fx2 = vx + ((H(fi, 300) >>> 4) % vw);
            var fy2 = vy + ((H(300, fi) >>> 4) % vh);
            var fSize = 2 + (fi % 3);
            ctx.globalAlpha = 0.3 + Math.sin(f * 0.02 + fi) * 0.15;
            ctx.fillStyle = '#d0e8f0';
            ctx.fillRect(fx2, fy2, fSize, fSize);
            if (fi < 15) {
                var edgeX = (fi < 8) ? vx + fi * 6 : vx + vw - (fi - 8) * 8;
                var edgeY = (fi % 2 === 0) ? vy + (fi % 5) * 4 : vy + vh - 10 + (fi % 4) * 2;
                ctx.globalAlpha = 0.25;
                ctx.fillRect(edgeX, edgeY, 4 + fi % 3, 3);
            }
        }
        ctx.restore();
    }

    if (this.nightType === 'shadow_surge' && this.nightActive) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(vx, vy, vw, vh);
        ctx.clip();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#200830';
        ctx.fillRect(vx, vy, vw, vh);
        for (var swi2 = 0; swi2 < 3; swi2++) {
            var swx = vx + 60 + swi2 * 150 + Math.sin(f * 0.01 + swi2 * 2) * 20;
            var swy = vy + vh - 60 - Math.abs(Math.sin(f * 0.005 + swi2)) * 40;
            ctx.globalAlpha = 0.15 + Math.sin(f * 0.02 + swi2) * 0.08;
            ctx.fillStyle = '#0a0010';
            ctx.fillRect(swx - 5, swy, 10, 50);
            ctx.fillRect(swx - 3, swy - 10, 6, 10);
        }
        ctx.restore();
    }

    ctx.fillStyle = frameCol;
    ctx.fillRect(vx - outerW, vy - outerW, vw + outerW * 2, outerW);
    ctx.fillRect(vx - outerW, vy + vh, vw + outerW * 2, outerW + 4);
    ctx.fillRect(vx - outerW, vy - outerW, outerW, vh + outerW * 2 + 4);
    ctx.fillRect(vx + vw, vy - outerW, outerW, vh + outerW * 2 + 4);
    ctx.fillStyle = frameHi;
    ctx.fillRect(vx - outerW + 1, vy - outerW + 1, vw + outerW * 2 - 2, 1);
    ctx.fillRect(vx - outerW + 1, vy - outerW + 1, 1, vh + outerW * 2 + 2);

    for (var ci = 1; ci < fs.cols; ci++) {
        var cx = vx + Math.floor(ci * vw / fs.cols) - Math.floor(barW / 2);
        ctx.fillStyle = frameSh;
        ctx.fillRect(cx - 1, vy, barW + 2, vh);
        ctx.fillStyle = frameCol;
        ctx.fillRect(cx, vy, barW, vh);
        ctx.fillStyle = frameHi;
        ctx.fillRect(cx + 1, vy, 1, vh);
    }
    for (var ri3 = 1; ri3 < fs.rows; ri3++) {
        var hy = vy + Math.floor(ri3 * vh / fs.rows) - Math.floor(barW / 2);
        ctx.fillStyle = frameSh;
        ctx.fillRect(vx, hy - 1, vw, barW + 2);
        ctx.fillStyle = frameCol;
        ctx.fillRect(vx, hy, vw, barW);
        ctx.fillStyle = frameHi;
        ctx.fillRect(vx, hy + 1, vw, 1);
    }

    ctx.fillStyle = frameCol;
    ctx.fillRect(vx - outerW, vy + vh, vw + outerW * 2, outerW + 6);
    ctx.fillStyle = frameHi;
    ctx.fillRect(vx - outerW + 2, vy + vh + 1, vw + outerW * 2 - 4, 2);

    var quoteAlpha = Math.min(1, f / 90);
    ctx.globalAlpha = quoteAlpha;
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#c0b898';
    ctx.textAlign = 'center';
    ctx.fillText('"' + wv.quote + '"', Math.floor(cw / 2), vy + vh + outerW + 24);
    ctx.globalAlpha = 1;

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#484030';
    ctx.fillText('click to close', Math.floor(cw / 2), vy + vh + outerW + 42);
    ctx.textAlign = 'left';
};

TWB.Game.prototype.drawNote = function() {
    var ctx = this.ctx;
    var cw = this.canvas.width;
    var ch = this.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, cw, ch);

    var pw = 340;
    var ph = 180;
    var px = Math.floor((cw - pw) / 2);
    var py = Math.floor((ch - ph) / 2) - 20;

    ctx.fillStyle = '#2a2820';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = '#322e24';
    ctx.fillRect(px + 3, py + 3, pw - 6, ph - 6);

    ctx.strokeStyle = '#1a1810';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, pw, ph);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#a09880';
    ctx.textAlign = 'center';

    var lines = this.readingNote.split('\n');
    var startY = py + 40 + Math.floor((ph - 80 - lines.length * 22) / 2);
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], Math.floor(cw / 2), startY + i * 22);
    }

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#605840';
    ctx.fillText('press any key', Math.floor(cw / 2), py + ph - 16);

    ctx.textAlign = 'left';
};

TWB.Game.prototype.drawVictory = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var t = Math.min(this.victoryTimer / 120, 1);

    ctx.fillStyle = 'rgba(0, 0, 0, ' + (t * 0.85) + ')';
    ctx.fillRect(0, 0, w, h);

    if (t < 0.3) return;

    var textA = Math.min(1, (t - 0.3) / 0.3);
    var hours = Math.floor(this.gameTime / 3600);
    var days = Math.floor(hours / 24);
    var dayStr = days === 1 ? '1 day' : days + ' days';

    ctx.save();
    ctx.globalAlpha = textA;

    ctx.fillStyle = '#d4a44a';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU MADE IT', w / 2, h / 2 - 80);

    ctx.fillStyle = '#c8c8d0';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('You found the way back.', w / 2, h / 2 - 40);

    if (t > 0.6) {
        var statA = Math.min(1, (t - 0.6) / 0.3);
        ctx.globalAlpha = statA;

        ctx.fillStyle = '#8a8a9a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('Survived ' + dayStr, w / 2, h / 2 + 10);
        ctx.fillText('Health: ' + Math.round(this.stats.health) + '%', w / 2, h / 2 + 30);
        ctx.fillText((this.dogName || 'Dog') + ' HP: ' + Math.round(this.wolfStats.health) + '%', w / 2, h / 2 + 50);

        var fireCount = 0;
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].type === 'campfire' && this.objects[i].tempFuel !== undefined) fireCount++;
        }
        ctx.fillText('Fires lit: ' + fireCount, w / 2, h / 2 + 70);
    }

    if (t >= 1) {
        ctx.fillStyle = '#6a6a7a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('Press R to play again', w / 2, h / 2 + 120);
    }

    ctx.restore();
};

TWB.Game.prototype.drawDeath = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var t = Math.min(this.deathTimer / 150, 1);

    ctx.fillStyle = 'rgba(30, 0, 0, ' + (t * 0.9) + ')';
    ctx.fillRect(0, 0, w, h);

    if (t < 0.3) return;

    var textA = Math.min(1, (t - 0.3) / 0.3);
    var hours = Math.floor(this.gameTime / 3600);
    var days = Math.floor(hours / 24);
    var dayStr = days === 1 ? '1 day' : days + ' days';

    ctx.save();
    ctx.globalAlpha = textA;

    ctx.fillStyle = '#8a2020';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU PERISHED', w / 2, h / 2 - 80);

    ctx.fillStyle = '#c8a0a0';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(this.deathCause, w / 2, h / 2 - 40);

    if (t > 0.6) {
        var statA = Math.min(1, (t - 0.6) / 0.3);
        ctx.globalAlpha = statA;

        ctx.fillStyle = '#8a6a6a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('Survived ' + dayStr, w / 2, h / 2 + 10);
    }

    if (t >= 1) {
        ctx.fillStyle = '#6a4a4a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('Press R to try again', w / 2, h / 2 + 120);
    }

    ctx.restore();
};

TWB.Game.prototype.handleFatesAnswer = function(choice) {
    var q = this.fates.question;
    if (choice === q.correct) {
        var tc = TWB._cabinData[TWB._targetCabin];
        var dx = tc.cx * TWB.TILE - this.player.x;
        var dy = tc.cy * TWB.TILE - this.player.y;
        var dir = '';
        if (Math.abs(dy) > Math.abs(dx) * 0.5) dir += dy < 0 ? 'North' : 'South';
        if (Math.abs(dx) > Math.abs(dy) * 0.5) dir += (dir ? '-' : '') + (dx < 0 ? 'West' : 'East');
        var dist = Math.sqrt(dx * dx + dy * dy) / TWB.TILE;
        var distWord = dist < 50 ? 'close' : dist < 150 ? 'far' : 'very far';
        this.notification = { text: 'Your path lies to the ' + dir + '... ' + distWord + '.', timer: 300 };
    } else {
        this.foggy = true;
        this.fogTimer = 3600 + Math.floor(Math.random() * 3600);
        this.lastKnownMapPos = { x: this.player.x, y: this.player.y };
        this.notification = { text: 'Wrong... the fog swallows you.', timer: 180 };
    }
    this.fates = null;
    this.fatesCooldown = 18000;
};

TWB.Game.prototype.drawFates = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var f = this.fates;
    var t = f.fade;

    ctx.save();
    ctx.globalAlpha = t * 0.65;
    ctx.fillStyle = '#0a0010';
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = t;

    var sprite = TWB.Sprites.fates;
    if (sprite) {
        var spx = w / 2 - sprite.width / 2;
        var spy = h / 2 - 140;
        ctx.globalAlpha = t * t;
        ctx.drawImage(sprite, Math.floor(spx), Math.floor(spy));
        ctx.globalAlpha = t;
    }

    var fw = 340, fh = 220;
    var fx = (w - fw) / 2;
    var fy = (h - fh) / 2;

    ctx.fillStyle = 'rgba(10,0,20,' + (0.88 * t) + ')';
    ctx.strokeStyle = 'rgba(74,48,96,' + t + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(fx, fy, fw, fh);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8a6aaa';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('The three women speak:', fx + fw / 2, fy + 28);

    ctx.fillStyle = '#c8b8e0';
    ctx.font = '8px "Press Start 2P", monospace';
    var lines = f.question.q.split('\n');
    for (var li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], fx + fw / 2, fy + 58 + li * 18);
    }

    if (t >= 1) {
        var btnW = 140, btnH = 30;
        var btnY = fy + fh - 52;
        var btn1x = fx + fw / 2 - btnW - 10;
        var btn2x = fx + fw / 2 + 10;

        ctx.fillStyle = f.hovered === 0 ? '#5a3a80' : '#2a1a40';
        ctx.fillRect(btn1x, btnY, btnW, btnH);
        ctx.strokeStyle = '#6a4a90';
        ctx.strokeRect(btn1x, btnY, btnW, btnH);

        ctx.fillStyle = f.hovered === 1 ? '#5a3a80' : '#2a1a40';
        ctx.fillRect(btn2x, btnY, btnW, btnH);
        ctx.strokeStyle = '#6a4a90';
        ctx.strokeRect(btn2x, btnY, btnW, btnH);

        ctx.fillStyle = '#d0c0f0';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(f.question.a[0], btn1x + btnW / 2, btnY + 18);
        ctx.fillText(f.question.a[1], btn2x + btnW / 2, btnY + 18);
    }

    ctx.restore();
};

TWB.Game.prototype.drawHUD = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var hudH = 80;
    var hudY = this.canvas.height - hudH;

    ctx.fillStyle = 'rgba(6,6,10,0.88)';
    ctx.fillRect(0, hudY, w, hudH);
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, hudY, w, 1);
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(0, hudY + 1, w, 1);

    var s = this.stats;
    var ws = this.wolfStats;

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';

    var faceH = TWB.Resources.face_human;
    if (faceH) {
        var fhH = Math.floor(faceH.height * (60 / faceH.width));
        ctx.drawImage(faceH, 4, hudY + 10, 60, fhH);
    }
    var px = 68;
    ctx.fillStyle = '#d4a44a';
    ctx.fillText(this.playerName || 'PLAYER', px, hudY + 5);
    this.drawBar(ctx, px, hudY + 17, 70, 6, s.health, '#4a1010', '#b83030');
    this.drawBar(ctx, px, hudY + 27, 70, 6, s.energy, '#0a3a18', '#20a040');
    this.drawBar(ctx, px, hudY + 37, 70, 6, s.hunger, '#3a2a08', '#c08820');
    this.drawBar(ctx, px, hudY + 47, 70, 6, s.thirst, '#0a2a3a', '#2080c0');
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('HP', px + 73, hudY + 17);
    ctx.fillText('EN', px + 73, hudY + 27);
    ctx.fillText('HU', px + 73, hudY + 37);
    ctx.fillText('TH', px + 73, hudY + 47);
    if (s.hunger < 20) { ctx.fillStyle = '#c03030'; ctx.fillText('HUNGRY!', px, hudY + 60); }
    else if (s.thirst < 20) { ctx.fillStyle = '#2060c0'; ctx.fillText('THIRSTY!', px, hudY + 60); }

    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(160, hudY + 5, 1, hudH - 10);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#d4a44a';
    ctx.fillText('BACKPACK [TAB]', 176, hudY + 5);
    ctx.font = '8px "Press Start 2P", monospace';
    var col1x = 176;
    var col2x = 340;
    var itemRow = 0;
    var usedSlots = 0;
    for (var bi = 0; bi < this.backpack.length; bi++) {
        var slot = this.backpack[bi];
        if (slot) {
            var colX = itemRow < 4 ? col1x : col2x;
            var rowY = hudY + 18 + (itemRow < 4 ? itemRow : itemRow - 4) * 11;
            var label = (TWB.ITEM_LABELS[slot.type] || slot.type) + ': ' + slot.count;
            ctx.fillStyle = '#a0a0a8';
            ctx.fillText(label, colX, rowY);
            itemRow++;
            usedSlots++;
        }
    }
    if (usedSlots === 0) {
        ctx.fillStyle = '#555';
        ctx.fillText('Empty', col1x, hudY + 30);
    }
    ctx.fillStyle = '#606068';
    ctx.fillText(usedSlots + '/10 slots', 176, hudY + 65);

    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(500, hudY + 5, 1, hudH - 10);

    var faceD = TWB.Resources.face_dog;
    if (faceD) {
        var fdH = Math.floor(faceD.height * (60 / faceD.width));
        ctx.drawImage(faceD, 506, hudY + 10, 60, fdH);
    }
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#d4a44a';
    var wx = 572;
    ctx.fillText(this.dogName || 'WOLF', wx, hudY + 5);
    this.drawBar(ctx, wx, hudY + 17, 70, 6, ws.health, '#4a1010', '#b83030');
    this.drawBar(ctx, wx, hudY + 27, 70, 6, ws.energy, '#0a3a18', '#20a040');
    this.drawBar(ctx, wx, hudY + 37, 70, 6, ws.hunger, '#3a2a08', '#c08820');
    this.drawBar(ctx, wx, hudY + 47, 70, 6, ws.thirst, '#0a2a3a', '#2080c0');
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('HP', wx + 73, hudY + 17);
    ctx.fillText('EN', wx + 73, hudY + 27);
    ctx.fillText('HU', wx + 73, hudY + 37);
    ctx.fillText('TH', wx + 73, hudY + 47);

    var moodColor = ws.mood === 'Happy' ? '#50c050' : ws.mood === 'Loyal' ? '#60a060' : ws.mood === 'Hungry' ? '#c08820' : ws.mood === 'Tired' ? '#a0a040' : '#a04040';
    ctx.fillStyle = moodColor;
    ctx.fillText('Mood: ' + ws.mood, wx, hudY + 60);

    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(660, hudY + 5, 1, hudH - 10);

    var ffx = 664;
    var fireLbl = this.indoors ? 'HEARTH' : 'FIRE';
    var fireFl = this.indoors ? this.fireplaceFuel : this.fireFuel;
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#d4a44a';
    ctx.fillText(fireLbl, ffx, hudY + 5);
    var fuelColor = fireFl > 40 ? '#c07020' : fireFl > 15 ? '#a05010' : '#802010';
    this.drawBar(ctx, ffx, hudY + 17, 90, 6, fireFl, '#1a0a04', fuelColor);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('FUEL', ffx + 93, hudY + 17);
    ctx.fillStyle = fireFl > 0 ? '#a06030' : '#802020';
    ctx.fillText(Math.floor(fireFl), ffx + 44, hudY + 17);
    if (fireFl <= 0) {
        ctx.fillStyle = '#a03030';
        ctx.fillText(this.indoors ? 'NOT LIT' : 'FIRE OUT!', ffx, hudY + 32);
    } else if (fireFl < 20) {
        ctx.fillStyle = '#a06030';
        ctx.fillText('Low fuel...', ffx, hudY + 32);
    }
};

window.TWB = TWB;
