/** @typedef {import('../../ChoreoGraph/3.2.1/types/choreograph') } ChoreoGraphCore */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/develop') } ChoreoGraphDevelop */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/input') } ChoreoGraphInput */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/audio') } ChoreoGraphAudio */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animation') } ChoreoGraphAnimation */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animationeditor') } ChoreoGraphAnimationEditor */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/blockcontroller') } ChoreoGraphBlockController */

const humanishCircles = [];
const humanishCirclesById = {};
let humanishCircleCounter = 0;

class HumanishCircle {
  constructor(init={}) {
    this.x = init.x===undefined ? -10 : init.x;
    this.y = init.y===undefined ? -10 : init.y;
    this.facing = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 0;
    this.space = init.space || null;
    this.lastThoughtTime = -Infinity;
    this.brainSpeed = Math.random()*1000 + 300;

    this.path = [];
    this.targetFacing = 0;
    this.targetX = init.x===undefined ? -10 : init.x;
    this.targetY = init.y===undefined ? -10 : init.y;
    this.targetChangeTime = cg.clock;
    this.repelX = 0;
    this.repelY = 0;

    this.maxSpeed = init.maxSpeed===undefined?0.007:init.maxSpeed; // (units per millisecond)
    this.turningSpeed = 50;
    this.turningMagnet = 0.5; // (radian) The distance where the magnet pulls to the target
    this.turningMagnetSpeed = 0.0003; // (radians per millisecond)
    this.twistThreshold = Math.PI*0.7; // (radian)
    this.targetAcceptanceDistance = 4;
    this.removeWithNoPath = false;
    this.delete = false;

    this.id = humanishCircleCounter;
    humanishCircleCounter++;

    if (init.state=="queue") {
      this.queueData = init.queueData;
      this.queuePosition = init.queuePosition || null;
      this.offset = [Math.random()*2-1,Math.random()*2-1];
    }

    this.state = init.state || "generic";
  }
  update() {
    if (ChoreoGraph.timeDelta>100||cg.settings.core.timeScale==0) { return; } // Don't process movement on lag spikes/inactive tab

    let distanceFromTarget = Math.sqrt(Math.pow(this.targetX-this.x,2)+Math.pow(this.targetY-this.y,2));
    if (this.path.length>0) {
      this.managePath(distanceFromTarget);
    } else {
      this.attemptEnterITS();
      this.attemptExitITS();
      if (this.passBrainSpeedCheck()) {
        this.attemptQueueAdvance();
        this.attemptCrowdAdvance();
      }
      if (this.path.length==0) { this.slowToStop(distanceFromTarget,100000); }
    }
    if (this.speed>0) {
      this.turnTowardsTargetFacing();
      this.repel = [0,0];

      if (cg.clock-this.targetChangeTime<20000) {
        // Repel from other humanish circles
        // The number below is pretty significant, the higher the more they will repel
        let distanceFromOtherHumanishCircles = 6*(1-(cg.clock-this.targetChangeTime)/20000);
        let humanishCirclesInSameSpace = humanishCircles.filter(hc => hc.space===this.space && cg.clock-hc.targetChangeTime<20000);
        for (let g=0;g<humanishCirclesInSameSpace.length;g++) {
          if (humanishCirclesInSameSpace[g]==this) { continue; }
          let distanceFromHumanishCircle = Math.sqrt(Math.pow(humanishCirclesInSameSpace[g].x-this.x,2)+Math.pow(humanishCirclesInSameSpace[g].y-this.y,2));
          if (distanceFromHumanishCircle) {
            if (distanceFromHumanishCircle<distanceFromOtherHumanishCircles) {
              this.repel = [(this.x-humanishCirclesInSameSpace[g].x)/distanceFromHumanishCircle*0.5,(this.y-humanishCirclesInSameSpace[g].y)/distanceFromHumanishCircle*0.5];
              this.velocityX += (this.x-humanishCirclesInSameSpace[g].x)/distanceFromHumanishCircle*0.5;
              this.velocityY += (this.y-humanishCirclesInSameSpace[g].y)/distanceFromHumanishCircle*0.5;
            }
          }
        }
      }
      // Apply velocity
      this.x += this.velocityX*cg.timeDelta*this.speed;
      this.y += this.velocityY*cg.timeDelta*this.speed;
    } else {
      if (this.state=="generic"&&this.removeWithNoPath&&this.path.length==0) {
        this.delete = true;
      }
    }
  }
  managePath(distanceFromTarget) {
    if (this.speed==0) {
      this.facing = Math.atan2(this.path[0][1]-this.y,this.path[0][0]-this.x);
    }
    if (distanceFromTarget<this.targetAcceptanceDistance) { // Close to target
      if (this.path[0][0]==this.targetX&&this.path[0][1]==this.targetY) {
        this.path.splice(0,1);
        if (this.path.length==0) { return; }
      }
      this.targetX = this.path[0][0];
      this.targetY = this.path[0][1];
      this.targetChangeTime = cg.clock;
    }
    if (this.path.length>1) {
      this.speed += Math.min(cg.timeDelta/500000,0.01);
      this.speed = Math.min(this.speed,this.maxSpeed);
    } else {
      this.slowToStop(distanceFromTarget,80000);
    }
  }
  slowToStop(distanceFromTarget,slowSpeed) {
    this.speed -= Math.min(cg.timeDelta/slowSpeed,0.01);
    if (distanceFromTarget<1) {
      this.speed = Math.max(this.speed,0);
    } else {
      this.speed = Math.max(this.speed,0.004); // Keep moving slowly if not at target
    }
  }
  turnTowardsTargetFacing() {
    // Facing direction of target
    this.targetFacing = Math.atan2(this.targetY-this.y,this.targetX-this.x);
    // Ease facing towards target facing
    let facingDifference = this.targetFacing-this.facing;
    if (facingDifference>Math.PI) { facingDifference -= 2*Math.PI; }
    if (facingDifference<-Math.PI) { facingDifference += 2*Math.PI; }
    let absoluteFacingDifference = Math.abs(facingDifference);

    if (absoluteFacingDifference>0.005&&absoluteFacingDifference<this.twistThreshold) {
      let change = Math.min(Math.pow(absoluteFacingDifference/Math.PI,2) * (cg.timeDelta/this.turningSpeed),absoluteFacingDifference);
      let invert = facingDifference<0 ? 1 : -1;
      this.facing -= change*invert;
      if (absoluteFacingDifference<this.turningMagnet) {
        this.facing -= this.turningMagnetSpeed*cg.timeDelta*invert;
      }
    } else {
      this.facing = this.targetFacing;
    }
    // Velocity in direction of target
    this.velocityX = Math.cos(this.facing);
    this.velocityY = Math.sin(this.facing);
  }
  passBrainSpeedCheck() {
    const brainSpeed = this.brainSpeed * (this.state==="crowd" ? 0.5 : 1);
    if (cg.clock-this.lastThoughtTime>brainSpeed) {
      this.lastThoughtTime = cg.clock;
      return true;
    }
    return false;
  }
  attemptQueueAdvance() {
    if (this.state!="queue") { return; }
    if (this.queueData==undefined) { console.warn("QueueData not defined for queue humanish circle"); return; }
    if (this.queuePosition===0) { return; }
    let lastQueuePosition = this.queuePosition;
    if (lastQueuePosition===null) { lastQueuePosition = this.queueData.startingPosition; }
    if (this.queuePosition===null&&this.queueData.occupied[this.queueData.startingPosition-1]) {
      let x = this.queueData.points[this.queueData.startingPosition][0]+this.offset[0];
      let y = this.queueData.points[this.queueData.startingPosition][1]+this.offset[1];
      this.path.push([x,y]);
    } else if (this.queueData.occupied[lastQueuePosition-1]) { return; }
    for (let i=lastQueuePosition;i>=0;i--) {
      this.queueData.occupied[this.queuePosition] = false;
      this.path.push([this.queueData.points[i][0]+this.offset[0],this.queueData.points[i][1]+this.offset[1]]);
      if (this.queueData.occupied[i-1]||i==0) {
        this.queuePosition = i;
        this.queueData.occupied[i] = true;
        break;
      }
    }
  }
  attemptCrowdAdvance() {
    if (this.state!="crowd") { return; }
    if (this.crowdIntention==preshows.EMPTY) {
      let closeSpot = this.crowdParameters.findCloserSpot(true,this.crowdPosition,70);
      if (closeSpot!==false) {
        this.crowdPosition = closeSpot;
        this.path.push(this.crowdParameters.spots[this.crowdPosition]);
      }
    }
  }
  findITSDestination() {
    const loadITS = cg.graphics.its.rotationState % 3;
    const census = preshows.censuses["its" + loadITS];

    let usePrimary = true;

    if (census > cg.graphics.its.dimensionData.minimumForSecondary) {
      usePrimary = Math.random() > 0.4;
    }

    let destination = null;
    let loops = 0;
    while (destination===null||cg.graphics.its.itsSpotAvailability[loadITS][destination]===false&&loops<200) {
      loops++;
      if (usePrimary) {
        destination = cg.graphics.its.dimensionData.primarySpots[Math.floor(Math.random()*cg.graphics.its.dimensionData.primarySpots.length)];
      } else {
        destination = cg.graphics.its.dimensionData.secondarySpots[Math.floor(Math.random()*cg.graphics.its.dimensionData.secondarySpots.length)];
      }
    }
    if (destination===null) {
      console.error("Failed to find ITS destination");
    }

    cg.graphics.its.itsSpotAvailability[loadITS][destination] = false;

    return destination;
  };
  attemptEnterITS() {
    if (!this.enteringITS||this.path.length>0) { return }
    this.enteringITS = false;
    this.state = "its";
    const loadITS = cg.graphics.its.rotationState % 3;
    preshows.censuses.outside--;
    preshows.censuses["its" + loadITS]++;
    if (preshows.censuses.outside === 0) {
      preshows.isOutsidePopulated = false;
    }
    this.space = SPACES["ITS" + loadITS];
    this.x = 352;
    this.y = 306;
    this.targetX = this.x;
    this.targetY = this.y;

    const randomDestination = this.findITSDestination();
    this.itsSpot = randomDestination;
    const path = cg.graphics.its.findPath(230,randomDestination);
    for (const p of path) {
      this.path.push([p[0],p[1]]);
    }
  };
  attemptExitITS() {
    if (!this.exitingITS||this.path.length>0) { return }
    this.exitingITS = false;
    this.x = 556;
    this.y = 271;
    this.targetX = this.x;
    this.targetY = this.y;
    this.space = SPACES.HANGER;
    const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
    preshows.censuses["its" + unloadITS]--;
    this.path.push([556,247]);
    this.enterCrowd(crowdParameters.hanger);
  };
  enterCrowd(crowdParameters, intention=preshows.FILL) {
    if (this.state==="queue") {
      this.queueData.occupied[this.queuePosition] = false;
    } else if (this.state==="crowd") {
      this.crowdParameters.open[this.crowdPosition] = true;
    }
    this.state = "crowd";
    this.crowdParameters = crowdParameters;
    this.crowdIntention = intention;
    const newPosition = this.crowdParameters.findSpot(true);
    if (newPosition===false) {
      return;
    }
    this.crowdPosition = newPosition;
    this.path.push(this.crowdParameters.spots[this.crowdPosition]);
  }
}
function addHumanishCircle(init) {
  let newHumanishCircle = new HumanishCircle(init);
  humanishCircles.push(newHumanishCircle);
  humanishCirclesById[newHumanishCircle.id] = newHumanishCircle;
  return newHumanishCircle;
}

