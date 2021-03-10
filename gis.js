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
                5: "#FFD080"
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

    }


    function parseToArrayOfArray(content, linesOffset = 0, tabsOffset = 0){

        const points = []

        const lines = content.split('\n');
        const linesLength = lines.length

        for(let line = linesOffset; line < linesLength; line++){

            const tabs = lines[line].split('\t');
            const tabsLength = tabs.length

            const point = []

            for(let tab = tabsOffset; tab < tabsLength; tab++){
                
                point.push(Number(tabs[tab]))

            }

            points.push(point)
            
        }

        return points

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

        // console.log(objStruct)
        console.log(arrOfObj)

        return arrOfObj

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

    const POINTSTextData = await (await fetch('data/Base.ep')).text()
    const POINTS = parseToArrayOfObject(POINTSTextData)

    const LINESTextData = await (await fetch('data/Base.svdb')).text()
    const LINES = parseToArrayOfObject(LINESTextData)

    const canvas = document.getElementById("canvas")
    canvas.width  = 1800;
    canvas.height = 3000;
    const ctx = canvas.getContext("2d");

    const draw = new Draw(ctx)

    drawLines(POINTS, LINES)

})()
