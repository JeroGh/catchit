document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('startScreen');
    const gameContainer = document.getElementById('gameContainer');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const finalScoreDisplay = document.getElementById('finalScore');
    const finalHighScoreDisplay = document.getElementById('finalHighScore');
    const leaderboardList = document.getElementById('leaderboardList');
    const dot = document.getElementById('dot');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const highScoreDisplay = document.getElementById('highScore');
    const backgroundCanvas = document.getElementById('backgroundCanvas');
    const ctxBackground = backgroundCanvas.getContext('2d');

    let score = 0;
    let time = 30;
    let gameActive = false;
    let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let timerId = null;

    highScoreDisplay.textContent = `High Score: ${highScore}`;

    function resizeCanvas() {
        backgroundCanvas.width = window.innerWidth;
        backgroundCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawDynamicBackground() {
        ctxBackground.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        const stars = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * backgroundCanvas.width,
                y: Math.random() * backgroundCanvas.height,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2
            });
        }

        function animateStars() {
            ctxBackground.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > backgroundCanvas.height) star.y = -star.radius;
                ctxBackground.beginPath();
                ctxBackground.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctxBackground.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
                ctxBackground.fill();
            });
            requestAnimationFrame(animateStars);
        }

        animateStars();
    }

    drawDynamicBackground();

    function moveDot() {
        if (!gameActive) return;

        const maxX = gameContainer.clientWidth - dot.clientWidth;
        const maxY = gameContainer.clientHeight - dot.clientHeight;
        const uiHeight = 100;
        const buffer = Math.max(50, window.innerHeight * 0.1);

        const newX = Math.floor(Math.random() * maxX);
        const newY = Math.floor(Math.random() * (maxY - uiHeight - buffer)) + uiHeight + buffer;

        dot.style.left = newX + 'px';
        dot.style.top = newY + 'px';
        dot.style.display = 'block';
        dot.style.opacity = '0';
        setTimeout(() => { dot.style.opacity = '1'; }, 10);
    }

    function updateTimer() {
        if (!gameActive) return;
        time--;
        timeDisplay.textContent = `Time: ${time}`;

        if (time <= 0) {
            gameActive = false;
            endGame();
        }
    }

    function updateLeaderboard() {
        leaderboardList.innerHTML = '';
        leaderboard.sort((a, b) => b - a).slice(0, 5).forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${index + 1}</td><td>${score}</td>`;
            leaderboardList.appendChild(row);
        });
    }

    function startGame() {
        if (timerId !== null) {
            clearInterval(timerId);
        }

        score = 0;
        time = 30;
        gameActive = true;
        scoreDisplay.textContent = `Score: ${score}`;
        timeDisplay.textContent = `Time: ${time}`;
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        gameOverScreen.style.display = 'none';
        moveDot();
        timerId = setInterval(updateTimer, 1000);
    }

    function endGame() {
        clearInterval(timerId);
        timerId = null;
        leaderboard.push(score);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        updateLeaderboard();
        finalScoreDisplay.textContent = score;
        finalHighScoreDisplay.textContent = highScore > score ? highScore : score;
        highScore = Math.max(highScore, score);
        highScoreDisplay.textContent = `High Score: ${highScore}`;
        localStorage.setItem('highScore', highScore);
        gameContainer.style.display = 'none';
        gameOverScreen.style.display = 'flex';
        dot.style.display = 'none';
    }

    dot.addEventListener('click', () => {
        if (!gameActive) return;
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        moveDot();
    });

    dot.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameActive) return;
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        moveDot();
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});