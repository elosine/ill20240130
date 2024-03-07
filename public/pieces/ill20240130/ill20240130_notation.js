//#ef NOTES
/*

Make loop brackets longer and skinnier
choose tempi
choose loops

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

  calcScrollingCursor();
  calcLoopsData();
  calcLoopsFrameArray();
  makeCanvas();
  mkStaffRects();
  calcCrvData();
  drawCrvs();
  drawNotation();
  calcBars();
  drawBars();
  makeLoopBrackets();
  makeLoopCursors();
  makeLoopBbs();
  makeScrollingCursors();
  makeBbs();
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
    updateLoops();
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
const NOTATION_Y = NOTATION_H / 6;
const NOTATION_SVG_W = 3780;
const NOTATION_SVG_H = 99.75;

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
const CRV_IY = 25;
const CRV_H = 84;
//Curve1 - crv20240131 w-237 h-52
let crvDataArrays = [];

function calcCrvData() {
  let ogCrvData = [{
    normAr: crv20240131,
    w: 3 * PX_PER_BEAT,
    h: CRV_H,
    bt: 5,
    iy: CRV_IY
  }, {
    normAr: crv20240224,
    w: 5 * PX_PER_BEAT,
    h: CRV_H,
    bt: 31,
    iy: CRV_IY
  }];
  ogCrvData.forEach((crvObj, crvIx) => {
    let td = {};
    let tArCp = deepCopy(crvObj.normAr);
    td['crvPts'] = tArCp;
    td['w'] = crvObj.w;
    td['h'] = crvObj.h;
    let tx = crvObj.bt * PX_PER_BEAT;
    td['x'] = Math.round(tx) % NOTATION_LINE_LENGTH_PX;
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
      x: crvObj.x,
      y: crvObj.y,
      w: crvObj.w,
      h: crvObj.h,
      fill: 'black',
      stroke: clr_limeGreen,
      strokeW: 0,
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
      strokeW: 3,
      strokeCap: 'round' //square;round;butt
    })
    curves.push(tcrv);
  });
}
//#endef Curves

//#ef Scrolling Cursors
let scrollingCursors = [];
let scrCsrText = [];
let scrollingCsrY1 = 5;
let scrollingCsrH = NOTATION_H - 10;
let scrollingCsrClrs = [];
let lineY = [];
//Tempo Timing
let tempos = [
  [60, 60, ''],
  [83, 83, ''],
  [111, 37.14, 'd'],
  [29, 99, 'a'],
  [47, 47, ''],
  [66, 66, ''],
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
      x: -19,
      y: scrollingCsrY1 + 11,
      fill: scrollingCsrClrs[i],
      stroke: scrollingCsrClrs[i],
      strokeW: 1,
      justifyH: 'start',
      justifyV: 'auto',
      fontSz: 14,
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
    scrCsrText[tempoIx].setAttributeNS(null, 'x', tx - 12);
    scrCsrText[tempoIx].setAttributeNS(null, 'y', ty + 11);
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

//#ef Bars
let barY = 7;
let barH = 25;
let bars = [];
const BAR_CLRS = [clr_limeGreen, clr_mustard, clr_brightBlue, clr_neonMagenta];

let barsTiming = [{
    startbt: 12,
    endbt: 14.5,
    motivenum: 3
  },
  {
    startbt: 19,
    endbt: 22,
    motivenum: 2
  }
];

function calcBars() {
  barsTiming.forEach((barObj, barIx) => {
    //find line number for start and end
    let tleftXAbs = barObj.startbt * PX_PER_BEAT;
    let tleftX = Math.round(tleftXAbs) % Math.round(NOTATION_LINE_LENGTH_PX);
    let tleftLineNum = Math.floor(tleftXAbs / NOTATION_LINE_LENGTH_PX);
    let trightXAbs = barObj.endbt * PX_PER_BEAT;
    let trightX = Math.round(trightXAbs) % Math.round(NOTATION_LINE_LENGTH_PX);
    let trightLineNum = Math.floor(trightXAbs / NOTATION_LINE_LENGTH_PX);
    barsTiming[barIx]['absXStart'] = tleftXAbs;
    barsTiming[barIx]['absXEnd'] = trightXAbs;
    //if linenums are not equal start at x=0 to right beat
    let tbar = [];
    if (tleftLineNum == trightLineNum) {
      let td = {};
      let tx = tleftX;
      let tw = trightX - tleftX;
      let ty = barY + ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * tleftLineNum);
      td['x'] = tx;
      td['y'] = ty;
      td['w'] = tw;
      tbar.push(td);
      barsTiming[barIx]['barMeasurements'] = tbar;
    } else { //if bar spills to next line
      let td1 = {};
      let tx1 = tleftX;
      let tw1 = WORLD_W - tleftX;
      let ty1 = barY + ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * tleftLineNum);
      td1['x'] = tx1;
      td1['y'] = ty1;
      td1['w'] = tw1;
      tbar.push(td1);
      let td2 = {};
      let tx2 = 0;
      let tw2 = trightX;
      let ty2 = barY + ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * trightLineNum);
      td2['x'] = tx2;
      td2['y'] = ty2;
      td2['w'] = tw2;
      tbar.push(td2);
      barsTiming[barIx]['barMeasurements'] = tbar;
    }
  });
}

function drawBars() {
  barsTiming.forEach((bObj, bIx) => {
    let tbr = [];
    let tMar = bObj.barMeasurements;
    for (var i = 0; i < tMar.length; i++) {
      let tmeas = tMar[i];
      let tBar = mkSvgRect({
        svgContainer: canvas.svg,
        x: tmeas.x,
        y: tmeas.y,
        w: tmeas.w,
        h: barH,
        fill: BAR_CLRS[bObj.motivenum],
        stroke: 'none',
        strokeW: 0,
        roundR: 0
      });
      tBar.setAttributeNS(null, 'display', 'yes');
      tbr.push(tBar);
      bars.push(tbr);
    }
  });
}
//#endef Bars

//#ef Loops
//Loops
let totalNumFramesPerLoop = [];
let loops = [{
  beatA: 9,
  beatB: 14,
  tempoIx: 1
  // }, {
  //   beatA: 48,
  //   beatB: 54,
  //   tempoIx: 2
  // }, {
  //   beatA: 72,
  //   beatB: 90,
  //   tempoIx: 3
  // }, {
  //   beatA: 99,
  //   beatB: 117,
  //   tempoIx: 2
}];
loops.forEach((loopObj, loopIx) => {
  let tLenPx = (loopObj.beatB - loopObj.beatA) * PX_PER_BEAT;
  loops[loopIx]['lenPx'] = tLenPx;
  let tpixa = (loopObj.beatA % BEATS_PER_LINE) * PX_PER_BEAT;
  loops[loopIx]['beatApxX'] = tpixa;
});
let loopCursors = [];
let loopsFrameArray = [];
let loopClr = 'yellow';
let loopCrvFollowers = [];
let loopBbs = [];


function calcLoopsData() {
  for (let loopIx = 0; loopIx < loops.length; loopIx++) {
    let tLoopObj = loops[loopIx];
    //Which pixel does the first beat of loop occur on?
    let tBeatApx = tLoopObj.beatA * PX_PER_BEAT;
    let tBeatBpx = tLoopObj.beatB * PX_PER_BEAT;
    // find the frame this pixel is in for the assigned tempo
    let tB1Frame, tB2Frame;
    for (let frmIx = 1; frmIx < tempoConsts[tLoopObj.tempoIx].frameArray.length; frmIx++) {
      let tThisX = tempoConsts[tLoopObj.tempoIx].frameArray[frmIx].absX;
      let tLastX = tempoConsts[tLoopObj.tempoIx].frameArray[frmIx - 1].absX;
      if (tBeatApx >= tLastX && tBeatApx < tThisX) {
        tB1Frame = frmIx - 1;
        loops[loopIx]['frameA'] = tB1Frame;
      }
      if (tBeatBpx >= tLastX && tBeatBpx < tThisX) {
        tB2Frame = frmIx - 1;
        loops[loopIx]['frameB'] = tB2Frame;
      }
    }
    let tNumFramesInLoop = tB2Frame - tB1Frame;
    loops[loopIx]['numFrames'] = tNumFramesInLoop;
    totalNumFramesPerLoop.push(tNumFramesInLoop);
  }

}

function calcLoopsFrameArray() {
  loops.forEach((lpObj, lpIx) => {
    let tempoFrameArray = tempoConsts[lpObj.tempoIx].frameArray;
    let tNumFrames = lpObj.numFrames;
    let tfrmArray = [];
    for (var frmIx = 0; frmIx < tNumFrames; frmIx++) {
      let td = {};
      let tIx = frmIx + lpObj.frameA;
      td['x'] = tempoFrameArray[tIx].x;
      td['y'] = tempoFrameArray[tIx].y;
      tfrmArray.push(td);
    }
    loopsFrameArray.push(tfrmArray);
  });
}

function makeLoopCursors() {
  for (var i = 0; i < loops.length; i++) {
    let tCsr = mkSvgLine({
      svgContainer: canvas.svg,
      x1: 0,
      y1: scrollingCsrY1,
      x2: 0,
      y2: scrollingCsrY1 + scrollingCsrH,
      stroke: loopClr,
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
      fill: 'yellow',
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
    tSvgImage.setAttributeNS(null, "y", ty1 - 6);
    tSvgImage.setAttributeNS(null, "x", tx1);
    tSvgImage.setAttributeNS(null, "visibility", 'visible');
    tSvgImage.setAttributeNS(null, "display", 'yes');
    canvas.svg.appendChild(tSvgImage);
    let ty2 = loopObj[loopObj.length - 1].y - 6;
    let tx2 = loopObj[loopObj.length - 1].x;
    let tSvgImageR = document.createElementNS(SVG_NS, "image");
    tSvgImageR.setAttributeNS(XLINK_NS, 'xlink:href', NOTATION_FILE_NAME_PATH + 'rightBracket.svg');
    tSvgImageR.setAttributeNS(null, "y", ty2);
    tSvgImageR.setAttributeNS(null, "x", tx2);
    tSvgImageR.setAttributeNS(null, "visibility", 'visible');
    tSvgImageR.setAttributeNS(null, "display", 'yes');
    canvas.svg.appendChild(tSvgImageR);
  });
}

function updateLoops() {
  totalNumFramesPerLoop.forEach((numFrames, loopIx) => {
    let currFrame = FRAMECOUNT % numFrames;
    let tx = loopsFrameArray[loopIx][currFrame].x;
    let ty = loopsFrameArray[loopIx][currFrame].y;
    loopCursors[loopIx].setAttributeNS(null, 'x1', tx);
    loopCursors[loopIx].setAttributeNS(null, 'x2', tx);
    loopCursors[loopIx].setAttributeNS(null, 'y1', ty);
    loopCursors[loopIx].setAttributeNS(null, 'y2', ty + scrollingCsrH);
    //bbs
    let tBbX = tx % Math.round(PX_PER_BEAT);
    let bbiy = bbOneBeat[tBbX].y;
    let tbby = bbiy + ty;
    loopBbs[loopIx].setAttributeNS(null, 'cx', tx);
    loopBbs[loopIx].setAttributeNS(null, 'cy', tbby);
  });
}
//#endef Loops

/*
//#ef Squares
let squareTimingFramesPerTempo = [];
let numSqrs = 4;
let sqrH = ((NOTATION_H*0.75)-5) /numSqrs;
let sqrW = 11;
let squares = [];

function calcSquareTimes() {
  tempoConsts.forEach((tempoObj, tempoIx) => { //run for each tempo
    let frameArray = [];
    let tNumFrames = tempoObj.totalDurFrames;
    for (var frmIx = 0; frmIx < tNumFrames; frmIx++) {
      let tmotiveAr = [];
      for (var j = 0; j < 4; j++) {
        let td = {};
        let tiy = tempoConsts[tempoIx].frameArray[frmIx].y;
        td['y'] = tiy + NOTATION_H - (sqrH * (j + 1)) - 2;
        td['oly'] = tiy + NOTATION_H - (sqrH * (j + 1)) - 2;
        td['h'] = sqrH;
        tmotiveAr.push(td);
      }
      frameArray.push(tmotiveAr);
    }
    barsTiming.forEach((barObj, barIx) => {
      let tStartX = barObj.absXStart;
      let tEndX = barObj.absXEnd;
      let tMotiveNum = barObj.motivenum;
      let tStartFrm, tEndFrm;
      for (var frmIx = 1; frmIx < tempoObj.frameArray.length; frmIx++) {
        let tThisFrmX = tempoObj.frameArray[frmIx].absX;
        let tLastFrmX = tempoObj.frameArray[frmIx - 1].absX;
        if (tStartX <= tThisFrmX && tStartX >= tLastFrmX) {
          tStartFrm = frmIx;
        }
        if (tEndX <= tThisFrmX && tEndX >= tLastFrmX) {
          tEndFrm = frmIx;
        }
      }
      let tNumFrmsThisBar = tEndFrm - tStartFrm;
      let tSqrInc = sqrH / tNumFrmsThisBar;
      for (var i = 0; i < tNumFrmsThisBar; i++) {
        let tiy = tempoObj.frameArray[i + tStartFrm].y + NOTATION_H - 2 - (sqrH * tMotiveNum);
        frameArray[i + tStartFrm][tMotiveNum]['h'] = tSqrInc * i;
        frameArray[i + tStartFrm][tMotiveNum]['y'] = tiy - (tSqrInc * i);
      }
    });
    squareTimingFramesPerTempo.push(frameArray);
  });
}

function mkSquares() {
  for (var j = 0; j < tempos.length; j++) {
    let tsqar = [];
    for (var i = 0; i < 4; i++) {
      let td = {};
      let tRect = mkSvgRect({
        svgContainer: canvas.svg,
        x: -sqrW,
        y: NOTATION_H - (sqrH * (i + 1)) - 2,
        w: sqrW,
        h: sqrH,
        fill: BAR_CLRS[i],
        stroke: BAR_CLRS[i],
        strokeW: 2,
        roundR: 0
      });
      let tOutline = mkSvgRect({
        svgContainer: canvas.svg,
        x: -sqrW,
        y: NOTATION_H - (sqrH * (i + 1)) - 2,
        w: sqrW + 2,
        h: sqrH,
        fill: 'none',
        stroke: BAR_CLRS[i],
        strokeW: 1,
        roundR: 0
      });
      td['sqr'] = tRect;
      td['ol'] = tOutline;
      tsqar.push(td);
    }
    squares.push(tsqar);
  }
}

function updateSquares() {
  totalNumFramesPerTempo.forEach((numFrames, tempoIx) => {
    let currFrame = FRAMECOUNT % numFrames;
    let tx = tempoConsts[tempoIx].frameArray[currFrame].x - sqrW - 1;
    for (var i = 0; i < 4; i++) {
      let ty = squareTimingFramesPerTempo[tempoIx][currFrame][i].y;
      let th = squareTimingFramesPerTempo[tempoIx][currFrame][i].h;
      let toly = squareTimingFramesPerTempo[tempoIx][currFrame][i].oly;
      squares[tempoIx][i].sqr.setAttributeNS(null, 'x', tx);
      squares[tempoIx][i].sqr.setAttributeNS(null, 'y', ty);
      squares[tempoIx][i].sqr.setAttributeNS(null, 'height', th);
      squares[tempoIx][i].ol.setAttributeNS(null, 'x', tx - 1);
      squares[tempoIx][i].ol.setAttributeNS(null, 'y', toly);
    }
  });
}
//#endef Squares
*/




//
