const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spin-button");
const ctx = wheel.getContext("2d");

// Prize definitions - will be scrambled
const basePrizes = [
    "Free Bath Salt",
    "Sugar Scrubs 50% OFF!",
    "$5 OFF!",
    "Try Again🙁",
    "Essential Oils 40% OFF!",
    "Free Soap from Basket",
    "Shampoo 25% OFF!",
    "Oops...",
    "Body Massage Oil 50% OFF!",
    "Face Mask $10 OFF!",
    "Try Again🙁",
    "Bakuchiol Face Cream $20 OFF!",
    "Lip Balm 20% OFF!",
    "Hair Care 30% OFF!",
    "Jojoba Beard Balm 40% OFF!"
];

// Function to scramble prizes with Free Bath Salt and Free Soap from Basket on opposite sides
function scramblePrizes(prizesArray) {
    const totalSlices = prizesArray.length;
    const halfWay = Math.floor(totalSlices / 2);
    
    // Separate the two special prizes from the rest
    const bathSalt = "Free Bath Salt";
    const soapBasket = "Free Soap from Basket";
    const otherPrizes = prizesArray.filter(p => p !== bathSalt && p !== soapBasket);
    
    // Verify we have the expected prizes
    if (otherPrizes.length !== totalSlices - 2) {
        console.error(`Warning: Expected 2 special prizes but found ${totalSlices - otherPrizes.length}`);
        return prizesArray; // Return original array if something is wrong
    }
    
    // Shuffle the other prizes using Fisher-Yates algorithm
    for (let i = otherPrizes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherPrizes[i], otherPrizes[j]] = [otherPrizes[j], otherPrizes[i]];
    }
    
    // Place Free Bath Salt at a random position in the first half
    const bathSaltPos = Math.floor(Math.random() * halfWay);
    
    // Place Free Soap from Basket on the opposite side
    // Opposite side means approximately halfWay positions away
    // Use modulo to ensure it wraps within bounds
    const soapBasketPos = (bathSaltPos + halfWay) % totalSlices;
    
    // Build the final array
    const scrambled = [];
    let otherIndex = 0;
    
    for (let i = 0; i < totalSlices; i++) {
        if (i === bathSaltPos) {
            scrambled.push(bathSalt);
        } else if (i === soapBasketPos) {
            scrambled.push(soapBasket);
        } else {
            // Safety check: ensure we don't exceed array bounds
            if (otherIndex >= otherPrizes.length) {
                console.error(`Error: otherIndex ${otherIndex} exceeds array length ${otherPrizes.length}`);
                return prizesArray;
            }
            scrambled.push(otherPrizes[otherIndex]);
            otherIndex++;
        }
    }
    
    // Validate result
    if (scrambled.length !== totalSlices) {
        console.error(`Error: Scrambled array has ${scrambled.length} items instead of ${totalSlices}`);
        return prizesArray; // Return original array if something went wrong
    }
    
    return scrambled;
}

// Scramble prizes at initialization
const prizes = scramblePrizes(basePrizes);

// Define slice weight multipliers (slimmer slices have smaller values)
const sliceWeights = prizes.map(prize => {
    if (prize === "Free Soap from Basket" || prize === "Free Bath Salt") {
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
        if (prizes[i] === "Free Soap from Basket" || prizes[i] === "Free Bath Salt") {
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

// Christmas emoji rain animation
function triggerChristmasEmojiRain() {
    const emojis = ['🎄', '🎅', '⛄', '🎁', '❄️', '🔔', '⭐', '🕯️'];
    const duration = 3000;
    const emojiCount = 30;
    const maxAnimationTime = 4000; // Maximum fall animation time (2s + 2s from random)
    const cleanupTime = maxAnimationTime + 500; // Add buffer for cleanup
    
    for (let i = 0; i < emojiCount; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.top = '-50px';
            emoji.style.fontSize = (Math.random() * 20 + 20) + 'px';
            emoji.style.zIndex = '9999';
            emoji.style.pointerEvents = 'none';
            emoji.style.animation = `fall ${Math.random() * 2 + 2}s linear forwards`;
            
            document.body.appendChild(emoji);
            
            // Remove after animation completes with buffer
            setTimeout(() => {
                emoji.remove();
            }, cleanupTime);
        }, Math.random() * duration);
    }
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
    
    // Trigger Christmas emoji rain only if not "Oops..." - with delay to avoid issues during modal animation
    if (prize !== "Oops...") {
        setTimeout(() => {
            triggerChristmasEmojiRain();
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