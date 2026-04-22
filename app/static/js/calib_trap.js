const S = 0.002;
const FRAME_HEIGHT = 1080;
const FRAME_WIDTH = 1920;
const EDGE_MARGIN = 6; // px from frame

// Slider elements
const topSlider = document.getElementById('top_shift');
const bottomSlider = document.getElementById('bottom_shift');
const xSlider = document.getElementById('x_shift');
const widthSlider = document.getElementById('width_scale');

let activeSlider = null;
let lastSent = 0;

// -----------------------------
// Sync sliders with backend
// -----------------------------
async function syncFromBackend() {
    try {
        const res = await fetch('/get_current_trapezoid');
        const p = await res.json();

        // Update bounds
        topSlider.min = 2500 + p.min_top / S;
        topSlider.max = 2500 + p.max_top / S;

        bottomSlider.min = 2500 + p.min_bottom / S;
        bottomSlider.max = 2500 + p.max_bottom / S;
        xSlider.min = 2500 + p.min_x / S;   // min_x = backend minimum allowed world_x_shift
        xSlider.max = 2500 + p.max_x / S;   // max_x = backend maximum allowed world_x_shift
        xSlider.value = 2500 + p.x_shift / S;

        // Only update slider positions if NOT currently dragging
        if (activeSlider !== 'top_shift')
            topSlider.value = 2500 + p.top_shift / S;

        if (activeSlider !== 'bottom_shift')
            bottomSlider.value = 2500 + p.bottom_shift / S;

        if (activeSlider !== 'x_shift')
            xSlider.value = 2500 + p.x_shift / S;

        if (activeSlider !== 'width_scale')
            widthSlider.value = ((p.width_scale - 0.1) / (8.0 - 0.1)) * 5000;

    } catch (err) {
        console.error('sync failed', err);
    }
}



// -----------------------------
// Move slider safely
// -----------------------------
function slidePoint(point, value) {
    const now = Date.now();
    if (now - lastSent < 16) return;
    lastSent = now;

    fetch(`/slide_point?point=${point}&value=${value}`, { method: 'POST' })
        .then(res => res.json())
        .then(() => {
            return fetch('/get_current_trapezoid');
        })
        .then(res => res.json())
        .then(p => {

            // Update bounds immediately
            topSlider.min = 2500 + p.min_top / S;
            topSlider.max = 2500 + p.max_top / S;

            bottomSlider.min = 2500 + p.min_bottom / S;
            bottomSlider.max = 2500 + p.max_bottom / S;

            // HARD CLAMP active slider if it exceeded bounds
            if (point === 'top_shift') {
                const newVal = 2500 + p.top_shift / S;
                topSlider.value = newVal;
            }

            if (point === 'bottom_shift') {
                const newVal = 2500 + p.bottom_shift / S;
                bottomSlider.value = newVal;
            }

            if (point === 'x_shift') {
                xSlider.value = 2500 + p.x_shift / S;
            }

            if (point === 'width_scale') {
                widthSlider.value =
                    ((p.width_scale - 0.1) / (8.0 - 0.1)) * 5000;
            }
        });
}

// -----------------------------
// Add event listeners
// -----------------------------
[topSlider, bottomSlider, xSlider, widthSlider].forEach(slider => {
    slider.addEventListener('mousedown', () => activeSlider = slider.id);
    slider.addEventListener('mouseup', () => activeSlider = null);
    slider.addEventListener('input', (e) => {
        slidePoint(slider.id, slider.value);
    });
});

// Initial sync
syncFromBackend();


// --------------------
// Pull backend limits
// --------------------
function updateSliderValues() {
    fetch('/get_current_trapezoid')
        .then(res => res.json())
        .then(params => {

            // Apply backend bounds → slider bounds
            topSlider.min = 2500 + params.min_top / S;
            topSlider.max = 2500 + params.max_top / S;

            bottomSlider.min = 2500 + params.min_bottom / S;
            bottomSlider.max = 2500 + params.max_bottom / S;

            // Apply backend values → slider thumbs
            topSlider.value = 2500 + params.top_shift / S;
            bottomSlider.value = 2500 + params.bottom_shift / S;
            xSlider.value = 2500 + params.x_shift / S;
            widthSlider.value = ((params.width_scale - 0.1) / (8.0 - 0.1)) * 5000;
        })
        .catch(err => console.error('updateSliderValues error:', err));
}



function logSliderValues() {
    console.log('Slider values:', {
    topLeftX: topLeftXSlider.value,
    topRightX: topRightXSlider.value,
    topLeftY: topLeftYSlider.value,
    bottomLeftY: bottomLeftYSlider.value
});
}

// Add event listeners for real-time constraint updates
// [topLeftXSlider, topRightXSlider, topLeftYSlider, bottomLeftYSlider].forEach(slider => {slider.addEventListener('input', () => {logSliderValues(); updateMaxMinSlider(); } )});

function savePoints() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/save_points', true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            alert('SPEC: Points saved successfully!');
        } else {
            alert('Error saving points: ' + xhr.responseText);
        }
    };
    xhr.send();
}
function transformed() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/transformed_image', true); // Request the transformed image from the server
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Generate a unique URL by appending a timestamp to prevent caching
            const transformedImage = document.getElementById('transformed-image');
            const uniqueUrl = '/static/mask/captured_frame.jpg?' + new Date().getTime(); // Add timestamp
            transformedImage.src = uniqueUrl;
            transformedImage.style.display = 'block'; // Show the image
        } else {
            console.error('Error fetching transformed image:', xhr.responseText);
        }
    };
    xhr.onerror = function () {
        console.error('Request failed');
    };
    xhr.send();
}