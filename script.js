const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spin-button");
const ctx = wheel.getContext("2d");

// Prize definitions from PR #3
const prizes = [
    "Sugar Scrubs 50% OFF!",
    "Body Massage Oil 50% OFF!",
    "Jojoba Beard Balm 40% OFF!",
    "Free Soap from Basket",
    "Hair Care 30% OFF!",
    "Bakuchiol Face Cream $20 OFF!",
    "Essential Oils 40% OFF!",
    "Lip Balm 20% OFF!",
    "Oops...",
    "Try Again🙁",
    "$5 OFF!",
    "Shampoo 25% OFF!",
    "Face Mask $10 OFF!",
    "Try Again🙁",
    "Free Bath Salt"
];

// Define slice weight multipliers (slimmer slices have smaller values)
const sliceWeights = prizes.map(prize => {
    if (prize === "Free Soap Gift Basket" || prize === "Free Bath Salt") {
        return 0.6; // 60% of normal size
    }
    return 1.0; // Normal size
});

// Calculate total weight for normalization
const totalWeight = sliceWeights.reduce((sum, weight) => sum + weight, 0);

const numberOfSlices = prizes.length;
const sliceColors = ["#FF5733", "#33FF57", "#5733FF", "#F1C40F", "#1ABC9C", "#E74C3C", "#9B59B6", "#3498DB", "#FF6B9D", "#FFA500", "#20B2AA", "#9370DB"];
let angle = 0;
let isSpinning = false;

// Confetti configuration constants from PR #2
const CONFETTI_ORIGIN_LEFT_MIN = 0.1;
const CONFETTI_ORIGIN_LEFT_MAX = 0.3;
const CONFETTI_ORIGIN_RIGHT_MIN = 0.7;
const CONFETTI_ORIGIN_RIGHT_MAX = 0.9;
const CONFETTI_ORIGIN_Y_OFFSET = -0.2;

// Easing function for smooth animation from PR #2
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Calculate slice angles based on weights
function calculateSliceAngles() {
    const sliceAngles = [];
    let cumulativeAngle = 0;
    
    for (let i = 0; i < numberOfSlices; i++) {
        const normalizedWeight = sliceWeights[i] / totalWeight;
        const sliceAngle = normalizedWeight * 2 * Math.PI;
        sliceAngles.push({
            start: cumulativeAngle,
            end: cumulativeAngle + sliceAngle,
            angle: sliceAngle
        });
        cumulativeAngle += sliceAngle;
    }
    
    return sliceAngles;
}

// Draw the wheel
function drawWheel() {
    const sliceAngles = calculateSliceAngles();
    
    for (let i = 0; i < numberOfSlices; i++) {
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, sliceAngles[i].start, sliceAngles[i].end);
        ctx.closePath();
        ctx.fillStyle = sliceColors[i % sliceColors.length];
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw text label
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(sliceAngles[i].start + sliceAngles[i].angle / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        // Make certain labels slimmer
        if (prizes[i] === "Free Soap Gift Basket" || prizes[i] === "Free Bath Salt") {
            ctx.font = "bold 9px Arial";
        } else {
            ctx.font = "bold 11px Arial";
        }
        ctx.fillText(prizes[i], 150, 5);
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
    // Normalize angle to 0-2π radians
    const normalizedAngle = ((finalAngle * Math.PI / 180) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    
    // Get slice angles
    const sliceAngles = calculateSliceAngles();
    
    // The flapper points at the right (3 o'clock position)
    // Adjust for wheel rotation direction (counter-clockwise in our coordinate system)
    const flapperPosition = (2 * Math.PI - normalizedAngle) % (2 * Math.PI);
    
    for (let i = 0; i < numberOfSlices; i++) {
        if (flapperPosition >= sliceAngles[i].start && flapperPosition < sliceAngles[i].end) {
            return i;
        }
    }
    
    return 0; // Fallback
}

// Trigger confetti effect using canvas-confetti library from PR #2
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

// Show prize modal from PR #3
function showPrizeModal(prize) {
    const modal = document.createElement('div');
    modal.id = 'prize-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const heading = document.createElement('h2');
    // Check if the prize is "Oops..." for special message
    if (prize === "Oops...") {
        heading.textContent = 'Maybe Next Time🥺';
    } else {
        heading.textContent = '🎉 Congratulations! 🎉';
    }
    
    const text = document.createElement('p');
    text.textContent = 'You won:';
    
    const prizeText = document.createElement('h3');
    prizeText.textContent = prize;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        modal.remove();
    });
    
    modalContent.appendChild(heading);
    modalContent.appendChild(text);
    modalContent.appendChild(prizeText);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    // Trigger confetti only if not "Oops..." - with delay to avoid white oval during modal animation
    if (prize !== "Oops...") {
        setTimeout(() => {
            triggerConfetti();
        }, 350);
    }
}

// Spin functionality with easing from PR #2 and prize display from PR #3
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
            const wonPrize = prizes[prizeIndex];
            console.log(`You won: ${wonPrize}`);
            
            // Show result with a slight delay
            setTimeout(() => {
                showPrizeModal(wonPrize);
                isSpinning = false;
                spinButton.disabled = false;
            }, 500);
        }
    }
    
    animate();
});

// Initial wheel drawing
drawWheel();