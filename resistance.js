/** @typedef {import('../../ChoreoGraph/3.2.1/types/choreograph') } ChoreoGraphCore */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/develop') } ChoreoGraphDevelop */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/input') } ChoreoGraphInput */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/audio') } ChoreoGraphAudio */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animation') } ChoreoGraphAnimation */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animationeditor') } ChoreoGraphAnimationEditor */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/blockcontroller') } ChoreoGraphBlockController */

const resistance = new class Resistance {
  leftEscapePodsUp = true;
  rightEscapePodsUp = true;
  leftEscapePodChangeTime = -Infinity;
  rightEscapePodChangeTime = -Infinity;
  escapePodFadeDuration = 2000;

  ESCAPEPOD_LEFT = true;
  ESCAPEPOD_RIGHT = false;

  nextEscapePodSide = this.ESCAPEPOD_LEFT;

  setLeftEPUp() {
    this.leftEscapePodsUp = true;
    this.leftEscapePodChangeTime = cg.clock;
  }
  setLeftEPDown() {
    this.leftEscapePodsUp = false;
    this.leftEscapePodChangeTime = cg.clock;
  }
  setRightEPUp() {
    this.rightEscapePodsUp = true;
    this.rightEscapePodChangeTime = cg.clock;
  }
  setRightEPDown() {
    this.rightEscapePodsUp = false;
    this.rightEscapePodChangeTime = cg.clock;
  }

  US_READY_FOR_NEW_VEHICLES = 0;
  US_AWAITING_PAIR = 1;
  US_READY_TO_UNLOCK = 2;
  US_UNLOADING = 3;
  US_READY_TO_CHECK = 4;
  US_CHECKING = 5;
  US_READY_TO_CLOSE = 6;
  US_READY_TO_DISPATCH = 7;

  UNLOAD_1 = 1;
  UNLOAD_2 = 2;

  unload1S = this.US_READY_TO_DISPATCH;
  unload2S = this.US_READY_TO_DISPATCH;

  crashSiteFV = null;
  crashSiteBV = null;

  unloadWaitFV = null;
  unloadWaitBV = null;

  unload1VL = null;
  unload1VR = null;
  unload2VL = null;
  unload2VR = null;

  escapePoduC = null;
  escapePoduD = null;
  escapePoduE = null;
  escapePoduF = null;
  escapePoddC = null;
  escapePoddD = null;
  escapePoddE = null;
  escapePoddF = null;

  escapePodsLeftExitTime = Infinity;
  escapePodsRightExitTime = Infinity;
  escapePodSequenceDuration = 25500;

  lastPodExitTime = -Infinity;
  posExitBufferDuration = 20000;

  preventDispatchUntil = -Infinity;

  resistancePositions = {
    unload1VL : [830,612,-90],
    unload1VR : [870,612,-90],
    unload2VL : [750,612,-90],
    unload2VR : [790,612,-90],
    unloadWaitFV : [780,510,-90],
    unloadWaitBV : [820,510,-90]
  }

  podDoorOrigins = cg.createPath([[1427,354],[1434,432],[1489,353],[1481,434],[841,353],[847,433],[902,353],[895,432]],"podDoorOrigins")

  podDoors = {
    uC : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
        colour : "#803d29"
      },"podDooruC"),
      transformInit : {
        x : this.podDoorOrigins[0][0],
        y : this.podDoorOrigins[0][1],
        r : 80
      }
    },"podDooruC","midground").graphic,

    uD : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
        colour : "#803d29"
      },"podDooruD"),
      transformInit : {
        x : this.podDoorOrigins[1][0],
        y : this.podDoorOrigins[1][1],
        r : 90
      }
    },"podDooruD","midground").graphic,

    uE : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
        colour : "#803d29"
      },"podDooruE"),
      transformInit : {
        x : this.podDoorOrigins[2][0],
        y : this.podDoorOrigins[2][1],
        r : 100
      }
    },"podDooruE","midground").graphic,

    uF : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
        colour : "#803d29"
      },"podDooruF"),
      transformInit : {
        x : this.podDoorOrigins[3][0],
        y : this.podDoorOrigins[3][1],
        r : 90
      }
    },"podDooruF","midground").graphic,

    dC : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
        colour : "#803d29"
      },"podDoordC"),
      transformInit : {
        x : this.podDoorOrigins[4][0],
        y : this.podDoorOrigins[4][1],
        r : 80
      }
    },"podDoordC","midground").graphic,

    dD : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
        colour : "#803d29"
      },"podDoordD"),
      transformInit : {
        x : this.podDoorOrigins[5][0],
        y : this.podDoorOrigins[5][1],
        r : 90
      }
    },"podDoordD","midground").graphic,

    dE : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
        colour : "#803d29"
      },"podDoordE"),
      transformInit : {
        x : this.podDoorOrigins[6][0],
        y : this.podDoorOrigins[6][1],
        r : 100
      }
    },"podDoordE","midground").graphic,

    dF : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
        colour : "#803d29"
      },"podDoordF"),
      transformInit : {
        x : this.podDoorOrigins[7][0],
        y : this.podDoorOrigins[7][1],
        r : 90
      }
    },"podDoordF","midground").graphic
  }

  unloadPaths = {
    LL : cg.createPath([[751,629,0],[750,637],[746,645],[736,649],[723,655],[711,654],[698,654],[698,654]]),
    LR : cg.createPath([[790,627,0],[788,634],[785,642],[780,650],[768,652],[754,657],[740,654],[725,657],[711,652],[702,652],[698,654]]),
    RL : cg.createPath([[831,627,0],[830,634],[825,642],[819,651],[808,655],[795,661],[780,658],[760,659],[739,655],[713,657],[698,654]]),
    RR : cg.createPath([[868,627,0],[865,636],[857,646],[846,647],[815,651],[778,649],[740,654],[712,652],[698,654]])
  }

  leaveRidePaths = [
    [[698,654],[692,652],[669,651],[658,635],[636,630],[617,616],[598,620],[581,629],[568,649],[549,657],[551,675],[549,694],[567,698],[578,716],[599,725],[596,748],[584,773],[548,784],[536,805]],
    [[698,654],[693,652],[669,641],[647,636],[630,622],[605,630],[574,638],[555,650],[549,668],[555,682],[558,705],[583,709],[597,723],[606,741],[596,756],[589,773],[557,778],[533,789],[515,805]],
  ]

  runEscapePodAnimation(left=true) {
    resistance.podDoors[left?"uC":"uE"].isOpen = false;
    resistance.podDoors[left?"uD":"uF"].isOpen = false;

    cg.createEvent({
      duration : 8200,
      left : left,
      end : (event) => {
        const left = event.left;
        const escapePodu0 = left ? resistance.escapePoduC : resistance.escapePoduF;
        const escapePodu1 = left ? resistance.escapePoduD : resistance.escapePoduE;
        const escapePodd0 = left ? resistance.escapePoddC : resistance.escapePoddF;
        const escapePodd1 = left ? resistance.escapePoddD : resistance.escapePoddE;
        const animd0 = cg.Animation.animations[left ? "pod_ddC" : "pod_ddE"];
        const animd1 = cg.Animation.animations[left ? "pod_ddD" : "pod_ddF"];
        const animu0 = cg.Animation.animations[left ? "pod_udC" : "pod_udE"];
        const animu1 = cg.Animation.animations[left ? "pod_udD" : "pod_udF"];

        escapePodu0.Animator.animation = animu0;
        escapePodu0.Animator.restart();
        escapePodu1.Animator.animation = animu1;
        escapePodu1.Animator.restart();
        escapePodd0.Animator.animation = animd0;
        escapePodd0.Animator.restart();
        escapePodd1.Animator.animation = animd1;
        escapePodd1.Animator.restart();

        if (left) {
          resistance.escapePodsLeftExitTime = cg.clock + resistance.escapePodSequenceDuration;
          resistance.setLeftEPDown();
        } else {
          resistance.escapePodsRightExitTime = cg.clock + resistance.escapePodSequenceDuration;
          resistance.setRightEPDown();
        }
      }
    });
  }

  canDispatch(side) {
    return (side === this.UNLOAD_1 ? this.unload1S === this.US_READY_TO_DISPATCH : this.unload2S === this.US_READY_TO_DISPATCH)
    && disco.return8V === null
    && disco.return9V === null
    && resistance.preventDispatchUntil < cg.clock;
  }

  dispatch(side) {
    if (!this.canDispatch(side)) { return; }
    const vehicleL = this[side===this.UNLOAD_1?"unload1VL":"unload2VL"];
    const vehicleR = this[side===this.UNLOAD_1?"unload1VR":"unload2VR"];

    if (vehicleL === null || vehicleR === null) {
      console.error("Attempted to dispatch with missing vehicles!", vehicleL, vehicleR);
      return;
    }

    if (side === this.UNLOAD_2) {
      resistance.preventDispatchUntil = cg.clock + 20000;
    }

    disco.return9V = vehicleR;

    this[side===this.UNLOAD_1?"unload1VL":"unload2VL"] = null;
    this[side===this.UNLOAD_1?"unload1VR":"unload2VR"] = null;

    vehicleL.Animator.animation = cg.Animation.animations[side===this.UNLOAD_1?"u2d":"u0d"];
    vehicleR.Animator.animation = cg.Animation.animations[side===this.UNLOAD_1?"u3d":"u1d"];

    this[side===this.UNLOAD_1?"unload1S":"unload2S"] = this.US_READY_FOR_NEW_VEHICLES;
  }

  canUnlock(side) {
    return (side === this.UNLOAD_1 ? this.unload1S === this.US_READY_TO_UNLOCK : this.unload2S === this.US_READY_TO_UNLOCK);
  }

  unlock(side) {
    if (!this.canUnlock(side)) { return false; }
    this[side===this.UNLOAD_1?"unload1S":"unload2S"] = this.US_UNLOADING;
    this.pullGuestsFromVehicles(side);
    cg.createEvent({
      duration : 6000,
      side : side,
      end : (event) => {
        this[event.side===this.UNLOAD_1?"unload1S":"unload2S"] = this.US_READY_TO_CHECK;
        moveCM("unload"+event.side,"unload"+event.side+"Check");
      }
    })
  }

  pullGuestsFromVehicles(side) {
    const vehicleL = this[side===this.UNLOAD_1?"unload1VL":"unload2VL"];
    const vehicleR = this[side===this.UNLOAD_1?"unload1VR":"unload2VR"];
    const lFront = vehicleL.frontGuests;
    const lBack = vehicleL.backGuests;
    const rFront = vehicleR.frontGuests;
    const rBack = vehicleR.backGuests;
    const allGuests = lFront.concat(lBack,rFront,rBack);

    // STAND GUESTS UP
    for (const guest of allGuests) {
      const vehicle = guest.vehicle;
      const rad = vehicle.transform.r * Math.PI / 180;
      const offset = guestVehicleLocations[guest.seatIndex];
      const x = vehicle.transform.x + offset[0] * Math.cos(rad) - offset[1] * Math.sin(rad);
      const y = vehicle.transform.y + offset[0] * Math.sin(rad) + offset[1] * Math.cos(rad);
      guest.state = "generic";
      guest.x = x;
      guest.y = y;
      guest.targetX = x;
      guest.targetY = y;
      rotr.guests++;
    }

    const lUnloadPath = this.unloadPaths[side===this.UNLOAD_1?"RL":"LL"];
    const rUnloadPath = this.unloadPaths[side===this.UNLOAD_1?"RR":"LR"];

    // CREATE EVENTS FOR GUEST MOVEMENT
    for (let i=0;i<2;i++) {
      const unloadPath = [lUnloadPath,rUnloadPath][i];
      const startX = unloadPath[0][0];
      const startY = unloadPath[0][1];
      const vehicle = [vehicleL,vehicleR][i];

      for (let j=0;j<2;j++) {
        const guests = [vehicle.frontGuests,vehicle.backGuests][j];

        for (let k=0;k<guests.length;k++) {
          const guest = guests[k];
          const distance = Math.sqrt((startX-guest.x)*(startX-guest.x)+(startY-guest.y)*(startY-guest.y));
          guest.distanceFromUnload = distance;
        }
        guests.sort((a,b) => a.distanceFromUnload - b.distanceFromUnload);

        const vehicleRad = vehicle.transform.r * (Math.PI/180);
        const rowFirstSeatXO = guestVehicleLocations[j*4][0];
        const rowFirstSeatYO = guestVehicleLocations[j*4][1];

        const vehicleStepX = vehicle.transform.x + Math.cos(vehicleRad) * (rowFirstSeatXO - 3) - Math.sin(vehicleRad) * rowFirstSeatYO;
        const vehicleStepY = vehicle.transform.y + Math.sin(vehicleRad) * (rowFirstSeatXO - 3) + Math.cos(vehicleRad) * rowFirstSeatYO;

        for (let k=0;k<guests.length;k++) {
          const guest = guests[k];
          const path = [];
          path.push([vehicleStepX,vehicleStepY]);
          for (let m=0;m<unloadPath.length;m++) {
            const x = unloadPath[m][0] + (Math.random()*6-3);
            const y = unloadPath[m][1] + (Math.random()*6-3);
            path.push([x,y]);
          }
          const leavePath = this.leaveRidePaths[Math.floor(Math.random()*this.leaveRidePaths.length)];
          for (let m=0;m<leavePath.length;m++) {
            const x = leavePath[m][0] + (Math.random()*6-3);
            const y = leavePath[m][1] + (Math.random()*6-3);
            path.push([x,y]);
          }
          cg.createEvent({
            duration : k * 500,
            guest : guest,
            path : path,
            end(event) {
              const guest = event.guest;
              guest.path = guest.path.concat(event.path);
              guest.removeWithNoPath = true;
            }
          })
        }
      }
    }

    vehicleL.frontGuests.length = 0;
    vehicleL.backGuests.length = 0;
    vehicleR.frontGuests.length = 0;
    vehicleR.backGuests.length = 0;
    for (let i=0;i<2;i++) {
      const vehicle = [vehicleL,vehicleR][i];
      for (let j=0;j<8;j++) {
        vehicle.Graphic.graphic.seatOccupancy[j] = false;
      }
    }
  }

  canCheck(side) {
    return (side === this.UNLOAD_1 ? this.unload1S === this.US_READY_TO_CHECK : this.unload2S === this.US_READY_TO_CHECK);
  }

  check(side) {
    if (!this.canCheck(side)) { return false; }
    this[side===this.UNLOAD_1?"unload1S":"unload2S"] = this.US_CHECKING;
    cg.createEvent({
      duration : 8000,
      side : side,
      end : (event) => {
        this[event.side===this.UNLOAD_1?"unload1S":"unload2S"] = this.US_READY_TO_CLOSE;
      }
    })
  }

  canCloseGates(side) {
    return (side === this.UNLOAD_1 ? this.unload1S === this.US_READY_TO_CLOSE : this.unload2S === this.US_READY_TO_CLOSE);
  }

  closeGates(side) {
    if (!this.canCloseGates(side)) { return false; }
    this[side===this.UNLOAD_1?"unload1S":"unload2S"] = this.US_READY_TO_DISPATCH;
  }
}

