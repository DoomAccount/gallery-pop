/*------------------------------------------------------------------------------
MIT License

https://github.com/DoomAccount/gallery-pop

Copyright (c) 2024 DoomAccount (Mostafa Sabry)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
------------------------------------------------------------------------------*/
/**
 * @function gallery_Pop
 * 
 * A comprehensive gallery pop-up system for viewing images and videos. This function dynamically creates
 * a modal overlay with navigation controls, thumbnails, and a counter for media items grouped by a shared identifier.
 * 
 * Key Features:
 * - Supports both image and video content.
 * - Enables navigation through next/previous buttons or thumbnail selection.
 * - Displays a counter showing the current media index and total items.
 * - Automatically handles media grouping via `data-group` attributes.
 * - Responsive design with full-screen overlay.
 * - Closes on "Escape" key press or clicking outside the content area.
 * 
 * Usage:
 * - Add a `data-gallerypop` attribute to triggers, specifying the media source (image or video).
 * - Group media items with a `data-group` attribute for seamless navigation within the same group.
 * - Include optional `data-video-image` for video thumbnails.
 */

const gallery_Pop = () => {
    // Create the overlay container for the gallery pop-up
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('gallerypop-overlay');
    document.body.appendChild(popupContainer);

    // Variables to track the current media index and groups of media
    let currentIndex = 0;
    let mediaArray = {};

    /**
      * Create and show a counter element
      * @returns {HTMLElement} The counter element for updating later
      */
    const createCounter = () => {
        const counterElement = document.createElement('div');
        counterElement.classList.add('gallerypop-counter');
        counterElement.textContent = `${currentIndex + 1} / 1`; // Placeholder for total images
        popupContainer.appendChild(counterElement);
        return counterElement;  // Return the counter element to update it later
    }

    /**
      * Open the gallery pop-up
      * @param {HTMLElement} trigger - The element that triggered the pop-up
      */
    function openGalleryPop(trigger) {
        const src = trigger.getAttribute('data-gallerypop'); // Media source
        const group = trigger.getAttribute('data-group'); // Group identifier
        popupContainer.classList.remove('hide');
        popupContainer.classList.add('show');

        // Initialize media array for the group if not already set
        if (!mediaArray[group]) {
            mediaArray[group] = [];
            document.querySelectorAll(`[data-gallerypop][data-group="${group}"]`).forEach((mediaTrigger) => {
                const mediaSrc = mediaTrigger.getAttribute('data-gallerypop');
                const videoSrc = mediaTrigger.getAttribute('data-video-image');
                if (!mediaArray[group].includes(mediaSrc)) mediaArray[group].push(videoSrc ? videoSrc : mediaSrc);
            });
        }
        currentIndex = mediaArray[group].indexOf(src);

        // Create content container for the media
        const popupContent = document.createElement('div');
        popupContent.classList.add('gallerypop-content');

        // Determine the media type (image or video)
        const mediaType = src.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image';
        let mediaElement;

        // Create and style the media element
        if (mediaType === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.src = src;
            mediaElement.controls = true; // Enable controls for videos
            mediaElement.autoplay = true; // Auto-play the video
            mediaElement.style.width = "auto";
            mediaElement.style.height = "100%";
            mediaElement.style.objectFit = "contain";
            mediaElement.style.margin = "auto";
            mediaElement.style.display = "block";
        } else {
            mediaElement = document.createElement('img');
            mediaElement.src = src;
            mediaElement.alt = "Gallery Image";
            mediaElement.style.width = "auto";
            mediaElement.style.height = "100%";
            mediaElement.style.objectFit = "contain";
            mediaElement.style.margin = "auto";
            mediaElement.style.display = "block";
        }
        // Add the 'gallerypop-image' class to control its style
        mediaElement.classList.add('gallerypop-image');

        // Append the image to the popup content
        popupContent.appendChild(mediaElement);

        // Clear previous content and add new content to the popup container
        popupContainer.innerHTML = '';
        popupContainer.appendChild(popupContent);
        popupContainer.style.display = 'flex';
        popupContainer.style.alignItems = 'center';
        popupContainer.style.justifyContent = 'center';

        // Close button
        const closeButton = document.createElement('button');
        closeButton.classList.add('gallerypop-close');
        closeButton.innerHTML = '';
        closeButton.addEventListener('click', closeGalleryPop);
        popupContainer.appendChild(closeButton);

        // Previous button
        const prevButton = document.createElement('div');
        prevButton.classList.add('gallerypop-nav', 'prev');
        prevButton.addEventListener('click', () => showNextMedia(-1, group));
        popupContainer.appendChild(prevButton);

        // Next button
        const nextButton = document.createElement('div');
        nextButton.classList.add('gallerypop-nav', 'next');
        nextButton.addEventListener('click', () => showNextMedia(1, group));
        popupContainer.appendChild(nextButton);

        // Create thumbnails for navigation
        const thumbContainer = document.createElement('div');
        thumbContainer.classList.add('gallerypop-thumbs');
        mediaArray[group].forEach((mediaSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = mediaSrc;
            thumb.classList.add('gallerypop-thumb');
            thumb.addEventListener('click', () => changeMedia(index, group));
            thumb.addEventListener('mouseenter', () => thumb.classList.add('active'));
            thumb.addEventListener('mouseleave', () => thumb.classList.remove('active'));
            thumbContainer.appendChild(thumb);

        });
        popupContainer.appendChild(thumbContainer);

        // Close popup when pressing outside the content or thumbs (but not on the image itself)
        popupContainer.addEventListener('click', (e) => {
            // Only close the gallery if clicked outside the image or thumbs
            if (e.target === popupContainer || e.target === thumbContainer || e.target === closeButton || e.target === popupContent) {
                closeGalleryPop();
            }
        });

        // Add the 'show' class to trigger the fade-in effect
        setTimeout(() => {
            mediaElement.classList.add('show');
        }, 10);

        // Create and set up the counter
        const counterElement = createCounter();

        // Update the counter text on first open
        updateCounter(counterElement);
    }

    // Close the gallery pop-up
    function closeGalleryPop() {
        const img = popupContainer.querySelector('.gallerypop-image')

        img.classList.remove('show');

        setTimeout(() => { popupContainer.classList.remove('show'); }, 500);
        setTimeout(() => { popupContainer.classList.add('hide'); }, 600);
        setTimeout(() => {
            popupContainer.style.display = 'none';
            popupContainer.innerHTML = '';
        }, 900);
    }

    /**
     * Show the next or previous media in the group
     * @param {number} direction - 1 for next, -1 for previous
     * @param {string} group - The media group identifier
     */
    function showNextMedia(direction, group) {
        currentIndex = (currentIndex + direction + mediaArray[group].length) % mediaArray[group].length;
        const popupContent = popupContainer.querySelector('.gallerypop-content img');
        if (!popupContent) {
            return;
        }
        popupContent.src = mediaArray[group][currentIndex];

        // Update active thumbnail
        const thumbs = popupContainer.querySelectorAll('.gallerypop-thumb');
        thumbs.forEach(thumb => thumb.classList.remove('active'));
        thumbs[currentIndex].classList.add('active');

        // Update the counter
        updateCounter(popupContainer.querySelector('.gallerypop-counter'));
    }

    /**
    * Change to a specific media by index
    * @param {number} index - The index of the media
    * @param {string} group - The media group identifier
    */
    function changeMedia(index, group) {
        currentIndex = index;
        const popupContent = popupContainer.querySelector('.gallerypop-content img');
        if (!popupContent) {
            return;
        }
        popupContent.src = mediaArray[group][currentIndex];

        // Update active thumbnail
        const thumbs = popupContainer.querySelectorAll('.gallerypop-thumb');
        thumbs.forEach(thumb => thumb.classList.remove('active'));
        thumbs[currentIndex].classList.add('active');

        // Update the counter
        updateCounter(popupContainer.querySelector('.gallerypop-counter'));

    }

    /**
     * Update the counter element
     * @param {HTMLElement} counterElement - The counter element to update
     */
    function updateCounter(counterElement) {
        const totalMedia = mediaArray[Object.keys(mediaArray)[0]].length;
        counterElement.textContent = `${currentIndex < 0 ? 1 : currentIndex + 1} / ${totalMedia}`;
    }

    // Close gallery on "Esc" key press
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeGalleryPop();
        }
    });

    // Initialize triggers for the gallery pop-up
    document.querySelectorAll('[data-gallerypop]').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openGalleryPop(trigger);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => gallery_Pop(), 1500)
});