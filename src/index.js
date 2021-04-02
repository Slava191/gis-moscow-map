const Draw = require('./draw.js')
const createGraph = require('ngraph.graph');
const aStar = require('./a-star/a-star.js')

const canvas = document.getElementById("canvas")
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight
const ctx = canvas.getContext("2d");

let POINTS = undefined,
    LINES  = undefined,
    CONTOURS = undefined,
    GREENZONES = undefined,
    WATER = undefined,
    BUILDINGS = undefined,
    RAILWAYS = undefined

let SCALE = 0.07, 
    TOPOFFSET = 30000, 
    LEFTOFFSET = 0

let draw;

//let draw = new Draw(ctx, { scale: 0.05, topOffset: 40500 })
    
//Создаем массив объектов из текстовой структуры
function parseToArrayOfObject(data){
        
    const lines = data.split('\n');
    const linesLength = lines.length

    const arrOfObj = []

    //The zero line consists structure of object

    const objStruct = []
    const firstTabs = lines[0].split('\t');

    for(const tab of firstTabs) objStruct.push(tab)

    arrOfObj.push(objStruct)
    
    //The other lines considering objects

    for(let line = 1; line < linesLength-1; line++){

        const tabs = lines[line].split('\t');
        const tabsLength = tabs.length

        const currentObj = {}

        for(let tab = 0; tab < tabsLength; tab++) {
            currentObj[objStruct[tab]] = Number(tabs[tab])
        }

        arrOfObj.push(currentObj)

    }

    return arrOfObj

}

//Формируем контуры
function reduceContour(CONTOURS){

    const myContours = [null]

    const CONTOURSLength = CONTOURS.length

    let currentContour = []
    let lastIdPoints = 1

    for(let i = 1; i < CONTOURSLength; i++){

        if(CONTOURS[i].IdPoints === lastIdPoints){
            currentContour.push({x: CONTOURS[i].x, y: CONTOURS[i]["y\r"]})
        }else{
            myContours.push([...currentContour])
            currentContour = []
            currentContour.push({x: CONTOURS[i].x, y: CONTOURS[i]["y\r"]})
        }

        lastIdPoints = CONTOURS[i].IdPoints

    }

    return myContours

}

//Отрисовка контуров
function drawContours(TYPEOFCONTOURS, CONTOURS, color, bgcolor = undefined, lineWidth = 1){

    const TYPEOFCONTOURSLength = TYPEOFCONTOURS.length

    for(let i = 1; i < TYPEOFCONTOURSLength; i++){

        const contour = CONTOURS[TYPEOFCONTOURS[i].IdPoints]

        const contourType = TYPEOFCONTOURS[i].IdType || 2

        draw.polyline(contour, color, contourType, bgcolor, lineWidth)

    }

}

const setGlobalData = async () => {

        //Получаем данные

        const POINTSTextData = await (await fetch('data/Base.ep')).text()
        POINTS = parseToArrayOfObject(POINTSTextData)
    
        const LINESTextData = await (await fetch('data/Base.svdb')).text()
        LINES = parseToArrayOfObject(LINESTextData)
    
        const CONTOURSTextData = await (await fetch('data/Base.epts')).text()
        CONTOURS = reduceContour(parseToArrayOfObject(CONTOURSTextData))
    
        const GREENZONESTextData = await (await fetch('data/Зеленая зона.elyr')).text()
        GREENZONES = parseToArrayOfObject(GREENZONESTextData)
    
        const WATERTextData = await (await fetch('data/Реки и водоемы.elyr')).text()
        WATER = parseToArrayOfObject(WATERTextData)
    
        const BUILDINGSTextData = await (await fetch('data/Жилая застройка.elyr')).text()
        BUILDINGS = parseToArrayOfObject(BUILDINGSTextData)
    
        const RAILWAYSTextData = await (await fetch('data/Железные дороги.elyr')).text()
        RAILWAYS = parseToArrayOfObject(RAILWAYSTextData)

}


const drawMap = () => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawContours(GREENZONES, CONTOURS, '#CAE5B3', '#D4F2BB')
    drawContours(WATER, CONTOURS, '#B8DFF5')
    drawContours(BUILDINGS, CONTOURS, '#E8E8E5', '#F6F6F3')
    drawContours(RAILWAYS, CONTOURS, '#7C6657', '#7C6657', 0.5)
    drawContours(LINES, CONTOURS, '#696969', '#696969', 1)

}

const zoomInOut = (mode) => {

    switch(mode){
        case 'in': 
            SCALE += 0.01
            break;
        case 'out':
            SCALE -= 0.01
            break;
    }

    draw.scale = SCALE
    
    drawMap();

}

const move = (mode) => {

    switch(mode){
        case 'top': 
            TOPOFFSET -= 1000
            break;
        case 'bottom': 
            TOPOFFSET += 1000
            break;
        case 'left':
            LEFTOFFSET -= 1000
            break;
        case 'right':
            LEFTOFFSET += 1000
            break;
    }

    draw.topOffset = TOPOFFSET
    draw.leftOffset = LEFTOFFSET

    drawMap();

}

const   zoomInButton = document.getElementById("zoom-in"),
        zoomOutButton = document.getElementById("zoom-out")
        moveTopButton = document.getElementById("move-top")
        moveBottomButton = document.getElementById("move-bottom")
        moveLeftButton = document.getElementById("move-left")
        moveRightButton = document.getElementById("move-right")
    
zoomInButton.addEventListener("click", () => zoomInOut('in'))
zoomOutButton.addEventListener("click", () => zoomInOut('out'))

