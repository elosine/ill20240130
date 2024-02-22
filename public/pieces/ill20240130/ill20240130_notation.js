//#ef NOTES
/*
Make beat guide just quarters
Adjust cursor height
Add Bars and Bar Event

*/
//#endef NOTES

//#ef General Variables
const TEMPO_COLORS = [clr_limeGreen, clr_mustard, clr_brightBlue, clr_brightOrange, clr_lavander, clr_darkRed2, clr_brightGreen, clr_lightGrey, clr_neonMagenta, clr_plum, clr_blueGrey, clr_lightGrey, clr_lightGreen];
//Dimensions
const NOTATION_H = 122;
const GAP_BTWN_NOTATION_LINES = 3;
const VERT_DISTANCE_BETWEEN_LINES = NOTATION_H + GAP_BTWN_NOTATION_LINES;
const NUM_NOTATION_LINES = 4;
const PX_PER_BEAT = 105;
const BEATS_PER_LINE = 9;
const NOTATION_LINE_LENGTH_PX = BEATS_PER_LINE * PX_PER_BEAT;
const TOTAL_NUM_PX_IN_SCORE = NOTATION_LINE_LENGTH_PX * NUM_NOTATION_LINES;
let WORLD_W = NOTATION_LINE_LENGTH_PX;
let WORLD_H = (NOTATION_H * NUM_NOTATION_LINES) + (GAP_BTWN_NOTATION_LINES * (NUM_NOTATION_LINES - 1));
//Timing
const LEADIN_SEC = 0;
const FRAMERATE = 60;
let FRAMECOUNT = -LEADIN_SEC * FRAMERATE;
const MS_PER_FRAME = 1000.0 / FRAMERATE;
let animationIsGo = true;
//Timesync
const TS = timesync.create({
  server: '/timesync',
  interval: 1000
});
//#endef General Variables

//#ef INIT
function init() {
  makeCanvas();
  mkStaffRects();
  drawNotation();
  calcCrvData();
  drawCrvs();
  makeScrollingCursors();
  makeBbs();
  calcScrollingCursor();
  drawBeatLines();
  let ts_Date = new Date(TS.now());
  let tsNowEpochTime_MS = ts_Date.getTime();
  epochTimeOfLastFrame_MS = tsNowEpochTime_MS;
  requestAnimationFrame(animationEngine);
}
//#endef INIT

//#ef Animation Engine
let cumulativeChangeBtwnFrames_MS = 0;
let epochTimeOfLastFrame_MS;

function animationEngine(timestamp) {
  let ts_Date = new Date(TS.now());
  let tsNowEpochTime_MS = ts_Date.getTime();
  cumulativeChangeBtwnFrames_MS += tsNowEpochTime_MS - epochTimeOfLastFrame_MS;
  epochTimeOfLastFrame_MS = tsNowEpochTime_MS;
  while (cumulativeChangeBtwnFrames_MS >= MS_PER_FRAME) {
    if (cumulativeChangeBtwnFrames_MS > (MS_PER_FRAME * FRAMERATE)) cumulativeChangeBtwnFrames_MS = MS_PER_FRAME;
    update();
    FRAMECOUNT++;
    cumulativeChangeBtwnFrames_MS -= MS_PER_FRAME;
  }
  if (animationIsGo) {
    requestAnimationFrame(animationEngine);
  }
}

function update() {
  if (FRAMECOUNT >= 0) {
    updateScrollingCsrs();
    updateBbs();
  }
}
//#endef Animation Engine

//#ef Canvas
let canvas = {};
let panelTitle = "Interactive Looping Line 20240130";
const staffRects = [];
let staffClr = 'white';
let canvasClr = clr_blueGrey;

