module.exports = class {

    constructor(ctx, options = {}){

        this.ctx = ctx
    
        this.scale = options.scale || 0.05
        this.topOffset = options.topOffset || 40500
        this.leftOffset = options.leftOffset || 0
        this.gitHubPages = options.gitHubPages || false

    }

    transformX(x){
        return this.scale*(this.leftOffset+x)
    }

    transformY(y){
        return this.scale*(this.topOffset-y)
    }

    point(x, y, color = "red", radius = 4){
        this.ctx.beginPath();
        this.ctx.fillStyle = color;

        this.ctx.arc(
            this.transformX(x), 
            this.transformY(y), 
            radius, 0, 2 * Math.PI, true
        );

        this.ctx.fill();
        this.ctx.closePath();
    }

    // line(x1, y1, x2, y2, type = 1){

    //     x1 = this.transformX(x1) 
    //     y1 = this.transformY(y1)
    //     x2 = this.transformX(x2)
    //     y2 = this.transformY(y2)

    //     this.ctx.beginPath(); 
    //     this.ctx.moveTo(x1, y1);  
    //     this.ctx.lineTo(x2, y2);  
    //     this.ctx.strokeStyle = this.roadTypesColor[type];
    //     this.ctx.lineWidth = 1*(type/1.5);
    //     this.ctx.stroke();  
    //     this.ctx.closePath();
    // }

    //arrOfPoints = [{x,y}, {x,y}]
    //type 1 - точка, 2 - линиия, 3 - контур
    polyline(arrOfPoints, color, type, bgcolor, lineWidth = 1){

        if(!arrOfPoints) return;
        if(arrOfPoints.length === 0) return;

        if(type===1){
            this.point(arrOfPoints[0].x, arrOfPoints[0].y, color, 1)
            return;
        }

        this.ctx.beginPath();
        
        this.ctx.moveTo(
            this.transformX(arrOfPoints[0].x), 
            this.transformY(arrOfPoints[0].y)
        ); 

        
        if(type === 3){

            for(let i = 1; i < arrOfPoints.length-1; i++){

                this.ctx.lineTo(
                    this.transformX(arrOfPoints[i].x), 
                    this.transformY(arrOfPoints[i].y)
                );

                if(this.gitHubPages){
                    this.ctx.moveTo(
                        this.transformX(arrOfPoints[i].x), 
                        this.transformY(arrOfPoints[i].y)
                    ); 
                }

            }

            this.ctx.lineTo(
                this.transformX(arrOfPoints[0].x), 
                this.transformY(arrOfPoints[0].y)
            );

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = lineWidth
            this.ctx.stroke();

            this.ctx.fillStyle = bgcolor || color;
            this.ctx.fill();
            
        }

        if(type === 2){

            for(let i = 1; i < arrOfPoints.length; i++){
                this.ctx.lineTo(
                    this.transformX(arrOfPoints[i].x), 
                    this.transformY(arrOfPoints[i].y)
                );

                if(this.gitHubPages){
                    this.ctx.moveTo(
                        this.transformX(arrOfPoints[i].x), 
                        this.transformY(arrOfPoints[i].y)
                    ); 
                }

            }

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = lineWidth
            this.ctx.stroke(); 
        }

        this.ctx.closePath();
        


    }

}