document.getElementById("predictionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const features = document.getElementById("features").value
        .split(",")
        .map(Number);

    const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: features })
    });

    const result = await response.json();
    document.getElementById("result").innerText = JSON.stringify(result);
});
