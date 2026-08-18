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
});
