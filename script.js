// Game Constants
const PLAYER_SPEED = 5;
const ENEMY_SPAWN_RATE = 60;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

// Game Variables
let canvas, ctx;
let player = { x: 100, y: 250, size: 30, speed: PLAYER_SPEED };
let enemies = [];
let score = 0;
let lives = 3;
let gameRunning = true;
let animationId;
let keys = {};

// Initialize Game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Event Listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('quitBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Start game loop
    gameLoop();
}

// Main Game Loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Update game state
    updatePlayer();
    updateEnemies();
    checkCollisions();
    
    // Draw everything
    drawPlayer();
    drawEnemies();
    drawScore();
    
    // Continue animation
    animationId = requestAnimationFrame(gameLoop);
}

// Player Controls
function handleKeyDown(e) {
    keys[e.key] = true;
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

function updatePlayer() {
    if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
    
    // Boundary checks
    player.x = Math.max(0, Math.min(GAME_WIDTH - player.size, player.x));
    player.y = Math.max(0, Math.min(GAME_HEIGHT - player.size, player.y));
}

// Enemy Logic
function spawnEnemy() {
    const size = Math.random() * 30 + 20;
    const speed = Math.random() * 3 + 1;
    const y = Math.random() * (GAME_HEIGHT - size);
    
    enemies.push({
        x: GAME_WIDTH,
        y: y,
        size: size,
        speed: speed,
        direction: Math.random() > 0.5 ? 1 : -1 // Random direction
    });
}

function updateEnemies() {
    // Spawn new enemies
    if (Math.random() * ENEMY_SPAWN_RATE < 1) {
        spawnEnemy();
    }
    
    // Move enemies
    enemies.forEach(enemy => {
        enemy.x -= enemy.speed;
        enemy.y += Math.sin(enemy.x * 0.05) * enemy.direction;
    });
    
    // Remove off-screen enemies
    enemies = enemies.filter(enemy => enemy.x + enemy.size > 0);
}

// Collision Detection
function checkCollisions() {
    enemies.forEach((enemy, index) => {
        const distance = Math.sqrt(
            Math.pow(player.x - enemy.x, 2) + 
            Math.pow(player.y - enemy.y, 2)
        );
        
        if (distance < (player.size + enemy.size) / 2) {
            if (player.size > enemy.size) {
                // Player eats enemy
                score += Math.floor(enemy.size);
                player.size += 2;
                enemies.splice(index, 1);
                updateScore();
            } else {
                // Player gets eaten
                lives--;
                document.getElementById('lives').textContent = lives;
                enemies.splice(index, 1);
                
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    });
}

// Drawing Functions
function drawPlayer() {
    ctx.fillStyle = '#4facfe';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
        player.x + player.size / 4, 
        player.y - player.size / 6, 
        player.size / 8, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.size > player.size ? '#ff4d4d' : '#2ecc71';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawScore() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 150, 50);
    ctx.fillStyle = 'white';
    ctx.font = '20px Poppins';
    ctx.fillText(`Score: ${score}`, 20, 35);
    ctx.fillText(`Size: ${Math.floor(player.size)}`, 20, 60);
}

// Game State Functions
function updateScore() {
    score = Math.max(0, score);
    document.getElementById('score').textContent = score;
}

function togglePause() {
    gameRunning = !gameRunning;
    document.getElementById('pauseModal').classList.toggle('hidden');
    
    if (gameRunning) {
        gameLoop();
    } else {
        cancelAnimationFrame(animationId);
    }
}

function gameOver() {
    cancelAnimationFrame(animationId);
    window.location.href = `gameover.html?score=${score}`;
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);