cg.graphicTypes.escapeDarkness = {
  draw(c,ax,ay,canvas) {
    const leftTimeSince = cg.clock-resistance.leftEscapePodChangeTime;
    const rightTimeSince = cg.clock-resistance.rightEscapePodChangeTime;
    if (resistance.leftEscapePodsUp) {
      if (resistance.leftEscapePodChangeTime+resistance.escapePodFadeDuration>cg.clock) {
        c.globalAlpha = (leftTimeSince)/resistance.escapePodFadeDuration;
      } else {
        c.globalAlpha = 1;
      }
    } else {
      if (resistance.leftEscapePodChangeTime+resistance.escapePodFadeDuration>cg.clock) {
        c.globalAlpha = 1-(leftTimeSince)/resistance.escapePodFadeDuration;
      } else {
        c.globalAlpha = 0;
      }
    }
    canvas.drawImage(cg.images.pod_darkness_left,812,394);

    if (resistance.rightEscapePodsUp) {
      if (resistance.rightEscapePodChangeTime+resistance.escapePodFadeDuration>cg.clock) {
        c.globalAlpha = (rightTimeSince)/resistance.escapePodFadeDuration;
      } else {
        c.globalAlpha = 1;
      }
    } else {
      if (resistance.rightEscapePodChangeTime+resistance.escapePodFadeDuration>cg.clock) {
        c.globalAlpha = 1-(rightTimeSince)/resistance.escapePodFadeDuration;
      } else {
        c.globalAlpha = 0;
      }
    }
    canvas.drawImage(cg.images.pod_darkness_right,930,394);

    if (resistance.leftEscapePodsUp) {
      if (resistance.leftEscapePodChangeTime+resistance.escapePodFadeDuration>cg.clock) {
        c.globalAlpha = 1-(leftTimeSince)/resistance.escapePodFadeDuration;
      } else {
        c.globalAlpha = 0;
      }
    } else {
      if (resistance.leftEscapePodChangeTime+resistance.escapePodFadeDuration>cg.clock) {
        c.globalAlpha = (leftTimeSince)/resistance.escapePodFadeDuration;
      } else {
        c.globalAlpha = 1;
      }
    }
    canvas.drawImage(cg.images.pod_darkness_left,1397,394);

    if (resistance.rightEscapePodsUp) {
      if (resistance.rightEscapePodChangeTime+resistance.escapePodFadeDuration>cg.clock) {
        c.globalAlpha = 1-(rightTimeSince)/resistance.escapePodFadeDuration;
      } else {
        c.globalAlpha = 0;
      }
    } else {
      if (resistance.rightEscapePodChangeTime+resistance.escapePodFadeDuration>cg.clock) {
        c.globalAlpha = (rightTimeSince)/resistance.escapePodFadeDuration;
      } else {
        c.globalAlpha = 1;
      }
    }
    canvas.drawImage(cg.images.pod_darkness_right,1522,394);
  }
}

