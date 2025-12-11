/**
 * OBS Hotkey Reference
 * Searchable keyboard shortcuts list
 */

const searchInput = document.getElementById('search');
const hotkeyItems = document.querySelectorAll('.hotkey-item');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    hotkeyItems.forEach(item => {
        const kbd = item.querySelector('kbd').textContent.toLowerCase();
        const description = item.querySelector('span').textContent.toLowerCase();

        if (query === '' || kbd.includes(query) || description.includes(query)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
});

// Copy hotkey on click
hotkeyItems.forEach(item => {
    item.addEventListener('click', () => {
        const kbd = item.querySelector('kbd').textContent;
        navigator.clipboard.writeText(kbd).then(() => {
            const original = item.querySelector('span').textContent;
            item.querySelector('span').textContent = 'Copied!';
            setTimeout(() => {
                item.querySelector('span').textContent = original;
            }, 1000);
        });
    });

    item.style.cursor = 'pointer';
});
