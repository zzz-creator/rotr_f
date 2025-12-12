/** @typedef {import('../../ChoreoGraph/3.2.1/types/choreograph') } ChoreoGraphCore */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/develop') } ChoreoGraphDevelop */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/input') } ChoreoGraphInput */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/audio') } ChoreoGraphAudio */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animation') } ChoreoGraphAnimation */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animationeditor') } ChoreoGraphAnimationEditor */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/blockcontroller') } ChoreoGraphBlockController */

cg.createPath([[1054,67],[956,67],[893,135],[893,239],[1005,67],[911,67],[842,114],[842,209.05],[1024,31],[852,49],[756,122],[756,181]],"debug_discoPositions");

cg.createPath([[850,705],[771,705]],"debug_unloadPositions");

cg.Input.createAction({
  keys : [new ChoreoGraph.Input.ActionKey({main:"d",shift:true})],
  down : () => {
    cg.graphics.debug.active = !cg.graphics.debug.active;
  }
},"toggleDebug");

cg.Input.createAction({
  keys : [new ChoreoGraph.Input.ActionKey({main:"l",shift:true})],
  down : () => {
    cg.settings.animation.debug.active = !cg.settings.animation.debug.active;
  }
},"toggleAnimations");

cg.graphicTypes.debug = new class debug {
  setup(init,cg) {
    this.active = false;
    this.discoMarkers = true;
    this.resistanceMarkers = true;
    this.humanishCirclePaths = true;
    this.crowdParameters = true;
    this.queues = true;
    this.itsDimension = true;
    this.itsDimensionIndices = true;
    this.colourAssignment = true;
    this.vehicleNumbers = true;
    this.queueSpawnTimers = true;
    this.audio = true;

    this.itsDimensionBreadcrumbs = true;
    this.itsDimensionBreadcrumbsStartEnd = [230,0];
    this.itsDimensionBreadcrumbsData = null;

    this.hasCachedDiscoStates = false;
    this.cachedDiscoStates = {
      interro : [],
      load : [],
      grouper : []
    };

    this.cacheDiscoStates = () => {
      for (let key of Object.keys(disco)) {
        if (key.includes("IS_")) {
          cg.graphics.debug.cachedDiscoStates.interro.push(key);
        } else if (key.includes("LS_")) {
          cg.graphics.debug.cachedDiscoStates.load.push(key);
        } else if (key.includes("GS_")) {
          cg.graphics.debug.cachedDiscoStates.grouper.push(key);
        }
      }

      cg.graphics.debug.hasCachedDiscoStates = true;
    }

    this.drawDiscoMarkers = (c) => {
      if (!this.hasCachedDiscoStates) {
        this.cacheDiscoStates();
      }
      const ml = { // Marker Locations
        "load1" : cg.paths.debug_discoPositions[0],
        "load2" : cg.paths.debug_discoPositions[1],
        "load3" : cg.paths.debug_discoPositions[2],
        "load4" : cg.paths.debug_discoPositions[3],
        "interro1" : cg.paths.debug_discoPositions[4],
        "interro2" : cg.paths.debug_discoPositions[5],
        "interro3" : cg.paths.debug_discoPositions[6],
        "interro4" : cg.paths.debug_discoPositions[7],
        "grouper1" : cg.paths.debug_discoPositions[8],
        "grouper2" : cg.paths.debug_discoPositions[9],
        "grouper3" : cg.paths.debug_discoPositions[10],
        "grouper4" : cg.paths.debug_discoPositions[11]
      }
      for (let position in ml) {
        let positionType;
        if (position.includes("load")) { c.fillStyle = "#c92914"; positionType = "load"; }
        if (position.includes("inter")) { c.fillStyle = "#274bcf"; positionType = "interro"; }
        if (position.includes("grouper")) { c.fillStyle = "#14c929"; positionType = "grouper"; }
        c.beginPath();
        c.arc(ml[position][0],ml[position][1],7,0,2*Math.PI);
        c.fill();
        c.fillStyle = "white";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = "bold 10px Arial";
        c.fillText(position,ml[position][0],ml[position][1]-15);
        if (disco[position+"S"]!=undefined) {
          c.font = "bold 10px Arial";
          c.fillText(disco[position+"S"],ml[position][0],ml[position][1]+0.7);
          c.font = "bold 3.2px Arial";
          for (let state of cg.graphics.debug.cachedDiscoStates[positionType]) {
            if (positionType=="interro"&&disco[state]==disco[position+"S"]) {
              c.fillText(state.replace("IS_",""),ml[position][0],ml[position][1]-9.4);
            } else if (positionType=="load"&&disco[state]==disco[position+"S"]) {
              c.fillText(state.replace("LS_",""),ml[position][0],ml[position][1]-9.4);
            } else if (positionType=="grouper"&&disco[state]==disco[position+"S"]) {
              c.fillText(state.replace("GS_",""),ml[position][0],ml[position][1]-9.4);
            }
          }
        }
        c.font = "bold 9px Arial";
        if (disco[position+"V"]!=null) {
          c.fillText(disco[position+"V"].vehicleIdentifier,ml[position][0],ml[position][1]+12);
        }
      }
    };

    this.drawResistanceMarkers = (c) => {
      const ml = { // Marker Locations
        "unload1" : cg.paths.debug_unloadPositions[0],
        "unload2" : cg.paths.debug_unloadPositions[1]
      }
      for (let position in ml) {
        if (position.includes("unload")) { c.fillStyle = "#c92914"; }
        c.beginPath();
        c.arc(ml[position][0],ml[position][1],7,0,2*Math.PI);
        c.fill();
        c.fillStyle = "white";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = "bold 10px Arial";
        c.fillText(position,ml[position][0],ml[position][1]-15);
        if (resistance[position+"S"]!=undefined) {
          c.font = "bold 10px Arial";
          c.fillText(resistance[position+"S"],ml[position][0],ml[position][1]+0.7);
          c.font = "bold 3.2px Arial";
          for (let key of Object.keys(resistance)) {
            if (key.includes("US_")&&position.includes("unload")&&resistance[key]==resistance[position+"S"]) {
              c.fillText(key.replace("US_",""),ml[position][0],ml[position][1]-9.4);
            }
          }
        }
        c.font = "bold 9px Arial";
        if (disco[position+"V"]!=null) {
          c.fillText(disco[position+"V"].vehicleIdentifier,ml[position][0],ml[position][1]+12);
        }
      }
    };

    this.drawHumanishCirclePathing = (c) => {
      const paths = [];
      const velocities = [];

      for (let humanishCircle of humanishCircles) {
        paths.push([humanishCircle.x,humanishCircle.y,humanishCircle.path]);
        if (humanishCircle.speed>0) {
          velocities.push([humanishCircle.x,humanishCircle.y,humanishCircle.velocityX,humanishCircle.velocityY]);
        }
      }

      c.strokeStyle = "pink";
      c.lineWidth = 0.2;
      c.beginPath();
      for (let path of paths) {
        c.moveTo(path[0],path[1]);
        for (let point of path[2]) {
          c.lineTo(point[0],point[1]);
        }
      }
      c.stroke();

      c.lineWidth = 0.5;
      c.strokeStyle = "blue";
      c.lineCap = "round";
      c.beginPath();
      for (let velocity of velocities) {
        c.moveTo(velocity[0],velocity[1]);
        c.lineTo(velocity[0]+velocity[2]*2,velocity[1]+velocity[3]*2);
      }
      c.stroke();
    };

    this.drawCrowdParameters = (c) => {
      const openSpots = [];
      const closedSpots = [];
      const activeExits = [];
      const inactiveExits = [];
      const connections = [];
      const targets = [];

      for (const crowdId in crowdParameters) {
        const crowd = crowdParameters[crowdId];

        for (let i=0;i<crowd.bakedLength;i++) {
          const x = crowd.spots[i][0];
          const y = crowd.spots[i][1];
          const open = crowd.open[i];
          const emptyDestinations = crowd.emptyDestinations[crowd.activeEmptySet][i];
          for (let setI=0;setI<crowd.emptyTargets.length;setI++) {
            if (crowd.exits[setI].includes(i)) {
              if (crowd.activeEmptySet===setI) {
                activeExits.push([x,y,crowdId]);
              } else {
                inactiveExits.push([x,y,crowdId]);
              }
            }

            for (const emptyTarget of crowd.emptyTargets[setI]) {
              targets.push([emptyTarget[0],emptyTarget[1]]);
            }
          }

          for (const fillTarget of crowd.fillTargets) {
            targets.push([fillTarget[0],fillTarget[1]]);
          }

          for (const destination of emptyDestinations) {
            let dx = crowd.spots[destination][0] - x;
            let dy = crowd.spots[destination][1] - y;

            dx *= 0.6;
            dy *= 0.6;

            connections.push([x,y,dx,dy]);
          }

          if (open) {
            openSpots.push([x,y,crowdId]);
          } else {
            closedSpots.push([x,y,crowdId]);
          }
        }
      }

      // Connections
      c.strokeStyle = "orange";
      c.lineWidth = 0.2;
      c.beginPath();
      for (const connection of connections) {
        c.moveTo(connection[0],connection[1]);
        c.lineTo(connection[0]+connection[2],connection[1]+connection[3]);
      }
      c.stroke();

      // Spots
      c.fillStyle = "#00ff00";
      c.beginPath();
      for (let spot of openSpots) {
        c.moveTo(spot[0],spot[1]);
        c.arc(spot[0],spot[1],0.8,0,2*Math.PI);
      }
      c.fill();
      c.fillStyle = "red";
      c.beginPath();
      for (let spot of closedSpots) {
        c.moveTo(spot[0],spot[1]);
        c.arc(spot[0],spot[1],0.8,0,2*Math.PI);
      }
      c.fill();

      // Exits
      c.strokeStyle = "blue";
      c.beginPath();
      for (let exit of activeExits) {
        c.moveTo(exit[0]+1.8,exit[1]);
        c.arc(exit[0],exit[1],1.8,0,2*Math.PI);
      }
      c.stroke();
      c.globalAlpha = 1;
      c.strokeStyle = "#001e4f";
      c.beginPath();
      for (let exit of inactiveExits) {
        c.moveTo(exit[0]+1.8,exit[1]);
        c.arc(exit[0],exit[1],1.8,0,2*Math.PI);
      }
      c.stroke();

      // Targets
      c.fillStyle = "#d95dd7";
      c.beginPath();
      for (let target of targets) {
        c.moveTo(target[0],target[1]);
        c.arc(target[0],target[1],0.5,0,2*Math.PI);
      }
      c.fill();
    };

    this.drawQueues = (c) => {
      let open = [];
      let closed = [];
      for (const queueId in queues) {
        const queue = queues[queueId];
        for (let i=0;i<queue.points.length;i++) {
          if (queue.occupied[i]) {
            closed.push(queue.points[i]);
          } else {
            open.push(queue.points[i]);
          }
        }
      }
      c.fillStyle = "#78ff78"; // Green
      c.beginPath();
      for (let i=0;i<open.length;i++) {
        c.moveTo(open[i][0],open[i][1]);
        c.arc(open[i][0],open[i][1],1,0,2*Math.PI);
      }
      c.fill();
      c.fillStyle = "#ff0000"; // Red
      c.beginPath();
      for (let i=0;i<closed.length;i++) {
        c.moveTo(closed[i][0],closed[i][1]);
        c.arc(closed[i][0],closed[i][1],1,0,2*Math.PI);
      }
      c.fill();
    };

    this.drawITSDimension = (canvas) => {
      const c = canvas.c;
      const width = cg.images.its_empty.width;
      const height = cg.images.its_empty.height;
      c.globalAlpha = 0.3;
      canvas.drawImage(cg.images.its_empty,360,270,width,height,90);
      c.globalAlpha = 1;

      if (cg.graphics.its.dimensionData === null) { return }

      if (this.itsDimensionBreadcrumbs) {
        this.drawITSDimensionBreadcrumbs(c);
      }

      c.beginPath();
      for (const position of cg.graphics.its.dimensionData.lowCostPositions) {
        c.rect(position[0]-0.5,position[1]-0.5,1,1);
      }
      c.fillStyle = "orange";
      c.fill();
      c.beginPath();
      for (const position of cg.graphics.its.dimensionData.highCostPositions) {
        c.rect(position[0]-0.5,position[1]-0.5,1,1);
      }
      c.fillStyle = "red";
      c.fill();

      if (this.itsDimensionIndices) {
        c.fillStyle = "white";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = "1.2px Arial";
        for (const index in cg.graphics.its.dimensionData.positions) {
          const position = cg.graphics.its.dimensionData.positions[index];
          c.fillText(index, position[0], position[1]);
        }
      }
    };

    this.drawITSDimensionBreadcrumbs = (c) => {
      const start = this.itsDimensionBreadcrumbsStartEnd[0];
      const end = this.itsDimensionBreadcrumbsStartEnd[1];
      if (this.itsDimensionBreadcrumbsData === null
          || this.itsDimensionBreadcrumbsData.start !== start
          || this.itsDimensionBreadcrumbsData.end !== end) {
        this.itsDimensionBreadcrumbsData = {
          start : start,
          end : end,
          breadcrumbs : cg.graphics.its.findBreadcrumbs(start, end, true)
        }
      }

      const breadcrumbs = this.itsDimensionBreadcrumbsData.breadcrumbs;
      c.beginPath();
      for (const a in breadcrumbs) {
        const b = breadcrumbs[a];
        const aPos = cg.graphics.its.dimensionData.positions[a];
        const bPos = cg.graphics.its.dimensionData.positions[b];
        c.moveTo(aPos[0], aPos[1]);
        c.lineTo(bPos[0], bPos[1]);
      }
      c.strokeStyle = "#64e5a3";
      c.lineWidth = 0.3;
      c.stroke();
    };

    this.drawColourAssignment = (c) => {
      const positions = {
        [disco.GROUPER_RED] : [],
        [disco.GROUPER_ORANGE] : [],
        [disco.GROUPER_BLUE] : [],
        [disco.GROUPER_GREY] : []
      };
      for (const humanishCircle of humanishCircles) {
        if (humanishCircle.assignedColour !== undefined && humanishCircle.assignedColour !== null) {
          positions[humanishCircle.assignedColour].push([humanishCircle.x,humanishCircle.y]);
        }
      }
      c.strokeStyle = "black";
      for (const colour in positions) {
        if (colour==disco.GROUPER_RED) { c.fillStyle = "#fe5c51"; }
        if (colour==disco.GROUPER_ORANGE) { c.fillStyle = "#fcc76a"; }
        if (colour==disco.GROUPER_BLUE) { c.fillStyle = "#40567f"; }
        if (colour==disco.GROUPER_GREY) { c.fillStyle = "#b3b6b8"; }
        c.beginPath();
        for (const position of positions[colour]) {
          c.moveTo(position[0]+1.5,position[1]);
          c.arc(position[0],position[1],1.5,0,2*Math.PI);
        }
        c.fill();
        c.stroke();
      }
    };

    this.drawVehicleNumbers = (c) => {
      for (let i=1;i<=38;i++) {
        const vehicle = vehicles[i];
        ChoreoGraph.transformContext(cg.canvases.main.camera,vehicle.transform.x,vehicle.transform.y,vehicle.transform.r);
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = "bold 10px Arial";
        c.fillStyle = "black";
        const width = c.measureText(vehicle.number).width + 4;
        c.beginPath();
        c.roundRect(-width/2,6.2,width,10,4);
        c.fill();
        c.fillStyle = "white";
        let standardRotation = vehicle.transform.r%360;
        if (standardRotation<0) { standardRotation += 360; }
        if (standardRotation>90 && standardRotation<=270) {
          c.rotate(Math.PI);
          c.translate(0,-23);
        }
        c.fillText(vehicle.number,0,12);
        if (vehicle.number===6||vehicle.number===9) {
          c.strokeStyle = "white";
          c.lineWidth = 0.6;
          c.beginPath();
          c.moveTo(-2,15.5);
          c.lineTo(2,15.5);
          c.stroke();
        }
      }
    };

    this.drawQueueSpawnTimers = (c) => {
      c.fillStyle = "white";
      c.textAlign = "left";
      c.textBaseline = "middle";
      c.font = "bold 10px Arial";
      c.fillText(Math.floor((preshows.nextQueueBufferTime-cg.clock)/1000),33,451);
      c.fillText(Math.floor((preshows.nextLLBufferTime-cg.clock)/1000),265,525);
    };

    this.drawAudio = (c) => {
      const nextTrack = rotra.soundtrack[rotra.track];
      c.font = "bold 18px Arial";
      c.textAlign = "left";
      c.strokeStyle = "black";
      c.lineWidth = 9;
      c.miterLimit = 2;
      c.strokeText(
        `NEXT TRACK: ${nextTrack}`,
        650,
        740
      );
      c.fillText(
        `NEXT TRACK: ${nextTrack}`,
        650,
        740
      );

      const timeTillNextTrack = rotra.nextTrackTime - cg.clock;
      c.font = "bold 16px Arial";
      c.strokeText(
        `BUFFER: ${Math.ceil(timeTillNextTrack/1000)}s`,
        650,
        765
      );
      c.fillText(
        `BUFFER: ${Math.ceil(timeTillNextTrack/1000)}s`,
        650,
        765
      );
    };
  };
  draw(c,ax,ay,canvas) {
    if (!this.active) return;
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.font = "bold 10px Arial";
    c.miterLimit = 2;
    c.lineWidth = 4;
    c.textAlign = "left";
    c.strokeText("DEBUG MODE ACTIVE",20,265);
    c.fillText("DEBUG MODE ACTIVE",20,265);
    c.font = "10px Arial";
    c.strokeText("TOGGLE - SHIFT + D",20,265+15);
    c.fillText("TOGGLE - SHIFT + D",20,265+15);

    if (this.discoMarkers) { this.drawDiscoMarkers(c); }
    if (this.resistanceMarkers) { this.drawResistanceMarkers(c); }
    if (this.humanishCirclePaths) { this.drawHumanishCirclePathing(c); }
    if (this.crowdParameters) { this.drawCrowdParameters(c); }
    if (this.queues) { this.drawQueues(c); }
    if (this.itsDimension) { this.drawITSDimension(canvas); }
    if (this.colourAssignment) { this.drawColourAssignment(c); }
    if (this.queueSpawnTimers) { this.drawQueueSpawnTimers(c); }
    if (this.audio) { this.drawAudio(c); }
    if (this.vehicleNumbers) { this.drawVehicleNumbers(c); }
  }
}
cg.createGraphic({type:"debug",ax:13+560/2,ay:13+765/2},"debug");
cg.scenes.main.createItem("graphic",{graphic:cg.graphics.debug},"debug","interface");