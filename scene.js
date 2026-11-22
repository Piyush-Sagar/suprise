/* Pixel artwork stays on a fixed grid so every opening frame shares an anchor. */
function drawGiftScene(stage) {
  const ctx = document.querySelector("#scene").getContext("2d");
  const ink = "#29172f";
  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  // Scan-convert the faces into whole pixels, including the diagonal edges.
  function face(color, points) {
    const ys = points.map((p) => p[1]);
    for (let y = Math.min(...ys); y < Math.max(...ys); y++) {
      const hits = [];
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        if (y1 > y + 0.5 !== y2 > y + 0.5) {
          hits.push(x1 + ((y + 0.5 - y1) * (x2 - x1)) / (y2 - y1));
        }
      }
      hits.sort((a, b) => a - b);
      for (let i = 0; i < hits.length; i += 2) {
        const left = Math.round(hits[i]);
        rect(left, y, Math.round(hits[i + 1]) - left, 1, color);
      }
    }
  }
  function twinkle(x, y, size, color) {
    rect(x, y - size, 2, size * 2 + 2, color);
    rect(x - size, y, size * 2 + 2, 2, color);
    if (size > 3) rect(x - 1, y - 1, 4, 4, color);
  }

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(-46, -5);
  ctx.fillStyle = "#efddd8";
  ctx.beginPath();
  ctx.ellipse(145, 184, 42, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  twinkle(72, 94, 3, "#c993ab");
  twinkle(205, 61, 4, "#d3a765");
  twinkle(215, 137, 2, "#c993ab");

  // Magenta paper, cool shadows, and two bands of golden ribbon.
  face(ink, [
    [91, 96],
    [144, 80],
    [196, 96],
    [196, 155],
    [145, 175],
    [91, 155],
  ]);
  face("#f65c9f", [
    [94, 98],
    [145, 115],
    [145, 171],
    [94, 153],
  ]);
  face("#ba357b", [
    [145, 115],
    [193, 97],
    [193, 153],
    [145, 171],
  ]);
  face("#d24987", [
    [95, 103],
    [145, 118],
    [145, 126],
    [95, 109],
  ]);
  face("#8b2a66", [
    [145, 118],
    [193, 102],
    [193, 110],
    [145, 126],
  ]);
  face("#ff8ab4", [
    [96, 112],
    [98, 113],
    [98, 151],
    [96, 150],
  ]);
  face("#ff86b7", [
    [97, 150],
    [144, 166],
    [144, 170],
    [97, 153],
  ]);
  face("#d85191", [
    [146, 167],
    [191, 151],
    [191, 153],
    [146, 170],
  ]);
  for (const [x, y] of [
    [101, 119],
    [133, 136],
    [102, 141],
    [180, 121],
    [152, 151],
    [187, 141],
  ]) {
    twinkle(x, y, 2, x < 145 ? "#ff9dc1" : "#de5a99");
  }
  face("#9b4d59", [
    [113, 107],
    [128, 112],
    [128, 166],
    [113, 161],
  ]);
  face("#ffcb62", [
    [114, 107],
    [125, 111],
    [125, 164],
    [114, 160],
  ]);
  face("#ffea9b", [
    [115, 109],
    [118, 110],
    [118, 161],
    [115, 160],
  ]);
  face("#86415c", [
    [163, 111],
    [179, 105],
    [179, 160],
    [163, 166],
  ]);
  face("#eaa449", [
    [165, 109],
    [177, 105],
    [177, 159],
    [165, 164],
  ]);
  face("#ffd375", [
    [166, 109],
    [169, 108],
    [169, 162],
    [166, 163],
  ]);
  if (stage > 0) {
    face("#fb80af", [
      [91, 96],
      [143, 78],
      [196, 96],
      [145, 115],
    ]);
    face("#53223e", [
      [96, 96],
      [143, 81],
      [190, 96],
      [145, 111],
    ]);
    face("#79324f", [
      [96, 96],
      [143, 81],
      [143, 94],
      [114, 102],
    ]);
  }
  if (stage > 1) {
    twinkle(127, 90, 4, "#fff1a8");
    twinkle(167, 85, 3, "#ffe988");
    if (stage === 3) {
      twinkle(148, 86, 5, "#fff4b8");
      twinkle(183, 78, 3, "#fcd0f3");
    }
  }
  // Lift and tip the entire lid and bow as a single piece.
  ctx.save();
  ctx.translate([0, 0, 4, 12][stage], [0, -7, -17, -32][stage]);
  ctx.translate(145, 94);
  ctx.rotate([0, -0.035, 0.065, 0.13][stage]);
  ctx.translate(-145, -94);
  face(ink, [
    [85, 84],
    [141, 65],
    [201, 83],
    [201, 100],
    [145, 121],
    [85, 101],
  ]);
  face("#ff9cc5", [
    [88, 85],
    [141, 68],
    [198, 84],
    [145, 104],
  ]);
  face("#ff72ac", [
    [88, 87],
    [145, 106],
    [145, 117],
    [88, 98],
  ]);
  face("#cf4485", [
    [145, 106],
    [198, 86],
    [198, 98],
    [145, 117],
  ]);
  face("#ffc7dc", [
    [89, 85],
    [143, 102],
    [143, 105],
    [89, 88],
  ]);
  face("#f98bb4", [
    [146, 103],
    [197, 84],
    [197, 87],
    [146, 106],
  ]);
  face("#ffe598", [
    [106, 79],
    [119, 75],
    [178, 90],
    [164, 96],
  ]);
  face("#ffca5f", [
    [166, 95],
    [179, 90],
    [179, 104],
    [166, 109],
  ]);
  face("#fff1ad", [
    [166, 96],
    [169, 95],
    [169, 108],
    [166, 109],
  ]);
  face("#fff0a7", [
    [111, 94],
    [164, 75],
    [177, 78],
    [125, 98],
  ]);
  face("#ffca5f", [
    [111, 94],
    [125, 99],
    [125, 111],
    [111, 106],
  ]);
  face("#ffe697", [
    [112, 95],
    [115, 96],
    [115, 107],
    [112, 106],
  ]);
  // Folded loops with dark inner faces and bright stepped highlights.
  face(ink, [
    [144, 83],
    [130, 81],
    [116, 76],
    [111, 70],
    [110, 58],
    [113, 52],
    [123, 51],
    [133, 56],
    [141, 66],
    [146, 75],
    [150, 64],
    [160, 54],
    [170, 52],
    [178, 56],
    [181, 63],
    [180, 72],
    [172, 78],
    [154, 84],
  ]);
  face("#f4b650", [
    [141, 78],
    [126, 74],
    [116, 69],
    [114, 61],
    [116, 55],
    [123, 54],
    [132, 60],
    [138, 68],
  ]);
  face("#ffdf81", [
    [115, 58],
    [118, 54],
    [123, 54],
    [132, 60],
    [138, 68],
    [140, 75],
    [135, 70],
    [129, 63],
    [121, 59],
  ]);
  face("#a35a39", [
    [118, 62],
    [126, 65],
    [135, 73],
    [128, 72],
    [120, 69],
  ]);
  face("#ffda76", [
    [148, 77],
    [153, 66],
    [162, 58],
    [170, 55],
    [176, 58],
    [177, 64],
    [175, 70],
    [166, 76],
    [154, 80],
  ]);
  face("#fff0aa", [
    [151, 73],
    [155, 64],
    [163, 57],
    [171, 55],
    [175, 58],
    [167, 59],
    [158, 65],
  ]);
  face("#b8753e", [
    [155, 76],
    [162, 67],
    [170, 62],
    [175, 62],
    [171, 69],
    [165, 72],
  ]);
  face("#f7ba53", [
    [143, 76],
    [150, 75],
    [156, 79],
    [155, 84],
    [146, 88],
    [139, 84],
    [138, 80],
  ]);
  rect(142, 78, 7, 3, "#ffeba2");
  ctx.restore();
  ctx.restore();
}
