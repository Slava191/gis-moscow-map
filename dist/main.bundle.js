/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/draw.js":
/*!*********************!*\
  !*** ./src/draw.js ***!
  \*********************/
/***/ ((module) => {

eval("module.exports = class {\r\n\r\n    constructor(ctx){\r\n        this.ctx = ctx\r\n        this.scale = 0.05\r\n        this.topOffset = 40500\r\n\r\n        this.roadTypesColor = {\r\n            0: \"#C5C5C4\",\r\n            1: \"#FFF7B8\",\r\n            2: \"#FFE294\",\r\n            3: \"#FFD080\",\r\n            3: \"#FFE294\",\r\n            5: \"#FFD080\"\r\n        }\r\n\r\n    }\r\n\r\n    point(x, y){\r\n        this.ctx.beginPath();\r\n        this.ctx.fillStyle = \"red\";\r\n        this.ctx.arc(x, y, 4, 0, 2 * Math.PI, true);\r\n        this.ctx.fill();\r\n    }\r\n\r\n    line(x1, y1, x2, y2, type = 1){\r\n\r\n        x1 = this.scale*x1 \r\n        y1 = this.scale*(this.topOffset-y1)\r\n        x2 = this.scale*x2\r\n        y2 = this.scale*(this.topOffset-y2) \r\n\r\n        this.ctx.beginPath(); \r\n        this.ctx.moveTo(x1, y1);  \r\n        this.ctx.lineTo(x2, y2);  \r\n        this.ctx.strokeStyle = this.roadTypesColor[type];\r\n        this.ctx.lineWidth = 1*(type/1.5);\r\n        this.ctx.stroke();  \r\n        this.ctx.closePath();\r\n    }\r\n\r\n    //[{x,y}, {x,y}]\r\n    polyline(arrOfPoints, color, type){\r\n\r\n        if(type===1 || !arrOfPoints){\r\n            console.log(type)\r\n            return\r\n        }\r\n\r\n        this.ctx.beginPath();\r\n        \r\n        this.ctx.moveTo(this.scale*arrOfPoints[0].x, this.scale*(this.topOffset-arrOfPoints[0].y)); \r\n\r\n        for(let i = 1; i < arrOfPoints.length-1; i++){\r\n            this.ctx.lineTo(this.scale*arrOfPoints[i].x, this.scale*(this.topOffset-arrOfPoints[i].y));\r\n        }\r\n\r\n        \r\n        \r\n        if(type === 3){\r\n            this.ctx.lineTo(this.scale*arrOfPoints[0].x, this.scale*(this.topOffset-arrOfPoints[0].y));\r\n            this.ctx.fillStyle = color;\r\n            //this.ctx.closePath();\r\n            this.ctx.fill();\r\n            //this.ctx.stroke(); \r\n        }\r\n\r\n        if(type === 2){\r\n            this.ctx.strokeStyle = color;\r\n            this.ctx.lineWidth = 0.5\r\n            //this.ctx.closePath();\r\n            this.ctx.stroke(); \r\n        }\r\n\r\n        this.ctx.closePath();\r\n        \r\n\r\n\r\n    }\r\n\r\n}\n\n//# sourceURL=webpack://gis-moscow-map/./src/draw.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const Draw = __webpack_require__(/*! ./draw.js */ \"./src/draw.js\")\r\n\r\nconst canvas = document.getElementById(\"canvas\")\r\ncanvas.width  = 1800;\r\ncanvas.height = 3000;\r\nconst ctx = canvas.getContext(\"2d\");\r\n\r\nconst draw = new Draw(ctx)\r\n\r\nfunction parseToArrayOfObject(data){\r\n        \r\n    const lines = data.split('\\n');\r\n    const linesLength = lines.length\r\n\r\n    const arrOfObj = []\r\n\r\n    //The zero line consists structure of object\r\n\r\n    const objStruct = []\r\n    const firstTabs = lines[0].split('\\t');\r\n\r\n    for(const tab of firstTabs) objStruct.push(tab)\r\n\r\n    arrOfObj.push(objStruct)\r\n    \r\n    //The other lines considering objects\r\n\r\n    for(let line = 1; line < linesLength-1; line++){\r\n\r\n        const tabs = lines[line].split('\\t');\r\n        const tabsLength = tabs.length\r\n\r\n        const currentObj = {}\r\n\r\n        for(let tab = 0; tab < tabsLength; tab++) {\r\n            currentObj[objStruct[tab]] = Number(tabs[tab])\r\n        }\r\n\r\n        arrOfObj.push(currentObj)\r\n\r\n    }\r\n\r\n    return arrOfObj\r\n\r\n}\r\n\r\nfunction reduceContour(CONTOURS){\r\n\r\n    const myContours = [null]\r\n\r\n    const CONTOURSLength = CONTOURS.length\r\n\r\n    let currentContour = []\r\n    let lastIdPoints = 1\r\n\r\n    for(let i = 1; i < CONTOURSLength; i++){\r\n\r\n        if(CONTOURS[i].IdPoints === lastIdPoints){\r\n            currentContour.push({x: CONTOURS[i].x, y: CONTOURS[i][\"y\\r\"]})\r\n        }else{\r\n            myContours.push([...currentContour])\r\n            currentContour = []\r\n            currentContour.push({x: CONTOURS[i].x, y: CONTOURS[i][\"y\\r\"]})\r\n        }\r\n\r\n        lastIdPoints = CONTOURS[i].IdPoints\r\n\r\n    }\r\n\r\n    return myContours\r\n\r\n}\r\n\r\nfunction drawLines(POINTS, LINES){\r\n\r\n    const LINESLength = LINES.length\r\n\r\n    for(let i = 1; i < LINESLength; i++){\r\n\r\n        const line = LINES[i]\r\n\r\n        draw.line(\r\n            POINTS[line.IdPoint1].X, \r\n            POINTS[line.IdPoint1].Y, \r\n            POINTS[line.IdPoint2].X, \r\n            POINTS[line.IdPoint2].Y, \r\n            line.TypeRoad\r\n        )\r\n\r\n    }\r\n\r\n}\r\n\r\nfunction drawContours(TYPEOFCONTOURS, CONTOURS, color){\r\n\r\n    const TYPEOFCONTOURSLength = TYPEOFCONTOURS.length\r\n\r\n    for(let i = 1; i < TYPEOFCONTOURSLength; i++){\r\n\r\n        const contour = CONTOURS[TYPEOFCONTOURS[i].IdPoints]\r\n\r\n        draw.polyline(contour, color, TYPEOFCONTOURS[i].IdType)\r\n\r\n    }\r\n\r\n}\r\n\r\n\r\nconst start = async () => {\r\n\r\n    const POINTSTextData = await (await fetch('data/Base.ep')).text()\r\n    const POINTS = parseToArrayOfObject(POINTSTextData)\r\n\r\n    const LINESTextData = await (await fetch('data/Base.svdb')).text()\r\n    const LINES = parseToArrayOfObject(LINESTextData)\r\n\r\n    const CONTOURSTextData = await (await fetch('data/Base.epts')).text()\r\n    const CONTOURS = reduceContour(parseToArrayOfObject(CONTOURSTextData))\r\n\r\n    //IdType 1 - точка, 2 - линиия, 3 - контур\r\n\r\n    const GREENZONESTextData = await (await fetch('data/Зеленая зона.elyr')).text()\r\n    const GREENZONES = parseToArrayOfObject(GREENZONESTextData)\r\n\r\n    const WATERTextData = await (await fetch('data/Реки и водоемы.elyr')).text()\r\n    const WATER = parseToArrayOfObject(WATERTextData)\r\n\r\n    const BUILDINGSTextData = await (await fetch('data/Жилая застройка.elyr')).text()\r\n    const BUILDINGS = parseToArrayOfObject(BUILDINGSTextData)\r\n\r\n    const RAILWAYSTextData = await (await fetch('data/Железные дороги.elyr')).text()\r\n    const RAILWAYS = parseToArrayOfObject(RAILWAYSTextData)\r\n\r\n    drawLines(POINTS, LINES)\r\n    drawContours(GREENZONES, CONTOURS, '#D4F2BB')\r\n    drawContours(WATER, CONTOURS, '#B8DFF5')\r\n    drawContours(BUILDINGS, CONTOURS, '#F6F6F3')\r\n    drawContours(RAILWAYS, CONTOURS, '#696969')\r\n\r\n    //Библиотека для поиска пути на взешенном графе\r\n    //https://habr.com/ru/post/338440/\r\n\r\n}\r\n\r\nstart()\n\n//# sourceURL=webpack://gis-moscow-map/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;