class CrowdParameters {
  constructor(init) {
    this.spots = init.spots; // A list of positions
    this.fillTargets = init.fillTargets; // [[position[]],[position[]]]
    this.emptyTargets = init.emptyTargets; // [[position[]],[position[]]]
    this.exits = init.exits;
    this.bakedLength = init.spots.length;

    this.jumpDistance = init.jumpDistance || 5;
    this.activeEmptySet = 0;
    this.open = (new Array(this.spots.length)).fill(true);
    this.emptyDestinations = Array(this.emptyTargets.length).fill().map(() => (Array(this.spots.length)).fill().map(() => [])); // A list of lists of indexes of spots that can be jumped to from each spot

    // Indexes of spots in order of distance from fill targets
    this.fillSort = [];
    for (let ii=0;ii<this.spots.length;ii++) {
      let closest = 0;
      let distance = 1000000;
      for (let i=0;i<this.spots.length;i++) {
        if (this.fillSort.includes(i)) { continue; }
        for (let fi=0;fi<this.fillTargets.length;fi++) {
          let newDistance = Math.sqrt(Math.pow(this.spots[i][0]-this.fillTargets[fi][0],2)+Math.pow(this.spots[i][1]-this.fillTargets[fi][1],2));
          if (newDistance<distance) {
            distance = newDistance;
            closest = i;
          }
        }
      }
      this.fillSort.push(closest);
    }

    // Indexes of spots in order of distance from empty targets
    this.emptySorts = Array(this.emptyTargets.length).fill().map(() => []);
    for (let setI=0;setI<this.emptyTargets.length;setI++) {
      for (let ii=0;ii<this.spots.length;ii++) {
        let closest = 0;
        let distance = 1000000;
        for (let i=0;i<this.spots.length;i++) {
          if (this.emptySorts[setI].includes(i)) { continue; }
          for (let fi=0;fi<this.emptyTargets[setI].length;fi++) {
            let newDistance = Math.sqrt(Math.pow(this.spots[i][0]-this.emptyTargets[setI][fi][0],2)+Math.pow(this.spots[i][1]-this.emptyTargets[setI][fi][1],2));
            if (newDistance<distance) {
              distance = newDistance;
              closest = i;
            }
          }
        }
        this.emptySorts[setI].push(closest);
      }
    }

    for (let setI=0;setI<this.emptyTargets.length;setI++) {
      for (const i of this.emptySorts[setI]) {
        const x = this.spots[i][0];
        const y = this.spots[i][1];
        for (const ci of this.emptySorts[setI]) {
          if (ci===i) { break; }
          const cx = this.spots[ci][0];
          const cy = this.spots[ci][1];
          const distance = Math.sqrt(Math.pow(cx-x,2)+Math.pow(cy-y,2));
          if (distance>this.jumpDistance) { continue; }
          this.emptyDestinations[setI][i].push(ci);
        }
      }
    }
  }
  // Find a spot that is open as close to the fill targets as possible
  findSpot(closeFound=false) {
    for (let i=0;i<this.fillSort.length;i++) {
      let spotIndex = this.fillSort[i];
      if (this.open[spotIndex]) {
        if (closeFound) {
          this.open[spotIndex] = false;
        }
        return spotIndex;
      }
    }
    console.error("Failed to find spot in crowd parameters",this);
    return false;
  }
  // Find a spot closer to the exit targets than the origin that is open
  findCloserSpot(closeAndOpen, origin, distance) {
    for (let i=0;i<this.emptySorts[this.activeEmptySet].length;i++) {
      let spotIndex = this.emptySorts[this.activeEmptySet][i];
      if (spotIndex==origin) { break; } // Dont check spots further from the exit than the origin
      if (this.open[spotIndex]) {
        if (Math.pow(this.spots[spotIndex][0]-this.spots[origin][0],2)+Math.pow(this.spots[spotIndex][1]-this.spots[origin][1],2)<distance) {
          if (closeAndOpen) {
            this.open[spotIndex] = false;
            this.open[origin] = true;
          }
          return spotIndex;
        }
      }
    }
    return false;
  }
}

