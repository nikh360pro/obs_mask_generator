/**
 * Stream Pack Generator
 * Multi-step wizard: configure 3 masks (Gaming, Just Chatting, Portrait)
 * then download all 3 as a ZIP using JSZip.
 */

(function () {
    "use strict";

    var STEPS = [
        { id: "gaming",   label: "Gaming",         width: 1920, height: 1080, shape: "rectangle", cornerRadius: 8,  aspectRatio: "16:9", icon: "??" },
        { id: "chatting", label: "Just Chatting",  width: 800,  height: 800,  shape: "ellipse",   cornerRadius: 0,  aspectRatio: "1:1",  icon: "??" },
        { id: "portrait", label: "Portrait 9:16",  width: 1080, height: 1920, shape: "rectangle", cornerRadius: 10, aspectRatio: "9:16", icon: "??" }
    ];

    var packCfg = STEPS.map(function (s) {
        return Object.assign({
            polygonSides: 6, squircleCurvature: 3.5, starPoints: 5, starDepth: 50,
            rotation: 0, feathering: 0, inverted: false,
            borderEnabled: false, borderColor: "#9146ff", borderThickness: 4,
            independentCorners: false, cornerRadiusTL: 8, cornerRadiusTR: 8,
            cornerRadiusBR: 8, cornerRadiusBL: 8
        }, s);
    });

    var currentStep = 0;
    var miniCtx;
    var miniCanvas;

    function init() {
        var openBtn = document.getElementById("pack-open-btn");
        var modal   = document.getElementById("pack-wizard-modal");
        var closeBtn = document.getElementById("pack-close-btn");
        var downloadBtn = document.getElementById("pack-download-btn");
        miniCanvas = document.getElementById("pack-mini-canvas");
        miniCtx    = miniCanvas ? miniCanvas.getContext("2d") : null;

        if (!openBtn || !modal) return;

        openBtn.addEventListener("click", function () {
            currentStep = 0;
            renderStep();
            modal.classList.remove("hidden");
            modal.classList.add("pack-wizard-visible");
        });

        closeBtn.addEventListener("click", function () {
            modal.classList.add("hidden");
            modal.classList.remove("pack-wizard-visible");
        });

        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                modal.classList.add("hidden");
                modal.classList.remove("pack-wizard-visible");
            }
        });

        document.getElementById("pack-prev-btn").addEventListener("click", function () {
            if (currentStep > 0) { currentStep--; renderStep(); }
        });

        document.getElementById("pack-next-btn").addEventListener("click", function () {
            if (currentStep < STEPS.length - 1) { currentStep++; renderStep(); }
        });

        downloadBtn.addEventListener("click", downloadPack);

        // Bind controls
        bindControls();
    }

    function renderStep() {
        var s = STEPS[currentStep];
        var cfg = packCfg[currentStep];

        // Stepper UI
        document.querySelectorAll(".pack-step-dot").forEach(function (dot, i) {
            if (i < currentStep) {
                dot.style.background = "#00f593"; dot.style.color = "#000";
            } else if (i === currentStep) {
                dot.style.background = "#9146ff"; dot.style.color = "#fff";
            } else {
                dot.style.background = "#2f2f35"; dot.style.color = "#848494";
            }
        });

        // Step title/label
        var titleEl = document.getElementById("pack-step-title");
        if (titleEl) titleEl.textContent = s.icon + " " + s.label;

        var subEl = document.getElementById("pack-step-sub");
        if (subEl) subEl.textContent = (currentStep + 1) + " of " + STEPS.length;

        // Sync controls to current step config
        syncControlsToStep(cfg);

        // Prev/Next
        document.getElementById("pack-prev-btn").disabled = currentStep === 0;
        document.getElementById("pack-next-btn").classList.toggle("hidden", currentStep === STEPS.length - 1);
        document.getElementById("pack-download-btn").classList.toggle("hidden", currentStep !== STEPS.length - 1);

        // Mini preview
        renderMini();
    }

    function syncControlsToStep(cfg) {
        var fields = ["pack-shape", "pack-width", "pack-height", "pack-corner", "pack-rotation"];
        var vals   = [cfg.shape, cfg.width, cfg.height, cfg.cornerRadius, cfg.rotation];
        fields.forEach(function (id, i) {
            var el = document.getElementById(id);
            if (el) el.value = vals[i];
        });

        // Shape btns
        document.querySelectorAll(".pack-shape-btn").forEach(function (btn) {
            var isActive = btn.dataset.shape === cfg.shape;
            btn.style.borderColor = isActive ? "#9146ff" : "#2f2f35";
            btn.style.background  = isActive ? "rgba(145,70,255,0.15)" : "#26262c";
            btn.style.color       = isActive ? "#9146ff" : "#adadb8";
        });
    }

    function renderMini() {
        if (!miniCanvas || !miniCtx) return;
        var cfg = packCfg[currentStep];
        var W = miniCanvas.width;
        var H = miniCanvas.height;

        // Scale config dimensions to fit mini canvas preserving aspect ratio
        var ar = cfg.width / cfg.height;
        var mW = W, mH = H;
        if (ar > W / H) { mH = Math.round(W / ar); } else { mW = Math.round(H * ar); }
        var offX = Math.round((W - mW) / 2);
        var offY = Math.round((H - mH) / 2);

        miniCtx.clearRect(0, 0, W, H);
        // Checkerboard
        for (var row = 0; row < H; row += 12) {
            for (var col = 0; col < W; col += 12) {
                miniCtx.fillStyle = ((row + col) / 12 % 2 === 0) ? "#2a2a2e" : "#1f1f23";
                miniCtx.fillRect(col, row, 12, 12);
            }
        }

        // Background (black)
        miniCtx.fillStyle = cfg.inverted ? "#ffffff" : "#000000";
        miniCtx.fillRect(offX, offY, mW, mH);

        // Shape (white fill)
        miniCtx.save();
        miniCtx.translate(offX, offY);
        miniCtx.fillStyle = cfg.inverted ? "#000000" : "#ffffff";
        miniCtx.beginPath();
        drawShapeToContext(miniCtx, cfg, mW, mH, 0);
        miniCtx.fill();
        miniCtx.restore();
    }

    function bindControls() {
        // Shape buttons
        document.querySelectorAll(".pack-shape-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                packCfg[currentStep].shape = btn.dataset.shape;
                document.querySelectorAll(".pack-shape-btn").forEach(function (b) {
                b.style.borderColor = "#2f2f35"; b.style.background = "#26262c"; b.style.color = "#adadb8";
            });
            btn.style.borderColor = "#9146ff"; btn.style.background = "rgba(145,70,255,0.15)"; btn.style.color = "#9146ff";
                renderMini();
            });
        });

        ["pack-width", "pack-height"].forEach(function (id, i) {
            var el = document.getElementById(id);
            if (!el) return;
            el.addEventListener("input", function () {
                var v = parseInt(el.value) || (i === 0 ? 1920 : 1080);
                if (i === 0) packCfg[currentStep].width  = v;
                else         packCfg[currentStep].height = v;
                renderMini();
            });
        });

        var cornerEl = document.getElementById("pack-corner");
        if (cornerEl) {
            cornerEl.addEventListener("input", function () {
                packCfg[currentStep].cornerRadius = parseInt(cornerEl.value) || 0;
                var vEl = document.getElementById("pack-corner-value");
                if (vEl) vEl.textContent = cornerEl.value + "%";
                renderMini();
            });
        }

        var rotEl = document.getElementById("pack-rotation");
        if (rotEl) {
            rotEl.addEventListener("input", function () {
                packCfg[currentStep].rotation = parseInt(rotEl.value) || 0;
                var vEl = document.getElementById("pack-rotation-value");
                if (vEl) vEl.textContent = rotEl.value + "deg";
                renderMini();
            });
        }
    }

    function generateMaskCanvas(cfg) {
        var c = document.createElement("canvas");
        c.width  = cfg.width;
        c.height = cfg.height;
        var ctx = c.getContext("2d");

        ctx.fillStyle = cfg.inverted ? "#ffffff" : "#000000";
        ctx.fillRect(0, 0, cfg.width, cfg.height);

        ctx.save();
        ctx.translate(cfg.width / 2, cfg.height / 2);
        ctx.rotate((cfg.rotation * Math.PI) / 180);
        ctx.translate(-cfg.width / 2, -cfg.height / 2);
        ctx.fillStyle = cfg.inverted ? "#000000" : "#ffffff";
        ctx.beginPath();
        drawShapeToContext(ctx, cfg, cfg.width, cfg.height, 0);
        ctx.fill();
        ctx.restore();

        return c;
    }

    function canvasToBlob(canvas) {
        return new Promise(function (resolve) {
            canvas.toBlob(function (blob) { resolve(blob); }, "image/png");
        });
    }

    function downloadPack() {
        var btn = document.getElementById("pack-download-btn");
        btn.textContent = "? Generating...";
        btn.disabled = true;

        // Load JSZip lazily
        if (typeof JSZip === "undefined") {
            var script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
            script.onload = function () { doZipDownload(btn); };
            document.head.appendChild(script);
        } else {
            doZipDownload(btn);
        }
    }

    function doZipDownload(btn) {
        var zip = new JSZip();
        var folder = zip.folder("StreamPack");
        var promises = packCfg.map(function (cfg, i) {
            var canvas = generateMaskCanvas(cfg);
            return canvasToBlob(canvas).then(function (blob) {
                var name = "OBS_Mask_" + STEPS[i].label.replace(/\s+/g, "_") + "_" + cfg.width + "x" + cfg.height + ".png";
                folder.file(name, blob);
            });
        });

        Promise.all(promises).then(function () {
            return zip.generateAsync({ type: "blob" });
        }).then(function (content) {
            var url = URL.createObjectURL(content);
            var a = document.createElement("a");
            a.href = url;
            a.download = "StreamPack_OBS_Masks.zip";
            a.click();
            URL.revokeObjectURL(url);
            btn.textContent = "? Downloaded!";
            btn.disabled = false;
            setTimeout(function () { btn.textContent = "? Download All as ZIP"; }, 3000);
        });
    }

    document.addEventListener("DOMContentLoaded", init);
})();



