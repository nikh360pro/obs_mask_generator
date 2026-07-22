/**
 * OBS Scene Builder
 * Lets users upload a screenshot of their OBS layout and drag/resize
 * the current mask over it to visualise the perfect placement.
 */

(function () {
    "use strict";

    var sb = {
        bgImage: null,
        maskX: 0, maskY: 0, maskW: 400, maskH: 225,
        dragging: false, resizing: false, resizeHandle: null,
        dragOffX: 0, dragOffY: 0,
        resizeStartX: 0, resizeStartY: 0, resizeStartW: 0, resizeStartH: 0,
        resizeStartMX: 0, resizeStartMY: 0,
        aspectRatio: 16 / 9,
        canvas: null, ctx: null, open: false
    };

    function init() {
        var toggleBtn  = document.getElementById("sb-toggle-btn");
        var panel      = document.getElementById("scene-builder-panel");
        var closeBtn   = document.getElementById("sb-close-btn");
        var uploadArea = document.getElementById("sb-upload-area");
        var fileInput  = document.getElementById("sb-file-input");
        var resetBtn   = document.getElementById("sb-reset-btn");
        sb.canvas = document.getElementById("sb-canvas");
        sb.ctx    = sb.canvas.getContext("2d");

        if (!toggleBtn || !sb.canvas) return;

        toggleBtn.addEventListener("click", function () {
            sb.open = !sb.open;
            panel.classList.toggle("hidden", !sb.open);
            if (sb.open) { syncMaskFromConfig(); render(); }
        });

        closeBtn.addEventListener("click", function () {
            sb.open = false;
            panel.classList.add("hidden");
        });

        uploadArea.addEventListener("click", function () { fileInput.click(); });

        uploadArea.addEventListener("dragover", function (e) {
            e.preventDefault(); uploadArea.classList.add("sb-upload-drag");
        });
        uploadArea.addEventListener("dragleave", function () {
            uploadArea.classList.remove("sb-upload-drag");
        });
        uploadArea.addEventListener("drop", function (e) {
            e.preventDefault(); uploadArea.classList.remove("sb-upload-drag");
            var file = e.dataTransfer.files[0];
            if (file && file.type.startsWith("image/")) loadBg(file);
        });

        fileInput.addEventListener("change", function () {
            if (fileInput.files[0]) loadBg(fileInput.files[0]);
        });

        resetBtn.addEventListener("click", function () {
            syncMaskFromConfig(); centerMask(); render();
        });

        sb.canvas.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        sb.canvas.addEventListener("touchstart", onTouchStart, { passive: false });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);

        syncMaskFromConfig(); resizeCanvas(); render();
    }

    function loadBg(file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                sb.bgImage = img;
                resizeCanvas(); centerMask(); render();
                document.getElementById("sb-upload-area").classList.add("hidden");
                document.getElementById("sb-canvas-wrap").classList.remove("hidden");
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function resizeCanvas() {
        if (!sb.bgImage) { sb.canvas.width = 1280; sb.canvas.height = 720; return; }
        var maxW  = Math.min(900, sb.bgImage.width);
        var scale = maxW / sb.bgImage.width;
        sb.canvas.width  = Math.round(sb.bgImage.width  * scale);
        sb.canvas.height = Math.round(sb.bgImage.height * scale);
    }

    function centerMask() {
        sb.maskW = Math.round(sb.canvas.width * 0.3);
        sb.maskH = Math.round(sb.maskW / sb.aspectRatio);
        sb.maskX = Math.round((sb.canvas.width  - sb.maskW) / 2);
        sb.maskY = Math.round((sb.canvas.height - sb.maskH) / 2);
    }

    function syncMaskFromConfig() {
        if (typeof config === "undefined") return;
        sb.aspectRatio = config.width / config.height;
    }

    function getMaskCfg(w, h) {
        if (typeof config === "undefined") return { shape: "rectangle", cornerRadius: 10, independentCorners: false };
        return Object.assign({}, config, { width: w, height: h });
    }

    function render() {
        var canvas = sb.canvas, ctx = sb.ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        if (sb.bgImage) {
            ctx.drawImage(sb.bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#111118";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#4a4a5a";
            ctx.font = "16px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Upload an OBS screenshot to begin", canvas.width / 2, canvas.height / 2);
            ctx.textAlign = "left";
        }

        // Darken outside mask
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Show unmasked area
        ctx.save();
        ctx.translate(sb.maskX, sb.maskY);
        ctx.beginPath();
        drawShapeToContext(ctx, getMaskCfg(sb.maskW, sb.maskH), sb.maskW, sb.maskH, 0);
        ctx.clip();
        if (sb.bgImage) {
            ctx.drawImage(sb.bgImage, -sb.maskX, -sb.maskY, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(0, 0, sb.maskW, sb.maskH);
        }
        ctx.restore();

        // Dashed outline
        ctx.save();
        ctx.translate(sb.maskX, sb.maskY);
        ctx.beginPath();
        drawShapeToContext(ctx, getMaskCfg(sb.maskW, sb.maskH), sb.maskW, sb.maskH, 0);
        ctx.strokeStyle = "rgba(145,70,255,0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        // Label
        if (typeof config !== "undefined") {
            ctx.fillStyle = "rgba(145,70,255,0.95)";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.fillText(config.width + " x " + config.height + "px", 6, sb.maskH - 6);
        }
        ctx.restore();

        // Resize handles
        var corners = [
            { x: sb.maskX,           y: sb.maskY },
            { x: sb.maskX + sb.maskW, y: sb.maskY },
            { x: sb.maskX + sb.maskW, y: sb.maskY + sb.maskH },
            { x: sb.maskX,           y: sb.maskY + sb.maskH }
        ];
        corners.forEach(function (c) {
            ctx.save();
            ctx.fillStyle = "#9146ff";
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });
    }

    function getCanvasPos(e) {
        var rect = sb.canvas.getBoundingClientRect();
        var sx = sb.canvas.width  / rect.width;
        var sy = sb.canvas.height / rect.height;
        return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
    }

    function getHandle(x, y) {
        var THRESH = 14;
        var handles = [
            { id: "nw", x: sb.maskX,           y: sb.maskY },
            { id: "ne", x: sb.maskX + sb.maskW, y: sb.maskY },
            { id: "se", x: sb.maskX + sb.maskW, y: sb.maskY + sb.maskH },
            { id: "sw", x: sb.maskX,            y: sb.maskY + sb.maskH }
        ];
        for (var i = 0; i < handles.length; i++) {
            if (Math.abs(x - handles[i].x) < THRESH && Math.abs(y - handles[i].y) < THRESH) return handles[i].id;
        }
        return null;
    }

    function inside(x, y) {
        return x >= sb.maskX && x <= sb.maskX + sb.maskW && y >= sb.maskY && y <= sb.maskY + sb.maskH;
    }

    function onMouseDown(e) {
        var pos = getCanvasPos(e);
        var handle = getHandle(pos.x, pos.y);
        if (handle) {
            sb.resizing = true; sb.resizeHandle = handle;
            sb.resizeStartX = pos.x; sb.resizeStartY = pos.y;
            sb.resizeStartW = sb.maskW; sb.resizeStartH = sb.maskH;
            sb.resizeStartMX = sb.maskX; sb.resizeStartMY = sb.maskY;
        } else if (inside(pos.x, pos.y)) {
            sb.dragging = true;
            sb.dragOffX = pos.x - sb.maskX; sb.dragOffY = pos.y - sb.maskY;
        }
    }

    function onMouseMove(e) {
        if (!sb.dragging && !sb.resizing) return;
        var pos = getCanvasPos(e);
        if (sb.dragging) {
            sb.maskX = Math.max(0, Math.min(sb.canvas.width  - sb.maskW, pos.x - sb.dragOffX));
            sb.maskY = Math.max(0, Math.min(sb.canvas.height - sb.maskH, pos.y - sb.dragOffY));
        } else {
            var dx = pos.x - sb.resizeStartX;
            var h = sb.resizeHandle;
            var newW = sb.resizeStartW, newH, newX = sb.resizeStartMX, newY = sb.resizeStartMY;
            if (h === "se") { newW = Math.max(60, sb.resizeStartW + dx); }
            if (h === "sw") { newW = Math.max(60, sb.resizeStartW - dx); newX = sb.resizeStartMX + sb.resizeStartW - newW; }
            if (h === "ne") { newW = Math.max(60, sb.resizeStartW + dx); }
            if (h === "nw") { newW = Math.max(60, sb.resizeStartW - dx); newX = sb.resizeStartMX + sb.resizeStartW - newW; }
            newH = newW / sb.aspectRatio;
            if (h === "ne" || h === "nw") { newY = sb.resizeStartMY + sb.resizeStartH - newH; }
            sb.maskW = newW; sb.maskH = newH; sb.maskX = newX; sb.maskY = newY;
        }
        render();
    }

    function onMouseUp() { sb.dragging = false; sb.resizing = false; }

    function onTouchStart(e) { if (e.touches.length !== 1) return; e.preventDefault(); onMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }); }
    function onTouchMove(e) { if (e.touches.length !== 1) return; e.preventDefault(); onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }); }
    function onTouchEnd() { onMouseUp(); }

    document.addEventListener("DOMContentLoaded", init);
})();
