/** @typedef {import('../../ChoreoGraph/3.2.1/types/choreograph') } ChoreoGraphCore */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/develop') } ChoreoGraphDevelop */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/input') } ChoreoGraphInput */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/audio') } ChoreoGraphAudio */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animation') } ChoreoGraphAnimation */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animationeditor') } ChoreoGraphAnimationEditor */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/blockcontroller') } ChoreoGraphBlockController */

cg.graphicTypes.readyRoomLights = {
  setup() {
    this.onTime = -Infinity;
    this.offTime = -Infinity;
    this.isOn = false;
    this.changeDuration = 5000;

    this.activate = () => {
      this.onTime = cg.clock;
      this.isOn = true;
    }
    this.deactivate = () => {
      this.offTime = cg.clock;
      this.isOn = false;
    }

    this.image = cg.images.rr1;
  },
  draw(c,ax,ay,canvas) {
    if (this.isOn) {
      if (cg.clock - this.onTime >= this.changeDuration) {
        c.globalAlpha = 1;
      } else {
        c.globalAlpha = Math.min(1,(cg.clock - this.onTime) / this.changeDuration);
      }
    } else {
      if (cg.clock - this.offTime >= this.changeDuration) {
        c.globalAlpha = 0;
      } else {
        c.globalAlpha = 1 - Math.min(1,(cg.clock - this.offTime) / this.changeDuration);
      }
    }

    canvas.drawImage(this.image,330,416);
  }
}

