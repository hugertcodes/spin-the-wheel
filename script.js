const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spin-button");
const ctx = wheel.getContext("2d");

// Prize definitions
const prizes = [
    "Sugar Scrubs 50% OFF!",
    "Body Massage Oil 50% OFF!",
    "Jojoba Beard Balm 40% OFF!",
    "Free Gift Basket!",
    "Hair Care 30% OFF!",
    "Face Cream 25% OFF!",
    "Essential Oils 40% OFF!",
    "Lip Balm 20% OFF!",
    "Nail Polish 35% OFF!",
    "Perfume 45% OFF!",
    "Soap Set 30% OFF!",
    "Shampoo 25% OFF!"
];

const numberOfSlices = prizes.length;
const sliceColors = ["#FF5733", "#33FF57", "#5733FF", "#F1C40F", "#1ABC9C", "#E74C3C", "#9B59B6", "#3498DB", "#FF6B9D", "#FFA500", "#20B2AA", "#9370DB"];
let angle = 0;
let isSpinning = false;

// Draw the wheel
function drawWheel() {
    const sliceAngle = (2 * Math.PI) / numberOfSlices;
    for (let i = 0; i < numberOfSlices; i++) {
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, sliceAngle * i, sliceAngle * (i + 1));
        ctx.closePath();
        ctx.fillStyle = sliceColors[i % sliceColors.length];
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add prize text
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(sliceAngle * i + sliceAngle / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#000";
        ctx.font = "bold 12px Arial";
        ctx.fillText(prizes[i], 150, 0);
        ctx.restore();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(250, 250, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw flapper (indicator)
function drawFlapper() {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(250, 10);
    ctx.lineTo(230, 40);
    ctx.lineTo(270, 40);
    ctx.closePath();
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

// Confetti effect
function createConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FF5733', '#33FF57', '#5733FF', '#F1C40F', '#1ABC9C'];
    const maxConfettiCount = 50;
    let confettiCount = 0;

    (function frame() {
        if (confettiCount >= maxConfettiCount) {
            return;
        }
        
        const confetti = [];
        for (let i = 0; i < 5 && confettiCount < maxConfettiCount; i++) {
            confetti.push({
                x: Math.random() * window.innerWidth,
                y: -10,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 5 + 5,
                speedY: Math.random() * 3 + 2
            });
            confettiCount++;
        }

        confetti.forEach(c => {
            const div = document.createElement('div');
            div.style.position = 'fixed';
            div.style.left = c.x + 'px';
            div.style.top = c.y + 'px';
            div.style.width = c.size + 'px';
            div.style.height = c.size + 'px';
            div.style.backgroundColor = c.color;
            div.style.pointerEvents = 'none';
            div.style.zIndex = '9999';
            document.body.appendChild(div);

            let currentY = c.y;
            const interval = setInterval(() => {
                currentY += c.speedY;
                div.style.top = currentY + 'px';
                if (currentY > window.innerHeight) {
                    clearInterval(interval);
                    div.remove();
                }
            }, 16);
        });

        if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
        }
    })();
}

// Get winning prize based on final angle
function getWinningPrize(finalAngle) {
    // All angles are in degrees for prize calculation
    const sliceAngle = 360 / numberOfSlices;
    // Normalize angle to 0-360 range and invert direction (clockwise)
    const normalizedAngle = (360 - (finalAngle % 360)) % 360;
    const winningIndex = Math.floor(normalizedAngle / sliceAngle) % numberOfSlices;
    return prizes[winningIndex];
}

// Show prize modal
function showPrizeModal(prize) {
    const modal = document.createElement('div');
    modal.id = 'prize-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const heading = document.createElement('h2');
    heading.textContent = '🎉 Congratulations! 🎉';
    
    const text = document.createElement('p');
    text.textContent = 'You won:';
    
    const prizeText = document.createElement('h3');
    prizeText.textContent = prize;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        modal.remove();
        // Note: Confetti animation is time-bound (3 seconds) and will clean up automatically
    });
    
    modalContent.appendChild(heading);
    modalContent.appendChild(text);
    modalContent.appendChild(prizeText);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    createConfetti();
}

// Spin functionality
spinButton.addEventListener("click", () => {
    if (isSpinning) return;
    isSpinning = true;
    spinButton.disabled = true;
    
    let spinAngle = Math.random() * 5000 + 2000; // Random spin duration
    let currentAngle = angle;
    const startTime = Date.now();
    const duration = 3000; // 3 seconds
    
    const spinInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            angle = currentAngle + (spinAngle * easeOut);
        } else {
            angle = currentAngle + spinAngle;
            clearInterval(spinInterval);
            isSpinning = false;
            spinButton.disabled = false;
            
            // Show winning prize
            const winningPrize = getWinningPrize(angle);
            setTimeout(() => showPrizeModal(winningPrize), 500);
        }
        
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-250, -250);
        drawWheel();
        ctx.restore();
        
        // Draw flapper on top after wheel rotation
        drawFlapper();
    }, 30);
});

// Initial wheel drawing
drawWheel();
drawFlapper();