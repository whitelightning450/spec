
    async function read_IMU_for_level() {
      try {
        const response = await fetch('/read_IMU_for_level');
        const IMUReading = await response.json();
        // console.log("IMU Reading:", IMUReading);        
        return IMUReading; //convert to degrees 
      } catch (error) {
        console.error("Error fetching IMU data:", error);
        // Default values in case of an error
        return [0, 0, 0]; // [pitch, roll, yaw]
      }
    }
    async function initializeBubbleLevel() {
      const vial = document.querySelector('.vial');
      const bubble = document.querySelector('.bubble');
      const rollDisplay = document.getElementById('roll-angle');
      const pitchDisplay = document.getElementById('pitch-angle');
      console.log("rollDisplay:", rollDisplay);
      console.log("pitchDisplay:", pitchDisplay);
      // Maximum horizontal displacement of the bubble within the vial
      const maxDisplacement = (vial.offsetWidth - bubble.offsetWidth) / 2;

      function updateBubbleAndRollDisplay(roll) {  
        const x = (roll / 90) * maxDisplacement;
        const bubbleWidth = 60; //width in pixels from css
        const xOffset = x - bubbleWidth / 2; // Adjust for the bubble's width
        bubble.style.transform = `translate(${xOffset}px, -50%)`;
        rollDisplay.textContent = roll.toFixed(0).replace(/^-0$/, '0'); // Show with 0 decimal places and no neg sign
      }
      
      // Initial reading
      // Multiply by 57.3 to convert radians to degrees
      const initialReading = await read_IMU_for_level();
      updateBubbleAndRollDisplay(initialReading[1]*57.3); 
      // Periodic updates
      setInterval(async () => {
        const updatedReading = await read_IMU_for_level();
        updateBubbleAndRollDisplay(updatedReading[1]*57.3);
      }, 300); // Update every 0.3 second
    }
    document.addEventListener("DOMContentLoaded", initializeBubbleLevel);