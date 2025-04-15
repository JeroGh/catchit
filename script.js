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
    const trailCanvas = document.getElementById('trailCanvas');
    const ctxBackground = backgroundCanvas.getContext('2d');
    const ctxTrail = trailCanvas.getContext('2d');

    let score = 0;
    let time = 30;
    let gameActive = false;
    let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let timerId = null;
    let particles = [];

    highScoreDisplay.textContent = `High Score: ${highScore}`;

    function resizeCanvases() {
        backgroundCanvas.width = window.innerWidth;
        backgroundCanvas.height = window.innerHeight;
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    function drawCosmicBackground() {
        ctxBackground.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        const gradient = ctxBackground.createRadialGradient(
            backgroundCanvas.width / 2, backgroundCanvas.height / 2, 0,
            backgroundCanvas.width / 2, backgroundCanvas.height / 2, backgroundCanvas.width
        );
        gradient.addColorStop(0, 'rgba(44, 83, 100, 0.8)');
        gradient.addColorStop(0.5, 'rgba(52, 152, 219, 0.5)');
        gradient.addColorStop(1, 'rgba(231, 76, 60, 0.2)');
        ctxBackground.fillStyle = gradient;
        ctxBackground.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

        const stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * backgroundCanvas.width,
                y: Math.random() * backgroundCanvas.height,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.7 + 0.3,
                hue: Math.random() * 360
            });
        }

        function animateNebula() {
            ctxBackground.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            ctxBackground.fillStyle = gradient;
            ctxBackground.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > backgroundCanvas.height) star.y = -star.radius;
                ctxBackground.beginPath();
                ctxBackground.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctxBackground.fillStyle = `hsla(${star.hue}, 70%, 80%, ${Math.random() * 0.7 + 0.3})`;
                ctxBackground.fill();
            });
            requestAnimationFrame(animateNebula);
        }

        animateNebula();
    }

    drawCosmicBackground();

    function createParticle(x, y) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: Math.random() * 3 + 1,
            alpha: 1,
            hue: Math.random() * 60 + 340
        };
    }

    function drawTrail() {
        ctxTrail.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        const dotRect = dot.getBoundingClientRect();
        const dotX = dotRect.left + dotRect.width / 2;
        const dotY = dotRect.top + dotRect.height / 2;

        if (gameActive) {
            particles.push(createParticle(dotX, dotY));
        }

        particles = particles.filter(p => p.alpha > 0);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
            ctxTrail.beginPath();
            ctxTrail.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctxTrail.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
            ctxTrail.fill();
        });

        requestAnimationFrame(drawTrail);
    }

    drawTrail();

    function moveDot() {
        if (!gameActive) return;

        const dotWidth = parseFloat(getComputedStyle(dot).width);
        const dotHeight = parseFloat(getComputedStyle(dot).height);
        const maxX = gameContainer.clientWidth - dotWidth;
        const maxY = gameContainer.clientHeight - dotHeight;
        const uiHeight = 100;
        const buffer = Math.max(50, window.innerHeight * 0.1);
        const edgePadding = 10;

        const newX = Math.floor(Math.random() * (maxX - edgePadding * 2)) + edgePadding;
        const newY = Math.floor(Math.random() * (maxY - uiHeight - buffer - edgePadding)) + uiHeight + buffer;

        dot.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        dot.style.top = Math.max(uiHeight + buffer, Math.min(newY, maxY)) + 'px';
        dot.style.display = 'block';
        dot.style.opacity = '0';
        dot.classList.add('orbiting');
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
        particles = [];
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
        dot.classList.remove('orbiting');
        particles = [];
    }

    dot.addEventListener('click', () => {
        if (!gameActive) return;
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        dot.classList.remove('orbiting');
        moveDot();
    });

    dot.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameActive) return;
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        dot.classList.remove('orbiting');
        moveDot();
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});