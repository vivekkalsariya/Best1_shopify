document.addEventListener("DOMContentLoaded", () => {
    const snowBuildUpCanvas = document.getElementById("snow-build-up");
    const ctx = snowBuildUpCanvas.getContext("2d");
    const snowflakes = [];
    const snowLevels = [];
    const snowflakeCharacters = ["❄", "*", "❉", "❃", "❅"];
    const maxSnowDepth = 80; // Limit snow depth
    let snowflakeCounter = 0;
    let snowflakeCreationRate = window.innerWidth > 768 ? 1 : 8; // Adjust for screen size
    let isMelting = false;
  
    // Resize canvas and initialize snow levels
    function resizeCanvas() {
      snowBuildUpCanvas.width = window.innerWidth;
      snowBuildUpCanvas.height = window.innerHeight; // Use innerHeight to match visible viewport height
      snowLevels.length = snowBuildUpCanvas.width;
      snowLevels.fill(0); // Reset snow levels
    }
  
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  
    function createSnowflake() {
      snowflakes.push({
        x: Math.random() * snowBuildUpCanvas.width,
        y: -10,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 2 + 1,
        opacity: 1,
        character: snowflakeCharacters[
          Math.floor(Math.random() * snowflakeCharacters.length)
        ],
      });
    }
  
    function smoothAccumulation() {
      for (let i = 1; i < snowLevels.length - 1; i++) {
        snowLevels[i] = (snowLevels[i - 1] + snowLevels[i] + snowLevels[i + 1]) / 3;
      }
    }
  
    function drawSnowflakes(deltaTime) {
      ctx.clearRect(0, 0, snowBuildUpCanvas.width, snowBuildUpCanvas.height);
  
      // Draw buildup
      ctx.fillStyle = "#ebe6ef";
      for (let x = 0; x < snowLevels.length; x++) {
        ctx.fillRect(x, snowBuildUpCanvas.height - snowLevels[x], 1, snowLevels[x]);
      }
  
      // Draw falling snowflakes
      snowflakes.forEach((snowflake, index) => {
        ctx.globalAlpha = snowflake.opacity;
        ctx.font = `${snowflake.size}px sans-serif`;
        ctx.fillText(snowflake.character, snowflake.x, snowflake.y);
        ctx.globalAlpha = 1;
  
        if (!isMelting) {
          snowflake.y += snowflake.speed * deltaTime * 60;
        } else {
          snowflake.speed *= 0.98;
          snowflake.opacity *= 0.98;
        }
  
        if (
          snowflake.y + snowflake.size / 2 >=
          snowBuildUpCanvas.height - snowLevels[Math.floor(snowflake.x)]
        ) {
          if (!isMelting) {
            const snowflakeX = Math.floor(snowflake.x);
            const snowflakeSize = snowflake.size / 2;
            const accumulationWidth = Math.ceil(snowflakeSize * 2);
            for (let i = -accumulationWidth; i <= accumulationWidth; i++) {
              const xIndex = Math.min(
                Math.max(snowflakeX + i, 0),
                snowLevels.length - 1
              );
              const falloff = Math.exp(-Math.abs(i) / 5);
              if (snowLevels[xIndex] < maxSnowDepth) {
                snowLevels[xIndex] += (snowflake.size / 4) * falloff;
              }
            }
            snowflakes.splice(index, 1);
          }
        }
      });
  
      smoothAccumulation();
    }
  
    function meltSnow() {
      let allMelted = true;
      for (let i = 0; i < snowLevels.length; i++) {
        if (snowLevels[i] > 0) {
          const meltRate = Math.random() * 0.3 + 0.1;
          snowLevels[i] -= meltRate;
          if (snowLevels[i] < 0) snowLevels[i] = 0;
          allMelted = false;
        }
      }
      return allMelted;
    }
  
    function checkFullSnow() {
      return snowLevels.every((level) => level >= maxSnowDepth);
    }
  
    function animate() {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastFrameTime) / 1000;
      lastFrameTime = currentTime;
  
      if (!isMelting) {
        if (checkFullSnow()) {
          isMelting = true;
        } else if (snowflakeCounter % snowflakeCreationRate === 0) {
          createSnowflake();
        }
        snowflakeCounter++;
      } else {
        if (meltSnow()) {
          snowflakes.length = 0;
          snowLevels.fill(0);
          isMelting = false;
        }
      }
  
      drawSnowflakes(deltaTime);
      requestAnimationFrame(animate);
    }
  
    let lastFrameTime = performance.now();
    animate();
  });
  