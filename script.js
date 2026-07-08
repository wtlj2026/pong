class Pong {
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Game dimensions
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        
        // Paddle properties
        this.paddleWidth = 10;
        this.paddleHeight = 80;
        this.paddleSpeed = 6;
        
        // Left paddle (Player 1)
        this.player1 = {
            x: 20,
            y: this.canvasHeight / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            score: 0,
            dy: 0
        };
        
        // Right paddle (Player 2)
        this.player2 = {
            x: this.canvasWidth - 30,
            y: this.canvasHeight / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            score: 0,
            dy: 0
        };
        
        // Ball properties
        this.ball = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            radius: 8,
            dx: 5,
            dy: 5,
            speed: 5
        };
        
        // Keyboard input tracking
        this.keys = {};
        
        this.setupEventListeners();
        this.updateScoreDisplay();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyShareLink());
    }
    
    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            document.getElementById('start-btn').textContent = '⏹️ Stop';
            this.gameLoop();
        } else {
            this.stop();
        }
    }
    
    stop() {
        this.gameRunning = false;
        document.getElementById('start-btn').textContent = '▶️ Start Game';
        this.draw();
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            document.getElementById('pause-btn').textContent = this.gamePaused ? '▶️ Resume' : '⏸️ Pause';
            if (!this.gamePaused) {
                this.gameLoop();
            }
        }
    }
    
    reset() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.player1.score = 0;
        this.player2.score = 0;
        this.resetBall();
        this.resetPaddles();
        this.updateScoreDisplay();
        document.getElementById('start-btn').textContent = '▶️ Start Game';
        document.getElementById('pause-btn').textContent = '⏸️ Pause';
        document.getElementById('game-status').textContent = 'Ready to Play!';
        this.draw();
    }
    
    resetBall() {
        this.ball.x = this.canvasWidth / 2;
        this.ball.y = this.canvasHeight / 2;
        this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * this.ball.speed;
        this.ball.dy = (Math.random() - 0.5) * this.ball.speed;
    }
    
    resetPaddles() {
        this.player1.y = this.canvasHeight / 2 - this.paddleHeight / 2;
        this.player2.y = this.canvasHeight / 2 - this.paddleHeight / 2;
        this.player1.dy = 0;
        this.player2.dy = 0;
    }
    
    handleInput() {
        // Player 1 controls (W/S keys)
        if (this.keys['w'] && this.player1.y > 0) {
            this.player1.y -= this.paddleSpeed;
        }
        if (this.keys['s'] && this.player1.y < this.canvasHeight - this.paddleHeight) {
            this.player1.y += this.paddleSpeed;
        }
        
        // Player 2 controls (P/L keys)
        if (this.keys['p'] && this.player2.y > 0) {
            this.player2.y -= this.paddleSpeed;
        }
        if (this.keys['l'] && this.player2.y < this.canvasHeight - this.paddleHeight) {
            this.player2.y += this.paddleSpeed;
        }
    }
    
    update() {
        if (this.gamePaused) return;
        
        this.handleInput();
        
        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with top and bottom
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvasHeight) {
            this.ball.dy = -this.ball.dy;
            this.ball.y = Math.max(this.ball.radius, Math.min(this.canvasHeight - this.ball.radius, this.ball.y));
        }
        
        // Ball collision with paddles
        if (this.ballPaddleCollision(this.player1)) {
            this.ball.dx = Math.abs(this.ball.dx);
            this.ball.x = this.player1.x + this.player1.width + this.ball.radius;
            this.ball.dy += (this.ball.y - (this.player1.y + this.player1.height / 2)) * 0.05;
        }
        
        if (this.ballPaddleCollision(this.player2)) {
            this.ball.dx = -Math.abs(this.ball.dx);
            this.ball.x = this.player2.x - this.ball.radius;
            this.ball.dy += (this.ball.y - (this.player2.y + this.player2.height / 2)) * 0.05;
        }
        
        // Score points
        if (this.ball.x - this.ball.radius < 0) {
            this.player2.score++;
            this.updateScoreDisplay();
            this.checkWinner();
            this.resetBall();
        }
        
        if (this.ball.x + this.ball.radius > this.canvasWidth) {
            this.player1.score++;
            this.updateScoreDisplay();
            this.checkWinner();
            this.resetBall();
        }
    }
    
    ballPaddleCollision(paddle) {
        return this.ball.x - this.ball.radius < paddle.x + paddle.width &&
               this.ball.x + this.ball.radius > paddle.x &&
               this.ball.y - this.ball.radius < paddle.y + paddle.height &&
               this.ball.y + this.ball.radius > paddle.y;
    }
    
    updateScoreDisplay() {
        document.getElementById('player1-score').textContent = this.player1.score;
        document.getElementById('player2-score').textContent = this.player2.score;
    }
    
    checkWinner() {
        if (this.player1.score >= 11) {
            document.getElementById('game-status').textContent = '🏆 Player 1 Wins!';
            this.gameRunning = false;
        } else if (this.player2.score >= 11) {
            document.getElementById('game-status').textContent = '🏆 Player 2 Wins!';
            this.gameRunning = false;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw center line
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasWidth / 2, 0);
        this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.drawPaddle(this.player1, '#00d4ff');
        this.drawPaddle(this.player2, '#7b2cbf');
        
        // Draw ball
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        this.ctx.shadowBlur = 15;
        
        // Draw pause text if paused
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = 'bold 30px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvasWidth / 2, this.canvasHeight / 2);
        }
    }
    
    drawPaddle(paddle, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        this.ctx.shadowColor = `${color}80`;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        this.ctx.shadowColor = 'transparent';
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        if (!this.gamePaused) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    copyShareLink() {
        const link = document.getElementById('share-link');
        link.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Pong();
});