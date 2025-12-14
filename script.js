const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spin-button");
const ctx = wheel.getContext("2d");
const numberOfSlices = 8;
const sliceColors = ["#FF5733", "#33FF57", "#5733FF", "#F1C40F", "#1ABC9C", "#E74C3C", "#9B59B6", "#3498DB"];
let angle = 0;

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
        ctx.stroke();
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