cg.graphicTypes.humanishCircles = {
  draw(c,ax,ay) {
    humanishCirclesUpdate();

    const cmHumanishCircles = [];
    let drawnSeparately = [];
    c.beginPath();
    for (let humanishCircle of humanishCircles) {
      if (humanishCircle.state=="invisible") { continue; }
      if (humanishCircle.state=="cm") { cmHumanishCircles.push(humanishCircle); continue; }
      if (humanishCircle.fadeMode) { drawnSeparately.push(humanishCircle); continue; }
      let x = humanishCircle.x;
      let y = humanishCircle.y;
      if (humanishCircle.state==="its") {
        const relativeCentre = [355,209];
        const actualCentre = [555,369];
        const dx = x-relativeCentre[0];
        const dy = y-relativeCentre[1];
        const rotOffset = {
          "its0" : 0,
          "its1" : 120,
          "its2" : 240
        }[humanishCircle.space];
        const angle = Math.atan2(dy,dx) + (cg.scenes.main.items.its.transform.r+60+rotOffset) * Math.PI/180;
        x = actualCentre[0] + Math.cos(angle) * Math.sqrt(dx*dx+dy*dy);
        y = actualCentre[1] + Math.sin(angle) * Math.sqrt(dx*dx+dy*dy);
      }
      c.moveTo(x,y);
      c.arc(x,y,2,0,2*Math.PI);
    }
    c.fillStyle = "#cfcfcf";
    c.fill();
    for (let humanishCircle of drawnSeparately) {
      if (humanishCircle.fadeMode) {
        let dur = humanishCircle.fadeData.duration;
        let sta = humanishCircle.fadeData.start;
        if (cg.clock>sta+dur) {
          humanishCircle.fadeData.end(humanishCircle);
        }
        if (humanishCircle.fadeData.fadeIn) {
          c.globalAlpha = Math.min(1,(cg.clock-sta)/dur);
        } else {
          c.globalAlpha = Math.max(0,1-(cg.clock-sta)/dur);
        }
      } else {
        c.globalAlpha = 1;
      }
      c.beginPath();
      c.moveTo(humanishCircle.x,humanishCircle.y);
      c.arc(humanishCircle.x,humanishCircle.y,2,0,2*Math.PI);
      c.fillStyle = "#cfcfcf";
      c.fill();
    }

    c.beginPath();
    for (const cm of cmHumanishCircles) {
      let x = cm.x;
      let y = cm.y;
      c.moveTo(x,y);
      c.arc(x,y,2,0,2*Math.PI);
    }
    c.fillStyle = "#a1a7ba";
    c.fill();
  }
}
cg.scenes.main.createItem("graphic",{
  graphic : cg.createGraphic({type:"humanishCircles"},"humanishCircles")
},"humanishCircles","midground");

function humanishCirclesUpdate() {
  for (let i=0;i<humanishCircles.length;i++) {
    humanishCircles[i].update();
    if (humanishCircles[i].delete) {
      delete humanishCirclesById[humanishCircles[i].id];
      humanishCircles.splice(i,1);
      i--;
    }
  }
}

class QueueData {
  constructor(init={}) {
    this.points = init.points;
    this.startingPosition = init.points.length-1;
    this.occupied = [];
    for (let i=0;i<this.points.length;i++) {
      this.occupied[i] = false;
    }
  }
};