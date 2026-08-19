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

        startScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';

        TWB.loadResources(function() {
            TWB.initSprites();

            var canvas = document.getElementById('game-canvas');
            var game = new TWB.Game(canvas);
            game.playerName = pName;
            game.dogName = dName;
            game.difficulty = selectedDifficulty;
            window._game = game;

            function loop() {
                game.update();
                game.render();
                requestAnimationFrame(loop);
            }

            requestAnimationFrame(loop);
        });
    }

    startBtn.addEventListener('click', startGame);

    dogInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') startGame();
    });
    playerInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') dogInput.focus();
    });

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
            title: 'TIPS',
            body: 'Talk to the Elder if you meet one. Their stories may hold useful clues.\n\nThe 3-Leaf Herb grows near lakes. Burn it in a fire for special effects.\n\nFill canteens at rivers to carry water with you.\n\nGood luck finding your way back.'
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
        tutPage = 0;
        showTutSlide();
        tutOverlay.style.display = 'flex';
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
