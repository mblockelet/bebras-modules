function GPS(settings) {
   self = this;
   var paper = settings.paper;
   var paperID = settings.paperID;
   var attr = settings.attr;
   var x0 = settings.x0;
   var y0 = settings.y0;
   var w = settings.w;
   var h = settings.h;
   var scale = settings.scale;
   var unit = settings.unit;
   var fixed = settings.fixed;
   this.timeShiftEnabled = settings.timeShiftEnabled;
   this.timeShift = 0;
   var firstTowersPos = settings.towerPos;
   var towerR = settings.towerR;
   var towerH = settings.towerH;
   var towerW = settings.towerW;
   var callback = settings.callback;
   var dragMargin = 10;
   var minR = towerR + dragMargin;

   this.landscape;
   this.overlay;
   this.towers = {};
   this.towerID = [];
   this.distInfo = {};
   var draggedData;

   this.init = function() {
      paper.rect(x0,y0,w,h).attr(attr.frame);
      for(var pos of firstTowersPos){
         this.addTower(pos);
      }
      this.overlay = paper.rect(x0,y0,w,h).attr(attr.overlay);

      this.initHandlers();
   };

   this.initHandlers = function() {
      Beav.dragWithTouch(this.overlay, onMove, onStart, onEnd);
   };

   this.addTower = function(pos) {
      if(this.towerID.includes(pos.id)){
         console.log(pos.id+" already exists")
         return
      }
      var x = x0 + pos.x;
      var y = y0 + pos.y;
      var circle = paper.circle(x,y,towerR).attr(attr.tower);
      var label = paper.text(x,y,pos.id).attr(attr.towerLabel);
      var outCircle = paper.circle(x,y,minR).attr(attr.circle).attr("clip-rect",x0+","+y0+","+w+","+h);
      if(this.timeShiftEnabled){
         var shiftedCircle = paper.circle(x,y,minR + this.timeShift).attr(attr.shiftedCircle).attr("clip-rect",x0+","+y0+","+w+","+h);
      }
      var maxR = Math.max(Math.abs(pos.x),Math.abs(pos.x - w),Math.abs(pos.y),Math.abs(pos.y - h));
      this.towers[pos.id] = { x: pos.x, y: pos.y, raphObj: paper.set(circle,label,outCircle), r: minR, maxR: maxR };
      this.towerID.push(pos.id);
      this.updateDistInfo(pos.id);
   };

   var onStart = function(x,y,ev) {
      var xMouseGps = x - $("#"+paperID).offset().left - x0;
      var yMouseGps = y - $("#"+paperID).offset().top - y0;
      var minDist = Infinity;
      draggedData = {};
      for(var id of self.towerID){
         var towerData = self.towers[id];
         var distFromCenter = Beav.Geometry.distance(xMouseGps,yMouseGps,towerData.x,towerData.y);
         if(distFromCenter < minDist){
            minDist = distFromCenter;
            draggedData.id = id;
            draggedData.type = 0;
         }
         var distFromCircle = Math.abs(distFromCenter - towerData.r);
         if(distFromCircle < minDist){
            minDist = distFromCircle;
            draggedData.id = id;
            draggedData.type = 1;
            draggedData.r0 = distFromCenter;
            draggedData.ri = towerData.r;
         }
      }
      if(minDist > dragMargin){
         draggedData = null;
      }
      if(callback){
         callback();
      }
   };
   var onMove = function(dx,dy,x,y,ev) {
      if(!draggedData){
         return
      }
      var xMouseGps = x - $("#"+paperID).offset().left - x0;
      var yMouseGps = y - $("#"+paperID).offset().top - y0;
      var id = draggedData.id;
      var ri = draggedData.ri;
      var towerData = self.towers[id];

      if(draggedData.type == 1){
         var r0 = draggedData.r0;
         var dR = Beav.Geometry.distance(xMouseGps,yMouseGps,towerData.x,towerData.y) - r0;
         var maxR = Math.max(Math.abs(towerData.x),Math.abs(towerData.x - w),Math.abs(towerData.y),Math.abs(towerData.y - h));
         var newR = Math.min(maxR,Math.max(minR,ri + dR));
         self.towers[id].raphObj[2].attr("r",newR);
         towerData.r = newR;
      }
      self.updateDistInfo(id);
   };
   var onEnd = function() {
      
   };

   this.updateDistInfo = function(id) {
      if(this.distInfo[id]){
         this.distInfo[id].line.remove();
      }
      var data = this.towers[id];
      var cx = data.x;
      var cy = data.y;
      var r = data.r;
      var side = (cx > w/2) ? 0 : 1;

      var x1 = (side) ? x0 + cx + towerR : x0 + cx - towerR;
      var x2 = (side) ? x0 + cx + data.r : x0 + cx - data.r;
      var line = paper.path("M"+x1+" "+(cy + y0)+",H"+x2).attr(attr.distLine);

      var xVal = (x2 + x1)/2;
      var yVal = y0 + cy - 15;
      if(r < minR + 20){
         yVal -= 20;
      }
      var valText = Math.round(data.r*scale)+" "+unit;
      if(this.distInfo[id]){
         this.distInfo[id].line = line;   
         this.distInfo[id].val.attr({
            text: valText,
            x: xVal,
            y: yVal
         });   
      }else{
         var val = paper.text(xVal,yVal,valText).attr(attr.distVal);
         this.distInfo[id] = { line: line, val: val };
      }
   };
   
   this.init();
};