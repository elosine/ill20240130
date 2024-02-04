//#ef NOTES
/*
bar under curve with its own builtin curve follower make local
Separate out barlines and draw over other notations
*/
//#endef NOTES

//#ef General Variables
const TEMPO_COLORS = [clr_limeGreen, clr_mustard, clr_brightBlue, clr_brightOrange, clr_lavander, clr_darkRed2, clr_brightGreen, clr_lightGrey, clr_neonMagenta, clr_plum, clr_blueGrey, clr_lightGrey, clr_lightGreen];
//Dimensions
const NOTATION_H = 162;
const GAP_BTWN_NOTATION_LINES = 3;
const VERT_DISTANCE_BETWEEN_LINES = NOTATION_H + GAP_BTWN_NOTATION_LINES;
const NUM_NOTATION_LINES = 3;
let WORLD_W = 948;
let WORLD_H = (NOTATION_H * NUM_NOTATION_LINES) + (GAP_BTWN_NOTATION_LINES * (NUM_NOTATION_LINES - 1));
const NOTATION_LINE_LENGTH_PX = WORLD_W;
//Timing
const LEADIN_SEC = 0;
const FRAMERATE = 60;
let FRAMECOUNT = -LEADIN_SEC * FRAMERATE;
const MS_PER_FRAME = 1000.0 / FRAMERATE;
const PX_PER_BEAT = 79;
const PX_PER_SEC = 79;
const TOTAL_NUM_PX_IN_SCORE = NOTATION_LINE_LENGTH_PX * NUM_NOTATION_LINES;
const BEATS_PER_LINE = WORLD_W / PX_PER_BEAT;
let animationIsGo = false;
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
  console.log(crvDataArrays);

  drawCrvs();
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
const NOTATION_FILE_NAME = 'beatGuide_12btPerLine_948pxWide_3Lines_79pxPerBt_2844px.svg';
const NOTATION_Y = NOTATION_H / 3;
const NOTATION_SVG_W = 2844;
const NOTATION_SVG_H = 66.5;
let beatLines = [];

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
    //Beat Lines
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
//#endef Notation


//#ef Curves
let normalizedCurveArray = [];
let curveCoordsByFramePerTempo = [];
const CRVFOLLOW_R = 4;
let crvFollowers = [];
let curves = [];
let curveBars = [];
let crvMargin = 2;
const CRV_IY = 0;
//Curve1 - crv20240131 w-237 h-52
let crvDataArrays = [];

function calcCrvData() {
  let ogCrvData = [{
    normAr: crv20240131,
    w: 237,
    h: 52,
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

function calcCrvAnimation() {
  tempoConsts.forEach((tempoObj, tempoIx) => { //for each tempo
    crvDataArrays.forEach((crvObj, crvIx) => { //for each curve
      let tCrvPtsAr = crvObj.crvPts;
      let tFrmAr = tempoObj.frameArray;
      let tCrvPtsThisTempo = [];
      tFrmAr.forEach((frmObj, frmIx) => {



        let td = {};
        td['x'] = frmObj.x;
        let tx0 = frmObj.absX;
        let tLineNum = Math.floor(tx0 / NOTATION_LINE_LENGTH_PX);
        let ty2 = (NOTATION_H / 2) + ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * tLineNum);
        for (var i = 1; i < normalizedCurveArray.length; i++) {
          let tx1 = normalizedCurveArray[i - 1].x;
          let tx2 = normalizedCurveArray[i].x;
          if (tx0 <= tx2 && tx0 > tx1) {
            ty2 = normalizedCurveArray[i].y + ((NOTATION_H + GAP_BTWN_NOTATION_LINES) * tLineNum);
          }
        }
        td['y'] = ty2
        tCrvPtsThisTempo.push(td);
      });
      curveCoordsByFramePerTempo.push(tCrvPtsThisTempo);
    });
  });
}

function mkCrvFollower() {
  for (var i = 0; i < tempos.length; i++) {
    let tCrvF = mkSvgCircle({
      svgContainer: canvas.svg,
      cx: 0,
      cy: 0,
      r: CRVFOLLOW_R,
      fill: scrollingCsrClrs[i],
      stroke: 'none',
      strokeW: 0
    });
    tCrvF.setAttributeNS(null, 'display', 'yes');
    crvFollowers.push(tCrvF);
  }
}

function updateCrvFollow() {
  totalNumFramesPerTempo.forEach((numFrames, tempoIx) => {
    let currFrame = FRAMECOUNT % numFrames;
    let tx = curveCoordsByFramePerTempo[tempoIx][currFrame].x;
    let ty = curveCoordsByFramePerTempo[tempoIx][currFrame].y;
    crvFollowers[tempoIx].setAttributeNS(null, 'cx', tx);
    crvFollowers[tempoIx].setAttributeNS(null, 'cy', ty);
  });
}
//#endef Curves





//
