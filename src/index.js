const Draw = require('./draw.js')

const canvas = document.getElementById("canvas")
canvas.width  = 1800;
canvas.height = 3000;
const ctx = canvas.getContext("2d");

const draw = new Draw(ctx)

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

function drawLines(POINTS, LINES){

    const LINESLength = LINES.length

    for(let i = 1; i < LINESLength; i++){

        const line = LINES[i]

        draw.line(
            POINTS[line.IdPoint1].X, 
            POINTS[line.IdPoint1].Y, 
            POINTS[line.IdPoint2].X, 
            POINTS[line.IdPoint2].Y, 
            line.TypeRoad
        )

    }

}

function drawContours(TYPEOFCONTOURS, CONTOURS, color){

    const TYPEOFCONTOURSLength = TYPEOFCONTOURS.length

    for(let i = 1; i < TYPEOFCONTOURSLength; i++){

        const contour = CONTOURS[TYPEOFCONTOURS[i].IdPoints]

        draw.polyline(contour, color, TYPEOFCONTOURS[i].IdType)

    }

}


const start = async () => {

    const POINTSTextData = await (await fetch('data/Base.ep')).text()
    const POINTS = parseToArrayOfObject(POINTSTextData)

    const LINESTextData = await (await fetch('data/Base.svdb')).text()
    const LINES = parseToArrayOfObject(LINESTextData)

    const CONTOURSTextData = await (await fetch('data/Base.epts')).text()
    const CONTOURS = reduceContour(parseToArrayOfObject(CONTOURSTextData))

    //IdType 1 - точка, 2 - линиия, 3 - контур

    const GREENZONESTextData = await (await fetch('data/Зеленая зона.elyr')).text()
    const GREENZONES = parseToArrayOfObject(GREENZONESTextData)

    const WATERTextData = await (await fetch('data/Реки и водоемы.elyr')).text()
    const WATER = parseToArrayOfObject(WATERTextData)

    const BUILDINGSTextData = await (await fetch('data/Жилая застройка.elyr')).text()
    const BUILDINGS = parseToArrayOfObject(BUILDINGSTextData)

    const RAILWAYSTextData = await (await fetch('data/Железные дороги.elyr')).text()
    const RAILWAYS = parseToArrayOfObject(RAILWAYSTextData)

    drawLines(POINTS, LINES)
    drawContours(GREENZONES, CONTOURS, '#D4F2BB')
    drawContours(WATER, CONTOURS, '#B8DFF5')
    drawContours(BUILDINGS, CONTOURS, '#F6F6F3')
    drawContours(RAILWAYS, CONTOURS, '#696969')

    //Библиотека для поиска пути на взешенном графе
    //https://habr.com/ru/post/338440/

}

start()