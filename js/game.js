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
    herb_vikos: [
        { label: 'Pick herb', action: 'pick_vikosherb' }
    ],
    campfire: [
        { label: 'Cook food', action: 'cook' },
        { label: 'Add wood', action: 'addwood' },
        { label: 'Burn herb', action: 'burn_herb', needs: 'vikosherb' },
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
        { label: 'Cook food', action: 'cook_fp' },
        { label: 'Burn herb', action: 'burn_herb_fp', needs: 'vikosherb' }
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
    curse_shrine: [
        { label: 'Light shrine', action: 'light_curse_shrine' },
        { label: 'Take relic', action: 'take_relic' }
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
    this.difficulty = 1;

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
    this.runStats = { cabinsVisited: {}, distWalked: 0, mealsEaten: 0, itemsCrafted: 0, animalsHunted: 0, fishCaught: 0, predators: 0, nightsOut: 0, shadowHits: 0, lowestHP: 100, dogFed: 0, woodBurned: 0, storms: 0, itemsFound: 0 };
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
    this.snowing = false;
    this.snowTimer = 5400 + Math.floor(Math.random() * 10800);
    this.snowFlakes = [];
    this.snowAccum = {};
    this.snowAccumRate = 0;

    this.lastRestTime = -9999;
    this.lastSleepTime = 0;
    this.starvationTimer = 0;
    this.wolfStarvationTimer = 0;

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
    this.knockoutUsed = false;
    this.knockoutActive = false;
    this.knockoutTimer = 0;
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
    this.distortion = 0;
    this.distortionFlicker = 0;

    this.questPhase = 0;
    this.questDay = -1;
    this.questShrines = [];
    this.questShrinesLit = 0;
    this.questDogPos = null;
    this.questTimer = 0;
    this.questTimerMax = 48 * 3600;
    this.questRevealed = false;
    this.dogStolen = false;
    this.dogRescued = false;
    this.questSymbol = null;

    this.wetness = 0;
    this.windSpeed = 0;
    this.windTimer = 0;
    this.dogSense = null;

    this.phantomLight = null;
    this.phantomCooldown = 0;
    this.phantom2 = null;
    this.phantom2Cooldown = 0;

    this.iconHover = -1;

    var cursedCandidates = [];
    for (var cci = 0; cci < TWB._cabinData.length; cci++) {
        if (cci !== TWB._startCabin && cci !== TWB._targetCabin) cursedCandidates.push(cci);
    }
    this.cursedCabin = cursedCandidates[Math.floor(Math.random() * cursedCandidates.length)];
    this.cursedDogStopped = false;

    this.shadowDebt = 0;

    this.shadowTrails = {};

    this.mysteryEvent = null;
    this.mysterySpawned = false;
    this.mysteryChosen = Math.random() < 0.25 ? Math.floor(Math.random() * 50) : -1;

    this.elder = null;
    this.elderCooldown = 7200 + Math.floor(Math.random() * 14400);
    this.elderDialogue = null;
    this.elderPrompt = false;
    this.elderTales = [
        '"My grandmother used to say the Fates never appear to those who seek them. Only to those who are lost. If you ever see them standing still on the path, don\'t ask where you\'re going. They already know."',
        '"Down in the valley, below the mountain, every winter they saw a light walking. Whoever followed it returned at dawn from the opposite side of the village. No one ever learned who carried the lantern."',
        '"There was a cabin you could never find twice in the same place. Some said it moved. Others said it was the people who moved. Those who slept inside never agreed on where it had been."',
        '"Listen to the dog. People see with their eyes. The dog sees with something else. If it stops and refuses to go forward, you\'d better go around."',
        '"Never blow out a candle at a roadside shrine. Sometimes it was lit by the hand of the living, sometimes by the hand of the dead. You can never know which one it was."',
        '"The river doesn\'t always take people. Sometimes it only takes their name. That\'s what the old ones said. The person would return, but not even their own dog would recognize them."',
        '"The shadows aren\'t born at night. They wait there all day. The moment the sun sets, they rise."',
        '"In my village there was a fir tree nobody would cut down. Not because they feared the tree. They feared the one who sat beneath it when no one was looking."',
        '"Some nights you could hear a bell from a church that had crumbled before my father was born. Whoever followed the sound lost their way until dawn."',
        '"If you ever reach a cabin and the dog stays outside... don\'t go in first."',
        '"The Vikogiatroi knew something everyone else forgot. The herb with three leaves - you don\'t eat it. You throw it in the fire. The flame changes. The shadows don\'t dare come close."',
        '"Don\'t cross a stone bridge after midnight. Not because you\'ll fall. Because something passes underneath at that hour, and if it senses you, it won\'t let you leave."'
    ];
    this.storyTruth = [];
    for (var sti = 0; sti < this.elderTales.length; sti++) {
        this.storyTruth.push(Math.random() < 0.5);
    }
    this.storyTruth[10] = true;
    this.fireBuff = 0;
    this.fireBuffFP = 0;

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

        if (self.elderDialogue) return;

        if (self.menu) {
            self.menu.hovered = self.getMenuItemAt(sx, sy);
            return;
        }

        var iconHit = self.getIconAt(sx, sy);
        if (iconHit) {
            self.iconHover = iconHit === 'TAB' ? 0 : iconHit === 'M' ? 1 : iconHit === 'C' ? 2 : 3;
            self.canvas.style.cursor = 'pointer';
            self.hoverObj = null;
            return;
        }
        self.iconHover = -1;

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
        if (self.readingNote) { self.dismissNote(); return; }
        if (self.elderDialogue) { self.elderDialogue = null; return; }
        if (self.victory || self.dead) return;
        var rect = self.canvas.getBoundingClientRect();
        var sx = (e.clientX - rect.left) * (self.canvas.width / rect.width);
        var sy = (e.clientY - rect.top) * (self.canvas.height / rect.height);

        var iconHit = self.getIconAt(sx, sy);
        if (iconHit) {
            if (iconHit === 'TAB') {
                self.backpackOpen = !self.backpackOpen;
                self.backpackHover = -1;
                self.backpackBtnHover = null;
                if (self.backpackOpen) { self.menu = null; self.craftingOpen = false; self.mapOpen = false; }
            } else if (iconHit === 'M') {
                if (!self.backpackOpen && !self.craftingOpen && !self.menu) self.mapOpen = !self.mapOpen;
            } else if (iconHit === 'C') {
                if (!self.backpackOpen && !self.menu) { self.craftingOpen = !self.craftingOpen; self.craftHover = -1; if (self.craftingOpen) self.mapOpen = false; }
            } else if (iconHit === 'L') {
                self.flashlightOn = !self.flashlightOn;
                self.notification = { text: 'Flashlight ' + (self.flashlightOn ? 'ON' : 'OFF'), timer: 60 };
            }
            return;
        }

        if (self.mapOpen) {
            var cw = self.canvas.width;
            var mapXx = cw - 28, mapXy = 10, mapXs = 14;
            if (sx >= mapXx && sx <= mapXx + mapXs && sy >= mapXy && sy <= mapXy + mapXs) {
                self.mapOpen = false;
                return;
            }
            self.mapOpen = false;
            return;
        }

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

        var closeHit = self.getPanelCloseAt(sx, sy);
        if (closeHit === 'backpack') { self.backpackOpen = false; self.backpackHover = -1; return; }
        if (closeHit === 'crafting') { self.craftingOpen = false; return; }

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
                            self.runStats.mealsEaten++;
                            msg = 'Ate ' + label + ' (+' + hunGain + ' hunger)';
                            break;
                        case 'feed':
                            var wEnGain = slot.type === 'food' ? 25 : (slot.type === 'canned_food' ? 18 : 4);
                            var wHunGain = slot.type === 'food' ? 35 : (slot.type === 'canned_food' ? 25 : 6);
                            var wHpGain = slot.type === 'food' ? 8 : (slot.type === 'canned_food' ? 5 : 1);
                            self.removeFromBackpack(slot.type, 1);
                            self.wolfStats.energy = Math.min(100, self.wolfStats.energy + wEnGain);
                            self.wolfStats.hunger = Math.min(100, self.wolfStats.hunger + wHunGain);
                            self.wolfStats.health = Math.min(100, self.wolfStats.health + wHpGain);
                            if (slot.type === 'food') self.wolfStats.mood = 'Happy';
                            self.runStats.dogFed++;
                            msg = 'Fed ' + (self.dogName || 'wolf') + ' ' + label + ' (+' + wHunGain + ' hunger)';
                            break;
                        case 'drink_canteen':
                            self.removeFromBackpack('canteen_full', 1);
                            self.addToBackpack('canteen', 1);
                            self.stats.thirst = Math.min(100, self.stats.thirst + 35);
                            msg = 'Drank from canteen (+35 thirst)';
                            break;
                        case 'dog_drink_canteen':
                            self.removeFromBackpack('canteen_full', 1);
                            self.addToBackpack('canteen', 1);
                            self.wolfStats.thirst = Math.min(100, self.wolfStats.thirst + 35);
                            msg = (self.dogName || 'Dog') + ' drank from canteen (+35 thirst)';
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
            self.dismissNote();
            return;
        }
        if ((self.victory || self.dead) && (e.key === 'r' || e.key === 'R')) {
            location.reload();
            return;
        }
        if (self.victory || self.dead) return;
        if (self.elderDialogue) {
            if (e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
                self.elderDialogue = null;
                return;
            }
        }
        if ((e.key === 'e' || e.key === 'E') && self.elderPrompt && self.elder && !self.elderDialogue) {
            self.elderDialogue = {
                text: self.elderTales[self.elder.tale],
                female: self.elder.female
            };
            self.elder = null;
            self.elderPrompt = false;
            return;
        }
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
        if (e.key.length === 1) {
            self.cheatBuffer = (self.cheatBuffer + e.key.toLowerCase()).slice(-10);
            var cb = self.cheatBuffer;
            if (cb.slice(-6) === '123456') {
                self.foggy = true;
                self.fogTimer = 9999;
                self.lastKnownMapPos = { x: self.player.x, y: self.player.y };
                self.notification = { text: 'Dense fog rolls in...', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-5) === 'night') {
                self.gameTime = 20 * 3600 + 30 * 60;
                self.notification = { text: 'CHEAT: Night falls', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-3) === 'day') {
                self.gameTime = 8 * 3600;
                self.nightActive = false;
                self.distortion = 0;
                self.notification = { text: 'CHEAT: Dawn breaks', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-6) === 'starve') {
                self.stats.hunger = 0;
                self.stats.thirst = 0;
                self.notification = { text: 'CHEAT: Starvation active', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-4) === 'feed') {
                self.stats.hunger = 100;
                self.stats.thirst = 100;
                self.stats.health = 100;
                self.starvationTimer = 0;
                self.notification = { text: 'CHEAT: Fully fed & healed', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-4) === 'rest') {
                self.lastRestTime = -9999;
                self.notification = { text: 'CHEAT: Rest cooldown reset', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-6) === 'shadow') {
                self.distortion = 1;
                self.distortionFlicker = 1;
                self.notification = { text: 'CHEAT: Max distortion', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-5) === 'quest') {
                if (self.questPhase === 0 && !self.dogStolen && !self.dogRescued) {
                    var shrineIndices = [];
                    for (var qi = 0; qi < self.objects.length; qi++) {
                        if (self.objects[qi].type === 'shrine') shrineIndices.push(qi);
                    }
                    self.questShrines = [];
                    while (self.questShrines.length < 3 && shrineIndices.length > 0) {
                        var ri = Math.floor(Math.random() * shrineIndices.length);
                        self.questShrines.push(shrineIndices.splice(ri, 1)[0]);
                    }
                    var farCabin = 0, farDist = 0;
                    for (var fi = 0; fi < TWB._cabinData.length; fi++) {
                        var fc = TWB._cabinData[fi];
                        var fdx = fc.cx * TWB.TILE - self.player.x;
                        var fdy = fc.cy * TWB.TILE - self.player.y;
                        var fd = fdx * fdx + fdy * fdy;
                        if (fd > farDist) { farDist = fd; farCabin = fi; }
                    }
                    var fc2 = TWB._cabinData[farCabin];
                    self.questDogPos = { x: fc2.cx * TWB.TILE + 40, y: fc2.cy * TWB.TILE + 40 };
                    self.dogStolen = true;
                    self.questPhase = 1;
                    self.questDay = self.day;
                    self.questTimer = 0;
                    self.questTimerMax = 48 * 3600;
                    self.questShrinesLit = 0;
                    self.questRevealed = false;
                    self.wolfX = -9999; self.wolfY = -9999;
                    self.notification = { text: 'CHEAT: Dog stolen! Find 3 shrines', timer: 180 };
                } else {
                    self.notification = { text: 'Quest already active/done', timer: 120 };
                }
                self.cheatBuffer = '';
            }
            if (cb.slice(-6) === 'rescue') {
                if (self.dogStolen && self.questDogPos) {
                    self.player.x = self.questDogPos.x;
                    self.player.y = self.questDogPos.y;
                    self.questRevealed = true;
                    self.questShrinesLit = 3;
                    self.notification = { text: 'CHEAT: Teleported to dog', timer: 120 };
                } else {
                    self.notification = { text: 'No active quest', timer: 120 };
                }
                self.cheatBuffer = '';
            }
            if (cb.slice(-4) === 'easy') {
                self.difficulty = 0;
                self.notification = { text: 'CHEAT: Difficulty -> HIKERS', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-4) === 'hard') {
                self.difficulty = 2;
                self.notification = { text: 'CHEAT: Difficulty -> THE MISTS', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-6) === 'normal') {
                self.difficulty = 1;
                self.notification = { text: 'CHEAT: Difficulty -> MOUNTAINEERS', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-5) === 'ghost') {
                var gAngle = Math.random() * Math.PI * 2;
                var gDist = 250 + Math.random() * 100;
                var gNear = -1;
                var gX = self.player.x + Math.cos(gAngle) * gDist;
                var gY = self.player.y + Math.sin(gAngle) * gDist;
                for (var gi = 0; gi < TWB._cabinData.length; gi++) {
                    var gc = TWB._cabinData[gi];
                    var gdx = gc.cx * TWB.TILE - gX, gdy = gc.cy * TWB.TILE - gY;
                    if (Math.sqrt(gdx * gdx + gdy * gdy) < 200) { gNear = gi; gX = gc.cx * TWB.TILE; gY = gc.cy * TWB.TILE; break; }
                }
                self.phantomLight = {
                    x: gX, y: gY, brightness: 1, timer: 0, fadeStart: -1,
                    outcome: gNear >= 0 ? (Math.random() < 0.5 ? 'cold_cabin' : 'just_left') : 'nothing',
                    cabin: gNear, notified: false
                };
                self.notification = { text: 'CHEAT: Phantom light spawned', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-5) === 'torch') {
                var tAngle = Math.random() * Math.PI * 2;
                var tDist = 250 + Math.random() * 150;
                self.phantom2 = {
                    x: self.player.x + Math.cos(tAngle) * tDist,
                    y: self.player.y + Math.sin(tAngle) * tDist,
                    dir: Math.random() * Math.PI * 2,
                    speed: 0.3 + Math.random() * 0.3,
                    timer: 0, maxTime: 1800 + Math.floor(Math.random() * 3600),
                    on: true, flickerTimer: 200,
                    moveTimer: 0, movePhase: 'search',
                    stareTimer: 0, stareTriggered: false
                };
                self.notification = { text: 'CHEAT: Phantom flashlight spawned', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-5) === 'curse') {
                if (self.cursedCabin >= 0) {
                    var ccab = TWB._cabinData[self.cursedCabin];
                    self.player.x = ccab.cx * TWB.TILE;
                    self.player.y = (ccab.cy + 4) * TWB.TILE;
                    self.player.tx = self.player.x;
                    self.player.ty = self.player.y;
                    self.wolf.x = self.player.x + 30;
                    self.wolf.y = self.player.y + 20;
                    self.notification = { text: 'Teleported to cursed cabin', timer: 120 };
                }
                self.cheatBuffer = '';
            }
            if (cb.slice(-4) === 'debt') {
                self.shadowDebt = Math.min(100, self.shadowDebt + 25);
                self.notification = { text: 'Shadow Debt: ' + Math.floor(self.shadowDebt), timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-7) === 'mystery') {
                if (!self.mysterySpawned) {
                    self.mysteryChosen = Math.floor(Math.random() * 50);
                    self.mysteryEvent = {
                        id: self.mysteryChosen,
                        x: self.player.x + 100,
                        y: self.player.y + 80,
                        discovered: false
                    };
                    self.mysterySpawned = true;
                    self.notification = { text: 'Mystery event spawned nearby', timer: 120 };
                } else {
                    self.notification = { text: 'Mystery already spawned this run', timer: 120 };
                }
                self.cheatBuffer = '';
            }
            if (cb.slice(-5) === 'elder') {
                self.elder = {
                    x: self.player.x + 60,
                    y: self.player.y + 40,
                    tale: Math.floor(Math.random() * self.elderTales.length),
                    timer: 0,
                    female: Math.random() < 0.5
                };
                self.notification = { text: 'Elder appeared nearby', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-4) === 'snow') {
                self.snowing = !self.snowing;
                self.snowTimer = self.snowing ? 5400 : 3600;
                self.notification = { text: self.snowing ? 'Snow ON' : 'Snow OFF', timer: 120 };
                self.cheatBuffer = '';
            }
            if (cb.slice(-5) === 'where') {
                self.showPlayerOnMap = true;
                self.mapOpen = true;
                self.backpackOpen = false;
                self.craftingOpen = false;
                self.cheatBuffer = '';
            }
            if (cb.slice(-5) === 'codes') {
                self.notification = { text: 'night day starve feed rest shadow quest rescue easy hard normal ghost torch curse debt mystery elder snow where', timer: 400 };
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
        if (obj.type === 'herb_vikos' && obj.picked) continue;
        var dx = wx - obj.x;
        var dy = wy - obj.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var hitR = (obj.type === 'cabin') ? 60 :
                   (obj.type === 'boulder') ? 50 :
                   (obj.type === 'tree_oak') ? 50 :
                   (obj.type === 'tree_pine') ? 36 :
                   (obj.type === 'river_spot') ? 40 :
                   (obj.type === 'trap') ? 20 :
                   (obj.type === 'bush' || obj.type === 'bush_berry' || obj.type === 'herb_vikos') ? 24 :
                   (obj.type === 'fireplace' || obj.type === 'cabinet' || obj.type === 'cabin_door') ? 28 :
                   (obj.type === 'bed') ? 32 :
                   (obj.type === 'table' || obj.type === 'shelf' || obj.type === 'crate') ? 28 :
                   (obj.type === 'note') ? 20 :
                   (obj.type === 'cabin_window') ? 28 :
                   (obj.type === 'cairn') ? 24 :
                   (obj.type === 'shrine' || obj.type === 'curse_shrine') ? 28 :
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
        if (it.needs && this.getItemCount(it.needs) <= 0) continue;
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
    var maxStack = type === 'berries' ? Infinity : 10;
    for (var i = 0; i < this.backpack.length; i++) {
        if (this.backpack[i] && this.backpack[i].type === type) {
            var canAdd = Math.min(count, maxStack - this.backpack[i].count);
            if (canAdd <= 0) return false;
            this.backpack[i].count += canAdd;
            return true;
        }
    }
    for (var i = 0; i < this.backpack.length; i++) {
        if (!this.backpack[i]) {
            this.backpack[i] = { type: type, count: Math.min(count, maxStack) };
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
    olive_oil: 'Olive Oil', vikosherb: '3-Leaf Herb',
    ski_goggles: 'Ski Goggles', torn_map: 'Torn Map', flare: 'Flare',
    battery: 'Battery', antenna: 'Antenna', fuse: 'Fuse',
    relic: 'Holy Relic'
};

TWB.ITEM_SHORT = {
    vikosherb: 'Herb', canned_food: 'Canned', expired_food: 'Exp.Food',
    fishing_rod: 'F.Rod', canteen_full: 'Water', olive_oil: 'Oil',
    firewood: 'Fwood', lighter: 'Lightr', bandage: 'Bandge',
    ski_goggles: 'Goggle', torn_map: 'Map', antenna: 'Antnna'
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
    var hasBtns = this.backpackHover >= 0 && this.backpack[this.backpackHover];
    var ph = 50 + rows * (slotSize + gap) + (hasBtns ? 60 : 8);
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
    if (slot.type === 'canteen_full') return ['drink_canteen', 'dog_drink_canteen', 'drop1', 'dropall'];
    if (slot.type === 'bandage') return ['use_bandage', 'drop1', 'dropall'];
    return ['drop1', 'dropall'];
};

TWB.Game.prototype.getBackpackBtnAt = function(sx, sy) {
    var btns = this.getBackpackBtns();
    if (btns.length === 0) return null;
    var l = this.getBackpackLayout();
    var totalRows = Math.ceil(this.backpack.length / l.cols);
    var baseY = l.slotsY + totalRows * (l.slotSize + l.gap) + 4;
    var btnW = 80;
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

TWB.Game.prototype.getIconAt = function(sx, sy) {
    var iconSize = 22, iconGap = 4;
    var boxW = 90;
    var cx = this.canvas.width - boxW - 8;
    var cy = 12;
    var iconY = cy + 34;
    var icons = [
        { key: 'TAB', label: 'B' },
        { key: 'M', label: 'M' },
        { key: 'C', label: 'C' },
        { key: 'L', label: 'L' }
    ];
    var totalIconW = icons.length * iconSize + (icons.length - 1) * iconGap;
    var iconStartX = cx - 6 + boxW - totalIconW;
    for (var i = 0; i < icons.length; i++) {
        var ix = iconStartX + i * (iconSize + iconGap);
        if (sx >= ix && sx <= ix + iconSize && sy >= iconY && sy <= iconY + iconSize) return icons[i].key;
    }
    return null;
};

TWB.Game.prototype.getPanelCloseAt = function(sx, sy) {
    var xSize = 14;
    if (this.backpackOpen) {
        var l = this.getBackpackLayout();
        var xx = l.px + l.pw - xSize - 6;
        var xy = l.py + 6;
        if (sx >= xx && sx <= xx + xSize && sy >= xy && sy <= xy + xSize) return 'backpack';
    }
    if (this.craftingOpen) {
        var pw = 280;
        var ph = 30 + TWB.RECIPES.length * 24 + 10;
        var px = Math.floor((this.canvas.width - pw) / 2);
        var py = Math.floor((this.canvas.height - ph) / 2) - 20;
        var xx2 = px + pw - xSize - 6;
        var xy2 = py + 4;
        if (sx >= xx2 && sx <= xx2 + xSize && sy >= xy2 && sy <= xy2 + xSize) return 'crafting';
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
        case 'pick_vikosherb':
            if (s.energy < 2) { msg = 'Too tired...'; break; }
            if (obj.picked) { msg = 'Already picked'; break; }
            if (!this.addToBackpack('vikosherb', 1)) { msg = 'Backpack is full!'; break; }
            obj.picked = true;
            s.energy = Math.max(0, s.energy - 2);
            msg = '+1 3-Leaf Herb';
            break;
        case 'burn_herb':
            var bhFuel = (obj.tempFuel !== undefined) ? obj.tempFuel : this.fireFuel;
            if (bhFuel <= 0) { msg = 'Fire is out!'; break; }
            if (this.getItemCount('vikosherb') <= 0) { msg = 'No herb to burn!'; break; }
            this.removeFromBackpack('vikosherb', 1);
            this.fireBuff = 18000;
            msg = 'The flame turns green... shadows retreat';
            this.notification = { text: msg, timer: 180 };
            break;
        case 'burn_herb_fp':
            if (this.fireplaceFuel <= 0) { msg = 'Light the fireplace first!'; break; }
            if (this.getItemCount('vikosherb') <= 0) { msg = 'No herb to burn!'; break; }
            this.removeFromBackpack('vikosherb', 1);
            this.fireBuffFP = 18000;
            msg = 'The flame turns green... shadows retreat';
            this.notification = { text: msg, timer: 180 };
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
                this.runStats.woodBurned++;
                msg = 'Added firewood (+40 fuel)';
            } else {
                this.removeFromBackpack('wood', 1);
                if (obj.tempFuel !== undefined) { obj.tempFuel = Math.min(100, obj.tempFuel + 25); }
                else { this.fireFuel = Math.min(100, this.fireFuel + 25); }
                this.runStats.woodBurned++;
                msg = 'Added wood (+25 fuel)';
            }
            break;
        case 'rest':
            if (this.gameTime - this.lastRestTime < 3600) {
                msg = 'Too soon to rest again...';
                break;
            }
            s.energy = Math.min(100, s.energy + 30);
            s.health = Math.min(100, s.health + 10);
            this.wolfStats.energy = Math.min(100, this.wolfStats.energy + 20);
            this.lastRestTime = this.gameTime;
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
            if (this.lastSleepTime && this.gameTime - this.lastSleepTime < 4 * 3600) {
                msg = 'Not tired enough to sleep yet...';
                break;
            }
            if (this.shadows && this.shadows.length > 0 && !this.barricaded) {
                msg = 'Shadows lurk outside! Barricade the door first.';
                break;
            }
            if (this.currentCabinIdx === this.cursedCabin) {
                this.gameTime += 1 * 3600;
                this.lastSleepTime = this.gameTime;
                s.hunger = Math.max(0, s.hunger - 5);
                s.thirst = Math.max(0, s.thirst - 5);
                msg = 'You woke after an hour... couldn\'t sleep.';
            } else {
                s.energy = Math.min(100, s.energy + 60);
                s.health = Math.min(100, s.health + 30);
                s.hunger = Math.max(0, s.hunger - 20);
                s.thirst = Math.max(0, s.thirst - 25);
                this.wolfStats.energy = Math.min(100, this.wolfStats.energy + 40);
                this.wolfStats.health = Math.min(100, this.wolfStats.health + 20);
                this.wolfStats.hunger = Math.max(0, this.wolfStats.hunger - 15);
                this.wolfStats.thirst = Math.max(0, this.wolfStats.thirst - 20);
                this.wolfStats.mood = 'Loyal';
                this.gameTime += 8 * 3600;
                this.lastSleepTime = this.gameTime;
                this.fireFuel = Math.max(0, this.fireFuel - 30);
                this.fireplaceFuel = Math.max(0, this.fireplaceFuel - 30);
                msg = 'Slept 8 hours...';
            }
            break;
        case 'search_cabinet':
            var searchKey = this.currentCabinIdx;
            var searchCount = this.cabinSearches[searchKey] || 0;
            var cabinType = TWB.CABIN_TYPES[TWB._cabinData[searchKey].type];
            var searchLimit = this.difficulty === 0 ? cabinType.maxSearch + 2 : this.difficulty === 2 ? Math.max(1, cabinType.maxSearch - 1) : cabinType.maxSearch;
            var hasQuestItem = !this.lighterFound || this.getScenarioItem(searchKey);
            if (hasQuestItem) searchLimit = Math.max(searchLimit, searchCount + 1);
            if (searchCount >= searchLimit) { msg = 'Nothing left to find'; break; }
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
                this.runStats.itemsFound++;
                break;
            }
            var sqItem = this.getScenarioItem(searchKey);
            if (sqItem) {
                if (!this.addToBackpack(sqItem.item, 1)) {
                    msg = 'Backpack is full!';
                    this.cabinSearches[searchKey]--;
                    break;
                }
                sqItem.callback();
                msg = sqItem.msg;
                this.runStats.itemsFound++;
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
            this.runStats.itemsFound++;
            break;
        case 'add_fp_wood':
            var fpWood = this.getItemCount('wood');
            var fpFw = this.getItemCount('firewood');
            if (fpWood < 1 && fpFw < 1) { msg = 'No wood to add!'; break; }
            if (fpFw > 0) {
                this.removeFromBackpack('firewood', 1);
                this.fireplaceFuel = Math.min(100, this.fireplaceFuel + 40);
                this.runStats.woodBurned++;
                msg = 'Added firewood (+40 fuel)';
            } else {
                this.removeFromBackpack('wood', 1);
                this.fireplaceFuel = Math.min(100, this.fireplaceFuel + 25);
                this.runStats.woodBurned++;
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
                this.runStats.animalsHunted++;
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
        case 'light_curse_shrine':
            if (obj.lit) { msg = 'Already lit. A purple flame flickers...'; break; }
            if (this.getItemCount('lighter') <= 0) { msg = 'Need a lighter.'; break; }
            if (this.getItemCount('olive_oil') > 0) {
                this.removeFromBackpack('olive_oil', 1);
                obj.lit = true;
                obj.litFuel = 900;
                msg = 'A cold purple flame ignites... something stirs.';
            } else if (this.getItemCount('wood') > 0) {
                this.removeFromBackpack('wood', 1);
                obj.lit = true;
                obj.litFuel = 450;
                msg = 'The shrine burns with an eerie glow...';
            } else {
                msg = 'Need oil or wood to light it.';
            }
            if (obj.lit) {
                var csd = TWB._scenarioData;
                if (csd.curseShrines && obj.shrineIdx !== undefined) {
                    csd.curseShrines[obj.shrineIdx].lit = true;
                }
                this._mapCanvas = null;
            }
            break;
        case 'take_relic':
            if (!obj.lit) { msg = 'The shrine is dark. Light it first.'; break; }
            if (obj.relicTaken) { msg = 'Already taken.'; break; }
            obj.relicTaken = true;
            if (!this.addToBackpack('relic', 1)) { obj.relicTaken = false; msg = 'Backpack full!'; break; }
            var relicCount = this.getItemCount('relic');
            var csd2 = TWB._scenarioData;
            if (csd2.curseShrines && obj.shrineIdx !== undefined) {
                csd2.curseShrines[obj.shrineIdx].relicTaken = true;
            }
            if (relicCount >= 3) {
                csd2.objectiveText = 'Bring the relics to the cursed cabin!';
            } else {
                csd2.objectiveText = 'Collect relics. (' + relicCount + '/3)';
            }
            msg = 'Took a Holy Relic. The air grows heavier... (' + relicCount + '/3)';
            this._mapCanvas = null;
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

TWB.Game.prototype.getScenarioItem = function(cabinIdx) {
    var sd = TWB._scenarioData;
    var self = this;
    if (TWB._scenario === 'RESCUE') {
        for (var i = 0; i < 3; i++) {
            if (sd.clueCabins[i] === cabinIdx && !sd.cluesFound[i]) {
                var items = ['ski_goggles', 'torn_map', 'flare'];
                var msgs = [
                    'Found Ski Goggles! A clue to the hiker\'s path.',
                    'Found a Torn Map! Another cabin is marked.',
                    'Found an Emergency Flare!'
                ];
                var idx = i;
                var noteText = sd.clueNotes ? sd.clueNotes[i] : null;
                return {
                    item: items[i],
                    msg: msgs[i],
                    callback: function() {
                        sd.cluesFound[idx] = true;
                        var found = 0;
                        for (var j = 0; j < 3; j++) { if (sd.cluesFound[j]) found++; }
                        if (found === 1) sd.objectiveText = 'Follow the hiker\'s trail. (1/3 clues)';
                        else if (found === 2) sd.objectiveText = 'One more clue remains. (2/3 clues)';
                        else sd.objectiveText = 'Find the hiker\'s cabin!';
                        self._mapCanvas = null;
                        if (noteText) {
                            self.readingNote = noteText;
                            self._pendingNoteReveal = idx;
                            self._pendingNoteScenario = 'RESCUE';
                        }
                    }
                };
            }
        }
    } else if (TWB._scenario === 'RELAY') {
        for (var i = 0; i < 3; i++) {
            if (sd.partCabins[i] === cabinIdx && !sd.partsFound[i]) {
                var items = ['battery', 'antenna', 'fuse'];
                var idx = i;
                var noteText = sd.partNotes ? sd.partNotes[i] : null;
                return {
                    item: items[i],
                    msg: 'Found ' + sd.partNames[i] + '!',
                    callback: function() {
                        sd.partsFound[idx] = true;
                        var found = 0;
                        for (var j = 0; j < 3; j++) { if (sd.partsFound[j]) found++; }
                        sd.objectiveText = 'Gather radio parts. (' + found + '/3)';
                        if (found === 3) sd.objectiveText = 'Bring parts to the relay station!';
                        if (noteText) {
                            self.readingNote = noteText;
                            self._pendingNoteReveal = idx;
                        }
                    }
                };
            }
        }
    }
    return null;
};

TWB.Game.prototype.dismissNote = function() {
    this.readingNote = null;
    if (this._pendingNoteReveal !== undefined && this._pendingNoteReveal !== null) {
        var sd = TWB._scenarioData;
        var scenario = this._pendingNoteScenario || TWB._scenario;
        var idx = this._pendingNoteReveal;
        if (scenario === 'RELAY' && sd.partNotes) {
            sd.notesRead[idx] = true;
            if (idx < 2) {
                var nextCabin = sd.partCabins[idx + 1];
                if (sd.revealedCabins.indexOf(nextCabin) === -1) sd.revealedCabins.push(nextCabin);
                this.notification = { text: 'Map updated - new location marked.', timer: 150 };
            } else {
                if (sd.revealedCabins.indexOf(TWB._targetCabin) === -1) sd.revealedCabins.push(TWB._targetCabin);
                this.notification = { text: 'Map updated - relay station marked!', timer: 150 };
            }
            this._mapCanvas = null;
        } else if (scenario === 'RESCUE' && sd.clueNotes) {
            sd.clueNotesRead[idx] = true;
            if (idx < 2) {
                var nextCabin = sd.clueCabins[idx + 1];
                if (sd.revealedCabins.indexOf(nextCabin) === -1) sd.revealedCabins.push(nextCabin);
                this.notification = { text: 'Map updated - new location marked.', timer: 150 };
            } else {
                if (sd.revealedCabins.indexOf(TWB._targetCabin) === -1) sd.revealedCabins.push(TWB._targetCabin);
                this.notification = { text: 'Map updated - hiker\'s cabin marked!', timer: 150 };
            }
            this._mapCanvas = null;
        }
        this._pendingNoteReveal = null;
        this._pendingNoteScenario = null;
    }
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
        var canWin = false;
        var sd = TWB._scenarioData;
        if (TWB._scenario === 'RESCUE') {
            canWin = sd.cluesFound[0] && sd.cluesFound[1] && sd.cluesFound[2] && this.getItemCount('flare') > 0;
            if (!canWin && sd.cluesFound[2]) {
                this.notification = { text: 'Use the flare outside the cabin!', timer: 150 };
            } else if (!canWin) {
                this.notification = { text: 'The cabin is empty... need more clues.', timer: 150 };
            }
        } else if (TWB._scenario === 'RELAY') {
            canWin = this.getItemCount('battery') > 0 && this.getItemCount('antenna') > 0 && this.getItemCount('fuse') > 0;
            if (!canWin) {
                var missing = [];
                if (this.getItemCount('battery') <= 0) missing.push('Battery');
                if (this.getItemCount('antenna') <= 0) missing.push('Antenna');
                if (this.getItemCount('fuse') <= 0) missing.push('Fuse');
                this.notification = { text: 'Radio dead. Missing: ' + missing.join(', '), timer: 180 };
            }
        } else if (TWB._scenario === 'CURSE') {
            canWin = this.getItemCount('relic') >= 3;
            if (!canWin) {
                this.notification = { text: 'A dark fog blocks the entrance... (' + this.getItemCount('relic') + '/3 relics)', timer: 150 };
                return;
            }
        }
        if (canWin) {
            this.victory = true;
            this.victoryTimer = 0;
            this.menu = null;
            return;
        }
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
    this.player.x = 4 * 32;
    this.player.y = 3 * 32;
    this.player.tx = this.player.x;
    this.player.ty = this.player.y;
    this.player.moving = false;
    this.wolf.x = 5 * 32;
    this.wolf.y = 3 * 32;
    this.wolf.tx = this.wolf.x;
    this.wolf.ty = this.wolf.y;
    this.wolf.moving = false;
    this.indoors = true;
    TWB.indoors = true;
    this.runStats.cabinsVisited[this.currentCabinIdx] = true;
    this.menu = null;
    this.barricaded = false;
    this.cabinEventTimer = 0;
    this.doorShake = 0;
    this.shadows = [];
    var cabinName = TWB.CABIN_TYPES[TWB._cabinData[nearestIdx].type].name;
    var cabDmg = TWB._cabinData[nearestIdx].damaged && !TWB._cabinData[nearestIdx].repaired;
    this.notification = { text: cabinName + (cabDmg ? ' (Damaged)' : ''), timer: 120 };
    var sd = TWB._scenarioData;
    var questCabins = null, questFound = null;
    if (TWB._scenario === 'RELAY' && sd.partCabins) { questCabins = sd.partCabins; questFound = sd.partsFound; }
    else if (TWB._scenario === 'RESCUE' && sd.clueCabins) { questCabins = sd.clueCabins; questFound = sd.cluesFound; }
    if (questCabins) {
        for (var qi = 0; qi < 3; qi++) {
            if (questCabins[qi] === nearestIdx && !questFound[qi]) {
                var dn = this.dogName || 'Dog';
                this.notification = { text: cabinName + ' - ' + dn + ' sniffs around excitedly!', timer: 150 };
                break;
            }
        }
    }
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
    if (this.elderDialogue) return;
    if (this.stats.health <= 0 && !this.dead) {
        if (!this.knockoutUsed && !this.dogStolen && !this.indoors && this.wolfStats.health > 10) {
            this.knockoutUsed = true;
            this.knockoutActive = true;
            this.knockoutTimer = 0;
            this.stats.health = 15;
            this.stats.energy = 10;
            var bestCabin = null, bestCabDist2 = Infinity;
            for (var kci = 0; kci < TWB._cabinData.length; kci++) {
                var kc = TWB._cabinData[kci];
                var kd = Math.sqrt(Math.pow(this.player.x - kc.cx * TWB.TILE, 2) + Math.pow(this.player.y - kc.cy * TWB.TILE, 2));
                if (kd < bestCabDist2) { bestCabDist2 = kd; bestCabin = kci; }
            }
            if (bestCabin !== null) {
                var kbc = TWB._cabinData[bestCabin];
                this.player.x = kbc.cx * TWB.TILE;
                this.player.y = (kbc.cy + 4) * TWB.TILE;
                this.player.tx = this.player.x;
                this.player.ty = this.player.y;
                this.player.moving = false;
                this.wolf.x = this.player.x + 20;
                this.wolf.y = this.player.y + 10;
                this.wolf.tx = this.wolf.x;
                this.wolf.ty = this.wolf.y;
                this.shadows = [];
                this.predator = null;
                this.fleeing = false;
            }
            this.notification = { text: (this.dogName || 'Dog') + ' dragged you to safety!', timer: 250 };
        } else {
            this.dead = true;
            this.deathTimer = 0;
            if (this.fleeing || this.predator) this.deathCause = 'A predator got you.';
            else if (this.wolfSiege) this.deathCause = 'The wolves overwhelmed you.';
            else if (this.shadowBreaching) this.deathCause = 'The shadows broke through.';
            else if (this.shadows && this.shadows.length > 0) this.deathCause = 'The shadows consumed you.';
            else if (this.stats.hunger <= 0) this.deathCause = 'You starved to death.';
            else if (this.stats.thirst <= 0) this.deathCause = 'You died of dehydration.';
            else if (this.raining && !this.indoors) this.deathCause = 'The cold rain drained your last strength.';
            else if (this.shadowDebt >= 60) this.deathCause = 'The night took its toll.';
            else if (this.stats.energy <= 0) this.deathCause = 'You collapsed from exhaustion.';
            else this.deathCause = 'You succumbed to the wilderness.';
        }
    }
    if (this.wolfStats.health <= 0 && !this.dead) {
        this.dead = true;
        this.deathTimer = 0;
        this.deathCause = (this.dogName || 'Your dog') + ' didn\'t make it...';
    }
    if (this.windowView) { this.windowView.frame++; return; }
    if (this.readingNote) return;
    this.player.update(this.objects);
    if (this.player.moving) this.runStats.distWalked += this.player.speed / TWB.TILE;

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

    if (this.dogStolen) {
        this.wolfHunting = null;
        this.dogSense = null;
    } else if (this.wolfHunting) {
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
            this.runStats.animalsHunted++;
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
            if ((ps.type !== 'shrine' && ps.type !== 'curse_shrine') || !ps.lit) continue;
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
                if ((dso.type !== 'shrine' && dso.type !== 'curse_shrine') || !dso.lit) continue;
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
            this.runStats.predators++;
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
    if (this.stats.health < this.runStats.lowestHP) this.runStats.lowestHP = this.stats.health;

    if (this.fireBuff > 0) this.fireBuff--;
    if (this.fireBuffFP > 0) this.fireBuffFP--;
    if (this.fireFuel > 0) {
        this.fireFuel = Math.max(0, this.fireFuel - (this.fireBuff > 0 ? 0.002 : 0.005));
    }
    var fpBurn = 0.005;
    if (this.nightType === 'freeze' && this.nightActive) fpBurn = 0.01;
    if (this.indoors && this.currentCabinIdx >= 0 && TWB._cabinData[this.currentCabinIdx].damaged && !TWB._cabinData[this.currentCabinIdx].repaired) fpBurn *= 1.5;
    if (this.indoors && this.currentCabinIdx === this.cursedCabin) fpBurn *= 2;
    if (this.fireBuffFP > 0) fpBurn *= 0.4;
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

    if ((this.fireBuffFP > 0 && this.indoors) || this.fireBuff > 0) {
        if (this.stats.health < 100) {
            this.stats.health = Math.min(100, this.stats.health + 0.005);
        }
        if (this.wolfStats.health < 100) {
            this.wolfStats.health = Math.min(100, this.wolfStats.health + 0.005);
        }
    }

    if (this.gameTime % 600 === 0) {
        var drainMult = this.difficulty === 0 ? 0.7 : this.difficulty === 2 ? 1.4 : 1;
        this.stats.energy = Math.max(0, this.stats.energy - 0.5 * drainMult);
        this.stats.hunger = Math.max(0, this.stats.hunger - 0.8 * drainMult);
        this.stats.thirst = Math.max(0, this.stats.thirst - 1.0 * drainMult);
        if (!this.dogStolen) {
            this.wolfStats.energy = Math.max(0, this.wolfStats.energy - 0.5 * drainMult);
            this.wolfStats.hunger = Math.max(0, this.wolfStats.hunger - 0.6 * drainMult);
            this.wolfStats.thirst = Math.max(0, this.wolfStats.thirst - 0.7 * drainMult);
        }
    }
    if (this.player.moving && this.gameTime % 300 === 0) {
        this.stats.energy = Math.max(0, this.stats.energy - 0.5);
        this.stats.thirst = Math.max(0, this.stats.thirst - 0.3);
    }
    if (!this.indoors && this.raining) {
        this.wetness = Math.min(100, this.wetness + 0.05);
        if (this.gameTime % 1800 === 0 && this.getItemCount('canteen') > 0) {
            this.removeFromBackpack('canteen', 1);
            this.addToBackpack('canteen_full', 1);
            this.notification = { text: 'Rain filled your canteen!', timer: 120 };
        }
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
    var nightStart = this.difficulty === 0 ? 21 : this.difficulty === 2 ? 19 : 20;
    this.nightActive = nightHour >= nightStart || nightHour < 6;

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
            this.runStats.nightsOut++;
            var ntMsg = 'Darkness falls... find shelter!';
            if (this.nightType === 'freeze') ntMsg = 'A freezing storm approaches... find shelter!';
            else if (this.nightType === 'shadow_surge') ntMsg = 'The darkness feels alive tonight... find shelter!';
            this.notification = { text: ntMsg, timer: 200 };
        }
    }

    var isSurge = this.nightType === 'shadow_surge';
    var isFreeze = this.nightType === 'freeze';
    var baseShadows = this.difficulty === 0 ? 4 : this.difficulty === 2 ? 8 : 6;
    if (this.shadowDebt >= 40) baseShadows += 2;
    if (this.shadowDebt >= 80) baseShadows += 2;
    var maxShadows = isSurge ? baseShadows + 2 : baseShadows;
    var baseSpawnRate = this.difficulty === 0 ? 450 : this.difficulty === 2 ? 200 : 300;
    if (this.shadowDebt >= 20) baseSpawnRate = Math.floor(baseSpawnRate * 0.8);
    if (this.shadowDebt >= 60) baseSpawnRate = Math.floor(baseSpawnRate * 0.6);
    var shadowSpawnRate = isSurge ? Math.floor(baseSpawnRate * 0.5) : baseSpawnRate;
    var relicCarried = this.getItemCount('relic');
    if (relicCarried > 0) shadowSpawnRate = Math.floor(shadowSpawnRate * (1 - relicCarried * 0.15));

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
                var flashRange = this.shadowDebt >= 80 ? 90 : 150;
                var flashRetreat = this.shadowDebt >= 80 ? 60 : 120;
                if (angleDiff < 0.8 && sdist < flashRange) {
                    sh.retreatTimer = flashRetreat;
                }
            }

            if (this.fireBuff > 0) {
                for (var cfi = 0; cfi < this.objects.length; cfi++) {
                    var cf = this.objects[cfi];
                    if (cf.type === 'campfire' && cf.tempFuel > 0) {
                        var cfdx = sh.x - cf.x, cfdy = sh.y - cf.y;
                        if (Math.sqrt(cfdx * cfdx + cfdy * cfdy) < 200) {
                            sh.retreatTimer = 60;
                        }
                    }
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
                this.runStats.shadowHits++;
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
            if (isSurge && this.fireplaceFuel <= 0 && !this.shadowBreaching && this.fireBuffFP <= 0) {
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

        if (this.shadowBreaching || this.doorShake > 0) {
            this.distortion = Math.min(1, this.distortion + 0.003);
        } else if (this.cabinEventTimer < 100) {
            this.distortion = Math.min(0.6, this.distortion + 0.001);
        } else {
            this.distortion = Math.max(0, this.distortion - 0.002);
        }
        if (this.distortion > 0.2 && Math.random() < 0.01) {
            this.distortionFlicker = 8 + Math.floor(Math.random() * 12);
        }
        if (this.distortionFlicker > 0) this.distortionFlicker--;

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

    if (!this.nightActive || !this.indoors) {
        this.distortion = Math.max(0, this.distortion - 0.005);
        this.distortionFlicker = 0;
    }

    if (this.phantomCooldown > 0) this.phantomCooldown--;
    if (this.nightActive && !this.indoors && !this.phantomLight && this.phantomCooldown <= 0) {
        var plHour = this.getGameHour();
        if (plHour >= 22 || plHour < 4) {
            var plCond = this.foggy || this.raining || this.windSpeed > 1.5;
            if (plCond && Math.random() < 0.0004) {
                var plAngle = Math.random() * Math.PI * 2;
                var plDist = 280 + Math.random() * 160;
                var plX = this.player.x + Math.cos(plAngle) * plDist;
                var plY = this.player.y + Math.sin(plAngle) * plDist;
                var plType = Math.random();
                var plNearCabin = -1;
                for (var pci = 0; pci < TWB._cabinData.length; pci++) {
                    var pcab = TWB._cabinData[pci];
                    var pcdx = pcab.cx * TWB.TILE - plX;
                    var pcdy = pcab.cy * TWB.TILE - plY;
                    if (Math.sqrt(pcdx * pcdx + pcdy * pcdy) < 200) {
                        plNearCabin = pci;
                        plX = pcab.cx * TWB.TILE;
                        plY = pcab.cy * TWB.TILE;
                        break;
                    }
                }
                var plOutcome = plNearCabin >= 0 ? (plType < 0.4 ? 'cold_cabin' : 'just_left') : 'nothing';
                this.phantomLight = {
                    x: plX, y: plY,
                    brightness: 1,
                    timer: 0,
                    fadeStart: -1,
                    outcome: plOutcome,
                    cabin: plNearCabin,
                    notified: false
                };
            }
        }
    }
    if (this.phantomLight) {
        var pl = this.phantomLight;
        pl.timer++;
        var pdx = this.player.x - pl.x;
        var pdy = this.player.y - pl.y;
        var pDist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pDist < 160 && pl.fadeStart < 0) {
            pl.fadeStart = pl.timer;
        }
        if (pl.fadeStart >= 0) {
            var fadeElapsed = pl.timer - pl.fadeStart;
            pl.brightness = Math.max(0, 1 - fadeElapsed * 0.008);
        }
        if (pl.brightness <= 0) {
            if (!pl.notified) {
                pl.notified = true;
                if (pl.outcome === 'cold_cabin') {
                    this.notification = { text: 'The cabin is dark. The fireplace is cold... old ash.', timer: 200 };
                } else if (pl.outcome === 'just_left') {
                    this.notification = { text: 'The door is ajar... the fireplace still warm. Someone was just here.', timer: 240 };
                } else {
                    this.notification = { text: 'Nothing here. You could have sworn you saw light...', timer: 200 };
                }
            }
            if (pl.timer - pl.fadeStart > 180) {
                this.phantomLight = null;
                this.phantomCooldown = 5400 + Math.floor(Math.random() * 7200);
            }
        }
        if (pl.timer > 3600) {
            this.phantomLight = null;
            this.phantomCooldown = 3600;
        }
    }
    if (!this.nightActive && this.phantomLight) {
        this.phantomLight = null;
    }

    if (this.phantom2Cooldown > 0) this.phantom2Cooldown--;
    if (this.nightActive && !this.indoors && !this.phantom2 && this.phantom2Cooldown <= 0) {
        var p2Hour = this.getGameHour();
        if (p2Hour >= 21 || p2Hour < 4) {
            if (Math.random() < 0.0003) {
                var p2Angle = Math.random() * Math.PI * 2;
                var p2Dist = 300 + Math.random() * 200;
                var p2X = this.player.x + Math.cos(p2Angle) * p2Dist;
                var p2Y = this.player.y + Math.sin(p2Angle) * p2Dist;
                var p2Dur = 900 + Math.floor(Math.random() * 5400);
                this.phantom2 = {
                    x: p2X, y: p2Y,
                    dir: Math.random() * Math.PI * 2,
                    speed: 0.3 + Math.random() * 0.3,
                    timer: 0,
                    maxTime: p2Dur,
                    on: true,
                    flickerTimer: 120 + Math.floor(Math.random() * 300),
                    moveTimer: 0,
                    movePhase: 'search',
                    stareTimer: 0,
                    stareTriggered: false
                };
            }
        }
    }
    if (this.phantom2) {
        var p2 = this.phantom2;
        p2.timer++;
        p2.moveTimer++;
        p2.flickerTimer--;

        if (p2.flickerTimer <= 0) {
            p2.on = !p2.on;
            p2.flickerTimer = p2.on ? (60 + Math.floor(Math.random() * 240)) : (30 + Math.floor(Math.random() * 90));
        }

        if (p2.stareTimer > 0) {
            p2.stareTimer--;
            var sDx = this.player.x - p2.x;
            var sDy = this.player.y - p2.y;
            p2.dir = Math.atan2(sDy, sDx);
            if (p2.stareTimer <= 0) {
                p2.dir = Math.random() * Math.PI * 2;
            }
        } else if (p2.movePhase === 'search') {
            p2.dir += (Math.random() - 0.5) * 0.05;
            p2.x += Math.cos(p2.dir) * p2.speed;
            p2.y += Math.sin(p2.dir) * p2.speed;
            if (p2.moveTimer > 180 + Math.floor(Math.random() * 300)) {
                p2.movePhase = 'pause';
                p2.moveTimer = 0;
            }
        } else if (p2.movePhase === 'pause') {
            p2.dir += (Math.random() - 0.5) * 0.08;
            if (p2.moveTimer > 60 + Math.floor(Math.random() * 120)) {
                p2.movePhase = 'search';
                p2.moveTimer = 0;
                if (!p2.stareTriggered && Math.random() < 0.25) {
                    p2.stareTimer = 300;
                    p2.stareTriggered = true;
                    p2.on = true;
                }
            }
        }

        var p2dx = this.player.x - p2.x;
        var p2dy = this.player.y - p2.y;
        var p2d = Math.sqrt(p2dx * p2dx + p2dy * p2dy);
        if (p2d < 200) {
            p2.x -= (p2dx / p2d) * 0.6;
            p2.y -= (p2dy / p2d) * 0.6;
        }

        if (p2.timer >= p2.maxTime) {
            p2.on = false;
            if (p2.timer > p2.maxTime + 60) {
                this.phantom2 = null;
                this.phantom2Cooldown = 7200 + Math.floor(Math.random() * 10800);
            }
        }
    }
    if (!this.nightActive && this.phantom2) {
        this.phantom2 = null;
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
        if (wasNight && !this.dogStolen && !this.dogRescued && this.questPhase === 0) {
            var triggerDay = this.difficulty === 0 ? -1 : this.difficulty === 2 ? 2 : 3;
            if (triggerDay > 0 && gameDay >= triggerDay) {
                this.questPhase = 1;
                this.dogStolen = true;
                this.questDay = gameDay;
                this.questTimer = 0;
                this.wolfHunting = null;
                this.dogSense = null;
                var shrines = [];
                for (var qsi = 0; qsi < this.objects.length; qsi++) {
                    if (this.objects[qsi].type === 'shrine') shrines.push(qsi);
                }
                this.questShrines = [];
                var shuffled = shrines.slice();
                for (var qi = shuffled.length - 1; qi > 0; qi--) {
                    var qj = Math.floor(Math.random() * (qi + 1));
                    var tmp = shuffled[qi]; shuffled[qi] = shuffled[qj]; shuffled[qj] = tmp;
                }
                this.questShrines = shuffled.slice(0, 3);
                this.questShrinesLit = 0;
                var farCabin = 0, farDist = 0;
                for (var fci = 0; fci < TWB._cabinData.length; fci++) {
                    var fc = TWB._cabinData[fci];
                    var fdx = fc.cx * TWB.TILE - this.player.x;
                    var fdy = fc.cy * TWB.TILE - this.player.y;
                    var fd = Math.sqrt(fdx * fdx + fdy * fdy);
                    if (fd > farDist) { farDist = fd; farCabin = fci; }
                }
                var fcc = TWB._cabinData[farCabin];
                var qOffX = (Math.random() - 0.5) * 200;
                var qOffY = (Math.random() - 0.5) * 200;
                this.questDogPos = { x: fcc.cx * TWB.TILE + qOffX, y: fcc.cy * TWB.TILE + qOffY };
                this.questSymbol = { x: this.wolf.x, y: this.wolf.y };
                this.wolf.x = -9999;
                this.wolf.y = -9999;
                this.notification = { text: 'You wake to silence... ' + (this.dogName || 'the dog') + ' is gone. A dark symbol marks where he slept.', timer: 300 };
            }
        }
    }

    if (this.dogStolen && this.questPhase > 0) {
        this.questTimer++;
        if (this.questPhase === 1) {
            var litCount = 0;
            for (var qci = 0; qci < this.questShrines.length; qci++) {
                var qs = this.objects[this.questShrines[qci]];
                if (qs && qs.lit) litCount++;
            }
            if (litCount > this.questShrinesLit) {
                this.questShrinesLit = litCount;
                this._mapCanvas = null;
                if (litCount < 3) {
                    this.notification = { text: 'Shrine ' + litCount + '/3 lit. The mountain hums...', timer: 180 };
                }
            }
            if (litCount >= 3 && !this.questRevealed) {
                this.questRevealed = true;
                this.questPhase = 2;
                this._mapCanvas = null;
                this.notification = { text: 'A divine light reveals ' + (this.dogName || 'the dog') + '\'s location! Find him before it\'s too late!', timer: 300 };
            }
        }
        if (this.questPhase === 2 && !this.indoors) {
            var qdx = this.player.x - this.questDogPos.x;
            var qdy = this.player.y - this.questDogPos.y;
            if (Math.sqrt(qdx * qdx + qdy * qdy) < 50) {
                this.dogStolen = false;
                this.dogRescued = true;
                this.questPhase = 3;
                this.wolf.x = this.questDogPos.x;
                this.wolf.y = this.questDogPos.y;
                this.wolfStats.health = Math.max(30, this.wolfStats.health);
                this.wolfStats.mood = 'Happy';
                this._mapCanvas = null;
                this.notification = { text: (this.dogName || 'Dog') + ' leaps into your arms! He\'s weak but alive!', timer: 300 };
            }
        }
        if (this.questTimer >= this.questTimerMax && this.questPhase < 3) {
            this.questPhase = -1;
            this.notification = { text: (this.dogName || 'The dog') + ' is lost forever to the mountain\'s darkness...', timer: 400 };
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
        this.starvationTimer++;
        if (this.starvationTimer < 1800) {
            this.player.speed = TWB.PLAYER_SPEED * 0.7;
        } else {
            this.player.speed = TWB.PLAYER_SPEED * 0.7;
            var starvMult = 1 + Math.floor((this.starvationTimer - 1800) / 1800) * 0.5;
            this.stats.health = Math.max(0, this.stats.health - 0.02 * starvMult);
        }
    } else {
        this.starvationTimer = 0;
        if (!this.fleeing) this.player.speed = TWB.PLAYER_SPEED;
    }
    if (this.wolfStats.hunger <= 0 || this.wolfStats.thirst <= 0) {
        this.wolfStarvationTimer++;
        var wStarvMult = 1 + Math.floor(this.wolfStarvationTimer / 1800) * 0.5;
        this.wolfStats.health = Math.max(0, this.wolfStats.health - 0.015 * wStarvMult);
    } else {
        this.wolfStarvationTimer = 0;
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
            var wlBase = this.difficulty === 0 ? 800 : this.difficulty === 2 ? 2400 : 1500;
            var wlRand = this.difficulty === 0 ? 1600 : this.difficulty === 2 ? 4800 : 3000;
            this.wildlifeTimer = wlBase + Math.floor(Math.random() * wlRand);
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
                this.runStats.storms++;
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

    this.snowTimer--;
    if (this.snowTimer <= 0) {
        if (this.snowing) {
            this.snowing = false;
            this.snowTimer = 7200 + Math.floor(Math.random() * 14400);
            this.notification = { text: 'The snow stopped.', timer: 120 };
        } else if (!this.raining) {
            var sHour = this.getGameHour();
            if (sHour >= 0 && sHour < 6 || sHour >= 16) {
                this.snowing = true;
                this.snowTimer = 2700 + Math.floor(Math.random() * 7200);
                this.runStats.storms++;
                this.notification = { text: 'It started snowing...', timer: 120 };
            } else {
                this.snowTimer = 1800;
            }
        } else {
            this.snowTimer = 1800;
        }
    }

    if (this.snowing && !this.indoors) {
        this.snowAccumRate = Math.min(1, this.snowAccumRate + 0.001);
        if (this.gameTime % 10 === 0) {
            var ptx = Math.floor(this.player.x / TWB.TILE);
            var pty = Math.floor(this.player.y / TWB.TILE);
            for (var asy = pty - 14; asy <= pty + 14; asy++) {
                for (var asx = ptx - 20; asx <= ptx + 20; asx++) {
                    if (asx < 0 || asy < 0 || asx >= TWB.COLS || asy >= TWB.ROWS) continue;
                    var gt = TWB.getGround(asx, asy);
                    if (gt === TWB.T_WATER || gt === TWB.T_WATER_DEEP) continue;
                    var sKey = asx + ',' + asy;
                    var cur = this.snowAccum[sKey] || 0;
                    if (cur < 1) {
                        this.snowAccum[sKey] = Math.min(1, cur + 0.03 + Math.random() * 0.04);
                    }
                }
            }
        }
    } else if (!this.snowing) {
        this.snowAccumRate = Math.max(0, this.snowAccumRate - 0.0001);
    }

    if (this.notification) {
        this.notification.timer--;
        if (this.notification.timer <= 0) this.notification = null;
    }

    // --- CURSED CABIN ---
    if (this.cursedCabin >= 0 && !this.indoors) {
        var cc = TWB._cabinData[this.cursedCabin];
        var ccx = cc.cx * TWB.TILE, ccy = cc.cy * TWB.TILE;
        var ccdx = this.player.x - ccx, ccdy = this.player.y - ccy;
        var ccDist = Math.sqrt(ccdx * ccdx + ccdy * ccdy);
        if (ccDist < 140 && !this.cursedDogStopped && !this.dogStolen) {
            this.cursedDogStopped = true;
            this.wolf.tx = this.wolf.x;
            this.wolf.ty = this.wolf.y;
            this.wolf.moving = false;
            this.wolfStats.mood = 'Uneasy';
        }
        if (ccDist > 200) this.cursedDogStopped = false;
    }
    if (this.indoors && this.currentCabinIdx === this.cursedCabin) {
        if (this.fireplaceFuel > 0 && this.gameTime % 1800 === 0 && Math.random() < 0.3) {
            this.fireplaceFuel = 0;
            if (!this.notification) this.notification = { text: 'The fire went out...', timer: 120 };
        }
        if (this.cursedDogStopped || true) {
            this.wolf.x = 6 * 32;
            this.wolf.y = 8 * 32;
            this.wolf.tx = this.wolf.x;
            this.wolf.ty = this.wolf.y;
            this.wolf.moving = false;
        }
    }

    // --- NIGHT DEBT ---
    var hour = this.getGameHour();
    if (!this.indoors && hour >= 21) {
        var debtRate = hour >= 23 ? 0.008 : hour >= 22 ? 0.005 : 0.003;
        this.shadowDebt = Math.min(100, this.shadowDebt + debtRate);
    } else if (this.indoors) {
        this.shadowDebt = Math.max(0, this.shadowDebt - 0.001);
    }
    if (this.shadowDebt >= 10 && !this.dogStolen && this.gameTime % 600 === 0) {
        this.wolfStats.mood = 'Uneasy';
    }
    if (this.shadowDebt >= 60 && !this.indoors && this.gameTime % 300 === 0) {
        this.stats.health = Math.max(0, this.stats.health - 0.3);
    }

    // --- SHADOW TRAIL ---
    for (var sti = 0; sti < this.shadows.length; sti++) {
        var stsh = this.shadows[sti];
        var stKey = Math.floor(stsh.x / TWB.TILE) + ',' + Math.floor(stsh.y / TWB.TILE);
        if (!this.shadowTrails[stKey]) this.shadowTrails[stKey] = 0;
        this.shadowTrails[stKey] = Math.min(5, this.shadowTrails[stKey] + 0.002);
    }
    if (!this.indoors) {
        var ptKey = Math.floor(this.player.x / TWB.TILE) + ',' + Math.floor(this.player.y / TWB.TILE);
        if (this.shadowTrails[ptKey] && this.shadowTrails[ptKey] > 1) {
            if (this.gameTime % 120 === 0) {
                this.stats.health = Math.max(0, this.stats.health - 0.2 * Math.floor(this.shadowTrails[ptKey]));
            }
        }
    }

    // --- MYSTERY EVENT ---
    if (this.mysteryChosen >= 0 && !this.mysterySpawned && !this.indoors) {
        var mHour = this.getGameHour();
        if (mHour >= 10 && mHour < 20 && Math.random() < 0.0001) {
            var mx = this.player.x + (Math.random() - 0.5) * 500;
            var my = this.player.y + (Math.random() - 0.5) * 500;
            mx = Math.max(100, Math.min(TWB.COLS * TWB.TILE - 100, mx));
            my = Math.max(100, Math.min(TWB.ROWS * TWB.TILE - 100, my));
            this.mysteryEvent = { id: this.mysteryChosen, x: mx, y: my, discovered: false };
            this.mysterySpawned = true;
        }
    }
    if (this.mysteryEvent && !this.mysteryEvent.discovered) {
        var meDx = this.player.x - this.mysteryEvent.x;
        var meDy = this.player.y - this.mysteryEvent.y;
        if (Math.sqrt(meDx * meDx + meDy * meDy) < 80) {
            this.mysteryEvent.discovered = true;
            var mysteryTexts = [
                'A campfire burns alone... as you approach, it dies.',
                'Ten candles in a perfect circle. No one around.',
                'All trees here lie fallen. Same direction.',
                'A table with a warm plate. No one in sight.',
                'A cauldron of boiling water. No one tends it.',
                'A shrine covered in fresh flowers. Who left them?',
                'Fifty shoes lined up in a row.',
                'Ten chairs. All facing the same point in the distance.',
                'A single burned tree among green ones.',
                'A swing moves by itself. No wind.',
                'An old bicycle against a tree.',
                'An empty suitcase. Nothing else.',
                'An open book. The pages don\'t turn.',
                'Dozens of spoons scattered on the ground.',
                'A well. You hear water. No bucket.',
                'A small wooden boat. In the middle of the forest.',
                'A large wall clock on a tree. Frozen at 3:33.',
                'Every stone here has a cross carved into it.',
                'A massive tree wrapped in hundreds of ribbons.',
                'A table with a chess game. Mid-play. No players.',
                'A single child\'s shoe. Nothing else.',
                'Two overturned boats. Miles from water.',
                'A backpack. Bone dry inside. In pouring rain.',
                'A tree with dozens of nails hammered in.',
                'All mushrooms here are black.',
                'A hundred stones in a perfect straight line.',
                'A wooden door. Standing alone. No building.',
                'Three empty swings. Perfectly still.',
                'A huge pile of firewood. As if someone was preparing.',
                'A cabin. All chairs placed outside.',
                'A cabin. Every window open. Door locked.',
                'A cabin. Table set for dinner. No one here.',
                'A path that ends abruptly. Into nothing.',
                'A clearing. Not a single tree. In a dense forest.',
                'A stone with a lit candle on top.',
                'Three shrines, side by side.',
                'A tree surrounded by dozens of empty cages.',
                'A line of stone cairns. Too many. Like a road.',
                'A wolf den. Empty. Filled with flowers.',
                'A wooden table. A lit lantern. It never goes out.',
                'A cabin. Door open. Fire burning. No one inside.',
                'A felled tree. Cut too perfectly. Like a machine.',
                'A perfect circle of mushrooms.',
                'Dozens of empty oil bottles around a shrine.',
                'Trees with the same number carved into every trunk.',
                'A rope hanging from a tree. Leading nowhere.',
                'A small wooden bridge. Over dry ground.',
                'A table. A glass. Still steaming.',
                'A path of lit candles. Ends at a rock. Nothing more.',
                'A stone. One word carved: TURN BACK.'
            ];
            this.notification = { text: mysteryTexts[this.mysteryEvent.id], timer: 300 };
        }
    }

    // --- ELDER ---
    if (!this.indoors && !this.elder && !this.elderDialogue && !this.nightActive) {
        this.elderCooldown--;
        if (this.elderCooldown <= 0) {
            var eAngle = Math.random() * Math.PI * 2;
            var eDist = 200 + Math.random() * 150;
            this.elder = {
                x: this.player.x + Math.cos(eAngle) * eDist,
                y: this.player.y + Math.sin(eAngle) * eDist,
                tale: Math.floor(Math.random() * this.elderTales.length),
                timer: 0,
                female: Math.random() < 0.5
            };
            this.elderCooldown = 18000 + Math.floor(Math.random() * 36000);
        }
    }
    if (this.elder && !this.elderDialogue) {
        this.elder.timer++;
        if (this.elder.timer > 5400) {
            this.elder = null;
        } else {
            var edx = this.player.x - this.elder.x;
            var edy = this.player.y - this.elder.y;
            var eDist2 = Math.sqrt(edx * edx + edy * edy);
            if (eDist2 < 60 && !this.elderPrompt) {
                this.elderPrompt = true;
            }
            if (eDist2 >= 80) {
                this.elderPrompt = false;
            }
        }
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
        var iw = TWB.INTERIOR_COLS * TWB.TILE;
        var ih = TWB.INTERIOR_ROWS * TWB.TILE;
        var wt = 6;
        var stoneH = 44;
        ctx.fillStyle = '#2a2420';
        ctx.fillRect(-cam.x, -cam.y, iw, stoneH);
        ctx.fillStyle = '#1e1a16';
        for (var swi = 0; swi < TWB.INTERIOR_COLS; swi++) {
            ctx.fillRect(swi * TWB.TILE - cam.x, 14 - cam.y, TWB.TILE, 2);
            ctx.fillRect(swi * TWB.TILE - cam.x, 30 - cam.y, TWB.TILE, 2);
            if (swi > 0) ctx.fillRect(swi * TWB.TILE - cam.x, -cam.y, 2, stoneH);
        }
        ctx.fillStyle = '#322a22';
        ctx.fillRect(-cam.x, stoneH - 2 - cam.y, iw, 2);
        ctx.fillStyle = '#3a3028';
        ctx.fillRect(-cam.x, ih - wt - cam.y, iw, wt);
        ctx.fillRect(-cam.x, stoneH - cam.y, wt, ih - stoneH);
        ctx.fillRect(iw - wt - cam.x, stoneH - cam.y, wt, ih - stoneH);
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
                var trailKey = tx + ',' + ty;
                if (this.shadowTrails[trailKey]) {
                    var trailAlpha = Math.min(0.6, this.shadowTrails[trailKey] * 0.12);
                    ctx.fillStyle = 'rgba(5,0,15,' + trailAlpha.toFixed(2) + ')';
                    ctx.fillRect(Math.floor(tx * TWB.TILE - cam.x), Math.floor(ty * TWB.TILE - cam.y), TWB.TILE, TWB.TILE);
                }
                var snowKey = tx + ',' + ty;
                if (this.snowAccum[snowKey]) {
                    var sa = this.snowAccum[snowKey];
                    ctx.fillStyle = 'rgba(210,210,220,' + (sa * 0.7).toFixed(2) + ')';
                    ctx.fillRect(Math.floor(tx * TWB.TILE - cam.x), Math.floor(ty * TWB.TILE - cam.y), TWB.TILE, TWB.TILE);
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
    if (!this.dogStolen) renderList.push({ kind: 'wolf', sortY: this.wolf.y });

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

    if (this.questSymbol && this.dogStolen && !this.indoors) this.drawQuestSymbol();
    if (this.questRevealed && this.dogStolen && !this.indoors && this.questDogPos) this.drawQuestDogGlow();
    if (!this.indoors && this.mysteryEvent && !this.mysteryEvent.discovered) this.drawMysteryGlow();
    if (!this.indoors) this.drawWildlife();
    if (!this.indoors && this.elder) this.drawElder();
    if (!this.indoors && this.shadows.length > 0) this.drawShadows();
    if (!this.indoors && this.phantomLight) this.drawPhantomLight();
    if (!this.indoors && this.phantom2 && this.phantom2.on) this.drawPhantom2();
    this.drawFire();
    this.drawLighting();
    if (this.indoors && this.doorShake > 0) this.drawDoorShake();
    if (this.indoors && this.stranger) this.drawStranger();
    if (this.raining && !this.indoors) this.drawRain();
    if (this.snowing && !this.indoors) this.drawSnow();
    if (this.fogDensity > 0 && !this.indoors) this.drawFog();
    this.drawCold();
    if (this.distortion > 0.1 && this.indoors) this.drawDistortion();
    if (TWB._scenario === 'CURSE' && !this.indoors) this.drawCurseEffects();
    this.drawClock();
    this.drawObjective();
    this.drawHUD();
    if (this.backpackOpen) this.drawBackpack();
    if (this.craftingOpen) this.drawCrafting();
    this.drawMenu();
    this.drawNotification();
    if (this.elderDialogue) this.drawElderDialogue();
    if (this.mapOpen) this.drawMap();
    if (this.readingNote) this.drawNote();
    if (this.windowView) this.drawWindowView();
    if (this.fates) this.drawFates();
    if (this.victory) this.drawVictory();
    if (this.dead) this.drawDeath();
};

TWB.Game.prototype.drawObject = function(obj) {
    if (obj.type === 'herb_vikos' && obj.picked) return;
    var sprite = TWB.Sprites[obj.type];
    if (!sprite) return;
    var anchor = TWB.getSpriteAnchor(obj.type);
    var dx = Math.floor(obj.x - anchor.x - this.camera.x);
    var dy = Math.floor(obj.y - anchor.y - this.camera.y);
    var ctx = this.ctx;

    var swayTypes = { tree_pine: 0.025, tree_oak: 0.018, bush: 0.012, herb_vikos: 0.015 };
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

    if (obj.type === 'curse_shrine') {
        if (obj.lit) {
            var flk = 0.5 + Math.sin(this.fireTime * 0.1) * 0.3;
            ctx.save();
            ctx.globalAlpha = flk;
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = '#6020a0';
            ctx.fillRect(dx + 12, dy + 16, 8, 3);
            ctx.fillStyle = '#8040c0';
            ctx.fillRect(dx + 13, dy + 13, 6, 3);
            var glow2 = ctx.createRadialGradient(dx + 16, dy + 20, 0, dx + 16, dy + 20, 30);
            glow2.addColorStop(0, 'rgba(80,20,160,0.4)');
            glow2.addColorStop(1, 'rgba(80,20,160,0)');
            ctx.fillStyle = glow2;
            ctx.fillRect(dx - 14, dy - 10, 60, 60);
            ctx.restore();
        } else {
            var pulse = 0.15 + Math.sin(this.fireTime * 0.04) * 0.1;
            ctx.save();
            ctx.globalAlpha = pulse;
            var dGlow = ctx.createRadialGradient(dx + 16, dy + 22, 0, dx + 16, dy + 22, 20);
            dGlow.addColorStop(0, 'rgba(60,10,80,0.5)');
            dGlow.addColorStop(1, 'rgba(60,10,80,0)');
            ctx.fillStyle = dGlow;
            ctx.fillRect(dx - 4, dy + 2, 40, 40);
            ctx.restore();
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

        var herbBuff = (obj.type === 'campfire' && this.fireBuff > 0) || (obj.type === 'fireplace' && this.fireBuffFP > 0);
        for (var i = 0; i < flameCount; i++) {
            var flick = Math.sin(t * 0.15 + i * 1.5 + oi) * 3;
            var h = (8 + Math.sin(t * 0.1 + i + oi) * 3) * flameScale;
            if (herbBuff) {
                ctx.fillStyle = 'rgba(50,200,80,' + alpha + ')';
                ctx.fillRect(fx - 3 + i * 2 + flick, fy - h, 3, h);
                ctx.fillStyle = 'rgba(120,255,100,' + (alpha * 0.7) + ')';
            } else {
                ctx.fillStyle = 'rgba(255,100,20,' + alpha + ')';
                ctx.fillRect(fx - 3 + i * 2 + flick, fy - h, 3, h);
                ctx.fillStyle = 'rgba(255,200,50,' + (alpha * 0.7) + ')';
            }
            ctx.fillRect(fx - 2 + i * 2 + flick, fy - h * 0.6, 2, h * 0.4);
        }

        var glowR = (herbBuff ? 70 : 50) * fuelPct;
        var glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
        if (herbBuff) {
            glow.addColorStop(0, 'rgba(80,200,100,' + (0.12 * fuelPct) + ')');
            glow.addColorStop(1, 'rgba(80,200,100,0)');
        } else {
            glow.addColorStop(0, 'rgba(255,150,50,' + (0.1 * fuelPct) + ')');
            glow.addColorStop(1, 'rgba(255,150,50,0)');
        }
        ctx.fillStyle = glow;
        ctx.fillRect(fx - glowR - 10, fy - glowR - 10, glowR * 2 + 20, glowR * 2 + 20);
    }

    for (var si = 0; si < this.objects.length; si++) {
        var shr = this.objects[si];
        if ((shr.type !== 'shrine' && shr.type !== 'curse_shrine') || !shr.lit) continue;
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
        if (this.difficulty === 0) nightBase += 3;
        else if (this.difficulty === 2) nightBase -= 3;
        return nightBase;
    }
    if (this.difficulty === 0) return low + 3;
    return low;
};

TWB.Game.prototype.getTemperatureBreakdown = function() {
    var base = this.getBaseTemperature();
    var wind = -Math.round(this.windSpeed * 3);
    var rain = (this.raining && !this.indoors) ? -4 : 0;
    var snow = (this.snowing && !this.indoors) ? -5 : 0;
    var snowGround = 0;
    if (!this.indoors) {
        var spx = Math.floor(this.player.x / TWB.TILE);
        var spy = Math.floor(this.player.y / TWB.TILE);
        var sgl = TWB.getSnowLevel(spx, spy);
        if (sgl > 0) snowGround = -2 * sgl;
        if (this.snowAccum[spx + ',' + spy]) snowGround = Math.min(snowGround, -2);
    }
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
            if ((sw.type !== 'shrine' && sw.type !== 'curse_shrine') || !sw.lit) continue;
            var swdx = this.player.x - sw.x;
            var swdy = this.player.y - sw.y;
            if (Math.sqrt(swdx * swdx + swdy * swdy) < 100) { shrineWarmth = 4; break; }
        }
    }

    var distort = 0;
    if (this.indoors && this.distortion > 0.2) {
        distort = -Math.round(Math.sin(this.gameTime * 0.1) * this.distortion * 10);
    }

    var cursedChill = 0;
    if (this.cursedCabin >= 0 && !this.indoors) {
        var ccData = TWB._cabinData[this.cursedCabin];
        var ccdx2 = this.player.x - ccData.cx * TWB.TILE;
        var ccdy2 = this.player.y - ccData.cy * TWB.TILE;
        if (Math.sqrt(ccdx2 * ccdx2 + ccdy2 * ccdy2) < 160) cursedChill = -2;
    }
    if (this.indoors && this.currentCabinIdx === this.cursedCabin) cursedChill = -2;

    return {
        base: base,
        wind: wind,
        rain: rain,
        snow: snow,
        snowGround: snowGround,
        wetness: wet,
        fire: fire,
        shelter: shelter,
        clothing: clothing,
        shrine: shrineWarmth,
        distortion: distort,
        cursed: cursedChill,
        feelsLike: base + wind + rain + snow + snowGround + wet + fire + shelter + clothing + shrineWarmth + distort + cursedChill
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

TWB.Game.prototype.drawElder = function() {
    var ctx = this.ctx;
    var e = this.elder;
    var sx = Math.floor(e.x - this.camera.x);
    var sy = Math.floor(e.y - this.camera.y);
    if (sx < -50 || sx > this.canvas.width + 50 || sy < -50 || sy > this.canvas.height + 50) return;
    var P = 2;
    var dk = '#0a0a0a';
    var md = '#141414';
    var lt = '#1e1e1e';

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(sx - 5 * P, sy - P, 10 * P, 2 * P);

    ctx.fillStyle = md;
    ctx.fillRect(sx - 2 * P, sy - 18 * P, P * 4, P);
    ctx.fillStyle = dk;
    ctx.fillRect(sx - 3 * P, sy - 17 * P, P * 5, P * 3);
    ctx.fillStyle = md;
    ctx.fillRect(sx - 2 * P, sy - 16 * P, P * 3, P * 2);
    ctx.fillStyle = dk;
    ctx.fillRect(sx - 2 * P, sy - 14 * P, P * 4, P);
    ctx.fillStyle = dk;
    ctx.fillRect(sx - 3 * P, sy - 13 * P, P * 6, P * 5);
    ctx.fillStyle = md;
    ctx.fillRect(sx - 2 * P, sy - 12 * P, P * 4, P * 3);
    ctx.fillStyle = dk;
    ctx.fillRect(sx - 4 * P, sy - 11 * P, P, P * 4);
    ctx.fillRect(sx + 3 * P, sy - 11 * P, P, P * 4);
    ctx.fillStyle = dk;
    ctx.fillRect(sx - 2 * P, sy - 8 * P, P * 5, P * 4);
    ctx.fillStyle = md;
    ctx.fillRect(sx - P, sy - 7 * P, P * 3, P * 2);
    ctx.fillStyle = dk;
    ctx.fillRect(sx - 2 * P, sy - 4 * P, P * 2, P * 4);
    ctx.fillRect(sx + P, sy - 4 * P, P * 2, P * 4);
    ctx.fillStyle = dk;
    ctx.fillRect(sx - 2 * P, sy, P * 2, P);
    ctx.fillRect(sx + P, sy, P * 2, P);
    ctx.fillStyle = lt;
    ctx.fillRect(sx + 4 * P, sy - 15 * P, P, P * 14);
    ctx.fillRect(sx + 4 * P, sy - P, P, P * 2);

    if (this.elderPrompt) {
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#d4a44a';
        ctx.fillText('[E] Talk', sx, sy - 20 * P);
        ctx.textAlign = 'left';
    }
};

TWB.Game.prototype.drawElderDialogue = function() {
    var ctx = this.ctx;
    var d = this.elderDialogue;
    var cw = this.canvas.width;
    var ch = this.canvas.height;
    var pw = 340, ph = 130;
    var px = Math.floor((cw - pw) / 2);
    var py = Math.floor(ch / 2) - 90;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = 'rgba(20,18,14,0.95)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#6a5a3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, pw, ph);
    ctx.strokeStyle = '#d4a44a';
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#8a7a5a';
    ctx.fillText(d.female ? 'An old woman speaks...' : 'An old man speaks...', px + 10, py + 8);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#c8b888';
    var words = d.text.split(' ');
    var lines = [];
    var line = '';
    var maxW = pw - 24;
    for (var i = 0; i < words.length; i++) {
        var test = line ? line + ' ' + words[i] : words[i];
        if (ctx.measureText(test).width > maxW) {
            lines.push(line);
            line = words[i];
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    for (var li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], px + 12, py + 24 + li * 12);
    }

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#5a5030';
    ctx.textAlign = 'center';
    ctx.fillText('click or [E] to close', px + pw / 2, py + ph - 12);
    ctx.textAlign = 'left';
};

TWB.Game.prototype.drawMysteryGlow = function() {
    var ctx = this.ctx;
    var me = this.mysteryEvent;
    var sx = Math.floor(me.x - this.camera.x);
    var sy = Math.floor(me.y - this.camera.y);
    if (sx < -50 || sx > this.canvas.width + 50 || sy < -50 || sy > this.canvas.height + 50) return;
    ctx.save();
    var pulse = 0.3 + Math.sin(this.fireTime * 0.03) * 0.15;
    var grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30);
    grad.addColorStop(0, 'rgba(200,180,120,' + pulse.toFixed(2) + ')');
    grad.addColorStop(1, 'rgba(200,180,120,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(sx - 30, sy - 30, 60, 60);
    ctx.restore();
};

TWB.Game.prototype.drawCloseBtn = function(x, y) {
    var ctx = this.ctx;
    var s = 14;
    ctx.fillStyle = 'rgba(60,20,20,0.7)';
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = '#804040';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, s, s);
    ctx.strokeStyle = '#cc6060';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + s - 3, y + s - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + s - 3, y + 3); ctx.lineTo(x + 3, y + s - 3); ctx.stroke();
};

TWB.Game.prototype.drawObjective = function() {
    var sd = TWB._scenarioData;
    if (!sd.objectiveText) return;
    var ctx = this.ctx;
    ctx.save();
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    var tw = ctx.measureText(sd.objectiveText).width;
    ctx.fillRect(4, 42, tw + 10, 14);
    ctx.fillStyle = '#b8a060';
    ctx.fillText(sd.objectiveText, 9, 46);
    ctx.restore();
};

TWB.Game.prototype.drawCurseEffects = function() {
    var ctx = this.ctx;
    var cam = this.camera;
    var sd = TWB._scenarioData;
    if (!sd.shrineCabin) return;
    var tc = TWB._cabinData[sd.shrineCabin];
    if (!tc) return;
    var tcx = Math.floor(tc.cx * TWB.TILE - cam.x);
    var tcy = Math.floor(tc.cy * TWB.TILE - cam.y);
    if (tcx > -200 && tcx < this.canvas.width + 200 && tcy > -200 && tcy < this.canvas.height + 200) {
        var pulse = 0.12 + Math.sin(this.fireTime * 0.02) * 0.06;
        var grad = ctx.createRadialGradient(tcx, tcy, 20, tcx, tcy, 150);
        grad.addColorStop(0, 'rgba(60,10,80,' + pulse.toFixed(2) + ')');
        grad.addColorStop(0.5, 'rgba(40,5,60,' + (pulse * 0.5).toFixed(2) + ')');
        grad.addColorStop(1, 'rgba(40,5,60,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(tcx - 150, tcy - 150, 300, 300);
    }
    var relics = this.getItemCount('relic');
    if (relics > 0) {
        var dist = relics * 0.02;
        var shiftX = Math.sin(this.fireTime * 0.07) * dist * 3;
        var shiftY = Math.cos(this.fireTime * 0.09) * dist * 2;
        ctx.save();
        ctx.globalAlpha = 0.06 * relics;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(this.canvas, shiftX, shiftY);
        ctx.restore();
        ctx.fillStyle = 'rgba(40,0,60,' + (0.03 * relics).toFixed(2) + ')';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

TWB.Game.prototype.drawClock = function() {
    var ctx = this.ctx;
    var totalMinutes = Math.floor(this.gameTime / 60);
    var hours = Math.floor(totalMinutes / 60) % 24;
    var minutes = totalMinutes % 60;
    var timeStr = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

    var hour = this.getGameHour();
    var period = hour < 6 ? 'NIGHT' : hour < 9 ? 'DAWN' : hour < 12 ? 'MORNING' : hour < 18 ? 'AFTERNOON' : hour < 21 ? 'DUSK' : 'NIGHT';

    var periodSuffix = this.raining ? ' RAIN' : (this.snowing ? ' SNOW' : '');
    if (this.nightActive && this.nightType === 'freeze') periodSuffix = ' STORM';
    else if (this.nightActive && this.nightType === 'shadow_surge') periodSuffix = ' DARK';
    var periodStr = period + periodSuffix;
    ctx.font = '8px "Press Start 2P", monospace';
    var periodW = ctx.measureText(periodStr).width;
    var boxW = Math.max(90, periodW + 16);
    var cx = this.canvas.width - boxW - 8;
    var cy = 12;

    var iconSize = 22, iconGap = 4, iconY = cy + 34;
    var icons = [
        { key: 'TAB', active: this.backpackOpen, label: 'B' },
        { key: 'M', active: this.mapOpen, label: 'M' },
        { key: 'C', active: this.craftingOpen, label: 'C' },
        { key: 'L', active: this.flashlightOn, label: 'L' }
    ];
    var totalIconW = icons.length * iconSize + (icons.length - 1) * iconGap;
    var iconStartX = cx - 6 + boxW - totalIconW;

    for (var ii = 0; ii < icons.length; ii++) {
        var icon = icons[ii];
        var ix = iconStartX + ii * (iconSize + iconGap);
        var iy = iconY;
        var hovered = (this.iconHover === ii);

        ctx.fillStyle = icon.active ? 'rgba(212,164,74,0.3)' : hovered ? 'rgba(40,40,60,0.8)' : 'rgba(6,6,10,0.6)';
        ctx.fillRect(ix, iy, iconSize, iconSize);
        ctx.strokeStyle = icon.active ? '#d4a44a' : hovered ? '#8a8a9a' : '#3a3a4a';
        ctx.lineWidth = 1;
        ctx.strokeRect(ix, iy, iconSize, iconSize);

        var col = icon.active ? '#d4a44a' : hovered ? '#b0b0c0' : '#6a6a7a';
        if (icon.label === 'B') {
            ctx.fillStyle = col;
            ctx.fillRect(ix + 5, iy + 4, 12, 14);
            ctx.fillStyle = icon.active ? 'rgba(212,164,74,0.25)' : hovered ? 'rgba(40,40,60,0.8)' : 'rgba(6,6,10,0.6)';
            ctx.fillRect(ix + 7, iy + 7, 4, 4);
            ctx.fillRect(ix + 12, iy + 7, 3, 4);
        } else if (icon.label === 'M') {
            ctx.fillStyle = col;
            ctx.fillRect(ix + 4, iy + 4, 14, 14);
            ctx.strokeStyle = icon.active ? '#1a1a0a' : '#2a2a3a';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(ix + 7, iy + 4); ctx.lineTo(ix + 7, iy + 18); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ix + 11, iy + 4); ctx.lineTo(ix + 11, iy + 18); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ix + 15, iy + 4); ctx.lineTo(ix + 15, iy + 18); ctx.stroke();
        } else if (icon.label === 'C') {
            ctx.strokeStyle = col;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(ix + 6, iy + 5); ctx.lineTo(ix + 6, iy + 17); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ix + 16, iy + 5); ctx.lineTo(ix + 16, iy + 17); ctx.stroke();
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(ix + 6, iy + 8); ctx.lineTo(ix + 16, iy + 8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ix + 6, iy + 14); ctx.lineTo(ix + 16, iy + 14); ctx.stroke();
        } else if (icon.label === 'L') {
            ctx.fillStyle = icon.active ? '#ffe080' : col;
            ctx.beginPath();
            ctx.moveTo(ix + 8, iy + 4);
            ctx.lineTo(ix + 14, iy + 4);
            ctx.lineTo(ix + 15, iy + 11);
            ctx.lineTo(ix + 7, iy + 11);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(ix + 8, iy + 12, 6, 3);
            if (icon.active) {
                ctx.strokeStyle = '#ffe080';
                ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(ix + 11, iy + 16); ctx.lineTo(ix + 11, iy + 19); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ix + 5, iy + 15); ctx.lineTo(ix + 3, iy + 18); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ix + 17, iy + 15); ctx.lineTo(ix + 19, iy + 18); ctx.stroke();
            }
        }

        if (hovered) {
            ctx.fillStyle = '#d4a44a';
            var ax = ix + Math.floor(iconSize / 2);
            var ay = iy - 3;
            ctx.fillRect(ax - 1, ay - 6, 2, 4);
            ctx.fillRect(ax - 3, ay - 4, 6, 2);
        }
    }

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
    ctx.fillText(periodStr, cx, cy + 16);

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
        ctx.font = '7px "Press Start 2P", monospace';
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
    } else if (!this.indoors && overlayA > 0.3) {
        var ep = this.player;
        var epx = Math.floor(ep.x - this.camera.x);
        var epy = Math.floor(ep.y - this.camera.y);
        var emGlow = lctx.createRadialGradient(epx, epy, 0, epx, epy, 20);
        emGlow.addColorStop(0, 'rgba(0,0,0,0.15)');
        emGlow.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = emGlow;
        lctx.fillRect(epx - 20, epy - 20, 40, 40);
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
            if ((sl.type !== 'shrine' && sl.type !== 'curse_shrine') || !sl.lit) continue;
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

TWB.Game.prototype.drawSnow = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;

    while (this.snowFlakes.length < 150) {
        this.snowFlakes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 1 + Math.random() * 2,
            speed: 0.5 + Math.random() * 1.2,
            drift: -0.3 + Math.random() * 0.6,
            wobble: Math.random() * Math.PI * 2
        });
    }

    ctx.save();
    for (var i = 0; i < this.snowFlakes.length; i++) {
        var f = this.snowFlakes[i];
        var alpha = 0.4 + f.r * 0.15;
        ctx.fillStyle = 'rgba(220,220,230,' + alpha.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        f.y += f.speed;
        f.wobble += 0.03;
        f.x += f.drift + Math.sin(f.wobble) * 0.3;
        if (f.y > h) {
            f.y = -f.r;
            f.x = Math.random() * w;
        }
        if (f.x < -5) f.x = w + 3;
        if (f.x > w + 5) f.x = -3;
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(180,185,200,0.04)';
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

TWB.Game.prototype.drawQuestDogGlow = function() {
    var ctx = this.ctx;
    var cam = this.camera;
    var dx = Math.floor(this.questDogPos.x - cam.x);
    var dy = Math.floor(this.questDogPos.y - cam.y);
    if (dx < -60 || dx > this.canvas.width + 60 || dy < -60 || dy > this.canvas.height + 60) return;
    var pulse = 0.3 + Math.sin(this.fireTime * 0.06) * 0.2;
    ctx.save();
    var glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, 40);
    glow.addColorStop(0, 'rgba(200,160,40,' + pulse + ')');
    glow.addColorStop(0.5, 'rgba(200,100,20,' + (pulse * 0.4) + ')');
    glow.addColorStop(1, 'rgba(200,60,20,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(dx - 40, dy - 40, 80, 80);
    ctx.restore();
};

TWB.Game.prototype.drawQuestSymbol = function() {
    var ctx = this.ctx;
    var cam = this.camera;
    var sx = Math.floor(this.questSymbol.x - cam.x);
    var sy = Math.floor(this.questSymbol.y - cam.y);
    if (sx < -40 || sx > this.canvas.width + 40 || sy < -40 || sy > this.canvas.height + 40) return;
    var pulse = Math.sin(this.fireTime * 0.04) * 0.15;
    ctx.save();
    ctx.globalAlpha = 0.6 + pulse;
    ctx.strokeStyle = '#2a0030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy - 6);
    ctx.lineTo(sx + 6, sy + 6);
    ctx.moveTo(sx + 6, sy - 6);
    ctx.lineTo(sx - 6, sy + 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx, sy - 8);
    ctx.lineTo(sx, sy + 8);
    ctx.moveTo(sx - 8, sy);
    ctx.lineTo(sx + 8, sy);
    ctx.stroke();
    ctx.fillStyle = '#1a0020';
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

TWB.Game.prototype.drawDistortion = function() {
    var ctx = this.ctx;
    var cw = this.canvas.width;
    var ch = this.canvas.height;
    var d = this.distortion;

    ctx.save();
    var vigA = d * 0.4;
    var vg = ctx.createRadialGradient(cw / 2, ch / 2, cw * 0.25, cw / 2, ch / 2, cw * 0.6);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(10,0,20,' + vigA + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, cw, ch);

    if (this.distortionFlicker > 0) {
        var flkA = 0.05 + d * 0.1;
        ctx.fillStyle = 'rgba(120,80,160,' + flkA + ')';
        ctx.fillRect(0, 0, cw, ch);
        var scanY = Math.floor(Math.random() * ch);
        var scanH = 2 + Math.floor(Math.random() * 4);
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(0, scanY, cw, scanH);
    }

    if (d > 0.5) {
        var lineCount = Math.floor((d - 0.5) * 20);
        ctx.strokeStyle = 'rgba(60,20,80,0.08)';
        ctx.lineWidth = 1;
        for (var li = 0; li < lineCount; li++) {
            var ly = Math.floor(Math.random() * ch);
            var lx = Math.floor(Math.random() * cw * 0.3);
            var ll = 20 + Math.floor(Math.random() * 60);
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx + ll, ly + (Math.random() - 0.5) * 4);
            ctx.stroke();
        }
    }
    ctx.restore();
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
    this.runStats.itemsCrafted++;
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

    this.drawCloseBtn(px + pw - 20, py + 4);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#d4a44a';
    ctx.fillText('CRAFTING', px + 10, py + 8);

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
    var ty = this.canvas.height * 0.38;

    var isWarning = n.text === 'Too tired...' || n.text === 'Backpack is full!';
    var color = isWarning ? '#e05050' : '#d4a44a';

    var tw = ctx.measureText(n.text).width;
    ctx.fillStyle = isWarning ? 'rgba(80,20,20,0.75)' : 'rgba(0,0,0,0.6)';
    ctx.fillRect(tx - tw / 2 - 10, ty - 12, tw + 20, 26);

    ctx.fillStyle = '#000';
    ctx.fillText(n.text, tx + 1, ty + 1);
    ctx.fillStyle = color;
    ctx.fillText(n.text, tx, ty);

    ctx.restore();
};

TWB.Game.prototype.drawPhantomLight = function() {
    var pl = this.phantomLight;
    if (!pl || pl.brightness <= 0) return;
    var ctx = this.ctx;
    var cam = this.camera;
    var sx = Math.floor(pl.x - cam.x), sy = Math.floor(pl.y - cam.y);
    var r = 40 + pl.brightness * 30;
    var flicker = 0.9 + Math.sin(this.gameTime * 0.15) * 0.1;
    var alpha = pl.brightness * 0.6 * flicker;
    var grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    grad.addColorStop(0, 'rgba(255,180,60,' + alpha + ')');
    grad.addColorStop(0.4, 'rgba(255,140,30,' + (alpha * 0.5) + ')');
    grad.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
};

TWB.Game.prototype.drawPhantom2 = function() {
    var p2 = this.phantom2;
    if (!p2) return;
    var ctx = this.ctx;
    var cam = this.camera;
    var sx = Math.floor(p2.x - cam.x), sy = Math.floor(p2.y - cam.y);
    var beamLen = 50 + Math.sin(this.gameTime * 0.05) * 10;
    var beamW = 0.25;
    var ex = sx + Math.cos(p2.dir) * beamLen;
    var ey = sy + Math.sin(p2.dir) * beamLen;
    var flick = 0.85 + Math.sin(this.gameTime * 0.2) * 0.15;
    var alpha = 0.4 * flick;
    if (p2.timer > p2.maxTime) alpha *= Math.max(0, 1 - (p2.timer - p2.maxTime) / 60);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffe8c0';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex + Math.cos(p2.dir + beamW) * 15, ey + Math.sin(p2.dir + beamW) * 15);
    ctx.lineTo(ex + Math.cos(p2.dir - beamW) * 15, ey + Math.sin(p2.dir - beamW) * 15);
    ctx.closePath();
    ctx.fill();

    var grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
    grad.addColorStop(0, 'rgba(255,240,200,0.5)');
    grad.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.globalAlpha = alpha * 1.5;
    ctx.fillStyle = grad;
    ctx.fillRect(sx - 12, sy - 12, 24, 24);
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

    if (this.dogStolen && this.questPhase > 0) {
        var pad = 24, bw2 = 10;
        var qmX = pad + bw2, qmY = pad + bw2;
        var qmW = cw - (pad + bw2) * 2, qmH = ch - (pad + bw2) * 2;
        var qsx = qmW / TWB.COLS, qsy = qmH / TWB.ROWS;

        for (var qmi = 0; qmi < this.questShrines.length; qmi++) {
            var qsh = this.objects[this.questShrines[qmi]];
            if (!qsh) continue;
            var qshx = qmX + (qsh.x / TWB.TILE) * qsx;
            var qshy = qmY + (qsh.y / TWB.TILE) * qsy;
            ctx.save();
            if (qsh.lit) {
                ctx.fillStyle = '#d4a44a';
                ctx.strokeStyle = '#c09030';
            } else {
                var qPulse = 0.5 + Math.sin(this.fireTime * 0.05 + qmi * 2) * 0.3;
                ctx.fillStyle = 'rgba(160,40,40,' + qPulse + ')';
                ctx.strokeStyle = '#802020';
            }
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(qshx, qshy, 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(qsh.lit ? '✓' : '?', qshx, qshy + 2);
            ctx.restore();
        }

        if (this.questRevealed && this.questDogPos) {
            var qdmx = qmX + (this.questDogPos.x / TWB.TILE) * qsx;
            var qdmy = qmY + (this.questDogPos.y / TWB.TILE) * qsy;
            var qPulse2 = 0.4 + Math.sin(this.fireTime * 0.08) * 0.4;
            ctx.save();
            ctx.fillStyle = 'rgba(200,30,30,' + qPulse2 + ')';
            ctx.beginPath();
            ctx.arc(qdmx, qdmy, 5 + Math.sin(this.fireTime * 0.08) * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#c02020';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#ff4040';
            ctx.font = 'italic 7px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.dogName || 'Dog', qdmx, qdmy - 10);
            ctx.restore();
        }
    }

    var sd = TWB._scenarioData;
    if (sd && !this.dogStolen) {
        var sPad = 24, sBw = 10;
        var smX = sPad + sBw, smY = sPad + sBw;
        var smW = cw - (sPad + sBw) * 2, smH = ch - (sPad + sBw) * 2;
        var ssx = smW / TWB.COLS, ssy = smH / TWB.ROWS;

        if (TWB._scenario === 'RESCUE' && sd.clueCabins) {
            for (var rci = 0; rci < 3; rci++) {
                if (sd.cluesFound[rci]) {
                    var rc = TWB._cabinData[sd.clueCabins[rci]];
                    if (!rc) continue;
                    var rcx = smX + rc.cx * ssx, rcy = smY + rc.cy * ssy;
                    ctx.save();
                    ctx.fillStyle = '#4090d0';
                    ctx.strokeStyle = '#3070b0';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(rcx, rcy, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.font = '7px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#fff';
                    ctx.fillText('✓', rcx, rcy + 2);
                    ctx.restore();
                }
            }
            if (sd.revealedCabins) {
                for (var rvi = 0; rvi < sd.revealedCabins.length; rvi++) {
                    var rvIdx = sd.revealedCabins[rvi];
                    var alreadyFound = false;
                    for (var rci2 = 0; rci2 < 3; rci2++) {
                        if (sd.clueCabins[rci2] === rvIdx && sd.cluesFound[rci2]) { alreadyFound = true; break; }
                    }
                    if (rvIdx === TWB._targetCabin) alreadyFound = false;
                    if (alreadyFound) continue;
                    var rvc = TWB._cabinData[rvIdx];
                    if (!rvc) continue;
                    var rvx = smX + rvc.cx * ssx, rvy = smY + rvc.cy * ssy;
                    var rvPulse = 0.5 + Math.sin(this.fireTime * 0.06 + rvi * 2) * 0.3;
                    ctx.save();
                    ctx.strokeStyle = 'rgba(200,80,80,' + rvPulse + ')';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.arc(rvx, rvy, 7, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.font = '7px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#d04040';
                    ctx.fillText('?', rvx, rvy + 2);
                    ctx.restore();
                }
            }
        } else if (TWB._scenario === 'RELAY' && sd.partCabins) {
            for (var rpi = 0; rpi < 3; rpi++) {
                if (sd.partsFound[rpi]) {
                    var rpc = TWB._cabinData[sd.partCabins[rpi]];
                    if (!rpc) continue;
                    var rpx = smX + rpc.cx * ssx, rpy = smY + rpc.cy * ssy;
                    ctx.save();
                    ctx.fillStyle = '#40d060';
                    ctx.strokeStyle = '#30b050';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(rpx, rpy, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.font = '7px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#fff';
                    ctx.fillText('✓', rpx, rpy + 2);
                    ctx.restore();
                }
            }
            if (sd.revealedCabins) {
                for (var rvi = 0; rvi < sd.revealedCabins.length; rvi++) {
                    var rvIdx = sd.revealedCabins[rvi];
                    var alreadyFound = false;
                    for (var rpi2 = 0; rpi2 < 3; rpi2++) {
                        if (sd.partCabins[rpi2] === rvIdx && sd.partsFound[rpi2]) { alreadyFound = true; break; }
                    }
                    if (rvIdx === TWB._targetCabin) alreadyFound = false;
                    if (alreadyFound) continue;
                    var rvc = TWB._cabinData[rvIdx];
                    if (!rvc) continue;
                    var rvx = smX + rvc.cx * ssx, rvy = smY + rvc.cy * ssy;
                    var rvPulse = 0.5 + Math.sin(this.fireTime * 0.06 + rvi * 2) * 0.3;
                    ctx.save();
                    ctx.strokeStyle = 'rgba(200,80,80,' + rvPulse + ')';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.arc(rvx, rvy, 7, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.font = '7px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#d04040';
                    ctx.fillText('?', rvx, rvy + 2);
                    ctx.restore();
                }
            }
        } else if (TWB._scenario === 'CURSE' && sd.curseShrines) {
            for (var csi = 0; csi < sd.curseShrines.length; csi++) {
                var cs = sd.curseShrines[csi];
                var csx = smX + cs.tx * ssx, csy = smY + cs.ty * ssy;
                ctx.save();
                var csPulse = 0.5 + Math.sin(this.fireTime * 0.05 + csi * 2) * 0.3;
                if (cs.relicTaken) {
                    ctx.fillStyle = '#d4a44a';
                    ctx.strokeStyle = '#c09030';
                } else if (cs.lit) {
                    ctx.fillStyle = 'rgba(120,40,200,' + csPulse + ')';
                    ctx.strokeStyle = '#8030c0';
                } else {
                    ctx.fillStyle = 'rgba(80,20,120,' + csPulse + ')';
                    ctx.strokeStyle = '#601080';
                }
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(csx, csy, 6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.font = '7px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(cs.relicTaken ? '✓' : '?', csx, csy + 2);
                ctx.restore();
            }
        }

        var tc = TWB._cabinData[TWB._targetCabin];
        if (tc) {
            var tcmx = smX + tc.cx * ssx, tcmy = smY + tc.cy * ssy;
            var tcPulse = 0.5 + Math.sin(this.fireTime * 0.06) * 0.3;
            ctx.save();
            ctx.strokeStyle = TWB._scenario === 'CURSE' ? 'rgba(120,30,180,' + tcPulse + ')' : 'rgba(200,160,60,' + tcPulse + ')';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(tcmx, tcmy, 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = TWB._scenario === 'CURSE' ? '#a040d0' : '#d4a44a';
            ctx.fillText('★', tcmx, tcmy + 2);
            ctx.restore();
        }
    }

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

    if (this.showPlayerOnMap) {
        var mPad = 24, mBw = 10;
        var pmX = mPad + mBw, pmY = mPad + mBw;
        var pmW = cw - (mPad + mBw) * 2, pmH = ch - (mPad + mBw) * 2;
        var pmsx = pmW / TWB.COLS, pmsy = pmH / TWB.ROWS;
        var ppx = pmX + (this.player.x / TWB.TILE) * pmsx;
        var ppy = pmY + (this.player.y / TWB.TILE) * pmsy;
        var bPulse = 0.5 + Math.sin(this.fireTime * 0.1) * 0.5;
        ctx.save();
        ctx.fillStyle = 'rgba(60,140,255,' + bPulse + ')';
        ctx.beginPath();
        ctx.arc(ppx, ppy, 4 + Math.sin(this.fireTime * 0.1) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4090ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ppx, ppy, 8 + Math.sin(this.fireTime * 0.08) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    this.drawCloseBtn(cw - 28, 10);
};

TWB.Game.prototype._renderMapStatic = function(ctx, cw, ch) {
    var pad = 24, bw = 12;
    var ink = '#3a2a14', inkL = '#7a6a48', inkM = '#5a4630';
    var red = '#8a3020';

    ctx.fillStyle = '#e2d4b0';
    ctx.fillRect(0, 0, cw, ch);
    for (var i = 0; i < 1500; i++) {
        var px = TWB.hash(i, 8000) % cw, py = TWB.hash(8000, i) % ch;
        var ci = i % 6;
        ctx.fillStyle = ci < 2 ? '#d8c89a' : ci < 4 ? '#ecdcb8' : '#cebe90';
        ctx.fillRect(px, py, 1 + i % 2, 1 + (i >> 1) % 2);
    }
    for (var i = 0; i < 10; i++) {
        var stx = TWB.hash(i * 7, 8500) % cw, sty = TWB.hash(8500, i * 7) % ch;
        var str = 20 + TWB.hash(i * 11, 8600) % 60;
        var grad = ctx.createRadialGradient(stx, sty, 0, stx, sty, str);
        grad.addColorStop(0, 'rgba(140,120,80,0.18)');
        grad.addColorStop(1, 'rgba(140,120,80,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(stx - str, sty - str, str * 2, str * 2);
    }

    var ox = pad, oy = pad, ow = cw - pad * 2, oh = ch - pad * 2;
    var ix = pad + bw, iy = pad + bw;
    var iw = cw - (pad + bw) * 2, ih = ch - (pad + bw) * 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, ow, oh);
    ctx.moveTo(ix + iw, iy); ctx.lineTo(ix, iy); ctx.lineTo(ix, iy + ih); ctx.lineTo(ix + iw, iy + ih);
    ctx.closePath();
    ctx.clip('evenodd');
    ctx.fillStyle = '#8a7050';
    ctx.fillRect(ox, oy, ow, oh);
    ctx.strokeStyle = '#6a5030';
    ctx.lineWidth = 0.8;
    for (var d = -ch; d < cw + ch; d += 4) {
        ctx.beginPath(); ctx.moveTo(d, oy); ctx.lineTo(d + oh, oy + oh); ctx.stroke();
    }
    ctx.fillStyle = '#a08a60';
    ctx.globalAlpha = 0.3;
    for (var d = -ch; d < cw + ch; d += 4) {
        ctx.beginPath(); ctx.moveTo(d + 1, oy); ctx.lineTo(d + oh + 1, oy + oh); ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();

    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(ox, oy, ow, oh);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ix, iy, iw, ih);

    var cjS = bw + 2;
    var corners = [[ox - 1, oy - 1], [ox + ow + 1, oy - 1], [ox - 1, oy + oh + 1], [ox + ow + 1, oy + oh + 1]];
    for (var ci2 = 0; ci2 < 4; ci2++) {
        var ccx = corners[ci2][0], ccy = corners[ci2][1];
        var dx2 = ci2 % 2 === 0 ? 1 : -1, dy2 = ci2 < 2 ? 1 : -1;
        ctx.fillStyle = '#7a6040';
        ctx.fillRect(ccx - (dx2 > 0 ? 1 : cjS), ccy - (dy2 > 0 ? 1 : cjS), cjS + 1, cjS + 1);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ccx - (dx2 > 0 ? 1 : cjS), ccy - (dy2 > 0 ? 1 : cjS), cjS + 1, cjS + 1);
        ctx.strokeStyle = '#5a4020';
        ctx.lineWidth = 0.6;
        var jcx2 = ccx + (dx2 > 0 ? cjS / 2 : -cjS / 2);
        var jcy2 = ccy + (dy2 > 0 ? cjS / 2 : -cjS / 2);
        ctx.beginPath(); ctx.moveTo(jcx2 - 3, jcy2 - 3); ctx.lineTo(jcx2 + 3, jcy2 + 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(jcx2 + 3, jcy2 - 3); ctx.lineTo(jcx2 - 3, jcy2 + 3); ctx.stroke();
    }

    var mapX = ix, mapY = iy, mapW = iw, mapH = ih;
    var sx = mapW / TWB.COLS, sy = mapH / TWB.ROWS;

    ctx.fillStyle = inkL;
    ctx.strokeStyle = inkL;
    ctx.lineWidth = 0.5;
    for (var gi = 0; gi < 350; gi++) {
        var gx = mapX + (TWB.hash(gi * 3, 7700) % Math.floor(mapW));
        var gy = mapY + (TWB.hash(7700, gi * 3) % Math.floor(mapH));
        var gs = 1.5 + (TWB.hash(gi * 7, 7701) % 3) * 0.5;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx - gs * 0.5, gy - gs);
        ctx.lineTo(gx + gs * 0.5, gy - gs);
        ctx.closePath();
        ctx.fill();
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function drawRiverSegment(getCenter, startY, endY, width, bankW) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#8a9098';
        for (var side = -1; side <= 1; side += 2) {
            ctx.beginPath();
            ctx.moveTo(mapX + (getCenter(startY) + side * bankW) * sx, mapY + startY * sy);
            for (var ty = startY + 2; ty < endY; ty += 2) {
                var wobble = Math.sin(ty * 0.4 + side * 2) * 0.3;
                ctx.lineTo(mapX + (getCenter(ty) + side * bankW + wobble) * sx, mapY + ty * sy);
            }
            ctx.stroke();
        }

        ctx.lineWidth = 0.4;
        ctx.strokeStyle = 'rgba(120,140,155,0.4)';
        for (var wy = startY + 6; wy < endY - 4; wy += 10) {
            var wcx = getCenter(wy);
            var wx = mapX + wcx * sx;
            var wyy = mapY + wy * sy;
            ctx.beginPath();
            ctx.moveTo(wx - 2, wyy);
            ctx.quadraticCurveTo(wx, wyy - 1, wx + 2, wyy);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawRiverSegment(TWB.getRiverCenter, 0, TWB.ROWS, 3.5, 4);
    var rp = TWB._riverParams;
    if (rp) {
        drawRiverSegment(TWB.getSecondRiver, rp.r2startY, rp.r2endY, 2.5, 3);
    }

    ctx.lineWidth = 0.6;
    ctx.strokeStyle = '#8a9098';
    for (var ti = 0; ti < TWB._tributaries.length; ti++) {
        var t = TWB._tributaries[ti];
        ctx.beginPath();
        ctx.moveTo(mapX + t.rx * sx, mapY + t.ry * sy);
        for (var d = 1; d <= t.length; d++) {
            ctx.lineTo(mapX + (t.rx + t.dir * d) * sx, mapY + (t.ry + Math.sin(d * t.curve) * 4 + d * t.slope) * sy);
        }
        ctx.stroke();
    }

    for (var szi = 0; szi < TWB._snowZones.length; szi++) {
        var sz = TWB._snowZones[szi];
        var szx = mapX + sz.cx * sx;
        var szy = mapY + sz.cy * sy;
        var szrx = sz.rx * sx;
        var szry = sz.ry * sy;
        ctx.beginPath();
        ctx.ellipse(szx, szy, szrx, szry, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,200,215,0.15)';
        ctx.fill();
    }

    for (var li = 0; li < TWB._lakeData.length; li++) {
        var lake = TWB._lakeData[li];
        var lkx = mapX + lake.cx * sx;
        var lky = mapY + lake.cy * sy;
        var lkrx = lake.rx * sx * 1.2;
        var lkry = lake.ry * sy * 1.2;
        ctx.save();
        ctx.translate(lkx, lky);
        ctx.rotate(lake.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, lkrx, lkry, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100,130,160,0.3)';
        ctx.fill();
        ctx.strokeStyle = '#8a9098';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
    }

    function drawPine(x, y, s) {
        var layers = Math.max(3, Math.floor(s * 0.8));
        var trunkH = s * 0.35;
        ctx.strokeStyle = '#4a3518';
        ctx.lineWidth = Math.max(0.8, s * 0.15);
        ctx.beginPath(); ctx.moveTo(x, y + trunkH); ctx.lineTo(x, y); ctx.stroke();

        for (var li = layers - 1; li >= 0; li--) {
            var ly = y - li * s * 0.28;
            var lw = s * 0.2 + (layers - li) * s * 0.22;
            var droop = s * 0.18;
            var col = li % 2 === 0 ? '#3a6830' : '#2d5428';
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(x, ly - s * 0.35);
            ctx.quadraticCurveTo(x - lw * 0.5, ly - droop * 0.3, x - lw, ly + droop);
            ctx.quadraticCurveTo(x - lw * 0.3, ly + droop * 0.5, x, ly);
            ctx.quadraticCurveTo(x + lw * 0.3, ly + droop * 0.5, x + lw, ly + droop);
            ctx.quadraticCurveTo(x + lw * 0.5, ly - droop * 0.3, x, ly - s * 0.35);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#2a4a20';
            ctx.lineWidth = 0.3;
            ctx.stroke();
        }
    }

    function drawDecid(x, y, s, col1, col2) {
        var trunkH = s * 0.55;
        ctx.strokeStyle = '#5a4020';
        ctx.lineWidth = Math.max(0.8, s * 0.12);
        ctx.beginPath(); ctx.moveTo(x, y + trunkH); ctx.lineTo(x, y - s * 0.1); ctx.stroke();

        var r = s * 0.5;
        var lobes = [
            [x - r * 0.4, y - r * 0.6, r * 0.55],
            [x + r * 0.45, y - r * 0.5, r * 0.5],
            [x, y - r * 1.0, r * 0.5],
            [x - r * 0.15, y - r * 0.3, r * 0.6],
            [x + r * 0.1, y - r * 0.7, r * 0.45]
        ];
        ctx.fillStyle = col1;
        for (var li = 0; li < lobes.length; li++) {
            ctx.beginPath();
            ctx.arc(lobes[li][0], lobes[li][1], lobes[li][2], 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = col2;
        ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.8, r * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + r * 0.25, y - r * 0.9, r * 0.3, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = ink;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        var aStep = Math.PI * 2 / 20;
        for (var ai = 0; ai <= 20; ai++) {
            var ang = ai * aStep;
            var maxR = 0;
            for (var li = 0; li < lobes.length; li++) {
                var ldx = x + Math.cos(ang) * r * 1.1 - lobes[li][0];
                var ldy = y - r * 0.55 + Math.sin(ang) * r * 0.9 - lobes[li][1];
                var dist = Math.sqrt(ldx * ldx + ldy * ldy);
                if (dist < lobes[li][2] + 0.5) {
                    var rr = r * 0.85 + Math.sin(ai * 1.7) * r * 0.15;
                    if (rr > maxR) maxR = rr;
                }
            }
            if (maxR === 0) maxR = r * 0.7 + Math.sin(ai * 2.3) * r * 0.1;
            var ox2 = x + Math.cos(ang) * maxR;
            var oy2 = y - r * 0.55 + Math.sin(ang) * maxR * 0.8;
            if (ai === 0) ctx.moveTo(ox2, oy2);
            else ctx.lineTo(ox2, oy2);
        }
        ctx.stroke();
    }

    var pineGreens = ['#3a6830', '#2d5428', '#456e38', '#325a2a', '#4a7840'];
    var decidCols = [
        ['#6a8a40', '#7a9a50'],
        ['#5a7a35', '#6a8a45'],
        ['#8a7a30', '#a09040'],
        ['#7a6a25', '#907a35'],
        ['#9a6a20', '#b08030']
    ];

    var treeStep = 8;
    for (var tty = 10; tty < TWB.ROWS - 10; tty += treeStep) {
        for (var ttx = 10; ttx < TWB.COLS - 10; ttx += treeStep) {
            var h = TWB.hash(ttx, tty) % 100;
            var isBorder = tty <= 8 || tty >= TWB.ROWS - 8 || ttx >= TWB.COLS - 8 || ttx <= 8;
            var isEdge = tty <= 15 || tty >= TWB.ROWS - 15 || ttx >= TWB.COLS - 15 || ttx <= 15;
            var threshold = isBorder ? 70 : (isEdge ? 40 : 22);
            if (h >= threshold) continue;

            var rc1 = TWB.getRiverCenter(tty);
            if (Math.abs(ttx - rc1) < 7) continue;
            var rp0 = TWB._riverParams;
            if (rp0 && tty > rp0.r2startY && tty < rp0.r2endY) {
                if (Math.abs(ttx - TWB.getSecondRiver(tty)) < 7) continue;
            }

            var tmx = mapX + ttx * sx, tmy = mapY + tty * sy;
            var th2 = TWB.hash(ttx * 3, tty * 5);
            var tSize = 3 + (th2 % 25) * 0.12;
            var isPine = th2 % 5 < 3;

            if (isPine) {
                drawPine(tmx, tmy, tSize);
            } else {
                var dci = th2 % 5;
                drawDecid(tmx, tmy, tSize, decidCols[dci][0], decidCols[dci][1]);
            }
        }
    }

    for (var oi = 0; oi < this.objects.length; oi++) {
        var bo = this.objects[oi];
        if (bo.type !== 'boulder') continue;
        var boh = TWB.hash(Math.floor(bo.x) * 13, Math.floor(bo.y) * 17);
        var bx = mapX + (bo.x / TWB.TILE) * sx + ((boh % 21) - 10) * sx;
        var by = mapY + (bo.y / TWB.TILE) * sy + (((boh >>> 8) % 21) - 10) * sy;
        var bSeed = TWB.hash(Math.floor(bo.x), Math.floor(bo.y));
        var nStones = 3 + bSeed % 3;
        var bScale = 1.8;

        for (var si = 0; si < nStones; si++) {
            var sox = bx + (si - nStones / 2) * 4 * bScale + (TWB.hash(si * 7 + Math.floor(bo.x), 5555) % 5 - 2);
            var soy = by + (TWB.hash(si * 11 + Math.floor(bo.y), 5556) % 4 - 1);
            var srw = (3 + TWB.hash(si * 13 + Math.floor(bo.x), 5557) % 4) * bScale;
            var srh = (2.5 + TWB.hash(si * 17 + Math.floor(bo.y), 5558) % 3) * bScale;

            var stoneCol = si % 3 === 0 ? '#6a5a42' : si % 3 === 1 ? '#5a4a38' : '#7a6a50';
            ctx.fillStyle = stoneCol;
            ctx.beginPath();
            ctx.moveTo(sox - srw, soy + srh * 0.2);
            ctx.quadraticCurveTo(sox - srw * 0.8, soy - srh, sox, soy - srh);
            ctx.quadraticCurveTo(sox + srw * 0.8, soy - srh, sox + srw, soy + srh * 0.2);
            ctx.quadraticCurveTo(sox + srw * 0.5, soy + srh * 0.6, sox, soy + srh * 0.5);
            ctx.quadraticCurveTo(sox - srw * 0.5, soy + srh * 0.6, sox - srw, soy + srh * 0.2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = ink;
            ctx.lineWidth = 0.6;
            ctx.stroke();

            ctx.fillStyle = 'rgba(160,150,120,0.35)';
            ctx.beginPath();
            ctx.moveTo(sox - srw * 0.5, soy - srh * 0.7);
            ctx.quadraticCurveTo(sox - srw * 0.2, soy - srh * 0.9, sox + srw * 0.1, soy - srh * 0.6);
            ctx.quadraticCurveTo(sox - srw * 0.1, soy - srh * 0.3, sox - srw * 0.5, soy - srh * 0.4);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(50,40,20,0.3)';
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(sox - srw * 0.3, soy - srh * 0.2);
            ctx.lineTo(sox + srw * 0.1, soy + srh * 0.1);
            ctx.stroke();
            if (si % 2 === 0) {
                ctx.beginPath();
                ctx.moveTo(sox + srw * 0.2, soy - srh * 0.5);
                ctx.lineTo(sox + srw * 0.4, soy - srh * 0.1);
                ctx.stroke();
            }
        }
    }

    for (var cri = 0; cri < this.objects.length; cri++) {
        var crn = this.objects[cri];
        if (crn.type !== 'cairn') continue;
        var crh2 = TWB.hash(Math.floor(crn.x) * 13, Math.floor(crn.y) * 17);
        var crx2 = mapX + (crn.x / TWB.TILE) * sx + ((crh2 % 21) - 10) * sx;
        var cry2 = mapY + (crn.y / TWB.TILE) * sy + (((crh2 >>> 8) % 21) - 10) * sy;
        ctx.fillStyle = '#706050';
        ctx.beginPath(); ctx.ellipse(crx2, cry2 + 1, 2.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#807060';
        ctx.beginPath(); ctx.ellipse(crx2, cry2 - 0.5, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#908070';
        ctx.beginPath(); ctx.ellipse(crx2, cry2 - 1.8, 1.2, 0.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 0.3;
        ctx.beginPath(); ctx.ellipse(crx2, cry2 + 1, 2.5, 1.5, 0, 0, Math.PI * 2); ctx.stroke();
    }

    for (var sri = 0; sri < this.objects.length; sri++) {
        var sro = this.objects[sri];
        if (sro.type !== 'shrine' && sro.type !== 'curse_shrine') continue;
        var srh2 = TWB.hash(Math.floor(sro.x) * 13, Math.floor(sro.y) * 17);
        var srx2 = mapX + (sro.x / TWB.TILE) * sx + ((srh2 % 21) - 10) * sx;
        var sry2 = mapY + (sro.y / TWB.TILE) * sy + (((srh2 >>> 8) % 21) - 10) * sy;
        ctx.fillStyle = '#6a5a40';
        ctx.fillRect(srx2 - 1.5, sry2 - 5, 3, 6);
        ctx.fillRect(srx2 - 3, sry2 - 5, 6, 1.5);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 0.4;
        ctx.strokeRect(srx2 - 1.5, sry2 - 5, 3, 6);
        ctx.fillStyle = '#8a7a58';
        ctx.fillRect(srx2 - 0.5, sry2 - 3.5, 1, 2);
    }

    for (var bmi = 0; bmi < this.objects.length; bmi++) {
        var bmo = this.objects[bmi];
        if (bmo.type !== 'bridge' && bmo.type !== 'broken_bridge' && bmo.type !== 'stepping_stones') continue;
        var bmh = TWB.hash(Math.floor(bmo.x) * 13, Math.floor(bmo.y) * 17);
        var bmx = mapX + (bmo.x / TWB.TILE) * sx + ((bmh % 15) - 7) * sx;
        var bmy = mapY + (bmo.y / TWB.TILE) * sy + (((bmh >>> 8) % 15) - 7) * sy;
        if (bmo.type === 'bridge') {
            ctx.strokeStyle = '#6a5030';
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(bmx - 6, bmy - 2.5); ctx.lineTo(bmx + 6, bmy - 2.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bmx - 6, bmy + 2.5); ctx.lineTo(bmx + 6, bmy + 2.5); ctx.stroke();
            ctx.fillStyle = '#8a7040';
            ctx.strokeStyle = '#5a4020';
            ctx.lineWidth = 0.4;
            for (var pl = 0; pl < 5; pl++) {
                var plx = bmx - 5 + pl * 2.5;
                ctx.fillRect(plx, bmy - 2, 2, 4);
                ctx.strokeRect(plx, bmy - 2, 2, 4);
            }
        } else if (bmo.type === 'broken_bridge') {
            ctx.fillStyle = '#7a5030';
            ctx.fillRect(bmx - 6, bmy - 2, 4, 4);
            ctx.fillRect(bmx + 2, bmy - 2, 4, 4);
            ctx.strokeStyle = red;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(bmx - 6, bmy - 2, 4, 4);
            ctx.strokeRect(bmx + 2, bmy - 2, 4, 4);
        } else {
            ctx.fillStyle = '#7a7060';
            for (var bsi = 0; bsi < 4; bsi++) {
                ctx.beginPath();
                ctx.ellipse(bmx - 3 + bsi * 2.5, bmy, 1.2, 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    for (var ci3 = 0; ci3 < TWB._cabinData.length; ci3++) {
        var c = TWB._cabinData[ci3];
        var ch1 = TWB.hash(ci3 * 37, 7777);
        var coffX = ((ch1 % 31) - 15) * sx;
        var coffY = (((ch1 >>> 8) % 31) - 15) * sy;
        var cx = mapX + c.cx * sx + coffX, cy = mapY + c.cy * sy + coffY;
        var cStyle = ch1 % 3;

        var wallW = 9, wallH = 6;
        var wallCol = cStyle === 0 ? '#8a7050' : cStyle === 1 ? '#7a6545' : '#6a5535';
        ctx.fillStyle = wallCol;
        ctx.fillRect(cx - wallW / 2, cy - 1, wallW, wallH);

        ctx.strokeStyle = 'rgba(60,40,20,0.3)';
        ctx.lineWidth = 0.3;
        for (var wp = 0; wp < 4; wp++) {
            var wpx = cx - wallW / 2 + 1 + wp * 2.2;
            ctx.beginPath(); ctx.moveTo(wpx, cy - 1); ctx.lineTo(wpx, cy + wallH - 1); ctx.stroke();
        }

        ctx.strokeStyle = ink;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cx - wallW / 2, cy - 1, wallW, wallH);

        var roofCol = cStyle === 0 ? '#9a5535' : cStyle === 1 ? '#8a6a3a' : '#7a5530';
        ctx.fillStyle = roofCol;
        ctx.beginPath();
        ctx.moveTo(cx - wallW / 2 - 2, cy - 1);
        ctx.lineTo(cx, cy - 7);
        ctx.lineTo(cx + wallW / 2 + 2, cy - 1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(60,40,20,0.25)';
        ctx.lineWidth = 0.3;
        for (var rl = 0; rl < 3; rl++) {
            var rly = cy - 2 - rl * 1.5;
            var rlw = (wallW / 2 + 2) * (1 - (rl + 1) * 0.25);
            ctx.beginPath(); ctx.moveTo(cx - rlw, rly); ctx.lineTo(cx + rlw, rly); ctx.stroke();
        }

        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(cx - 1, cy + wallH - 4, 2.5, 3);

        if (cStyle !== 2) {
            ctx.fillStyle = '#c8d8e0';
            ctx.fillRect(cx + 2.5, cy, 2, 2);
            ctx.strokeStyle = ink;
            ctx.lineWidth = 0.3;
            ctx.strokeRect(cx + 2.5, cy, 2, 2);
            ctx.beginPath(); ctx.moveTo(cx + 3.5, cy); ctx.lineTo(cx + 3.5, cy + 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + 2.5, cy + 1); ctx.lineTo(cx + 4.5, cy + 1); ctx.stroke();
        }
    }

    var sc = TWB._cabinData[TWB._startCabin];
    var sch = TWB.hash(TWB._startCabin * 37, 7777);
    var scOffX = ((sch % 31) - 15) * sx;
    var scOffY = (((sch >>> 8) % 31) - 15) * sy;
    var scx = mapX + sc.cx * sx + scOffX, scy = mapY + sc.cy * sy + scOffY;
    ctx.save();
    ctx.translate(scx, scy - 16);
    ctx.rotate(-0.04);
    ctx.font = 'italic 8px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = ink;
    ctx.fillText('You are here', 0, 0);
    ctx.restore();

    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(scx, scy - 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8a860';
    ctx.beginPath();
    ctx.arc(scx, scy - 10, 1.5, 0, Math.PI * 2);
    ctx.fill();

    if (TWB._targetCabin >= 0) {
        var tc = TWB._cabinData[TWB._targetCabin];
        var tch = TWB.hash(TWB._targetCabin * 37, 7777);
        var tcOffX = ((tch % 31) - 15) * sx;
        var tcOffY = (((tch >>> 8) % 31) - 15) * sy;
        var tcx = mapX + tc.cx * sx + tcOffX, tcy = mapY + tc.cy * sy + tcOffY;
        ctx.strokeStyle = red;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        var nPts = 32;
        for (var pi = 0; pi <= nPts; pi++) {
            var ang = (pi / nPts) * Math.PI * 2 - 0.3;
            var wobble = Math.sin(pi * 1.7) * 2 + Math.cos(pi * 2.9) * 1.4;
            var rr2 = 12 + wobble;
            var ptx = tcx + Math.cos(ang) * rr2;
            var pty = tcy + Math.sin(ang) * rr2;
            if (pi === 0) ctx.moveTo(ptx, pty);
            else ctx.lineTo(ptx, pty);
        }
        ctx.stroke();
    }

    var crx = mapX + mapW - 42, cry3 = mapY + mapH - 42, crs = 20;
    ctx.fillStyle = 'rgba(226,212,176,0.8)';
    ctx.beginPath(); ctx.arc(crx, cry3, crs + 8, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(crx, cry3, crs + 3, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(crx, cry3, crs + 5, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.arc(crx, cry3, 2, 0, Math.PI * 2); ctx.fill();

    var mainA = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    for (var i = 0; i < 4; i++) {
        var a = mainA[i];
        var len = crs + 1;
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.moveTo(crx + Math.cos(a) * len, cry3 + Math.sin(a) * len);
        ctx.lineTo(crx + Math.cos(a - 0.22) * 3, cry3 + Math.sin(a - 0.22) * 3);
        ctx.lineTo(crx, cry3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = inkL;
        ctx.beginPath();
        ctx.moveTo(crx + Math.cos(a) * len, cry3 + Math.sin(a) * len);
        ctx.lineTo(crx + Math.cos(a + 0.22) * 3, cry3 + Math.sin(a + 0.22) * 3);
        ctx.lineTo(crx, cry3);
        ctx.closePath();
        ctx.fill();
    }
    var secA = [-Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4];
    for (var i = 0; i < 4; i++) {
        var a = secA[i];
        ctx.fillStyle = inkL;
        ctx.beginPath();
        ctx.moveTo(crx + Math.cos(a) * crs * 0.5, cry3 + Math.sin(a) * crs * 0.5);
        ctx.lineTo(crx + Math.cos(a - 0.3) * 2, cry3 + Math.sin(a - 0.3) * 2);
        ctx.lineTo(crx + Math.cos(a + 0.3) * 2, cry3 + Math.sin(a + 0.3) * 2);
        ctx.closePath();
        ctx.fill();
    }

    ctx.font = 'bold 8px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = ink;
    ctx.fillText('N', crx, cry3 - crs - 8);
    ctx.font = '7px Georgia, serif';
    ctx.fillText('S', crx, cry3 + crs + 8);
    ctx.fillText('E', crx + crs + 8, cry3);
    ctx.fillText('W', crx - crs - 8, cry3);
    ctx.textBaseline = 'alphabetic';

    ctx.font = 'bold 10px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = ink;
    ctx.fillText('THE WAY BACK', cw / 2, pad - 4);

    ctx.font = '7px "Press Start 2P", monospace';
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

    this.drawCloseBtn(l.px + l.pw - 20, l.py + 6);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#d4a44a';
    ctx.fillText('BACKPACK', l.px + l.pw / 2, l.py + 10);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#606068';
    var used = 0;
    for (var c = 0; c < this.backpack.length; c++) { if (this.backpack[c]) used++; }
    ctx.fillText(used + '/10 slots', l.px + l.pw / 2, l.py + 28);

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

            ctx.fillStyle = '#8a8a92';
            var label = TWB.ITEM_LABELS[slot.type] || slot.type;
            ctx.save();
            ctx.beginPath();
            ctx.rect(bx + 1, by + 1, l.slotSize - 2, l.slotSize - 2);
            ctx.clip();
            ctx.font = '7px "Press Start 2P", monospace';
            var words = label.split(' ');
            if (words.length > 1) {
                ctx.fillText(words[0], bx + l.slotSize / 2, by + 28);
                ctx.fillText(words.slice(1).join(' '), bx + l.slotSize / 2, by + 38);
            } else {
                ctx.fillText(label, bx + l.slotSize / 2, by + 33);
            }
            ctx.restore();
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
        var btnW = 80;
        var btnH = 20;
        var gapX = 12;
        var gapY = 6;
        var startX = l.px + Math.floor((l.pw - btnW * 2 - gapX) / 2);
        var dName = (this.dogName || 'Dog');
        if (dName.length > 6) dName = dName.substring(0, 5) + '.';
        var btnLabels = { eat: 'Eat', feed: 'Feed ' + dName, drop1: 'Drop 1', dropall: 'Drop All', drink_canteen: 'Drink', dog_drink_canteen: 'Give ' + dName, use_bandage: 'Use' };
        var btnColors = { eat: ['#103a18', '#1a4a24', '#40c060', '#60e080'],
                          feed: ['#18283a', '#203848', '#4090c0', '#60b0e0'],
                          drink_canteen: ['#103a18', '#1a4a24', '#40c060', '#60e080'],
                          dog_drink_canteen: ['#18283a', '#203848', '#4090c0', '#60b0e0'],
                          use_bandage: ['#103a18', '#1a4a24', '#40c060', '#60e080'],
                          drop1: ['#1a1018', '#3a2020', '#a04040', '#e06060'],
                          dropall: ['#1a1018', '#3a2020', '#a04040', '#e06060'] };

        ctx.font = '8px "Press Start 2P", monospace';
        for (var bi = 0; bi < btns.length; bi++) {
            var col = bi % 2;
            var row = Math.floor(bi / 2);
            var bx = startX + col * (btnW + gapX);
            var by = baseY + row * (btnH + gapY);
            var hovered = this.backpackBtnHover === btns[bi];
            var c = btnColors[btns[bi]] || ['#1a2a1a', '#2a3a2a', '#60a060', '#80c080'];
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

    var pw = 380;
    var ph = 200;
    var px = Math.floor((cw - pw) / 2);
    var py = Math.floor((ch - ph) / 2) - 20;

    ctx.fillStyle = '#2a2820';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = '#322e24';
    ctx.fillRect(px + 3, py + 3, pw - 6, ph - 6);

    ctx.strokeStyle = '#1a1810';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, pw, ph);

    ctx.font = '9px "Press Start 2P", monospace';
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

    var victoryTitle = 'YOU MADE IT';
    var victoryMsg = 'You found the way back.';
    if (TWB._scenario === 'RESCUE') {
        victoryTitle = 'HIKER FOUND';
        victoryMsg = 'The flare lit the sky. Rescue is on the way.';
    } else if (TWB._scenario === 'RELAY') {
        victoryTitle = 'SIGNAL SENT';
        victoryMsg = 'The radio crackles to life. Help is coming.';
    } else if (TWB._scenario === 'CURSE') {
        victoryTitle = 'CURSE BROKEN';
        victoryMsg = 'The relics glow and the fog lifts.';
    }
    ctx.fillText(victoryTitle, w / 2, h / 2 - 140);

    ctx.fillStyle = '#c8c8d0';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(victoryMsg, w / 2, h / 2 - 100);

    if (t > 0.6) {
        var statA = Math.min(1, (t - 0.6) / 0.3);
        ctx.globalAlpha = statA;

        ctx.fillStyle = '#a0a0b0';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('Survived ' + dayStr, w / 2, h / 2 - 65);

        ctx.fillStyle = '#8a8a9a';
        ctx.font = '7px "Press Start 2P", monospace';
        var rs = this.runStats;
        var cabCount = Object.keys(rs.cabinsVisited).length;
        var dist = Math.round(rs.distWalked);
        var distStr = dist >= 1000 ? (dist / 1000).toFixed(1) + ' km' : dist + ' m';
        var lCol = w / 2 - 160;
        var rCol = w / 2 + 20;
        var sy = h / 2 - 40;
        var lh = 16;
        ctx.textAlign = 'left';
        ctx.fillText('Cabins visited: ' + cabCount, lCol, sy);
        ctx.fillText('Distance walked: ' + distStr, lCol, sy + lh);
        ctx.fillText('Meals eaten: ' + rs.mealsEaten, lCol, sy + lh * 2);
        ctx.fillText('Items crafted: ' + rs.itemsCrafted, lCol, sy + lh * 3);
        ctx.fillText('Animals hunted: ' + rs.animalsHunted, lCol, sy + lh * 4);
        ctx.fillText('Predator encounters: ' + rs.predators, lCol, sy + lh * 5);
        ctx.fillText('Nights outdoors: ' + rs.nightsOut, lCol, sy + lh * 6);

        ctx.fillText('Shadow attacks: ' + rs.shadowHits, rCol, sy);
        ctx.fillText('Lowest HP: ' + Math.round(rs.lowestHP) + '%', rCol, sy + lh);
        ctx.fillText('Dog fed: ' + rs.dogFed, rCol, sy + lh * 2);
        ctx.fillText('Wood burned: ' + rs.woodBurned, rCol, sy + lh * 3);
        ctx.fillText('Storms weathered: ' + rs.storms, rCol, sy + lh * 4);
        ctx.fillText('Items found: ' + rs.itemsFound, rCol, sy + lh * 5);
        ctx.fillText('Health: ' + Math.round(this.stats.health) + '%', rCol, sy + lh * 6);
        ctx.textAlign = 'center';
    }

    if (t >= 1) {
        ctx.fillStyle = '#6a6a7a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('Press R to play again', w / 2, h / 2 + 90);
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
    ctx.fillText('YOU PERISHED', w / 2, h / 2 - 140);

    ctx.fillStyle = '#c8a0a0';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(this.deathCause, w / 2, h / 2 - 100);

    if (t > 0.6) {
        var statA = Math.min(1, (t - 0.6) / 0.3);
        ctx.globalAlpha = statA;

        ctx.fillStyle = '#9a7a7a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('Survived ' + dayStr, w / 2, h / 2 - 65);

        ctx.fillStyle = '#8a6a6a';
        ctx.font = '7px "Press Start 2P", monospace';
        var rs = this.runStats;
        var cabCount = Object.keys(rs.cabinsVisited).length;
        var dist = Math.round(rs.distWalked);
        var distStr = dist >= 1000 ? (dist / 1000).toFixed(1) + ' km' : dist + ' m';
        var lCol = w / 2 - 160;
        var rCol = w / 2 + 20;
        var sy = h / 2 - 40;
        var lh = 16;
        ctx.textAlign = 'left';
        ctx.fillText('Cabins visited: ' + cabCount, lCol, sy);
        ctx.fillText('Distance walked: ' + distStr, lCol, sy + lh);
        ctx.fillText('Meals eaten: ' + rs.mealsEaten, lCol, sy + lh * 2);
        ctx.fillText('Items crafted: ' + rs.itemsCrafted, lCol, sy + lh * 3);
        ctx.fillText('Animals hunted: ' + rs.animalsHunted, lCol, sy + lh * 4);
        ctx.fillText('Predator encounters: ' + rs.predators, lCol, sy + lh * 5);
        ctx.fillText('Nights outdoors: ' + rs.nightsOut, lCol, sy + lh * 6);

        ctx.fillText('Shadow attacks: ' + rs.shadowHits, rCol, sy);
        ctx.fillText('Lowest HP: ' + Math.round(rs.lowestHP) + '%', rCol, sy + lh);
        ctx.fillText('Dog fed: ' + rs.dogFed, rCol, sy + lh * 2);
        ctx.fillText('Wood burned: ' + rs.woodBurned, rCol, sy + lh * 3);
        ctx.fillText('Storms weathered: ' + rs.storms, rCol, sy + lh * 4);
        ctx.fillText('Items found: ' + rs.itemsFound, rCol, sy + lh * 5);
        ctx.textAlign = 'center';
    }

    if (t >= 1) {
        ctx.fillStyle = '#6a4a4a';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('Press R to try again', w / 2, h / 2 + 90);
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
    if (this.dogStolen) {
        if (faceD) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            var fdH2 = Math.floor(faceD.height * (60 / faceD.width));
            ctx.drawImage(faceD, 506, hudY + 10, 60, fdH2);
            ctx.restore();
        }
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#a03030';
        ctx.fillText(this.dogName || 'WOLF', 572, hudY + 5);
        ctx.fillStyle = '#802020';
        ctx.fillText('MISSING', 572, hudY + 22);
        if (this.questRevealed) {
            ctx.fillStyle = '#c08820';
            ctx.fillText('TRACKED', 572, hudY + 36);
        } else {
            ctx.fillStyle = '#606068';
            ctx.fillText('Shrines: ' + this.questShrinesLit + '/3', 572, hudY + 36);
        }
        var qTimeLeft = Math.max(0, this.questTimerMax - this.questTimer);
        var qHours = Math.floor(qTimeLeft / 3600);
        var qMins = Math.floor((qTimeLeft % 3600) / 60);
        ctx.fillStyle = qHours < 12 ? '#a03030' : '#c08820';
        ctx.fillText(qHours + 'h ' + qMins + 'm left', 572, hudY + 50);
    } else {
        if (faceD) {
            var fdH = Math.floor(faceD.height * (60 / faceD.width));
            ctx.drawImage(faceD, 506, hudY + 10, 60, fdH);
        }
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#d4a44a';
        var wx = 572;
        ctx.fillText(this.dogName || 'WOLF', wx, hudY + 5);
        this.drawBar(ctx, wx, hudY + 17, 60, 6, ws.health, '#4a1010', '#b83030');
        this.drawBar(ctx, wx, hudY + 27, 60, 6, ws.energy, '#0a3a18', '#20a040');
        this.drawBar(ctx, wx, hudY + 37, 60, 6, ws.hunger, '#3a2a08', '#c08820');
        this.drawBar(ctx, wx, hudY + 47, 60, 6, ws.thirst, '#0a2a3a', '#2080c0');
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('HP', wx + 63, hudY + 17);
        ctx.fillText('EN', wx + 63, hudY + 27);
        ctx.fillText('HU', wx + 63, hudY + 37);
        ctx.fillText('TH', wx + 63, hudY + 47);

        var moodColor = ws.mood === 'Happy' ? '#50c050' : ws.mood === 'Loyal' ? '#60a060' : ws.mood === 'Hungry' ? '#c08820' : ws.mood === 'Tired' ? '#a0a040' : '#a04040';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = moodColor;
        ctx.fillText(ws.mood, wx, hudY + 60);
    }

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