function makeCanvas() {
  let tPanel = mkPanel({
    w: WORLD_W,
    h: WORLD_H,
    title: panelTitle,
    onwindowresize: true,
    clr: 'none',
    ipos: 'center-top',
  });
  tPanel.content.addEventListener('click', function() {
    document.documentElement.webkitRequestFullScreen({
      navigationUI: 'hide'
    });
    animationIsGo = true;
    requestAnimationFrame(animationEngine);
  });
  canvas['panel'] = tPanel;
  canvas['div'] = tPanel.content;
  let tSvg = mkSVGcontainer({
    canvas: tPanel.content,
    w: WORLD_W,
    h: WORLD_H,
    x: 0,
    y: 0,
  });
  //Change Background Color of svg container tSvg.style.backgroundColor = clr_mustard
  tSvg.style.backgroundColor = canvasClr;
  canvas['svg'] = tSvg;
}

function mkStaffRects() {
  for (var i = 0; i < NUM_NOTATION_LINES; i++) {
    let tRect = mkSvgRect({
      svgContainer: canvas.svg,
      x: 0,
      y: VERT_DISTANCE_BETWEEN_LINES * i,
      w: WORLD_W,
      h: NOTATION_H,
      fill: staffClr,
      stroke: 'yellow',
      strokeW: 0,
      roundR: 0
    });
    staffRects.push(tRect);
  }
}
//#endef Canvas

//#ef Notation
const NOTATION_FILE_NAME_PATH = '/pieces/ill20240130/notationSVGs/';
const NOTATION_FILE_NAME = 'ill20240130_SVG.svg';
const NOTATION_Y = NOTATION_H / 3;
const NOTATION_SVG_W = 3780;
const NOTATION_SVG_H = 58.7;

function drawNotation() {
  for (var i = 0; i < NUM_NOTATION_LINES; i++) {
    let tSvgImage = document.createElementNS(SVG_NS, "image");
    tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', NOTATION_FILE_NAME_PATH + NOTATION_FILE_NAME);
    tSvgImage.setAttributeNS(null, "y", NOTATION_Y + (i * (NOTATION_H + GAP_BTWN_NOTATION_LINES)));
    tSvgImage.setAttributeNS(null, "x", i * -NOTATION_LINE_LENGTH_PX);
    tSvgImage.setAttributeNS(null, "width", NOTATION_SVG_W);
    tSvgImage.setAttributeNS(null, "height", NOTATION_SVG_H);
    tSvgImage.setAttributeNS(null, "visibility", 'visible');
    tSvgImage.setAttributeNS(null, "display", 'yes');
    canvas.svg.appendChild(tSvgImage);
  }
}
//#endef Notation

//#ef Beat Lines
let beatLines = [];

function drawBeatLines() {
  for (var i = 0; i < NUM_NOTATION_LINES; i++) {
    for (var j = 0; j < BEATS_PER_LINE; j++) {
      let tx2 = j * PX_PER_BEAT;
      let y1 = (i * VERT_DISTANCE_BETWEEN_LINES);
      let tBl = mkSvgLine({
        svgContainer: canvas.svg,
        x1: tx2,
        y1: y1,
        x2: tx2,
        y2: y1 + NOTATION_H,
        stroke: 'magenta',
        strokeW: 0.5
      });
      beatLines.push(tBl);
    }
  }
}
//#endef Beat Lines

//#ef Curves
let curves = [];
let curveBars = [];
let crvMargin = 2;
const CRV_IY = crvMargin;
//Curve1 - crv20240131 w-237 h-52
let crvDataArrays = [];

function calcCrvData() {
  let ogCrvData = [{
    normAr: crv20240131,
    w: 237,
    h: NOTATION_H - (crvMargin * 2),
    bt: 5,
    iy: CRV_IY
  }];
  ogCrvData.forEach((crvObj, crvIx) => {
    let td = {};
    let tArCp = deepCopy(crvObj.normAr);
    td['crvPts'] = tArCp;
    td['w'] = crvObj.w;
    td['h'] = crvObj.h;
    let tx = crvObj.bt * PX_PER_BEAT;
    td['x'] = tx;
    let tLineNum = Math.floor(tx / NOTATION_LINE_LENGTH_PX);
    let ty = ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * tLineNum) + CRV_IY;
    td['y'] = ty;
    crvDataArrays.push(td);
  });
}

