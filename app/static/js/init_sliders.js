// Fetch JSON and initialize sliders in pixel space
async function initializeSliders() {
    try {
        // Fetch current trapezoid state (world-space)
        const response = await fetch('/get_current_trapezoid');
        const params = await response.json(); 
        // expects { top_shift, bottom_shift, ... }

        console.log("Trapezoid params in JS:", params);

        // Get slider elements
        const topSlider = document.getElementById('top_shift');
        const bottomSlider = document.getElementById('bottom_shift');

        const HEIGHT = 1080; // or your actual frame height

        // Map world-space top/bottom to pixel position
        // Using the projected points that your app already calculates
        // top_pixel = fraction from top of frame: (projected top Y)
        // bottom_pixel = fraction from top of frame: (projected bottom Y)
        topSlider.min = 0;
        topSlider.max = 5000;
        bottomSlider.min = 0;
        bottomSlider.max = 5000;

        topSlider.value = lastSliderValue.top_shift =
            2500 + params.top_shift / 0.002;

        bottomSlider.value = lastSliderValue.bottom_shift =
            2500 + params.bottom_shift / 0.002;

        // Other sliders can stay as they are
        document.getElementById('x_shift').value = 2500 + params.x_shift / 0.002;
        document.getElementById('width_scale').value = ((params.width_scale - 0.1) / (5.0 - 0.1)) * 5000;

        // Attach listeners
        [topSlider, bottomSlider].forEach(slider => {
            slider.addEventListener('input', () => {
                console.log(`${slider.id} updated to ${slider.value}`);
            });
        });

        // Update overlay visualization
        updateRangeOverlay(topSlider, document.getElementById('top_shift_range'));
        updateRangeOverlay(bottomSlider, document.getElementById('bottom_shift_range'));

    } catch (error) {
        console.error('Error initializing sliders:', error);
    }
}

// Initialize sliders on page load
initializeSliders();


// Fetch JSON and initialize world-space sliders
// async function initializeSliders() {
//     try {
//         // Fetch current world-space values from Flask
//         const response = await fetch('/get_trapezoid_params');
//         const params = await response.json(); // expects { top_shift, bottom_shift, x_shift, width_scale }
//         console.log("Trapezoid params in JS:", params);

//         // Get slider elements
//         const sliders = {
//             top_shift: document.getElementById('top_shift'),
//             bottom_shift: document.getElementById('bottom_shift'),
//             x_shift: document.getElementById('x_shift'),
//             width_scale: document.getElementById('width_scale')
//         };

//         // Map values to slider positions
//         sliders.top_shift.value = 2500 + params.top_shift / 0.002;
//         sliders.bottom_shift.value = 2500 + params.bottom_shift / 0.002;
//         // sliders.top_shift.value = 2500;
//         // sliders.bottom_shift.value = 2500;
//         sliders.x_shift.value = 2500 + params.x_shift / 0.002;
//         sliders.width_scale.value = ((params.width_scale - 0.1) / (5.0 - 0.1)) * 5000;

//         // Add input listeners (optional, your slidePoint already handles updates)
//         Object.keys(sliders).forEach(sliderId => {
//             sliders[sliderId].addEventListener('input', () => {
//                 console.log(`${sliderId} updated to ${sliders[sliderId].value}`);
//             });
//         });

//     } catch (error) {
//         console.error('Error initializing sliders:', error);
//     }
// }

// // Initialize sliders on page load
// initializeSliders();