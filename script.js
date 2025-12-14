const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spin-button");
const ctx = wheel.getContext("2d");
const numberOfSlices = 8;
const sliceColors = ["#FF5733", "#33FF57", "#5733FF", "#F1C40F", "#1ABC9C", "#E74C3C", "#9B59B6", "#3498DB"];
const prizeLabels = ["Prize 1", "Prize 2", "Prize 3", "Prize 4", "Prize 5", "Prize 6", "Prize 7", "Prize 8"];
let angle = 0;
let isSpinning = false;

// Confetti configuration constants
const CONFETTI_ORIGIN_LEFT_MIN = 0.1;
const CONFETTI_ORIGIN_LEFT_MAX = 0.3;
const CONFETTI_ORIGIN_RIGHT_MIN = 0.7;
const CONFETTI_ORIGIN_RIGHT_MAX = 0.9;
const CONFETTI_ORIGIN_Y_OFFSET = -0.2;

// Easing function for smooth animation
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Draw the wheel
function drawWheel() {
    const sliceAngle = (2 * Math.PI) / numberOfSlices;
    for (let i = 0; i < numberOfSlices; i++) {
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, sliceAngle * i, sliceAngle * (i + 1));
        ctx.closePath();
        ctx.fillStyle = sliceColors[i % sliceColors.length];
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw text label
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(sliceAngle * i + sliceAngle / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px Arial";
        ctx.fillText(prizeLabels[i], 150, 10);
        ctx.restore();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(250, 250, 40, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Calculate which prize was selected
function getPrizeIndex(finalAngle) {
    // Normalize angle to 0-360
    const normalizedAngle = ((finalAngle % 360) + 360) % 360;
    
    // The flapper points at the top (12 o'clock position)
    // Calculate which slice is at the top
    const sliceAngle = 360 / numberOfSlices;
    
    // Adjust for the rotation direction and flapper position
    // The wheel rotates clockwise, so we need to find which slice is under the flapper
    const adjustedAngle = (360 - normalizedAngle + (sliceAngle / 2)) % 360;
    const prizeIndex = Math.floor(adjustedAngle / sliceAngle) % numberOfSlices;
    
    return prizeIndex;
}

// Trigger confetti effect
function triggerConfetti() {
    // Check if confetti library is available
    if (typeof confetti !== 'function') {
        console.warn('Confetti library not loaded');
        return;
    }
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from two different positions
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(CONFETTI_ORIGIN_LEFT_MIN, CONFETTI_ORIGIN_LEFT_MAX), y: Math.random() + CONFETTI_ORIGIN_Y_OFFSET }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(CONFETTI_ORIGIN_RIGHT_MIN, CONFETTI_ORIGIN_RIGHT_MAX), y: Math.random() + CONFETTI_ORIGIN_Y_OFFSET }
        });
    }, 250);
}

// Spin functionality with easing
spinButton.addEventListener("click", () => {
    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    
    const minSpins = 5;
    const maxSpins = 8;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const randomDegrees = Math.random() * 360;
    const totalRotation = spins * 360 + randomDegrees;
    
    const startAngle = angle;
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easedProgress = easeOutCubic(progress);
        angle = startAngle + totalRotation * easedProgress;
        
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-250, -250);
        drawWheel();
        ctx.restore();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spin complete
            const prizeIndex = getPrizeIndex(angle);
            console.log(`You won: ${prizeLabels[prizeIndex]}`);
            
            // Trigger confetti
            setTimeout(() => {
                triggerConfetti();
            }, 100);
            
            // Show result with a slight delay
            setTimeout(() => {
                const message = `Congratulations! You won: ${prizeLabels[prizeIndex]}`;
                // For better UX, log to console. In production, this could be a custom modal.
                console.log(message);
                alert(message);
                isSpinning = false;
                spinButton.disabled = false;
            }, 500);
        }
    }
    
    animate();
});

// Initial wheel drawing
drawWheel();