cg.graphicTypes.its = {
  setup(init) {
    this.clock = 0;

    this.pauseClockUntilEntranceClosed = false;
    this.pauseClockUntilExitClosed = false;
    this.pauseUntilHangerAlertIsClear = false;

    this.targetRotationChangeTime = -Infinity;
    this.targetRotationState = 0;
    this.rotationState = 0;
    this.rotationDuration = 22000;

    this.lastRRUnload = SPACES.READYROOMNORTH;

    this.dimensionBoundary = cg.createPath([[347,298],[347,285],[327,285],[327,278],[319,278],[319,253],[327,253],[327,246],[386,246],[386,252],[377,252],[377,279],[386,279],[386,285],[365,285],[365,298]],"itsDimensionBoundary");
    this.dimensionCutouts = [
      cg.createPath([[339,256],[346,256],[346,275],[339,275]],"itsDimensionCutout0"),
      cg.createPath([[370,275],[363,275],[363,256],[370,256]],"itsDimensionCutout1")
    ];
    this.dimensionMultiplierAreas = [
      cg.createPath([[336,253],[349,253],[349,278],[336,278]],"itsDimensionMultiplierArea0"),
      cg.createPath([[359,253],[383,253],[383,278],[359,278]],"itsDimensionMultiplierArea1")
    ];
    this.dimensionData = {
      positions : [],
      multipliers : [],
      connections : [],
      lowCostPositions : [],
      highCostPositions : [],
      cachedBreadcrumbs : {},
      nearbyDistance : 20,
      nearbySpots : [],
      wanderMaximumIndex : 208,
      wanderInterval : 350,
      primarySpots : [],
      minimumForSecondary : 15,
      secondarySpots : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,40,41,42,59,60,61,72,73,74,85,86,87,98,99,100,111,112,113,124,125,126,137,138,139,150,151,152,189,190,191,192,193,194,195,184,185,186,187,188,204,205,206,207,208]
    };

    this.itsSpotAvailability = [null,null,null];

    this.findPath = (start, end) => {
      if (start===end) { return []; }
      if (start >= this.dimensionData.positions.length || end >= this.dimensionData.positions.length) {
        console.warn("Start or end index does not exist in findPath", start, end);
      }
      let breadcrumbs;
      if (this.dimensionData.cachedBreadcrumbs[start]) {
        breadcrumbs = this.dimensionData.cachedBreadcrumbs[start];
      } else {
        breadcrumbs = this.findBreadcrumbs(start, end)
      }
      const directions = this.findDirectionsFromBreadcrumbs(start, end, breadcrumbs);
      const path = this.findPathFromDirections(directions);
      return path;
    };

    this.findBreadcrumbs = (start, end, fullSearch=false) => {
      let currentNode = start;
      let endNodeX = this.dimensionData.positions[end][0];
      let endNodeY = this.dimensionData.positions[end][1];

      const FCosts = {};
      const GCosts = {};
      GCosts[start] = 0;

      const open = [start];
      const closed = [];
      const breadcrumbs = {};

      let loops = 0;
      while (loops<2000) {
        loops++;

        if (open.length==0) { console.warn("NO OPEN NODES"); break; }
        open.splice(open.indexOf(currentNode),1);
        closed.push(currentNode);

        let currentNodeX = this.dimensionData.positions[currentNode][0];
        let currentNodeY = this.dimensionData.positions[currentNode][1];

        const connections = this.dimensionData.connections[currentNode];
        connections.forEach(function(connection) {
          if (closed.includes(connection)) { return; }
          const connectionNodeX = cg.graphics.its.dimensionData.positions[connection][0];
          const connectionNodeY = cg.graphics.its.dimensionData.positions[connection][1];
          const connectionGCost = (GCosts[currentNode]+Math.sqrt(Math.pow(connectionNodeX-currentNodeX,2)+Math.pow(connectionNodeY-currentNodeY,2)))*cg.graphics.its.dimensionData.multipliers[connection];
          const connectionFCost = Math.sqrt(Math.pow(connectionNodeX-endNodeX,2)+Math.pow(connectionNodeY-endNodeY,2))+connectionGCost;
          if (!FCosts[connection]||connectionFCost < FCosts[connection]) {
            FCosts[connection] = connectionFCost;
            breadcrumbs[connection] = currentNode;
            GCosts[connection] = connectionGCost;
          }
          if (!open.includes(connection)) { open.push(connection); }
        });
        if (open.length==0) {
          if (fullSearch===false) { console.warn("NO NEXT NODE"); }
          break;
        }
        let lowestFCost = FCosts[open[0]];
        let nextNode = open[0];
        for (let i=0;i<open.length;i++) {
          if (lowestFCost > FCosts[open[i]]) {
            lowestFCost = FCosts[open[i]];
            nextNode = open[i];
          }
        }
        if (nextNode==end&&fullSearch===false) { break; }
        currentNode = nextNode;
      }
      if (fullSearch) {
        this.dimensionData.cachedBreadcrumbs[start] = breadcrumbs;
      }
      return breadcrumbs;
    };

    this.findDirectionsFromBreadcrumbs = (start, end, breadcrumbs) => {
      const directions = [end];
      let currentBreadcrumb = breadcrumbs[end];
      let loops = 0;
      while (currentBreadcrumb!=start && loops < 500) {
        loops++;
        directions.push(currentBreadcrumb);
        currentBreadcrumb = breadcrumbs[currentBreadcrumb];
      }
      if (loops>=500) { console.warn("Max loops reached in findDirectionsFromBreadcrumbs",breadcrumbs,start,end); return; }
      directions.push(start);
      return directions.reverse();
    };

    this.findPathFromDirections = (directions) => {
      const path = [];
      for (const index of directions) {
        const position = this.dimensionData.positions[index];
        path.push(position);
      }
      return path;
    }

    this.calibratePocketDimension = () => {
      const topLeft = [315.5,241.5];
      const widthHeight = [200,200];
      const spacing = 3;
      const c = cg.canvases.main.c;

      let index = 0;
      for (let y=topLeft[1];y<widthHeight[1]+topLeft[1];y+=spacing) {
        for (let x=topLeft[0];x<widthHeight[0]+topLeft[0];x+=spacing) {
          let isValid = true;
          c.beginPath();
          for (const point of this.dimensionBoundary) {
            c.lineTo(point[0],point[1]);
          }
          c.closePath();
          if (!c.isPointInPath(x,y)) { continue; }
          for (const cutout of this.dimensionCutouts) {
            c.beginPath();
            for (const point of cutout) {
              c.lineTo(point[0],point[1]);
            }
            c.closePath();
            if (c.isPointInPath(x,y)) {
              isValid = false;
              break;
            }
          }
          if (!isValid) { continue; }
          let multiplier = 1;
          for (const multiplierArea of this.dimensionMultiplierAreas) {
            c.beginPath();
            for (const point of multiplierArea) {
              c.lineTo(point[0],point[1]);
            }
            c.closePath();
            if (c.isPointInPath(x,y)) {
              multiplier = 2;
              break;
            }
          }
          const position = [x,y];
          this.dimensionData.connections[index] = [];
          this.dimensionData.positions[index] = position;
          this.dimensionData.multipliers[index] = multiplier;
          if (multiplier===1) {
            this.dimensionData.lowCostPositions.push(position);
          } else {
            this.dimensionData.highCostPositions.push(position);
            this.dimensionData.primarySpots.push(index);
          }
          let upLeftIndex = -1;
          let upIndex = -1;
          let upRightIndex = -1;
          let leftIndex = -1;
          for (let comparisonIndex=0;comparisonIndex<this.dimensionData.positions.length;comparisonIndex++) {
            const comparisonPosition = this.dimensionData.positions[comparisonIndex];
            if (comparisonPosition[0]===x && comparisonPosition[1]===y-spacing) {
              upIndex = comparisonIndex;
            } else if (comparisonPosition[0]===x-spacing && comparisonPosition[1]===y-spacing) {
              upLeftIndex = comparisonIndex;
            } else if (comparisonPosition[0]===x+spacing && comparisonPosition[1]===y-spacing) {
              upRightIndex = comparisonIndex;
            } else if (comparisonPosition[0]===x-spacing && comparisonPosition[1]===y) {
              leftIndex = comparisonIndex;
            }
          }
          if (upLeftIndex!==-1) {
            this.dimensionData.connections[index].push(upLeftIndex);
            this.dimensionData.connections[upLeftIndex].push(index);
          }
          if (upIndex!==-1) {
            this.dimensionData.connections[index].push(upIndex);
            this.dimensionData.connections[upIndex].push(index);
          }
          if (upRightIndex!==-1) {
            this.dimensionData.connections[index].push(upRightIndex);
            this.dimensionData.connections[upRightIndex].push(index);
          }
          if (leftIndex!==-1) {
            this.dimensionData.connections[index].push(leftIndex);
            this.dimensionData.connections[leftIndex].push(index);
          }
          index++;
        }
      }

      this.itsSpotAvailability[0] = new Array(this.dimensionData.positions.length).fill(true);
      this.itsSpotAvailability[1] = new Array(this.dimensionData.positions.length).fill(true);
      this.itsSpotAvailability[2] = new Array(this.dimensionData.positions.length).fill(true);

      for (let i=0;i<this.dimensionData.positions.length;i++) {
        this.dimensionData.nearbySpots[i] = [];
      }

      for (let index=0;index<this.dimensionData.positions.length;index++) {
        const indexX = this.dimensionData.positions[index][0];
        const indexY = this.dimensionData.positions[index][1];
        for (let checkI=0;checkI<this.dimensionData.positions.length;checkI++) {
          if (this.dimensionData.nearbySpots[index].includes(checkI)) { continue; }
          if (this.dimensionData.nearbySpots[checkI].includes(index)) { continue; }
          const checkX = this.dimensionData.positions[checkI][0];
          const checkY = this.dimensionData.positions[checkI][1];
          const distance = Math.sqrt(Math.pow(checkX-indexX,2)+Math.pow(checkY-indexY,2));
          if (distance <= this.dimensionData.nearbyDistance) {
            this.dimensionData.nearbySpots[index].push(checkI);
            this.dimensionData.nearbySpots[checkI].push(index);
          }
        }
      }

      return this.dimensionData;
    };

    this.calibratePocketDimension();

    this.advanceRotation = () => {
      if (cg.clock - this.targetRotationChangeTime < this.rotationDuration) {
        return;
      }
      this.targetRotationState++;
      this.targetRotationChangeTime = cg.clock;
      preshows.emptyITS = false;
    };

    this.EventBlock = class EventBlock {
      startTime;
      endTime;
      repeatDelay;
      getTitle;
      getColour;
      slot;
      started = false;

      onStart = null;
      onEnd = null;

      get nextStartTime() {
        return this.startTime + this.repeatDelay;
      }

      get nextEndTime() {
        const duration = this.endTime - this.startTime;
        return this.nextStartTime + duration;
      }

      get nextNextStartTime() {
        return this.nextStartTime + this.repeatDelay;
      }

      get nextNextEndTime() {
        const duration = this.endTime - this.startTime;
        return this.nextNextStartTime + duration;
      }

      constructor(init) {
        this.startTime = init.startTime;
        this.endTime = init.endTime;
        this.repeatDelay = init.repeatDelay;
        this.getTitle = init.getTitle;
        this.getColour = init.getColour;
        this.slot = init.slot;
        this.onStart = init.onStart;
        this.onEnd = init.onEnd;
      }

      jumpToNextTimes() {
        const duration = this.endTime - this.startTime;
        this.startTime = this.startTime + this.repeatDelay;
        this.endTime = this.startTime + duration;
        this.started = false;
      }

      get isActive() {
        return cg.graphics.its.clock >= this.startTime && cg.graphics.its.clock < this.endTime;
      }

      update() {
        const clock = cg.graphics.its.clock;
        if (clock >= this.endTime) {
          this.onEnd(this);
          this.jumpToNextTimes();
        }
        if (this.isActive && !this.started) {
          this.started = true;
          this.onStart(this);
        }
      }
    };

    this.events = [];
    this.eventsById = {};

    for (let i=0;i<init.events.length;i++) {
      const eventInit = init.events[i];
      const eventBlock = new this.EventBlock(eventInit);
      this.events.push(eventBlock);
      this.eventsById[eventInit.id] = eventBlock;
    }
    delete init.events;

    this.advanceClock = () => {
      if (cg.timeSinceLastFrame < cg.settings.core.inactiveTime) {
        if (!preshows.isITSEntranceOpen&&this.pauseClockUntilEntranceClosed) {
          this.pauseClockUntilEntranceClosed = false;
        }
        if (!preshows.isITSExitOpen&&this.pauseClockUntilExitClosed) {
          this.pauseClockUntilExitClosed = false;
        }
        if (this.pauseClockUntilEntranceClosed && preshows.isITSEntranceOpen
         || this.pauseClockUntilExitClosed && preshows.isITSExitOpen) {
          return;
        }
        if (this.pauseUntilHangerAlertIsClear && preshows.lastHangerOverloadAlertTime + preshows.hangerOverloadAlertCooldown > cg.clock) {
          return;
        } else {
          this.pauseUntilHangerAlertIsClear = false;
        }
        this.clock += cg.timeSinceLastFrame * cg.settings.core.timeScale;
      }
    }
  },
  draw(c,ax,ay,canvas) {
    const width = cg.images.its_empty.width;
    const height = cg.images.its_empty.height;
    canvas.drawImage(cg.images.its_empty,-3,-62,width,height,-90);
    canvas.drawImage(cg.images.its_empty,-52,34,width,height,-120-90);
    canvas.drawImage(cg.images.its_empty,55,28,width,height,-240-90);

    if (cg.graphics.debug.active) {
      c.globalAlpha = 0.2;
      c.textAlign = "center";
      c.font = "30px Aurebesh_english";
      c.fillStyle = "#00ff00";
      c.fillText("1",0,-50);
      c.fillText("0",-50,36);
      c.fillText("2",50,36);
      c.globalAlpha = 1;
    }

    this.advanceClock();

    for (const event of this.events) {
      event.update(this.clock);
    }

    if (this.rotationState !== this.targetRotationState) {
      const timeSinceLastRotation = cg.clock - this.targetRotationChangeTime;
      if (timeSinceLastRotation >= this.rotationDuration) {
        this.rotationState++;
        this.targetRotationChangeTime = cg.clock;
        cg.scenes.main.items.its.transform.r = -this.rotationState * 120;
        return;
      }
      let phase = Math.min(1, timeSinceLastRotation / this.rotationDuration);
      phase = cg.Animation.easeFunctions.inOutSine(phase);
      cg.scenes.main.items.its.transform.r = -this.rotationState * 120 - phase * 120;
    }

    cg.graphics.its0Door.draw(cg.canvas.c);
    cg.graphics.its1Door.draw(cg.canvas.c);
    cg.graphics.its2Door.draw(cg.canvas.c);
  }
}

