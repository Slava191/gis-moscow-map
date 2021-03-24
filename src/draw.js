module.exports = class {

    constructor(ctx){
        this.ctx = ctx
        this.scale = 0.05
        this.topOffset = 40500

        this.roadTypesColor = {
            0: "#C5C5C4",
            1: "#FFF7B8",
            2: "#FFE294",
            3: "#FFD080",
            3: "#FFE294",
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
        this.ctx.lineWidth = 1*(type/1.5);
        this.ctx.stroke();  
        this.ctx.closePath();
    }

    //[{x,y}, {x,y}]
    polyline(arrOfPoints, color, type){

        if(type===1 || !arrOfPoints){
            console.log(type)
            return
        }

        this.ctx.beginPath();
        
        this.ctx.moveTo(this.scale*arrOfPoints[0].x, this.scale*(this.topOffset-arrOfPoints[0].y)); 

        
        if(type === 3){

            for(let i = 1; i < arrOfPoints.length-1; i++){
                this.ctx.lineTo(this.scale*arrOfPoints[i].x, this.scale*(this.topOffset-arrOfPoints[i].y));
            }

            this.ctx.lineTo(this.scale*arrOfPoints[0].x, this.scale*(this.topOffset-arrOfPoints[0].y));
            this.ctx.fillStyle = color;
            //this.ctx.closePath();
            this.ctx.fill();
            //this.ctx.stroke(); 
        }

        if(type === 2){

            for(let i = 1; i < arrOfPoints.length; i++){
                this.ctx.lineTo(this.scale*arrOfPoints[i].x, this.scale*(this.topOffset-arrOfPoints[i].y));
            }

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1
            //this.ctx.closePath();
            this.ctx.stroke(); 
        }

        this.ctx.closePath();
        


    }

}