function drawCrvs() {
  crvDataArrays.forEach((crvObj, crvIx) => {
    //curve rects
    let tRect = mkSvgRect({
      svgContainer: canvas.svg,
      x: crvObj.x - crvMargin,
      y: crvObj.y - crvMargin,
      w: crvObj.w + (crvMargin * 2),
      h: crvObj.h + (crvMargin * 2),
      fill: 'black',
      stroke: clr_limeGreen,
      strokeW: 1,
      roundR: 0
    });
    curveBars.push(tRect);
    let tcrv = mkSvgCrv({
      svgContainer: canvas.svg,
      w: crvObj.w,
      h: crvObj.h,
      x: crvObj.x,
      y: crvObj.y,
      pointsArray: crvObj.crvPts,
      fill: 'none',
      stroke: clr_limeGreen,
      strokeW: 2,
      strokeCap: 'round' //square;round;butt
    })
    curves.push(tcrv);
  });
}
//#endef Curves

//#ef Scrolling Cursors
let scrollingCursors = [];
let scrCsrText = [];
let scrollingCsrY1 = 30;
let scrollingCsrH = 65;
let scrollingCsrClrs = [];
let lineY = [];
//Tempo Timing
let tempos = [
  [60, 60, ''],
  [37.14, 37.14, ''],
  [96.92, 37.14, 'd'],
  [32.3, 86.67, 'a'],
  [86.67, 86.67, '']
];
let totalNumFramesPerTempo = [];
let tempoConsts = [];
tempos.forEach((tempoArr, i) => {
  let td = {};
  //convert initial and final tempi from bpm to pixelsPerFrame
  let iTempo = tempoArr[0]; //bpm
  let fTempo = tempoArr[1]; //bpm
  td['iTempoBPM'] = iTempo;
  td['fTempoBPM'] = fTempo;
  // convert bpm to pxPerFrame: pxPerMinute = iTempo * PX_PER_BEAT; pxPerSec = pxPerMinute/60; pxPerFrame = pxPerSec/FRAMERATE
  let iTempoPxPerFrame = ((iTempo * PX_PER_BEAT) / 60) / FRAMERATE;
  let fTempoPxPerFrame = ((fTempo * PX_PER_BEAT) / 60) / FRAMERATE;
  td['iTempoPxPerFrame'] = iTempoPxPerFrame;
  td['fTempoPxPerFrame'] = fTempoPxPerFrame;
  //calc acceleration from initial tempo and final tempo
  // a = (v2 - u2) / 2s ; v=finalVelocity, u=initialVelocity, s=totalDistance
  let tAccel = (Math.pow(fTempoPxPerFrame, 2) - Math.pow(iTempoPxPerFrame, 2)) / (2 * TOTAL_NUM_PX_IN_SCORE);
  // console.log('tempo ' + i + ' acceleration: ' + tAccel);
  td['accel'] = tAccel;
  // Calculate total number of frames from acceleration and distance
  // t = sqrRoot( (2L/a) ) ; L is total pixels
  let totalDurFrames;
  if (tAccel == 0) {
    totalDurFrames = Math.round(TOTAL_NUM_PX_IN_SCORE / iTempoPxPerFrame);
  } else {
    totalDurFrames = Math.round((fTempoPxPerFrame - iTempoPxPerFrame) / tAccel);
  }
  td['totalDurFrames'] = totalDurFrames;
  tempoConsts.push(td);
});
for (var i = 0; i < NUM_NOTATION_LINES; i++) {
  let ty = scrollingCsrY1 + ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * i);
  lineY.push(ty);
}
tempos.forEach((tempo, tix) => {
  scrollingCsrClrs.push(TEMPO_COLORS[tix % TEMPO_COLORS.length]);
});

