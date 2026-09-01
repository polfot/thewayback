document.addEventListener('DOMContentLoaded', function() {
    var playerInput = document.getElementById('player-name');
    var dogInput = document.getElementById('dog-name');
    var startBtn = document.getElementById('start-btn');
    var errorMsg = document.getElementById('name-error');
    var startScreen = document.getElementById('start-screen');
    var gameWrapper = document.getElementById('game-wrapper');

    function sanitize(val) {
        return val.replace(/[^a-zA-Z]/g, '');
    }

    function formatName(val) {
        val = sanitize(val);
        if (!val) return '';
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }

    playerInput.addEventListener('input', function() {
        this.value = sanitize(this.value);
        errorMsg.textContent = '';
    });

    dogInput.addEventListener('input', function() {
        this.value = sanitize(this.value);
        errorMsg.textContent = '';
    });

    var selectedDifficulty = 1;
    var diffDescs = ['Mild temperatures, more loot, shadows appear late', 'Balanced survival experience', 'Scarce resources, brutal cold, no mercy'];
    var diffBtns = document.querySelectorAll('.diff-btn');
    var diffDesc = document.getElementById('diff-desc');
    for (var di = 0; di < diffBtns.length; di++) {
        diffBtns[di].addEventListener('click', function() {
            for (var j = 0; j < diffBtns.length; j++) diffBtns[j].classList.remove('selected');
            this.classList.add('selected');
            selectedDifficulty = parseInt(this.getAttribute('data-diff'));
            diffDesc.textContent = diffDescs[selectedDifficulty];
        });
    }

    function startGame() {
        var pName = formatName(playerInput.value);
        var dName = formatName(dogInput.value);

        if (!pName || pName.length < 2) {
            errorMsg.textContent = 'Enter a name (2+ letters)';
            playerInput.focus();
            return;
        }
        if (!dName || dName.length < 2) {
            errorMsg.textContent = 'Enter dog name (2+ letters)';
            dogInput.focus();
            return;
        }

        TWB.Audio.init();
        TWB.Audio.resume();

        startScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';

        var canvas = document.getElementById('game-canvas');
        var baseH = 520;
        var ratio = window.innerWidth / window.innerHeight;
        canvas.height = baseH;
        canvas.width = Math.round(baseH * ratio);
        var lctx = canvas.getContext('2d');
        lctx.imageSmoothingEnabled = false;
        lctx.fillStyle = '#000';
        lctx.fillRect(0, 0, canvas.width, canvas.height);
        lctx.font = "12px 'Press Start 2P', monospace";
        lctx.fillStyle = '#d4a44a';
        lctx.textAlign = 'center';
        lctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);

        TWB.loadResources(function() {
            TWB.initSprites();

            if (selectedDifficulty === 2) {
                TWB.COLS = 750;
                TWB.ROWS = 750;
                TWB.CABIN_COUNT = 32;
            } else {
                TWB.COLS = 500;
                TWB.ROWS = 500;
                TWB.CABIN_COUNT = 24;
            }
            TWB.WORLD_W = TWB.COLS * TWB.TILE;
            TWB.WORLD_H = TWB.ROWS * TWB.TILE;

            lctx.fillStyle = '#000';
            lctx.fillRect(0, 0, canvas.width, canvas.height);
            lctx.fillStyle = '#d4a44a';
            lctx.fillText('Generating world...', canvas.width / 2, canvas.height / 2);

            setTimeout(function() {
                var game = new TWB.Game(canvas);
                game.playerName = pName;
                game.dogName = dName;
                game.difficulty = selectedDifficulty;
                window._game = game;

                window.addEventListener('resize', function() {
                    var r = window.innerWidth / window.innerHeight;
                    canvas.width = Math.round(baseH * r);
                    canvas.height = baseH;
                    game.ctx.imageSmoothingEnabled = false;
                    game.camera.vw = canvas.width;
                    game.camera.vh = canvas.height;
                });

                function loop() {
                    game.update();
                    game.render();
                    requestAnimationFrame(loop);
                }

                requestAnimationFrame(loop);
            }, 50);
        });
    }

    startBtn.addEventListener('click', startGame);

    dogInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') startGame();
    });
    playerInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') dogInput.focus();
    });

    // === Title screen walking animation ===
    (function() {
        var ac = document.getElementById('title-anim');
        var actx = ac.getContext('2d');

        function goldify(src) {
            var c = document.createElement('canvas');
            c.width = src.width; c.height = src.height;
            var ctx = c.getContext('2d');
            ctx.drawImage(src, 0, 0);
            var id = ctx.getImageData(0, 0, c.width, c.height);
            var d = id.data;
            for (var i = 0; i < d.length; i += 4) {
                if (d[i+3] > 0) {
                    var br = (d[i] + d[i+1] + d[i+2]) / 3 / 255;
                    d[i]   = Math.min(255, Math.floor(160 + br * 52));
                    d[i+1] = Math.min(255, Math.floor(120 + br * 44));
                    d[i+2] = Math.min(255, Math.floor(40 + br * 34));
                }
            }
            ctx.putImageData(id, 0, 0);
            return c;
        }

        var charR = [], wolfR = [], charL = [], wolfL = [];
        for (var si = 0; si < 3; si++) {
            var cl = goldify(makeCharSprite(2, si));
            charL.push(cl);
            charR.push(flipH(cl));
            var wl = goldify(makeWolfSprite(2, si));
            wolfL.push(wl);
            wolfR.push(flipH(wl));
        }

        var screenW = 500;
        ac.width = screenW;
        ac.height = 60;
        var pxPos = -60, wx = -110, speed = 0.5;
        var frame = 0, tick = 0;
        var state = 'walk', petTimer = 0, petCooldown = 300 + Math.floor(Math.random() * 200);
        var tailFrame = 0, heartAlpha = 0;
        var animId = null;
        var charY = 14, wolfY = 30;
        var groundY = 46;

        function animLoop() {
            actx.clearRect(0, 0, ac.width, ac.height);
            // grass ground
            actx.fillStyle = '#4a4a38';
            actx.fillRect(0, groundY, ac.width, 14);
            actx.fillStyle = '#464632';
            actx.fillRect(0, groundY, ac.width, 3);
            actx.fillStyle = '#3a3a2c';
            for (var gi = 0; gi < ac.width; gi += 5) {
                actx.fillRect(gi, groundY + 4 + (gi % 3), 2, 1);
                actx.fillRect(gi + 2, groundY + 8, 1, 1);
            }
            actx.fillStyle = '#52523e';
            for (var gi2 = 0; gi2 < ac.width; gi2 += 11) {
                actx.fillRect(gi2 + 1, groundY + 2, 1, 2);
            }
            tick++;

            if (state === 'walk') {
                if (tick % 10 === 0) frame = (frame + 1) % 3;
                pxPos += speed;
                if (wx < pxPos - 40) wx += speed;

                petCooldown--;
                if (petCooldown <= 0 && pxPos > 60 && pxPos < screenW - 80) {
                    state = 'approach';
                    petTimer = 0;
                }

                if (pxPos > screenW + 40) { pxPos = -60; wx = -110; }

                actx.drawImage(charR[frame], Math.floor(pxPos), charY);
                actx.drawImage(wolfR[frame], Math.floor(wx), wolfY);
            } else if (state === 'approach') {
                if (wx < pxPos - 20) {
                    wx += speed * 1.2;
                    if (tick % 8 === 0) frame = (frame + 1) % 3;
                    actx.drawImage(charL[0], Math.floor(pxPos), charY);
                    actx.drawImage(wolfR[frame], Math.floor(wx), wolfY);
                } else {
                    state = 'pet';
                    petTimer = 0;
                    heartAlpha = 0;
                }
            } else if (state === 'pet') {
                petTimer++;
                if (tick % 6 === 0) tailFrame = (tailFrame + 1) % 3;
                heartAlpha = Math.min(1, petTimer / 30);

                actx.drawImage(charL[0], Math.floor(pxPos), charY);
                actx.drawImage(wolfL[tailFrame], Math.floor(wx), wolfY);

                if (heartAlpha > 0) {
                    actx.globalAlpha = heartAlpha * (0.6 + 0.4 * Math.sin(tick * 0.15));
                    actx.fillStyle = '#d44';
                    var hx = Math.floor(wx + 14);
                    var hy = 22 - Math.floor(petTimer * 0.04);
                    actx.fillRect(hx - 2, hy, 2, 2);
                    actx.fillRect(hx + 2, hy, 2, 2);
                    actx.fillRect(hx - 3, hy + 1, 2, 2);
                    actx.fillRect(hx + 3, hy + 1, 2, 2);
                    actx.fillRect(hx - 2, hy + 2, 6, 2);
                    actx.fillRect(hx - 1, hy + 4, 4, 1);
                    actx.fillRect(hx, hy + 5, 2, 1);
                    actx.globalAlpha = 1;
                }

                if (petTimer > 120) {
                    state = 'walk';
                    petCooldown = 300 + Math.floor(Math.random() * 200);
                    frame = 0;
                }
            }

            animId = requestAnimationFrame(animLoop);
        }
        animId = requestAnimationFrame(animLoop);

        startBtn.addEventListener('click', function() {
            if (animId) cancelAnimationFrame(animId);
        });
    })();

    var tutSlides = [
        {
            title: 'SURVIVAL BASICS',
            body: 'You are lost in the wilderness with your dog. Your goal is to survive and find your way back.\n\nWatch your stats: HP, Energy, Hunger, and Thirst. If HP reaches zero, you die.\n\nClick on the ground to move. Click on objects to interact with them.'
        },
        {
            title: 'GATHERING & CRAFTING',
            body: 'Click on trees, rocks, and bushes to gather Wood, Stone, Sticks, and Berries.\n\nPress [C] to open the Crafting menu. Combine materials to make useful items like Traps, Rope, Knives, and Torches.\n\nPress [TAB] to open your Backpack.'
        },
        {
            title: 'FIRE & SHELTER',
            body: 'Fire is essential. Find a cabin and light the fireplace with Wood. Campfires outside also provide warmth.\n\nStay near fire to warm up. Cook raw meat on the fire before eating it.\n\nShelter protects you from rain, snow, and the cold of night.'
        },
        {
            title: 'YOUR DOG',
            body: 'Your dog is your companion. Feed it meat to keep it healthy and loyal.\n\nThe dog senses danger before you do. If it refuses to move forward, trust it.\n\nKeep your dog fed and rested. A neglected dog may run away.'
        },
        {
            title: 'NIGHT & SHADOWS',
            body: 'When darkness falls, shadows emerge. They are drawn to you.\n\nStay near fire to keep shadows at bay. Torches provide a mobile light source.\n\nIf shadows surround you and there is no light nearby, run.'
        },
        {
            title: 'THE MAP & NAVIGATION',
            body: 'Press [M] to open the map. It shows cabins, rivers, and landmarks.\n\nExplore cabins to find supplies: canned food, lighters, and other useful items.\n\nRivers block your path but can be crossed at bridges or shallow points.'
        },
        {
            title: 'WEATHER & TERRAIN',
            body: 'Rain and snow make you colder and drain your health. Seek shelter when weather turns.\n\nSome areas are covered in snow. Snow zones are colder but may hide rare herbs near frozen lakes.\n\nWind chill makes cold nights even more dangerous.'
        },
        {
            title: 'YOUR QUEST',
            body: 'Each game gives you a different quest to complete:\n\nRESCUE - Search cabins for clues about a missing hiker. Find all 3 clues, then reach the target cabin.\n\nRELAY - Collect 3 radio parts (Battery, Antenna, Fuse) from different cabins. Bring them to the relay station.\n\nCURSE - Find 3 ancient shrines in the forest. Light each one and collect the Holy Relic inside. Bring all 3 relics to the cursed cabin.\n\nCheck your objective at the top-left of the screen. Press [M] for the map - quest markers show your progress.'
        },
        {
            title: 'TIPS',
            body: 'If you collapse, your dog will drag you to the nearest cabin once.\n\nTalk to the Elder if you meet one. Their stories may hold useful clues.\n\nThe 3-Leaf Herb grows near lakes. Burn it in a fire for special effects.\n\nFill canteens at rivers to carry water with you.\n\nGood luck finding your way back.'
        }
    ];

    var tutPage = 0;
    var tutOverlay = document.getElementById('tutorial-overlay');
    var tutTitle = document.getElementById('tutorial-title');
    var tutBody = document.getElementById('tutorial-body');
    var tutPageEl = document.getElementById('tut-page');
    var tutPrev = document.getElementById('tut-prev');
    var tutNext = document.getElementById('tut-next');
    var tutClose = document.getElementById('tut-close');
    var tutBtn = document.getElementById('tutorial-btn');

    function showTutSlide() {
        var s = tutSlides[tutPage];
        tutTitle.textContent = s.title;
        tutBody.innerHTML = s.body.replace(/\n/g, '<br>');
        tutPageEl.textContent = (tutPage + 1) + ' / ' + tutSlides.length;
        tutPrev.style.visibility = tutPage > 0 ? 'visible' : 'hidden';
        tutNext.textContent = tutPage < tutSlides.length - 1 ? 'NEXT' : 'DONE';
    }

    tutBtn.addEventListener('click', function() {
        startScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';

        TWB.loadResources(function() {
            TWB.initSprites();

            TWB.COLS = 30;
            TWB.ROWS = 28;
            TWB.WORLD_W = TWB.COLS * TWB.TILE;
            TWB.WORLD_H = TWB.ROWS * TWB.TILE;

            var canvas = document.getElementById('game-canvas');
            var baseH = 520;
            var ratio = window.innerWidth / window.innerHeight;
            canvas.height = baseH;
            canvas.width = Math.round(baseH * ratio);

            var savedGenerate = TWB.generateObjects;
            TWB.generateObjects = TWB.generateTutorialObjects;
            var game = new TWB.Game(canvas);
            TWB.generateObjects = savedGenerate;
            game.playerName = 'Player';
            game.dogName = 'Dog';
            game.difficulty = 0;
            game.initTutorial();
            window._game = game;

            window.addEventListener('resize', function() {
                var r = window.innerWidth / window.innerHeight;
                canvas.width = Math.round(baseH * r);
                canvas.height = baseH;
                game.ctx.imageSmoothingEnabled = false;
                game.camera.vw = canvas.width;
                game.camera.vh = canvas.height;
            });

            function loop() {
                game.update();
                game.render();
                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
        });
    });

    tutPrev.addEventListener('click', function() {
        if (tutPage > 0) { tutPage--; showTutSlide(); }
    });

    tutNext.addEventListener('click', function() {
        if (tutPage < tutSlides.length - 1) { tutPage++; showTutSlide(); }
        else { tutOverlay.style.display = 'none'; }
    });

    tutClose.addEventListener('click', function() {
        tutOverlay.style.display = 'none';
    });
});
