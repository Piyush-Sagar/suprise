document.addEventListener('DOMContentLoaded', () => {
    const giftBox = document.getElementById('gift-box');
    const videoContainer = document.getElementById('video-container');
    const videoPlayer = document.getElementById('video-player');
    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');

    // Image sequence for the gift box opening animation
    const giftImages = [
        'gift1.png', // Initial closed state
        'gift2.png', // Lid slightly ajar
        'gift3.png', // Lid lifting off
        'gift4.png'  // Box fully open
    ];

    let currentFrame = 0;
    let isOpened = false;

    // Preload images for a smoother animation
    giftImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    giftBox.addEventListener('click', () => {
        if (isOpened) return;

        currentFrame++;

        // Add shake animation on each click
        giftBox.classList.add('shake-animation');

        if (currentFrame < giftImages.length) {
            // Change to the next image in the sequence
            giftBox.src = giftImages[currentFrame];
        } else {
            // If the sequence is finished, show the video
            isOpened = true;
            showTheVideo();
        }
    });

    giftBox.addEventListener('animationend', () => {
        giftBox.classList.remove('shake-animation');
    });

    function showTheVideo() {
        // Make the open box non-interactive
        giftBox.classList.remove('hover:scale-110');
        giftBox.classList.add('cursor-default');

        // Fade out the title and subtitle
        title.classList.add('opacity-0');
        subtitle.classList.add('opacity-0');

        // Wait for a moment to show the final open box, then reveal the video
        setTimeout(() => {
            giftBox.parentElement.classList.add('hidden');
            videoContainer.classList.remove('hidden');

            videoPlayer.muted = false;
            videoPlayer.play().catch(error => {
                console.error("Autoplay was prevented:", error);
                title.textContent = "Click to play your video!";
                title.classList.remove('opacity-0');
            });
        }, 800);
    }
});
