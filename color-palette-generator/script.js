// Color Palette Generator - Script

document.addEventListener('DOMContentLoaded', () => {
    let palette = ['#9146FF', '#772CE8', '#5C16C5', '#1F1F23', '#EFEFF1'];
    const names = ['Primary', 'Secondary', 'Accent', 'Background', 'Text'];

    const baseColorInput = document.getElementById('base-color');
    const baseColorHex = document.getElementById('base-color-hex');
    const harmonySelect = document.getElementById('harmony-type');
    const bgStyleSelect = document.getElementById('bg-style');
    const generateBtn = document.getElementById('generate-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');

    // Convert hex to HSL
    function hexToHSL(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    // Convert HSL to hex
    function hslToHex(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r, g, b;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        return '#' + [r, g, b].map(v => {
            const hex = Math.round((v + m) * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    // Generate palette from base color
    function generatePalette() {
        const base = hexToHSL(baseColorInput.value);
        const harmony = harmonySelect.value;
        const isDark = bgStyleSelect.value === 'dark';

        let colors = [];

        switch (harmony) {
            case 'analogous':
                colors = [
                    hslToHex(base.h, base.s, base.l),
                    hslToHex(base.h - 20, base.s * 0.9, base.l - 10),
                    hslToHex(base.h + 20, base.s * 0.8, base.l - 20)
                ];
                break;
            case 'complementary':
                colors = [
                    hslToHex(base.h, base.s, base.l),
                    hslToHex(base.h + 180, base.s * 0.9, base.l),
                    hslToHex(base.h + 180, base.s * 0.7, base.l - 15)
                ];
                break;
            case 'triadic':
                colors = [
                    hslToHex(base.h, base.s, base.l),
                    hslToHex(base.h + 120, base.s * 0.85, base.l),
                    hslToHex(base.h + 240, base.s * 0.85, base.l)
                ];
                break;
            case 'monochromatic':
                colors = [
                    hslToHex(base.h, base.s, base.l),
                    hslToHex(base.h, base.s * 0.8, base.l - 15),
                    hslToHex(base.h, base.s * 0.6, base.l - 30)
                ];
                break;
        }

        // Add background and text colors
        if (isDark) {
            colors.push(hslToHex(base.h, 10, 12));
            colors.push('#EFEFF1');
        } else {
            colors.push('#FFFFFF');
            colors.push(hslToHex(base.h, 10, 15));
        }

        palette = colors;
        updateDisplay();
    }

    // Update palette display
    function updateDisplay() {
        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach((swatch, i) => {
            const color = palette[i];
            swatch.querySelector('.swatch-color').style.background = color;
            swatch.querySelector('.swatch-hex').textContent = color;
            swatch.querySelector('.swatch-name').textContent = names[i];
        });

        // Update mock preview
        const mock = document.getElementById('mock-preview');
        mock.style.background = palette[3];
        mock.querySelector('.mock-header').style.background = palette[0];
        mock.querySelector('.mock-avatar').style.background = palette[1];
        mock.querySelector('.mock-name').style.color = palette[4];
        mock.querySelector('.mock-game').style.color = palette[4];
        mock.querySelector('.mock-content').style.borderColor = palette[2];
        mock.querySelectorAll('.mock-user').forEach(el => el.style.color = palette[0]);
        mock.querySelectorAll('.mock-message').forEach(el => el.style.color = palette[4]);
    }

    // Event listeners
    baseColorInput.addEventListener('input', () => {
        baseColorHex.textContent = baseColorInput.value.toUpperCase();
        generatePalette();
    });

    harmonySelect.addEventListener('change', generatePalette);
    bgStyleSelect.addEventListener('change', generatePalette);

    generateBtn.addEventListener('click', () => {
        // Randomize base color
        const randomHue = Math.floor(Math.random() * 360);
        const randomSat = 60 + Math.floor(Math.random() * 30);
        const randomLig = 45 + Math.floor(Math.random() * 20);
        baseColorInput.value = hslToHex(randomHue, randomSat, randomLig);
        baseColorHex.textContent = baseColorInput.value.toUpperCase();
        generatePalette();
    });

    copyAllBtn.addEventListener('click', () => {
        const text = palette.map((c, i) => `${names[i]}: ${c}`).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            copyAllBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                copyAllBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy All`;
            }, 2000);
        });
    });

    // Preset themes
    document.querySelectorAll('.preset-theme').forEach(btn => {
        btn.addEventListener('click', () => {
            palette = JSON.parse(btn.dataset.colors);
            baseColorInput.value = palette[0];
            baseColorHex.textContent = palette[0];
            updateDisplay();
        });
    });

    // Copy individual swatch
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            const hex = swatch.querySelector('.swatch-hex').textContent;
            navigator.clipboard.writeText(hex);
            swatch.querySelector('.swatch-hex').textContent = 'Copied!';
            setTimeout(() => {
                swatch.querySelector('.swatch-hex').textContent = hex;
            }, 1000);
        });
    });

    // Export CSS
    document.getElementById('export-css').addEventListener('click', () => {
        const css = `:root {\n${palette.map((c, i) => `  --${names[i].toLowerCase()}: ${c};`).join('\n')}\n}`;
        navigator.clipboard.writeText(css);
        alert('CSS Variables copied to clipboard!');
    });

    // Export JSON
    document.getElementById('export-json').addEventListener('click', () => {
        const json = JSON.stringify(Object.fromEntries(palette.map((c, i) => [names[i].toLowerCase(), c])), null, 2);
        navigator.clipboard.writeText(json);
        alert('JSON copied to clipboard!');
    });

    // Initial display
    updateDisplay();
});