cg.scenes.main.createItem("graphic",{
  graphic : cg.createGraphic({
    type : "escapeDarkness"
  },"escapeDarkness")
},"escapeDarkness","foreground");

cg.graphicTypes.unloadGates = {
  draw(c,ax,ay,canvas) {
    c.lineWidth = 2.5;
    c.strokeStyle = "#807f7f";
    if (!cg.graphics.mainControl.unloadKnobState(resistance.UNLOAD_2)) {
      c.beginPath();
      c.moveTo(743,628.3);
      c.lineTo(758,628.3);
      c.moveTo(782,628.3);
      c.lineTo(798,628.3);
      c.stroke();
    }
    if (!cg.graphics.mainControl.unloadKnobState(resistance.UNLOAD_1)) {
      c.beginPath();
      c.moveTo(822,628.3);
      c.lineTo(838,628.3);
      c.moveTo(861,628.3);
      c.lineTo(876,628.3);
      c.stroke();
    }
  }
}

cg.scenes.main.createItem("graphic",{
  graphic : cg.createGraphic({
    type : "unloadGates"
  },"unloadGates")
},"unloadGates","midground");

cg.createGraphic({
  type : "image",
  image : cg.images.escape_pod,
  width : 60,
  height : 60
},"escapePod");

cg.callbacks.listen("core","start",()=>{
  for (const pod of ["uC","uD","uE","uF","dC","dD","dE","dF"]) {
    const escapePod = cg.createObject({},"escapePod"+pod)
    .attach("Graphic",{
      graphic : cg.graphics.escapePod,
      collection : "midground"
    })
    .attach("Animator",{
      animation : cg.Animation.animations["pod_"+pod],
      loop : false
    });
    cg.scenes.main.addObject(escapePod);
    resistance["escapePod"+pod] = escapePod;
  }
})


cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedUnload = null;
  }
},"unloadLeft");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedUnload = null;
  }
},"unloadRight");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 40,
  hoverCursor : "default",
  transformInit : {x:850,y:610}
},"unload1Map");

cg.Input.createAction({
  keys : [cg.Input.buttons.unload1Map,cg.Input.buttons.unloadRight],
  down : () => {
    if (resistance.canUnlock(resistance.UNLOAD_1)) {
      resistance.unlock(resistance.UNLOAD_1);
    } else if (resistance.canCheck(resistance.UNLOAD_1)) {
      resistance.check(resistance.UNLOAD_1);
    } else if (resistance.canCloseGates(resistance.UNLOAD_1)) {
      resistance.closeGates(resistance.UNLOAD_1);
    } else if (resistance.canDispatch(resistance.UNLOAD_1)) {
      resistance.dispatch(resistance.UNLOAD_1);
    }
  }
},"unload1");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 40,
  hoverCursor : "default",
  transformInit : {x:771,y:610}
},"unload2Map");

cg.Input.createAction({
  keys : [cg.Input.buttons.unload2Map,cg.Input.buttons.unloadLeft],
  down : () => {
    if (resistance.canUnlock(resistance.UNLOAD_2)) {
      resistance.unlock(resistance.UNLOAD_2);
    } else if (resistance.canCheck(resistance.UNLOAD_2)) {
      resistance.check(resistance.UNLOAD_2);
    } else if (resistance.canCloseGates(resistance.UNLOAD_2)) {
      resistance.closeGates(resistance.UNLOAD_2);
    } else if (resistance.canDispatch(resistance.UNLOAD_2)) {
      resistance.dispatch(resistance.UNLOAD_2);
    }
  }
},"unload2");