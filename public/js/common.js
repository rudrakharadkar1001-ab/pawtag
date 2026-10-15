/* PetVora shared helpers */
window.PV = (function () {
  var THEMES = {
    beagle:   { name: "Beagle", img: "/img/beagle.jpg", dark: 0,
      v: { bg: "#FFF4E6", bg2: "#F3DDC0", ink: "#2A1A10", soft: "#7a5a43", primary: "#B5651D", pdark: "#6E3A12", accent: "#241812", card: "#FFFFFF", cardink: "#2A1A10", line: "rgba(110,58,18,.18)" },
      about: "Beagles are happy, curious scent hunters. Their nose leads the way, so a Beagle that wanders off is usually just following a smell. Please call my family and I'll be home for treats soon." },
    golden:   { name: "Golden Retriever", img: "/img/golden.jpg", dark: 0,
      v: { bg: "#FFF6D9", bg2: "#F7DF9B", ink: "#4A3108", soft: "#8a6a2a", primary: "#E0A82E", pdark: "#9A6A0C", accent: "#FFF9E8", card: "#FFFDF3", cardink: "#4A3108", line: "rgba(154,106,12,.22)" },
      about: "Golden Retrievers are gentle, friendly and love people. I will happily walk up to strangers, so if you found me, I am not scared of you. I just need my family." },
    labrador: { name: "Labrador", img: "/img/labrador.jpg", dark: 0,
      v: { bg: "#FFF0DC", bg2: "#F2CFA0", ink: "#4B2E14", soft: "#85633f", primary: "#D08C3C", pdark: "#86521A", accent: "#5E6B3A", card: "#FFFAF2", cardink: "#4B2E14", line: "rgba(134,82,26,.22)" },
      about: "Labradors are playful, loyal and full of energy. I love water, food and people. If you found me, a little water and a kind word will keep me calm until my family arrives." },
    shepherd: { name: "German Shepherd", img: "/img/shepherd.jpg", dark: 1,
      v: { bg: "#17110D", bg2: "#2A1D14", ink: "#F5E8D8", soft: "#c9b095", primary: "#D9832F", pdark: "#8A4A14", accent: "#F2B26B", card: "#241A13", cardink: "#F5E8D8", line: "rgba(217,131,47,.28)" },
      about: "German Shepherds are brave, smart and very loyal. I may be a little careful with strangers, so please stay calm, speak softly and call my family." },
    other:    { name: "", img: "/img/petvora_logo.png", dark: 0,
      v: { bg: "#EAF6FF", bg2: "#CDEBF7", ink: "#0B2A5B", soft: "#4a6a92", primary: "#1668C7", pdark: "#0B2A5B", accent: "#14B8A6", card: "#FFFFFF", cardink: "#0B2A5B", line: "rgba(11,42,91,.16)" },
      about: "I am a much-loved family member. If you found me, please stay with me and call my family using the button above." }
  };

  function applyTheme(key) {
    var t = THEMES[key] || THEMES.other, r = document.documentElement.style;
    for (var k in t.v) r.setProperty("--" + k, t.v[k]);
    document.documentElement.setAttribute("data-dark", t.dark ? "1" : "0");
    return t;
  }

  /* ---- age: grows with days automatically ---- */
  function ageFrom(dobStr) {
    var p = dobStr.split("-").map(Number), n = new Date();
    var y = n.getFullYear() - p[0], m = n.getMonth() + 1 - p[1], d = n.getDate() - p[2];
    if (d < 0) { m--; d += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    if (y < 0) { y = 0; m = 0; d = 0; }
    return { y: y, m: m, d: d };
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function ageText(a) {
    var parts = [];
    if (a.y) parts.push(plural(a.y, "year"));
    if (a.m) parts.push(plural(a.m, "month"));
    if (!parts.length) parts.push(plural(a.d, "day"));
    return parts.join(" ");
  }
  function dobFromYM(years, months) {
    var n = new Date(), total = n.getFullYear() * 12 + n.getMonth() - (years * 12 + months);
    var y = Math.floor(total / 12), m = total % 12;
    var dim = new Date(y, m + 1, 0).getDate(), d = Math.min(n.getDate(), dim);
    return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  /* ---- resize photos in the browser so uploads are small and never fail ---- */
  function compress(file, maxSide, quality) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onerror = function () { reject(new Error("read")); };
      fr.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("img")); };
        img.onload = function () {
          var s = Math.min(1, maxSide / Math.max(img.width, img.height));
          var c = document.createElement("canvas");
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", quality));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ---- paw decoration ---- */
  var PAW = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><ellipse cx="32" cy="42" rx="14" ry="11"/><ellipse cx="14" cy="26" rx="6" ry="8" transform="rotate(-20 14 26)"/><ellipse cx="26" cy="17" rx="6" ry="8.5" transform="rotate(-6 26 17)"/><ellipse cx="38" cy="17" rx="6" ry="8.5" transform="rotate(6 38 17)"/><ellipse cx="50" cy="26" rx="6" ry="8" transform="rotate(20 50 26)"/></g></svg>';
  function mountPaws(el, seed, count) {
    var s = 0; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) % 100003;
    function rnd() { s = (s * 16807 + 11) % 2147483647; return s / 2147483647; }
    var h = "";
    for (var j = 0; j < (count || 16); j++) {
      var size = 28 + rnd() * 46;
      h += '<i style="left:' + (rnd() * 94).toFixed(1) + '%;top:' + (rnd() * 96).toFixed(1) + '%;width:' + size.toFixed(0) + 'px;height:' + size.toFixed(0) + 'px;transform:rotate(' + (rnd() * 360 | 0) + 'deg);opacity:' + (0.07 + rnd() * 0.09).toFixed(2) + '">' + PAW + '</i>';
    }
    el.innerHTML = h;
  }

  function telLink(phone) {
    var d = phone.replace(/[^\d+]/g, "");
    if (d.charAt(0) !== "+") { if (d.length === 10) d = "+91" + d; else d = "+" + d; }
    return d;
  }
  function mapLink(r) {
    if (r.lat != null && r.lng != null) return "https://www.google.com/maps/search/?api=1&query=" + r.lat + "," + r.lng;
    if (r.mapLink) return r.mapLink;
    if (r.address) return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(r.address);
    return "";
  }
  return { THEMES: THEMES, applyTheme: applyTheme, ageFrom: ageFrom, ageText: ageText, dobFromYM: dobFromYM, compress: compress, PAW: PAW, mountPaws: mountPaws, telLink: telLink, mapLink: mapLink };
})();
