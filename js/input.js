const KEY_TO_DIRECTION = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    a: 'left',
    d: 'right',
    w: 'up',
    s: 'down',
};

const SWIPE_THRESHOLD_PX = 30;

export function bindInput(onMove) {
    const handleKeydown = (event) => {
        const direction = KEY_TO_DIRECTION[event.key];
        if (!direction) return;
        event.preventDefault();
        onMove(direction);
    };

    let touchStart = null;

    const handleTouchStart = (event) => {
        const touch = event.changedTouches[0];
        touchStart = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (event) => {
        if (!touchStart) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - touchStart.x;
        const dy = touch.clientY - touchStart.y;
        touchStart = null;

        if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD_PX) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            onMove(dx > 0 ? 'right' : 'left');
        } else {
            onMove(dy > 0 ? 'down' : 'up');
        }
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
}
