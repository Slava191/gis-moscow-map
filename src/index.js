const Draw = require('./draw.js')
const createGraph = require('ngraph.graph');
const aStar = require('./a-star/a-star.js')

const canvas = document.getElementById("canvas")
canvas.width  = 1800;
canvas.height = 2000;
const ctx = canvas.getContext("2d");

const draw = new Draw(ctx, { scale: 0.05, topOffset: 40500 })

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


const start = async () => {

    //Получаем данные

    const POINTSTextData = await (await fetch('data/Base.ep')).text()
    const POINTS = parseToArrayOfObject(POINTSTextData)

    const LINESTextData = await (await fetch('data/Base.svdb')).text()
    const LINES = parseToArrayOfObject(LINESTextData)

    const CONTOURSTextData = await (await fetch('data/Base.epts')).text()
    const CONTOURS = reduceContour(parseToArrayOfObject(CONTOURSTextData))

    const GREENZONESTextData = await (await fetch('data/Зеленая зона.elyr')).text()
    const GREENZONES = parseToArrayOfObject(GREENZONESTextData)

    const WATERTextData = await (await fetch('data/Реки и водоемы.elyr')).text()
    const WATER = parseToArrayOfObject(WATERTextData)

    const BUILDINGSTextData = await (await fetch('data/Жилая застройка.elyr')).text()
    const BUILDINGS = parseToArrayOfObject(BUILDINGSTextData)

    const RAILWAYSTextData = await (await fetch('data/Железные дороги.elyr')).text()
    const RAILWAYS = parseToArrayOfObject(RAILWAYSTextData)

    
    drawContours(GREENZONES, CONTOURS, '#CAE5B3', '#D4F2BB')
    drawContours(WATER, CONTOURS, '#B8DFF5')
    drawContours(BUILDINGS, CONTOURS, '#E8E8E5', '#F6F6F3')
    drawContours(RAILWAYS, CONTOURS, '#7C6657', '#7C6657', 0.5)
    drawContours(LINES, CONTOURS, '#696969', '#696969', 1)

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
    })

    canvas.addEventListener("mouseover", function(e) {

        if(buildWayMode){
            document.body.style.cursor = 'crosshair'
        }else{
            document.body.style.cursor = 'grab'
        }

    })

    canvas.addEventListener("click", function(e) {

        

        if(buildWayMode){

            const rect = e.target.getBoundingClientRect();

            const mousePosX = (e.clientX-rect.left)/0.05; 
            const mousePosY = (40500-((e.clientY-rect.top)/0.05)) ;

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
                document.body.style.cursor = 'grab'

            }

        }

    })


}

start()