cg.graphicTypes.itsFlashes = {
  setup(init) {
    this.offTime = -Infinity;
    this.fadeOffDuration = 400;
  },
  draw(c,ax,ay,canvas) {
    if (cg.clock > this.offTime + this.fadeOffDuration) {
      return;
    } else if (cg.clock >= this.offTime) {
      c.globalAlpha = 1 - (cg.clock - this.offTime) / this.fadeOffDuration;
    }
    const width = cg.images.its_attack.width;
    const height = cg.images.its_attack.height;
    canvas.drawImage(cg.images.its_attack,-3,-62,width,height,-90);
  }
}
cg.createGraphic({
  type : "itsFlashes"
},"itsFlashes");

cg.createSequence({
  callbacks : {
    "100" : () => {
      cg.graphics.itsFlashes.offTime = cg.clock + 100;
    },
    "200" : () => {
      cg.graphics.itsFlashes.offTime = cg.clock + 200;
    },
    "1000" : () => {
      cg.graphics.itsFlashes.offTime = cg.clock + 1000;
    },
    "5000" : () => {
      cg.graphics.itsFlashes.offTime = cg.clock + 5000;
    }
  },
  data : ["100",500,"100",400,"200",1000,"1000",1300,"100",300,"100",400,"200",350,"200",200,"100",350,"100",200,"100",1000,"1000",1200,"200",500,"5000",6000,"100",200,"100",150,"100",200,"200",350,"100",200,"100",150,"100",300,"1000",1400,"1000",1300,"1000",1400,"1000",150,"100",200,"100",150,"100",150,"100",200,"100",150,"100",150,"100",200,"100",150,"100",300,"1000",1400,"1000",1300,"1000",1400,"1000",150,"100",200,"100",150,"100",150,"200"]
},"itsAttack");

cg.createGraphic({
  type : "its",
  events : [
    {
      id : "itsLoading",
      startTime : 20000,
      endTime : 100000-18000-5000,
      repeatDelay : 100000,
      getTitle : (eventBlock) => {
        if (!eventBlock.event.isActive||!eventBlock.isPrimary) {
          return "(UN)LOAD";
        }
        const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
        const loadITS = cg.graphics.its.rotationState % 3;
        const loadDoor = cg.graphics["its" + loadITS + "Door"];
        const unloadDoor = cg.graphics["its" + unloadITS + "Door"];
        if (loadDoor.isOpen&&unloadDoor.isOpen) {
          return "(UN)LOAD";
        } else if (loadDoor.isOpen) {
          return "LOAD";
        } else if (unloadDoor.isOpen) {
          return "UNLOAD";
        } else {
          return "READY";
        }
      },
      getColour : (eventBlock) => {
        const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
        const loadITS = cg.graphics.its.rotationState % 3;
        const loadDoor = cg.graphics["its" + loadITS + "Door"];
        const unloadDoor = cg.graphics["its" + unloadITS + "Door"];
        if (loadDoor.isOpen||unloadDoor.isOpen||!eventBlock.event.isActive||!eventBlock.isPrimary) {
          return "#3882ef";
        } else {
          return "#38bbef";
        }
      },
      slot : 2,
      onStart : () => {
        if (preshows.isOutsidePopulated) {
          const loadITS = (cg.graphics.its.rotationState) % 3;
          preshows.openITSEntranceDoor(loadITS);
        }
      },
      onEnd : () => {
        const middleITS = (cg.graphics.its.rotationState+2) % 3;
        if (preshows.censuses["its"+middleITS] > 0) {
          cg.graphics.its.pauseUntilHangerAlertIsClear = true;
        }
        if (preshows.isITSEntranceOpen) {
          cg.graphics.its.pauseClockUntilEntranceClosed = true;
        }
        if (preshows.isITSExitOpen) {
          cg.graphics.its.pauseClockUntilExitClosed = true;
        }
      }
    },
    {
      id : "itsRotate",
      startTime : 100000-22000+500,
      endTime : 100000+2000,
      repeatDelay : 100000,
      getTitle : () => "ROT",
      getColour : () => "#86acff",
      slot : 2,
      onStart : () => {
        cg.graphics.its.advanceRotation();
        cg.createEvent({
          duration : 36000,
          end : () => {
            cg.sequences.itsAttack.run();
          }
        });
        const middleITS = (cg.graphics.its.rotationState+2) % 3;
        if (preshows.censuses["its"+middleITS] > 0) {
          cg.createEvent({
            duration : 12000,
            end : () => {
              moveCM("deshipper","deshipperGreet");
            }
          })
        }
      },
      onEnd : () => {
        const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
        if (preshows.censuses["its"+unloadITS] > 0) {
          preshows.openITSExitDoor(unloadITS);
          cg.createEvent({
            duration : 8000,
            end : () => {
              preshows.emptyITS = true;
            }
          });
          cg.createEvent({
            duration : 45000,
            end : () => {
              preshows.setHangerToEmpty();
            }
          });
        }
        if (rotr.lsbsArmPreshowSequence) {
          cg.sequences.lsbsPreshows.run();
        }
      }
    },
    {
      id : "rrNLoad",
      startTime : 100000+500-16000,
      endTime : 223000-16000,
      repeatDelay : 100000*2,
      getTitle : (eventBlock) => {
        if (eventBlock.isPrimary) {
          if (preshows.isReadyRoomNorthLoaded && eventBlock.event.isActive) {
            return "READY";
          } else if (cg.graphics.readyRoomNorthExitDoor.isOpen) {
            return "UNLOAD";
          } else {
            return "LOAD"
          }
        } else {
          return "LOAD"
        }
      },
      getColour : (eventBlock) => {
        if (eventBlock.isPrimary) {
          if (preshows.isReadyRoomNorthLoaded && eventBlock.event.isActive) {
            return "#00ce60";
          } else if (cg.graphics.readyRoomNorthExitDoor.isOpen) {
            return "#e46f2f";
          } else {
            return "#86acff"
          }
        } else {
          return "#86acff";
        }
      },
      slot : 0,
      onStart : () => {},
      onEnd : () => {}
    },
    {
      id : "rrNShow",
      startTime : 100000-500-75000-16000,
      endTime : 100000-500-16000,
      repeatDelay : 100000*2,
      getTitle : (eventBlock) => {
        if (eventBlock.isPrimary
           && !preshows.isReadyRoomNorthRunning
           && eventBlock.event.isActive) {
          return "MISSED";
        } else if (eventBlock.isPrimary
          && preshows.isReadyRoomNorthRunning
          && eventBlock.event.isActive) {
          return "RUNNING";
        } else {
          return "SHOW";
        }
      },
      getColour : (eventBlock) => {
        if (eventBlock.isPrimary
           && !preshows.isReadyRoomNorthRunning
           && eventBlock.event.isActive) {
          return "#260033";
        } else if (eventBlock.isPrimary
          && preshows.isReadyRoomNorthRunning
          && eventBlock.event.isActive) {
          return "#003261";
        } else {
          return "#000261";
        }
      },
      slot : 0,
      onStart : (eventBlock) => {
        if (preshows.isReadyRoomNorthLoaded) {
          preshows.isReadyRoomNorthRunning = true;
          preshows.rrNorthLights.activate();
          cg.createEvent({
            duration : 8000,
            end : () => {
              preshows.rrnbb8Onstage = false;
            }
          })
        }
      },
      onEnd : () => {
        if (preshows.isReadyRoomNorthRunning) {
          preshows.isReadyRoomNorthRunning = false;
          preshows.openReadyRoomNorthExitDoor();
          preshows.rrNorthLights.deactivate()
        }
      }
    },
    {
      id : "rrSLoad",
      startTime : 1000-16000,
      endTime : 124000-16000,
      repeatDelay : 100000*2,
      getTitle : (eventBlock) => {
        if (eventBlock.isPrimary) {
          if (preshows.isReadyRoomSouthLoaded && eventBlock.event.isActive) {
            return "READY";
          } else if (cg.graphics.readyRoomSouthExitDoor.isOpen) {
            return "UNLOAD";
          } else {
            return "LOAD"
          }
        } else {
          return "LOAD"
        }
      },
      getColour : (eventBlock) => {
        if (eventBlock.isPrimary) {
          if (preshows.isReadyRoomSouthLoaded && eventBlock.event.isActive) {
            return "#00ce60";
          } else if (cg.graphics.readyRoomSouthExitDoor.isOpen) {
            return "#e46f2f";
          } else {
            return "#86acff"
          }
        } else {
          return "#86acff";
        }
      },
      slot : 1,
      onStart : () => {},
      onEnd : () => {}
    },
    {
      id : "rrSShow",
      startTime : -75000-16000,
      endTime : 0-16000,
      repeatDelay : 100000*2,
      getTitle : (eventBlock) => {
        if (eventBlock.isPrimary
           && !preshows.isReadyRoomSouthRunning
           && eventBlock.event.isActive) {
          return "MISSED";
        } else if (eventBlock.isPrimary
          && preshows.isReadyRoomSouthRunning
          && eventBlock.event.isActive) {
          return "RUNNING";
        } else {
          return "SHOW";
        }
      },
      getColour : (eventBlock) => {
        if (eventBlock.isPrimary
           && !preshows.isReadyRoomSouthRunning
           && eventBlock.event.isActive) {
          return "#260033";
        } else if (eventBlock.isPrimary
          && preshows.isReadyRoomSouthRunning
          && eventBlock.event.isActive) {
          return "#003261";
        } else {
          return "#000261";
        }
      },
      slot : 1,
      onStart : (eventBlock) => {
        if (preshows.isReadyRoomSouthLoaded) {
          preshows.isReadyRoomSouthRunning = true;
          preshows.rrSouthLights.activate();
          cg.createEvent({
            duration : 8000,
            end : () => {
              preshows.rrsbb8Onstage = false;
            }
          })
        }
      },
      onEnd : () => {
        if (preshows.isReadyRoomSouthRunning) {
          preshows.isReadyRoomSouthRunning = false;
          preshows.openReadyRoomSouthExitDoor();
          preshows.rrSouthLights.deactivate()
        }
      }
    }
  ]
},"its");