canvas.addEventListener("wheel", (e) => e.deltaY < 0 ? zoomInOut('in') : zoomInOut('out') );

moveTopButton .addEventListener("click", () => move('top'))
moveBottomButton.addEventListener("click", () => move('bottom'))
moveLeftButton .addEventListener("click", () => move('left'))
moveRightButton.addEventListener("click", () => move('right'))

let isMouseDown = false
let offsetBeforeMouseUp = [0, 0]

canvas.addEventListener('mousedown', (e) => {
    isMouseDown  = true

    

    offsetBeforeMouseUp = [e.clientX, e.clientY]
});

canvas.addEventListener('mouseup', (e) => {
    isMouseDown = false

    document.body.style.cursor = 'default'
            
    const [x, y] = offsetBeforeMouseUp

    if(Math.abs(e.clientX-x) > 40 || Math.abs(e.clientY-y) > 40){

        LEFTOFFSET += (e.clientX-x)/SCALE
        TOPOFFSET += (e.clientY-y)/SCALE

        draw.topOffset = TOPOFFSET
        draw.leftOffset = LEFTOFFSET

        drawMap();
    
    }

});


canvas.addEventListener('mousemove', function(e) {

    if(isMouseDown){

        // const [x, y] = offsetBeforeMouseUp

        // if(((e.clientX-x) != 0 && Math.abs(e.clientX-x)%10 === 0) || ((e.clientY-y) != 0 && Math.abs(e.clientY-y)%10 === 0)){
    
        //     LEFTOFFSET += (e.clientX-x)/SCALE
        //     TOPOFFSET += (e.clientY-y)/SCALE
    
        //     draw.topOffset = TOPOFFSET
        //     draw.leftOffset = LEFTOFFSET
    
        //     drawMap();
        
        // }

    }

})

const start = async () => {


    await setGlobalData();

    draw = new Draw(ctx, { scale: SCALE, topOffset: TOPOFFSET, leftOffset: LEFTOFFSET })
    
    draw.gitHubPages = true

    drawMap();
  

    //Библиотека для поиска пути на взешенном графе
    //https://habr.com/ru/post/338440/

    let graph = createGraph();

    for(let i = 1; i < LINES.length; i++)
        graph.addLink(LINES[i].IdPoint1, LINES[i].IdPoint2, { weight: LINES[i].Length, line: LINES[i] });
    
    const pathFinder = aStar(graph, {
        distance(a, b, link) { return link.data.weight }
    });

    //FIXME: Широкое поле для рефаторинга)))


    const buildWay = (pointOneId, pointTwoId) => {

        let path = pathFinder.find(pointOneId, pointTwoId);
        path.reverse();

        let wayLength = 0;
        let pathString = path[0].id;
        let pathArray = [path[0].id]
        let firstPathLine = null

        try{
            firstPathLine = graph.getNode(path[1].id).links.find(link => link.toId === graph.getNode(path[0].id).id || link.fromId === graph.getNode(path[0].id).id).data.line
            
        }catch(e){
            console.log("Ошибка тут")
        }

        let pathLines = [firstPathLine]

        for(let i = 0; i < path.length-1; i++){
            const currentNode = path[i]
            const nextNode = path[i+1]

            let currentNodeAndNextNodeData
            
            try{
                currentNodeAndNextNodeData = currentNode.links.find(link => link.toId === nextNode.id || link.fromId === nextNode.id).data
            }catch(e){
                console.log("Ошибка тут", currentNode, nextNode)
            }

            const lengthToNextNode = currentNodeAndNextNodeData.weight

            //console.log(currentNode.links.)

            wayLength += lengthToNextNode 
            pathString += ` -> ${nextNode.id}`

            pathLines.push(currentNodeAndNextNodeData.line)
            
            pathArray.push(nextNode.id)

        }

        drawContours(pathLines, CONTOURS, 'red', 'red', 2)
        console.log("Путь:", pathString, pathArray, "Длина:", wayLength)

    }

    let pointOneId = undefined, 
        pointTwoId = undefined, 
        buildWayMode = false

    const buildWayButton = document.getElementById("build-way")
    buildWayButton.addEventListener("click", function(e){
        buildWayMode = true
        document.body.style.cursor = 'crosshair'
    })


    canvas.addEventListener("click", function(e) {

        

        if(buildWayMode){

            const rect = e.target.getBoundingClientRect();

            const mousePosX = ((e.clientX-rect.left)/SCALE)-LEFTOFFSET; 
            const mousePosY = (TOPOFFSET-((e.clientY-rect.top)/SCALE)) ;

            let minLength = 100000
            let findedPoint = null

            for(let i = 1; i < POINTS.length; i++){

                const lengthBetwenPoints = Math.sqrt(Math.pow((POINTS[i].X - mousePosX), 2) + Math.pow((POINTS[i].Y - mousePosY),2))

                if(lengthBetwenPoints <= minLength){
                    findedPoint = POINTS[i]
                    minLength = lengthBetwenPoints
                }

            }

            console.log(mousePosX, mousePosY)
            console.log(findedPoint)

            draw.point(findedPoint.X, findedPoint.Y)
    
            if(!pointOneId && !pointTwoId){

                pointOneId = findedPoint.IdPoint
                
            }else if(pointOneId && !pointTwoId){

                pointTwoId = findedPoint.IdPoint

                console.log("Строю маршрут между ", pointOneId, " и ", pointTwoId)
                buildWay(pointOneId, pointTwoId)

                pointOneId = undefined
                pointTwoId = undefined
                buildWayMode = false
                document.body.style.cursor = 'default'

            }

        }

    })


}

start()