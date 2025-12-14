const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spin-button");
const ctx = wheel.getContext("2d");
const prizes = [
    "5% Discount",
    "10% Discount",
    "15% Discount",
    "Win a Free Soap",
    "Win a Free Candle"
];
const numberOfSlices = 5;
const sliceColors = ["#FF5733", "#33FF57", "#5733FF", "#F1C40F", "#1ABC9C"];
let angle = 0;

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
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(sliceAngle * i + sliceAngle / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#000";
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText(prizes[i], 150, 10);
        ctx.restore();
    }
}

// Spin functionality
spinButton.addEventListener("click", () => {
    let spinAngle = Math.random() * 5000 + 2000; // Random spin duration
    const spinInterval = setInterval(() => {
        angle += 10;
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-250, -250);
        drawWheel();
        ctx.restore();
    }, 30);

    setTimeout(() => clearInterval(spinInterval), spinAngle);
});

// Initial wheel drawing
drawWheel();