cg.createPath([[313,385.5],[315.5,401]],"readyRoomNorthEntranceDoor");

cg.createGraphic({
  type : "door",
  left : cg.paths.readyRoomNorthEntranceDoor[0],
  right : cg.paths.readyRoomNorthEntranceDoor[1]
},"readyRoomNorthEntranceDoor");

cg.scenes.main.createItem("graphic",{
  graphic : cg.graphics.readyRoomNorthEntranceDoor
},"readyRoomNorthEntranceDoor","midground");

cg.createPath([[311,419],[301,431]],"readyRoomSouthEntranceDoor");

cg.createGraphic({
  type : "door",
  left : cg.paths.readyRoomSouthEntranceDoor[0],
  right : cg.paths.readyRoomSouthEntranceDoor[1]
},"readyRoomSouthEntranceDoor");

cg.scenes.main.createItem("graphic",{
  graphic : cg.graphics.readyRoomSouthEntranceDoor
},"readyRoomSouthEntranceDoor","midground");

cg.createPath([[362,389],[355.8,412.5]],"readyRoomNorthExitDoor");

cg.createGraphic({
  type : "door",
  left : cg.paths.readyRoomNorthExitDoor[0],
  right : cg.paths.readyRoomNorthExitDoor[1]
},"readyRoomNorthExitDoor");

cg.scenes.main.createItem("graphic",{
  graphic : cg.graphics.readyRoomNorthExitDoor
},"readyRoomNorthExitDoor","midground");

cg.createPath([[351,429],[345,453]],"readyRoomSouthExitDoor");

cg.createGraphic({
  type : "door",
  left : cg.paths.readyRoomSouthExitDoor[0],
  right : cg.paths.readyRoomSouthExitDoor[1]
},"readyRoomSouthExitDoor");

cg.scenes.main.createItem("graphic",{
  graphic : cg.graphics.readyRoomSouthExitDoor
},"readyRoomSouthExitDoor","midground");

cg.createGraphic({
  type : "door",
  left : [-78,29],
  right : [-65,53]
},"its0Door");

cg.createGraphic({
  type : "door",
  left : [-12,-83],
  right : [14,-83]
},"its1Door");

cg.createGraphic({
  type : "door",
  left : [77.5,31],
  right : [65,53]
},"its2Door");