function calcScrollingCursor() {
  tempoConsts.forEach((tempoObj, tempoIx) => { //run for each tempo
    let frameArray = [];
    let tNumFrames = Math.round(tempoObj.totalDurFrames); //create an array with and index for each frame in the piece per tempo
    for (var frmIx = 0; frmIx < tNumFrames; frmIx++) { //loop for each frame in the piece
      let td = {}; //dictionary to hold position values
      //Calculate x
      let tCurPx = Math.round((tempoObj.iTempoPxPerFrame * frmIx) + ((tempoObj.accel * Math.pow(frmIx, 2)) / 2));
      td['absX'] = tCurPx;
      let tx = tCurPx % NOTATION_LINE_LENGTH_PX; //calculate cursor x location at each frame for this tempo
      td['x'] = tx;
      //Calc Y pos
      let tLineNum = Math.floor(tCurPx / NOTATION_LINE_LENGTH_PX)
      let ty = scrollingCsrY1 + ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * tLineNum);
      td['y'] = ty;
      frameArray.push(td);
    }
    tempoConsts[tempoIx]['frameArray'] = frameArray;
    totalNumFramesPerTempo.push(frameArray.length);
  });
}

function makeScrollingCursors() {
  for (var i = 0; i < tempos.length; i++) {
    let tCsr = mkSvgLine({
      svgContainer: canvas.svg,
      x1: 0,
      y1: scrollingCsrY1,
      x2: 0,
      y2: scrollingCsrY1 + scrollingCsrH,
      stroke: scrollingCsrClrs[i],
      strokeW: 2
    });
    tCsr.setAttributeNS(null, 'stroke-linecap', 'round');
    tCsr.setAttributeNS(null, 'display', 'yes');
    scrollingCursors.push(tCsr);
    //Cursor Text
    let tTxt = mkSvgText({
      svgContainer: canvas.svg,
      x: 0,
      y: scrollingCsrY1,
      fill: scrollingCsrClrs[i],
      stroke: scrollingCsrClrs[i],
      strokeW: 1,
      justifyH: 'start',
      justifyV: 'auto',
      fontSz: 18,
      fontFamily: 'lato',
      txt: tempos[i][2]
    });
    scrCsrText.push(tTxt);
  }
}

function updateScrollingCsrs(frame, tempoIx) {
  totalNumFramesPerTempo.forEach((numFrames, tempoIx) => {
    let currFrame = FRAMECOUNT % numFrames;
    let tx = tempoConsts[tempoIx].frameArray[currFrame].x;
    let ty = tempoConsts[tempoIx].frameArray[currFrame].y;
    scrollingCursors[tempoIx].setAttributeNS(null, 'x1', tx);
    scrollingCursors[tempoIx].setAttributeNS(null, 'x2', tx);
    scrollingCursors[tempoIx].setAttributeNS(null, 'y1', ty);
    scrollingCursors[tempoIx].setAttributeNS(null, 'y2', ty + scrollingCsrH);
    scrCsrText[tempoIx].setAttributeNS(null, 'x', tx - 5);
    scrCsrText[tempoIx].setAttributeNS(null, 'y', ty - 2);
  });
}
//#endef Scrolling Cursors

//#ef Scrolling Cursor BBs
let BB_RADIUS = 4;
let bbs = [];
// Calculate Ascent and Descent for 1 BB
let bbOneBeat = [];
// let descentPct = 0.6;
let descentPct = 0.8;
let ascentPct = 1 - descentPct;
let ascentNumXpx = Math.ceil(ascentPct * PX_PER_BEAT);
let descentNumXpx = Math.floor(descentPct * PX_PER_BEAT);
// let ascentFactor = 0.45;
let ascentFactor = 0.15;
// let descentFactor = 2.9;
let descentFactor = 5;
let ascentPlot = plot(function(x) { //see Function library; exponential curve
  return Math.pow(x, ascentFactor);
}, [0, 1, 0, 1], ascentNumXpx, scrollingCsrH, scrollingCsrY1);
ascentPlot.forEach((y) => {
  bbOneBeat.push(y);
});
let descentPlot = plot(function(x) {
  return Math.pow(x, descentFactor);
}, [0, 1, 1, 0], descentNumXpx, scrollingCsrH, scrollingCsrY1);
descentPlot.forEach((y) => {
  bbOneBeat.push(y);
});

function makeBbs() {
  for (var i = 0; i < tempos.length; i++) {
    let tBb = mkSvgCircle({
      svgContainer: canvas.svg,
      cx: 0,
      cy: 0,
      r: BB_RADIUS,
      fill: scrollingCsrClrs[i],
      stroke: 'white',
      strokeW: 0
    });
    bbs.push(tBb);
  }
}

