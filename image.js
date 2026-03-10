(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  function __accessProp(key) {
    return this[key];
  }
  var __toCommonJS = (from) => {
    var entry = (__moduleCache ??= new WeakMap).get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function") {
      for (var key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(entry, key))
          __defProp(entry, key, {
            get: __accessProp.bind(from, key),
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
          });
    }
    __moduleCache.set(from, entry);
    return entry;
  };
  var __moduleCache;
  var __returnValue = (v) => v;
  function __exportSetter(name, newValue) {
    this[name] = __returnValue.bind(null, newValue);
  }
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: __exportSetter.bind(all, name)
      });
  };

  // src/image.ts
  var exports_image = {};
  __export(exports_image, {
    getAccentColorFromImage: () => getAccentColorFromImage
  });

  // public/img/start.jpg
  var start_default = "./start-vqpv6c77.jpg";

  // src/image.ts
  var ACCENT_COLOR = "#15803d";
  var canvas_image = document.getElementById("canvas-image");
  var image = new Image;
  function getAccentColorFromImage(onAccent) {
    if (!canvas_image)
      return;
    const ctx = canvas_image.getContext("2d");
    const width = canvas_image.clientWidth;
    const height = canvas_image.clientHeight;
    canvas_image.width = width;
    canvas_image.height = height;
    if (!ctx)
      return;
    image.onload = () => {
      window.addEventListener("resize", resizeImage);
      ctx.drawImage(image, 0, 0, width, height);
      const { accent_rgb, bg_rgb } = get_avg_color(start_default);
      ACCENT_COLOR = rgbToHex(accent_rgb);
      onAccent(ACCENT_COLOR);
      document.querySelectorAll("a").forEach((item) => {
        item.style.color = `rgb(${accent_rgb.r},${accent_rgb.g},${accent_rgb.b})`;
      });
      document.querySelector("body").style.backgroundColor = `rgb(${bg_rgb.r},${bg_rgb.g},${bg_rgb.b})`;
    };
    image.src = start_default;
  }
  function get_avg_color(image2) {
    let i = -4;
    let blockSize = 5;
    let totalWeight = 0;
    let weightedR = 0, weightedG = 0, weightedB = 0;
    var bg_rgb = { r: 0, g: 0, b: 0 };
    let bestSaturation = 0;
    let length = image2.data.length;
    while ((i += blockSize * 4) < length) {
      const r = image2.data[i];
      const g = image2.data[i + 1];
      const b = image2.data[i + 2];
      if (r < 30 && g < 30 && b < 30)
        continue;
      if (r > 225 && g > 225 && b > 225)
        continue;
      const weight = getSaturation(r, g, b);
      if (weight < 0.1)
        continue;
      weightedR += r * weight;
      weightedG += g * weight;
      weightedB += b * weight;
      totalWeight += weight;
      if (weight > bestSaturation) {
        bestSaturation = weight;
        bg_rgb = { r, g, b };
      }
    }
    const accent_rgb = {
      r: Math.floor(weightedR / totalWeight),
      g: Math.floor(weightedG / totalWeight),
      b: Math.floor(weightedB / totalWeight)
    };
    return { accent_rgb, bg_rgb };
  }
  function getSaturation(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;
    if (max === 0)
      return 0;
    return delta / max;
  }
  function resizeImage() {
    let width = canvas_image.clientWidth;
    let height = canvas_image.clientHeight;
    canvas_image.height = height;
    canvas_image.width = width;
    console.log("test");
    canvas_image.getContext("2d")?.drawImage(image, 0, 0, width, height);
  }
  function rgbToHex({ r, g, b }) {
    const hr = r.toString(16).padStart(2, "0");
    const hg = g.toString(16).padStart(2, "0");
    const hb = b.toString(16).padStart(2, "0");
    return `#${hr}${hg}${hb}`;
  }
})();