const preshows = new class Preshows {
  allowEnterMerge = true;
  allowEnterReadyRoom = false;
  lastMergeLeaveTime = -Infinity;
  mergeLeaveBufferDuration = 6500;
  run = 0;

  mainQueueEnable = true;
  llQueueEnable = true;
  busyness = "high";

  isOutsidePopulated = false;

  isReadyRoomNorthLoaded = false;
  isReadyRoomSouthLoaded = false;

  isReadyRoomNorthRunning = false;
  isReadyRoomSouthRunning = false;

  isITSEntranceOpen = false;
  isITSExitOpen = false;

  emptyITS = false;

  FILL = "fill";
  EMPTY = "empty";

  censuses = {
    mainQueue : 0,
    llQueue : 0,
    merge : 0,
    readyRoomNorth : 0,
    readyRoomSouth : 0,
    outside : 0,
    its0 : 0,
    its1 : 0,
    its2 : 0,
    destroyerQueueLeft : 0,
    destroyerQueueRight : 0
  }

  nextITSWander = 0;

  nextQueueBufferTime = 0;
  nextLLBufferTime = 0;
  queueBuffer = 0;
  llBuffer = 0;

  queueToPull = "main";
  pulledSinceLastSwitch = 0;

  nextITSEmptyTime = 0;

  rrnbb8Onstage = true;
  rrsbb8Onstage = true;

  rrNorthLights = cg.scenes.main.createItem("graphic",{
    graphic : cg.createGraphic({
      type : "readyRoomLights",
      image : cg.images.rr1
    },"readyRoomLights1")
  },"readyRoomLights1","foreground").graphic;

  rrSouthLights = cg.scenes.main.createItem("graphic",{
    graphic : cg.createGraphic({
      type : "readyRoomLights",
      image : cg.images.rr2
    },"readyRoomLights2")
  },"readyRoomLights2","foreground").graphic;

  lastHangerOverloadAlertTime = -Infinity;
  hangerOverloadAlertCooldown = 10000;

  rrNEnterCheckpoints = cg.createPath([[314,391],[315,394]],"rrEnterCheckpoints");
  rrNExitCheckpoints = cg.createPath([[360,397],[358,404]],"rrExitCheckpoints");
  rrSEnterCheckpoints = cg.createPath([[307,424],[305,426]],"rrEnterCheckpoints");
  rrSExitCheckpoints = cg.createPath([[349,437],[347,444]],"rrExitCheckpoints");

  update() {
    if (this.queueBuffer > 0 && this.censuses.mainQueue < cg.paths.mainQueue.length) {
      this.queueBuffer--;
      addGuestToMainQueue();
    }
    if (this.nextQueueBufferTime < cg.clock) {
      if (preshows.mainQueueEnable) {
        this.queueBuffer += Math.ceil(Math.random()*4);
      }
      let duration = 0;
      if (this.censuses.mainQueue<120) {
        duration = 2000 + Math.random()*2000;
      } else if (this.censuses.mainQueue<200) {
        duration = 4000 + Math.random()*8000;
      } else if (this.censuses.mainQueue<230) {
        duration = 15000 + Math.random()*20000;
      } else {
        duration = 30000 + Math.random()*30000;
      }
      if (preshows.busyness==="low") {
        duration *= 5;
      }
      this.nextQueueBufferTime = cg.clock + duration;
    }
    if (this.llBuffer > 0 && this.censuses.llQueue < cg.paths.llQueue.length) {
      this.llBuffer--;
      addGuestToLLQueue();
    }
    if (this.nextLLBufferTime < cg.clock) {
      if (preshows.llQueueEnable) {
        this.llBuffer += Math.ceil(Math.random()*4);
      }
      let duration = 0;
      if (this.censuses.llQueue<10) {
        duration = 6000 + Math.random()*15000;
      } else if (this.censuses.llQueue<20) {
        duration = 20000 + Math.random()*20000;
      } else if (this.censuses.llQueue<30) {
        duration = 50000 + Math.random()*40000;
      } else {
        duration = 80000 + Math.random()*60000;
      }
      if (preshows.busyness==="low") {
        duration *= 4;
      }
      this.nextLLBufferTime = cg.clock + duration;
    }
    if (this.nextITSWander < cg.clock) {
      this.nextITSWander = cg.clock + cg.graphics.its.dimensionData.wanderInterval;
      this.itsWander();
    }
    if (
      (cg.graphics.readyRoomNorthEntranceDoor.isOpen && cg.clock - cg.graphics.readyRoomNorthEntranceDoor.openTime > cg.graphics.readyRoomNorthEntranceDoor.changeDuration)
      ||
      (cg.graphics.readyRoomSouthEntranceDoor.isOpen && cg.clock - cg.graphics.readyRoomSouthEntranceDoor.openTime > cg.graphics.readyRoomSouthEntranceDoor.changeDuration)
    ) {
      this.pullGuestsIntoReadyRoom();
    }
    this.pullGuestsIntoDestroyerQueues();
    if (this.allowEnterMerge) { preshows.pullGuestFromMainOrLLQueue(); }
    if (this.isITSEntranceOpen) { this.pullGuestsIntoITS(); }
    this.pullGuestsFromReadyRoom();
    if (this.emptyITS && this.nextITSEmptyTime < cg.clock) {
      this.nextITSEmptyTime = cg.clock + 50;
      this.pullGuestFromITS();
    }
    this.run++;
  };

  itsWander() {
    const ship = Math.floor(Math.random()*3);
    const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
    if (ship === unloadITS) { return; }
    const candidates = humanishCircles.filter(
      (guest) => guest.space === SPACES["ITS" + ship]
      && guest.enteringITS !== true
      && guest.path.length === 0
    );
    if (candidates.length === 0) { return; }
    const candidate = candidates[Math.floor(Math.random()*candidates.length)];
    const targets = cg.graphics.its.dimensionData.nearbySpots[candidate.itsSpot];
    const target = targets[Math.floor(Math.random()*targets.length)];
    if (cg.graphics.its.itsSpotAvailability[target]===false) { return; }
    if (target > cg.graphics.its.dimensionData.wanderMaximumIndex) { return; }
    const path = cg.graphics.its.findPath(candidate.itsSpot, target);
    for (const position of path) {
      candidate.path.push(position);
    }
    candidate.itsSpot = target;
  };

  pullGuestFromMainOrLLQueue() {
    let hasOpenSpot = false;
    for (let i=0;i<crowdParameters.merge.open.length;i++) {
      if (crowdParameters.merge.open[i]) {
        hasOpenSpot = true;
        break;
      }
    }
    if (hasOpenSpot===false) { return; }
    const frontGuest = humanishCircles.filter(
      (guest) => guest.state === "queue" && guest.queueData === queues[this.queueToPull] && guest.queuePosition === 0 && guest.path.length <= 15
    )[0];
    if (!frontGuest) {
      this.pulledSinceLastSwitch = 0;
      this.queueToPull = this.queueToPull === "main" ? "ll" : "main";
      return;
    }

    this.pulledSinceLastSwitch++;
    if (this.pulledSinceLastSwitch >= 20) {
      this.pulledSinceLastSwitch = 0;
      this.queueToPull = this.queueToPull === "main" ? "ll" : "main";
    }

    preshows.censuses[this.queueToPull+"Queue"]--;
    preshows.censuses.merge++;

    frontGuest.enterCrowd(crowdParameters.merge);
    frontGuest.space = SPACES.MERGE;
  };

  setMergeToEmpty(isNorth=true) {
    this.allowEnterMerge = false;
    crowdParameters.merge.activeEmptySet = isNorth ? 0 : 1;
    const guestsInMerge = humanishCircles.filter(
      (guest) => guest.space === SPACES.MERGE && guest.state !== "cm"
    );
    for (const guest of guestsInMerge) {
      guest.crowdIntention = preshows.EMPTY;
    }
  };

  pullGuestsIntoReadyRoom() {
    const readyRoomCrowd = crowdParameters.merge.activeEmptySet === 0 ? crowdParameters.readyRoomNorth : crowdParameters.readyRoomSouth;

    const exits = crowdParameters.merge.exits[crowdParameters.merge.activeEmptySet];

    for (const exit of exits) {
      if (crowdParameters.merge.open[exit] === false) {
        const guest = humanishCircles.filter(
          (guest) => guest.state === "crowd" && guest.crowdParameters === crowdParameters.merge && guest.crowdPosition === exit
        )[0];
        if (!guest) {
          console.error("Guest could not be found at merge exit", exit);
          return;
        }

        let closestX = 0;
        let closestY = 0;
        let closestDistance = Infinity;
        const readyRoomSide = crowdParameters.merge.activeEmptySet === 0 ? "N" : "S";
        for (const position of this[`rr${readyRoomSide}EnterCheckpoints`]) {
          const distance = Math.sqrt(Math.pow(guest.x - position[0], 2) + Math.pow(guest.y - position[1], 2));
          if (distance < closestDistance) {
            closestX = position[0];
            closestY = position[1];
            closestDistance = distance;
          }
        }

        guest.path.push([closestX, closestY]);

        preshows.censuses["readyRoom" + (crowdParameters.merge.activeEmptySet === 0 ? "North" : "South")]++;
        preshows.censuses.merge--;
        preshows.lastMergeLeaveTime = cg.clock;
        guest.enterCrowd(readyRoomCrowd);
        guest.space = crowdParameters.merge.activeEmptySet === 0 ? SPACES.READYROOMNORTH : SPACES.READYROOMSOUTH;
      }
    }
  };

  setReadyRoomNorthToEmpty() {
    const guests = humanishCircles.filter(
      (guest) => guest.space === SPACES.READYROOMNORTH && guest.state !== "cm"
    );
    if (guests.length === 0) { return; }
    this.isReadyRoomNorthLoaded = false;
    for (const guest of guests) {
      guest.crowdIntention = this.EMPTY;
    }
  }

  setReadyRoomSouthToEmpty() {
    const guests = humanishCircles.filter(
      (guest) => guest.space === SPACES.READYROOMSOUTH && guest.state !== "cm"
    );
    if (guests.length === 0) { return; }
    this.isReadyRoomSouthLoaded = false;
    for (const guest of guests) {
      guest.crowdIntention = this.EMPTY;
    }
  };

  pullGuestsFromReadyRoom() {
    let guests = null;
    if (cg.graphics.readyRoomNorthExitDoor.isOpen && preshows.censuses.readyRoomNorth > 0
      && cg.clock - cg.graphics.readyRoomNorthExitDoor.openTime > cg.graphics.readyRoomNorthExitDoor.changeDuration
    ) {
      guests = humanishCircles.filter(
        (guest) => guest.space === SPACES.READYROOMNORTH && guest.state !== "cm"
        && crowdParameters.readyRoomNorth.exits[0].includes(guest.crowdPosition)
      );
    } else if (cg.graphics.readyRoomSouthExitDoor.isOpen
      && cg.clock - cg.graphics.readyRoomSouthExitDoor.openTime > cg.graphics.readyRoomSouthExitDoor.changeDuration
    ) {
      guests = humanishCircles.filter(
        (guest) => guest.space === SPACES.READYROOMSOUTH && guest.state !== "cm"
        && crowdParameters.readyRoomSouth.exits[0].includes(guest.crowdPosition)
      );
    }
    if (!guests || guests.length === 0) { return; }

    for (const guest of guests) {
      preshows.censuses["readyRoom" + (guest.space === SPACES.READYROOMNORTH ? "North" : "South")]--;
      preshows.censuses.outside++;

      let closestX = 0;
      let closestY = 0;
      let closestDistance = Infinity;
      const readyRoomSide = guest.space === SPACES.READYROOMNORTH ? "N" : "S";
      for (const position of this[`rr${readyRoomSide}ExitCheckpoints`]) {
        const distance = Math.sqrt(Math.pow(guest.x - position[0], 2) + Math.pow(guest.y - position[1], 2));
        if (distance < closestDistance) {
          closestX = position[0];
          closestY = position[1];
          closestDistance = distance;
        }
      }

      guest.path.push([closestX, closestY]);

      guest.enterCrowd(crowdParameters.outside);
      guest.space = SPACES.OUTSIDE;
    }
  };

  setOutsideToEmpty() {
    const guests = humanishCircles.filter(
      (guest) => guest.space === SPACES.OUTSIDE && guest.state !== "cm"
    );
    if (guests.length === 0) { return; }
    for (const guest of guests) {
      guest.crowdIntention = preshows.EMPTY;
    }
  };

  pullGuestsIntoITS() {
    let guests = humanishCircles.filter(
        (guest) => guest.space === SPACES.OUTSIDE && guest.enteringITS !== true && guest.state !== "cm"
        && crowdParameters.outside.exits[0].includes(guest.crowdPosition)
      );
    if (!guests || guests.length === 0) { return; }

    for (const guest of guests) {
      crowdParameters.outside.open[guest.crowdPosition] = true;
      guest.enteringITS = true;
      guest.path.push([469,417]);
    }
  };

  pullGuestFromITS() {
    const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
    const guests = humanishCircles.filter(
      (guest) => guest.space === SPACES["ITS" + unloadITS]
      && guest.exitingITS !== true
    );
    guests.sort((a,b) => b.y - a.y);
    if (guests.length === 0) { return; }
    const guest = guests[0];
    const path = cg.graphics.its.findPath(guest.itsSpot, 230 - Math.round(Math.random()));
    for (const position of path) {
      guest.path.push(position);
    }
    guest.path.push([352,309]);
    guest.exitingITS = true;
  };

  setHangerToEmpty() {
    const guests = humanishCircles.filter(
      (guest) => guest.space === SPACES.HANGER && guest.state !== "cm"
    );
    if (guests.length === 0) { return; }
    for (const guest of guests) {
      guest.crowdIntention = this.EMPTY;
    }
  };

  pullGuestsIntoDestroyerQueues() {
    const guests = humanishCircles.filter(
      (guest) => guest.space === SPACES.HANGER && guest.state !== "cm"
      && crowdParameters.hanger.exits[0].includes(guest.crowdPosition)
      && guest.path.length === 0
    );
    if (guests.length === 0) { return; }
    let side = Math.round(Math.random()) ? "Left" : "Right";
    if (this.censuses["destroyerQueue" + side] >= queues["destroyer" + side].points.length && this.censuses["destroyerQueue" + (side==="Left"?"Right":"Left")] < queues["destroyer" + (side==="Left"?"Right":"Left")].points.length) {
      side = side === "Left" ? "Right" : "Left";
    }
    if (this.censuses["destroyerQueue" + side]+guests.length > queues["destroyer" + side].points.length) {
      preshows.lastHangerOverloadAlertTime = cg.clock;
      return;
    }

    for (const guest of guests) {
      guest.state = "queue";
      guest.space = SPACES["DESTROYERQUEUE" + side.toUpperCase()];
      guest.path.push([658,213]);
      guest.crowdParameters.open[guest.crowdPosition] = true;
      guest.queueData = queues["destroyer" + side];
      this.censuses["destroyerQueue" + side]++;
      for (let i=guest.queueData.points.length-1;i>=0;i--) {
        if (guest.queueData.occupied[i-1]||i===guest.queueData.points.length-1) {
          guest.queuePosition = i;
          guest.queueData.occupied[i] = true;
          break;
        } else {
          guest.path.push(guest.queueData.points[i]);
        }
      }
    }
  };

  createStartingGuests() {
    const MAINSTARTINGGUESTS = 130;
    preshows.censuses.mainQueue += MAINSTARTINGGUESTS;
    for (let i=0;i<MAINSTARTINGGUESTS;i++) {
      addHumanishCircle({
        x:queues.main.points[i][0],
        y:queues.main.points[i][1],
        state:"queue",
        queueData:queues.main,
        queuePosition : i+1,
        space : SPACES.MAINQUEUE
      });
    }

    const DESTROYERSTARTINGGUESTS = 45;
    preshows.censuses.destroyerQueueLeft += DESTROYERSTARTINGGUESTS;
    for (let i=0;i<DESTROYERSTARTINGGUESTS;i++) {
      addHumanishCircle({
        x:queues.destroyerLeft.points[i][0],
        y:queues.destroyerLeft.points[i][1],
        state:"queue",
        queueData:queues.destroyerLeft,
        queuePosition : i+1,
        space : SPACES.DESTROYERQUEUELEFT
      });
    }

    preshows.censuses.destroyerQueueRight += DESTROYERSTARTINGGUESTS;
    for (let i=0;i<DESTROYERSTARTINGGUESTS;i++) {
      addHumanishCircle({
        x:queues.destroyerRight.points[i][0],
        y:queues.destroyerRight.points[i][1],
        state:"queue",
        queueData:queues.destroyerRight,
        queuePosition : i+1,
        space : SPACES.DESTROYERQUEUERIGHT
      });
    }
  };

  get canOpenReadyRoomNorthEntranceDoor() {
    return !this.isReadyRoomNorthLoaded // Not loaded
    && !cg.graphics.readyRoomNorthEntranceDoor.isOpen // Door not already open
    && !cg.graphics.readyRoomNorthExitDoor.isOpen // Exit door not open
    && cg.clock - cg.graphics.readyRoomNorthEntranceDoor.openTime > cg.graphics.readyRoomNorthEntranceDoor.changeDuration // Door has been closed long enough
    && !cg.graphics.readyRoomSouthEntranceDoor.isOpen // South entrance door not open
  };

  get canOpenReadyRoomSouthEntranceDoor() {
    return !this.isReadyRoomSouthLoaded // Not loaded
    && !cg.graphics.readyRoomSouthEntranceDoor.isOpen // Door not already open
    && !cg.graphics.readyRoomSouthExitDoor.isOpen // Exit door not open
    && cg.clock - cg.graphics.readyRoomSouthEntranceDoor.openTime > cg.graphics.readyRoomSouthEntranceDoor.changeDuration // Door has been closed long enough
    && !cg.graphics.readyRoomNorthEntranceDoor.isOpen; // North entrance door not open
  };

  openReadyRoomNorthEntranceDoor() {
    if (!this.canOpenReadyRoomNorthEntranceDoor) { return; }
    cg.graphics.readyRoomNorthEntranceDoor.open();
    preshows.setMergeToEmpty(true);
    moveCM("rrn","rrnGreet");
  };

  openReadyRoomSouthEntranceDoor() {
    if (!this.canOpenReadyRoomSouthEntranceDoor) { return; }
    cg.graphics.readyRoomSouthEntranceDoor.open();
    preshows.setMergeToEmpty(false);
    moveCM("rrs","rrsGreet");
  };

  get canCloseReadyRoomNorthEntranceDoor() {
    return cg.graphics.readyRoomNorthEntranceDoor.isOpen // Door is open
    && cg.clock - cg.graphics.readyRoomNorthEntranceDoor.openTime > cg.graphics.readyRoomNorthEntranceDoor.changeDuration // Door has been open long enough
    && preshows.censuses.merge === 0 // Merge is empty
    && preshows.lastMergeLeaveTime + preshows.mergeLeaveBufferDuration < cg.clock // Guests have enough time to leave the room
  };

  get canCloseReadyRoomSouthEntranceDoor() {
    return cg.graphics.readyRoomSouthEntranceDoor.isOpen // Door is open
    && cg.clock - cg.graphics.readyRoomSouthEntranceDoor.openTime > cg.graphics.readyRoomSouthEntranceDoor.changeDuration // Door has been open long enough
    && preshows.censuses.merge === 0 // Merge is empty
    && preshows.lastMergeLeaveTime + preshows.mergeLeaveBufferDuration < cg.clock // Guests have enough time to leave the room
  };

  closeReadyRoomNorthEntranceDoor() {
    if (!this.canCloseReadyRoomNorthEntranceDoor) { return; }
    rotra.trigger("preshows","north");
    cg.graphics.readyRoomNorthEntranceDoor.close();
    this.allowEnterMerge = true;
    const guestsInReadyRoomNorth = humanishCircles.filter(
      (guest) => guest.space === SPACES.READYROOMNORTH && guest.state !== "cm"
    );
    if (guestsInReadyRoomNorth.length > 0) {
      this.isReadyRoomNorthLoaded = true;
    }
  };

  closeReadyRoomSouthEntranceDoor() {
    if (!this.canCloseReadyRoomSouthEntranceDoor) { return; }
    rotra.trigger("preshows","south");
    cg.graphics.readyRoomSouthEntranceDoor.close();
    this.allowEnterMerge = true;
    const guestsInReadyRoomSouth = humanishCircles.filter(
      (guest) => guest.space === SPACES.READYROOMSOUTH && guest.state !== "cm"
    );
    if (guestsInReadyRoomSouth.length > 0) {
      this.isReadyRoomSouthLoaded = true;
    }
  };

  get canOpenReadyRoomNorthExitDoor() {
    return cg.graphics.readyRoomNorthExitDoor.isOpen === false // Exit door not already open
    && cg.clock - cg.graphics.readyRoomNorthExitDoor.openTime > cg.graphics.readyRoomNorthExitDoor.changeDuration // Door has been closed long enough
    && this.isReadyRoomNorthLoaded // Ready room has been loaded
    && !this.isOutsidePopulated // Outside is clear
    && !preshows.isITSEntranceOpen // ITS entrance closed
  }

  get canOpenReadyRoomSouthExitDoor() {
    return cg.graphics.readyRoomSouthExitDoor.isOpen === false // Exit door not already open
    && cg.clock - cg.graphics.readyRoomSouthExitDoor.openTime > cg.graphics.readyRoomSouthExitDoor.changeDuration // Door has been closed long enough
    && this.isReadyRoomSouthLoaded // Ready room has been loaded
    && !this.isOutsidePopulated // Outside is clear
    && !preshows.isITSEntranceOpen // ITS entrance closed
  };

  openReadyRoomNorthExitDoor() {
    if (!this.canOpenReadyRoomNorthExitDoor) { return; }
    this.setReadyRoomNorthToEmpty();
    this.isReadyRoomNorthLoaded = false;
    cg.graphics.readyRoomNorthExitDoor.open();
    this.isOutsidePopulated = true;
    moveCM("rrn","rrnExpel");
    moveCM("outsiden","outsidenUnload");
    moveCM("outsides","outsidesSupport");
    preshows.lastRRUnload = SPACES.READYROOMNORTH;
  };

  openReadyRoomSouthExitDoor() {
    if (!this.canOpenReadyRoomSouthExitDoor) { return; }
    this.setReadyRoomSouthToEmpty();
    this.isReadyRoomSouthLoaded = false;
    cg.graphics.readyRoomSouthExitDoor.open();
    this.isOutsidePopulated = true;
    moveCM("rrs","rrsExpel");
    moveCM("outsides","outsidesUnload");
    moveCM("outsiden","outsidenSupport");
    preshows.lastRRUnload = SPACES.READYROOMSOUTH;
  };

  get canCloseReadyRoomNorthExitDoor() {
    const guestsInReadyRoomNorth = humanishCircles.filter(
      (guest) => guest.space === SPACES.READYROOMNORTH && guest.state !== "cm"
    );
    return cg.graphics.readyRoomNorthExitDoor.isOpen // Exit door is open
    && cg.clock - cg.graphics.readyRoomNorthExitDoor.openTime > cg.graphics.readyRoomNorthExitDoor.changeDuration // Door has been open long enough
    && guestsInReadyRoomNorth.length === 0 // No guests in ready room
    && CMs.rrn.path.length < 2; // CM back in room
  }

  get canCloseReadyRoomSouthExitDoor() {
    const guestsInReadyRoomSouth = humanishCircles.filter(
      (guest) => guest.space === SPACES.READYROOMSOUTH && guest.state !== "cm"
    );
    return cg.graphics.readyRoomSouthExitDoor.isOpen // Exit door is open
    && cg.clock - cg.graphics.readyRoomSouthExitDoor.openTime > cg.graphics.readyRoomSouthExitDoor.changeDuration // Door has been open long enough
    && guestsInReadyRoomSouth.length === 0 // No guests in ready room
    && CMs.rrs.path.length < 2; // CM back in room
  };

  closeReadyRoomNorthExitDoor() {
    if (!this.canCloseReadyRoomNorthExitDoor) { return; }
    cg.graphics.readyRoomNorthExitDoor.close();
    preshows.rrnbb8Onstage = true;
  };

  closeReadyRoomSouthExitDoor() {
    if (!this.canCloseReadyRoomSouthExitDoor) { return; }
    cg.graphics.readyRoomSouthExitDoor.close();
    preshows.rrsbb8Onstage = true;
  };

  get canOpenITSEntranceDoor() {
    return this.isOutsidePopulated // Guests are outside
  };

  openITSEntranceDoor(loadITS) {
    if (!this.canOpenITSEntranceDoor) { return; }
    this.isITSEntranceOpen = true;
    this.setOutsideToEmpty();
    cg.graphics["its" + loadITS + "Door"].open();
  };

  get canCloseITSEntranceDoor() {
    return preshows.censuses.outside === 0 // No guests waiting to leave
  }

  closeITSEntranceDoor() {
    if (!this.canCloseITSEntranceDoor) { return; }
    this.isITSEntranceOpen = false;
    const loadITS = cg.graphics.its.rotationState % 3;
    cg.graphics["its" + loadITS + "Door"].close();
    if (preshows.lastRRUnload === SPACES.READYROOMNORTH) {
      moveCM("outsiden","outsidenReset");
    } else {
      moveCM("outsides","outsidesReset");
    }
  }

  get canOpenITSExitDoor() {
    return true; // Always, because its automatic and makes no sense to have debug stuff for
  }

  openITSExitDoor(unloadITS) {
    if (!this.canOpenITSExitDoor) { return; }
    this.isITSExitOpen = true;
    cg.graphics["its" + unloadITS + "Door"].open();
    preshows.setHangerToEmpty();
    cg.createEvent({
      duration : 7000,
      end : () => {
        moveCM("deshipper","deshipperAside");
      }
    })
    cg.createEvent({
      duration : 16000,
      end : () => {
        moveCM("deshipper","deshipperCheck");
      }
    })
  }

  get canCloseITSExitDoor() {
    const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
    return preshows.censuses["its" + unloadITS] === 0 // No guests waiting to leave
  }

  closeITSExitDoor() {
    if (!this.canCloseITSExitDoor) { return; }
    this.isITSExitOpen = false;
    const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
    cg.graphics["its" + unloadITS + "Door"].close();
  }
};