function updateBbs(frame, tempoIx) {
  totalNumFramesPerTempo.forEach((numFrames, tempoIx) => {
    let currFrame = FRAMECOUNT % numFrames;
    let tx = tempoConsts[tempoIx].frameArray[currFrame].x;
    let tCurPx = tempoConsts[tempoIx].frameArray[currFrame].absX;
    let tBbX = tCurPx % Math.round(PX_PER_BEAT);
    let bbiy = bbOneBeat[tBbX].y;
    let tLineNum = Math.floor(tCurPx / NOTATION_LINE_LENGTH_PX)
    let ty = bbiy + ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * tLineNum);
    bbs[tempoIx].setAttributeNS(null, 'cx', tx);
    bbs[tempoIx].setAttributeNS(null, 'cy', ty);
  });
}
//#endef Scrolling Cursor BBs


/*
//#ef Loops
function makeLoopCursors() {
  for (var i = 0; i < loops.length; i++) {
    let tCsr = mkSvgLine({
      svgContainer: canvas.svg,
      x1: 0,
      y1: scrollingCsrY1,
      x2: 0,
      y2: scrollingCsrY1 + scrollingCsrH,
      stroke: clr_neonMagenta,
      strokeW: 3
    });
    tCsr.setAttributeNS(null, 'stroke-linecap', 'round');
    tCsr.setAttributeNS(null, 'display', 'yes');
    loopCursors.push(tCsr);
  }
}

function makeLoopBbs() {
  for (var i = 0; i < loops.length; i++) {
    let tBb = mkSvgCircle({
      svgContainer: canvas.svg,
      cx: 0,
      cy: 0,
      r: BB_RADIUS,
      fill: clr_neonMagenta,
      stroke: 'white',
      strokeW: 0
    });
    loopBbs.push(tBb);
  }
}

function makeLoopBrackets() {
  loopsFrameArray.forEach((loopObj, loopIx) => {
    let ty1 = loopObj[0].y;
    let tx1 = loopObj[0].x;
    let tSvgImage = document.createElementNS(SVG_NS, "image");
    tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', NOTATION_FILE_NAME_PATH + 'leftBracket.svg');
    tSvgImage.setAttributeNS(null, "y", ty1 - 15);
    tSvgImage.setAttributeNS(null, "x", tx1 - 2);
    tSvgImage.setAttributeNS(null, "visibility", 'visible');
    tSvgImage.setAttributeNS(null, "display", 'yes');
    canvas.svg.appendChild(tSvgImage);
    let ty2 = loopObj[loopObj.length - 1].y;
    let tx2 = loopObj[loopObj.length - 1].x;
    let tSvgImageR = document.createElementNS(SVG_NS, "image");
    tSvgImageR.setAttributeNS(XLINK_NS, 'xlink:href', NOTATION_FILE_NAME_PATH + 'rightBracket.svg');
    tSvgImageR.setAttributeNS(null, "y", ty2 - 15);
    tSvgImageR.setAttributeNS(null, "x", tx2 - 16);
    tSvgImageR.setAttributeNS(null, "visibility", 'visible');
    tSvgImageR.setAttributeNS(null, "display", 'yes');
    canvas.svg.appendChild(tSvgImageR);
  });
}

function updateLoops(frame, loopIx) {
  let tx = loopsFrameArray[loopIx][frame].x;
  let ty = loopsFrameArray[loopIx][frame].y;
  loopCursors[loopIx].setAttributeNS(null, 'x1', tx);
  loopCursors[loopIx].setAttributeNS(null, 'x2', tx);
  loopCursors[loopIx].setAttributeNS(null, 'y1', ty);
  loopCursors[loopIx].setAttributeNS(null, 'y2', ty + scrollingCsrH);
  //bbs
  let tbx = loopsFrameArray[loopIx][frame].x;
  let tby = loopsFrameArray[loopIx][frame].bby;
  loopBbs[loopIx].setAttributeNS(null, 'cx', tbx);
  loopBbs[loopIx].setAttributeNS(null, 'cy', tby);
}
//#endef Loops

*/




//
