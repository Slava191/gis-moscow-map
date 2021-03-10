(async function(){

    class Draw{

        constructor(ctx){
            this.ctx = ctx
            this.scale = 0.05
            this.topOffset = 40000

            this.roadTypesColor = {
                1: "#D1D1D1",
                2: "#C5C5C4",
                3: "#FFF7B8",
                4: "#FFE294",
                5: "#FFD080",
                6: "green"
            }

        }

        point(x, y){
            this.ctx.beginPath();
            this.ctx.fillStyle = "red";
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI, true);
            this.ctx.fill();
        }

        line(x1, y1, x2, y2, type = 1){

            x1 = this.scale*x1 
            y1 = this.scale*(this.topOffset-y1)
            x2 = this.scale*x2
            y2 = this.scale*(this.topOffset-y2) 

            this.ctx.beginPath(); 
            this.ctx.moveTo(x1, y1);  
            this.ctx.lineTo(x2, y2);  
            this.ctx.strokeStyle = this.roadTypesColor[type];
            this.ctx.lineWidth = 1*(type/2);
            this.ctx.stroke();  
        }

        //[{x,y}, {x,y}]
        polyline(arrOfPoints, color, type){

            if(type===1 || !arrOfPoints){
                console.log(type)
                return
            }

            this.ctx.beginPath();
            
            this.ctx.moveTo(this.scale*arrOfPoints[0].x, this.scale*(this.topOffset-arrOfPoints[0].y)); 

            for(let i = 1; i < arrOfPoints.length-1; i++){
                this.ctx.lineTo(this.scale*arrOfPoints[i].x, this.scale*(this.topOffset-arrOfPoints[i].y));
            }

            
            
            if(type === 3){
                this.ctx.lineTo(this.scale*arrOfPoints[0].x, this.scale*(this.topOffset-arrOfPoints[0].y));
                this.ctx.fillStyle = color;
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke(); 
            }

            if(type === 2){
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 0.5
                this.ctx.closePath();
                this.ctx.stroke(); 
            }
            


        }

    }


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


    const POINTSTextData = await (await fetch('data/Base.ep')).text()
    const POINTS = parseToArrayOfObject(POINTSTextData)

    const LINESTextData = await (await fetch('data/Base.svdb')).text()
    const LINES = parseToArrayOfObject(LINESTextData)

    const CONTOURSTextData = await (await fetch('data/Base.epts')).text()
    const CONTOURS = reduceContour(parseToArrayOfObject(CONTOURSTextData))

    //IdType 1 - точка, 2 - линиия, 3 - контур

    const GREENZONESTextData = await (await fetch('data/Зеленая зона.elyr')).text()
    const GREENZONES = parseToArrayOfObject(GREENZONESTextData)

    console.log(GREENZONES)

    const WATERTextData = await (await fetch('data/Реки и водоемы.elyr')).text()
    const WATER = parseToArrayOfObject(WATERTextData)

    const BUILDINGSTextData = await (await fetch('data/Жилая застройка.elyr')).text()
    const BUILDINGS = parseToArrayOfObject(BUILDINGSTextData)

    const RAILWAYSTextData = await (await fetch('data/Железные дороги.elyr')).text()
    const RAILWAYS = parseToArrayOfObject(RAILWAYSTextData)

    const canvas = document.getElementById("canvas")
    canvas.width  = 1800;
    canvas.height = 3000;
    const ctx = canvas.getContext("2d");

    const draw = new Draw(ctx)

    drawLines(POINTS, LINES)
    drawContours(GREENZONES, CONTOURS, '#50c878')
    drawContours(WATER, CONTOURS, '#0095b6')
    drawContours(BUILDINGS, CONTOURS, '#FFFAFA')
    drawContours(RAILWAYS, CONTOURS, '#696969')

})()