cg.createEvent({
  duration : 300,
  loop : true,
  end : () => { preshows.update(); }
},"preshowUpdate");

cg.createObject({},"rrnbb8")
.attach("Graphic",{
  graphic : cg.graphics.bb8,
  collection : "midground"
})
.attach("Animator",{
  animation : cg.Animation.animations.bb80_off,
  onEnd : findNextAnimation
});

cg.createObject({},"rrsbb8")
.attach("Graphic",{
  graphic : cg.graphics.bb8,
  collection : "midground"
})
.attach("Animator",{
  animation : cg.Animation.animations.bb81_off,
  onEnd : findNextAnimation
});

cg.createObject({},"xwingbb8")
.attach("Graphic",{
  graphic : cg.graphics.bb8,
  collection : "midground"
})
.attach("Animator",{
  animation : cg.Animation.animations.bb8_xwing
});

cg.scenes.main.addObject(cg.objects.rrnbb8);
cg.scenes.main.addObject(cg.objects.rrsbb8);
cg.scenes.main.addObject(cg.objects.xwingbb8);

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 20,
  hoverCursor : "default",
  transformInit : {x:314,y:390}
},"toggleReadyRoomNorthEntranceDoorMap");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles"
},"preshowsReadyRoom1");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles"
},"preshowsReadyRoom2");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles"
},"preshowsITSEnter");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles"
},"preshowsITSExit");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.menus.page = "log";
    cg.scenes.main.items.menus.transform.o = 1;
  }
},"preshowsLog");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleReadyRoomNorthEntranceDoorMap,cg.Input.buttons.preshowsReadyRoom1],
  down : () => {
    if (cg.graphics.readyRoomNorthEntranceDoor.isOpen) {
      preshows.closeReadyRoomNorthEntranceDoor();
    } else {
      preshows.openReadyRoomNorthEntranceDoor();
    }
  }
},"toggleReadyRoomNorthEntranceDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 20,
  hoverCursor : "default",
  transformInit : {x:307,y:430}
},"toggleReadyRoomSouthEntranceDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleReadyRoomSouthEntranceDoorMap,cg.Input.buttons.preshowsReadyRoom2],
  down : () => {
    if (cg.graphics.readyRoomSouthEntranceDoor.isOpen) {
      preshows.closeReadyRoomSouthEntranceDoor();
    } else {
      preshows.openReadyRoomSouthEntranceDoor();
    }
  }
},"toggleReadyRoomSouthEntranceDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:360,y:399}
},"toggleReadyRoomNorthExitDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleReadyRoomNorthExitDoorMap,cg.Input.buttons.preshowsReadyRoom1],
  down : () => {
    if (cg.graphics.readyRoomNorthExitDoor.isOpen) {
      preshows.closeReadyRoomNorthExitDoor();
    } else if (cg.graphics.debug.active) {
      const timeSinceEntranceClose = cg.clock - cg.graphics.readyRoomNorthEntranceDoor.closeTime;
      if (timeSinceEntranceClose < cg.graphics.readyRoomNorthEntranceDoor.changeDuration) { return; }
      preshows.openReadyRoomNorthExitDoor();
    }
  }
},"toggleReadyRoomNorthExitDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:349,y:442}
},"toggleReadyRoomSouthExitDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleReadyRoomSouthExitDoorMap,cg.Input.buttons.preshowsReadyRoom2],
  down : () => {
    if (cg.graphics.readyRoomSouthExitDoor.isOpen) {
      preshows.closeReadyRoomSouthExitDoor();
    } else if (cg.graphics.debug.active) {
      const timeSinceEntranceClose = cg.clock - cg.graphics.readyRoomSouthEntranceDoor.closeTime;
      if (timeSinceEntranceClose < cg.graphics.readyRoomSouthEntranceDoor.changeDuration) { return; }
      preshows.openReadyRoomSouthExitDoor();
    }
  }
},"toggleReadyRoomSouthExitDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 60,
  hoverCursor : "default",
  transformInit : {x:470,y:419}
},"toggleITSEntranceDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleITSEntranceDoorMap,cg.Input.buttons.preshowsITSEnter],
  down : () => {
    if (preshows.isITSEntranceOpen) {
      preshows.closeITSEntranceDoor();
    } else if (cg.graphics.debug.active) {
      const loadITS = cg.graphics.its.rotationState % 3;
      preshows.openITSEntranceDoor(loadITS);
    }
  }
},"toggleITSEntranceDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 60,
  hoverCursor : "default",
  transformInit : {x:555,y:271}
},"toggleITSExitDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleITSExitDoorMap,cg.Input.buttons.preshowsITSExit],
  down : () => {
    if (preshows.isITSExitOpen) {
      preshows.closeITSExitDoor();
    } else if (cg.graphics.debug.active) {
      const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
      preshows.openITSExitDoor(unloadITS);
    }
  }
},"toggleITSExitDoor");