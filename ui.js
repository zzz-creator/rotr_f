const UICOLOURS = {
  DARKEST : "#353536",
  MEDIUM : "#424243",
  LIGHTEST : "#7f7f7f",
  WHITE : "#ffffff",
  BLACK : "#000000",
  YELLOW : "#fffc00",
  MENU_BACKGROUND : "#6b6b6d"
}

cg.graphicTypes.preshowsControl = {
  setup() {
    this.hasSetPreshowButtons = false;

    this.rrEntranceDoorState = (side="North") => {
      if (cg.graphics[`readyRoom${side}EntranceDoor`].isOpen) {
        if (preshows[`canCloseReadyRoom${side}EntranceDoor`]) {
          return INDICATOR_COLOUR.GREEN;
        } else if (preshows.censuses.merge > 0) {
          return INDICATOR_COLOUR.YELLOW;
        } else {
          return INDICATOR_COLOUR.RED;
        }
      } else {
        if (cg.graphics[`readyRoom${side}ExitDoor`].isOpen || preshows.censuses[`readyRoom${side}`] > 0) {
          return INDICATOR_COLOUR.OFF;
        } else if (preshows[`canOpenReadyRoom${side}EntranceDoor`] && preshows.censuses.merge === 49) {
          return INDICATOR_COLOUR.GREEN;
        } else if (preshows[`canOpenReadyRoom${side}EntranceDoor`] && preshows.censuses.merge !== 49) {
          return INDICATOR_COLOUR.BLUE;
        } else if (cg.graphics[`readyRoom${side}ExitDoor`].isOpen && preshows.censuses.merge > 0) {
          return INDICATOR_COLOUR.YELLOW;
        } else {
          return INDICATOR_COLOUR.RED;
        }
      }
    }

    this.rrExitDoorState = (side="North") => {
      if (cg.graphics[`readyRoom${side}ExitDoor`].isOpen) {
        if (preshows[`canCloseReadyRoom${side}ExitDoor`]) {
          return INDICATOR_COLOUR.GREEN;
        } else if (preshows.censuses[`readyRoom${side}`] > 0) {
          return INDICATOR_COLOUR.YELLOW;
        } else {
          return INDICATOR_COLOUR.RED;
        }
      } else {
        if (preshows[`canOpenReadyRoom${side}ExitDoor`] && cg.graphics.debug.active) {
          return INDICATOR_COLOUR.WHITE;
        } else if (cg.graphics[`readyRoom${side}EntranceDoor`].isOpen) {
          return INDICATOR_COLOUR.OFF;
        } else {
          return INDICATOR_COLOUR.RED;
        }
      }
    }

    this.itsDoorState = (door="Entrance") => {
      let can, isOpen;
      if (door==="Entrance") {
        isOpen = preshows.isITSEntranceOpen;
      } else {
        isOpen = preshows.isITSExitOpen;
      }
      if (door==="Entrance") {
        if (isOpen) {
          can = preshows.canCloseITSEntranceDoor;
        } else {
          can = preshows.canOpenITSEntranceDoor;
        }
      } else {
        if (isOpen) {
          can = preshows.canCloseITSExitDoor;
        } else {
          can = preshows.canOpenITSExitDoor;
        }
      }

      if (cg.clock - cg.graphics.its.targetRotationChangeTime < cg.graphics.its.rotationDuration) {
        return INDICATOR_COLOUR.OFF;
      }
      if (!isOpen&&can) {
        return cg.graphics.debug.active ? INDICATOR_COLOUR.WHITE : INDICATOR_COLOUR.YELLOW;
      }
      if (isOpen&&can) {
        return INDICATOR_COLOUR.GREEN;
      }
      if (door!=="Entrance"&&isOpen&&!can) {
        return INDICATOR_COLOUR.YELLOW;
      }
      return INDICATOR_COLOUR.OFF;
    }
  },
  /** @param {CanvasRenderingContext2D} c */
  draw(c,ax,ay,canvas) {
    // Panel
    const TOTALWIDTH = 431;
    const TOTALHEIGHT = 235;
    const MAJORBORDER = 9;
    const MINORBORDER = 7;
    const BORDERINDENT = 4.5;
    const TEXTHEIGHT = 12;
    const TITLEPADDING = 15;

    const TIMELINEWIDTH = 290;
    const READYROOMSHEIGHT = 125;
    c.textBaseline = "alphabetic";
    c.lineWidth = 3;
    c.font = rotr.font(13);
    c.textAlign = "center";

    c.fillStyle = UICOLOURS.DARKEST;
    c.fillRect(0,0,TOTALWIDTH,TOTALHEIGHT);
    c.fillStyle = UICOLOURS.MEDIUM;
    c.fillRect(
      MAJORBORDER,
      MAJORBORDER,
      TOTALWIDTH-MAJORBORDER*2,
      TOTALHEIGHT-MAJORBORDER*2
    );
    const TOPMINORBOXY = MAJORBORDER+MINORBORDER;

    // Timeline Box
    c.fillStyle = UICOLOURS.LIGHTEST;
    c.fillRect(
      MAJORBORDER+MINORBORDER,
      TOPMINORBOXY,
      TIMELINEWIDTH,
      TOTALHEIGHT-MAJORBORDER*2-MINORBORDER*2
    );
    c.strokeStyle = UICOLOURS.DARKEST;
    c.strokeRect(
      MAJORBORDER+MINORBORDER+BORDERINDENT,
      TOPMINORBOXY+BORDERINDENT,
      TIMELINEWIDTH-BORDERINDENT*2,
      TOTALHEIGHT-MAJORBORDER*2-MINORBORDER*2-BORDERINDENT*2
    );

    // Ready Room Box
    const READYROOMSX = MAJORBORDER+MINORBORDER+TIMELINEWIDTH+MINORBORDER;
    const RIGHTBOXESWIDTH = TOTALWIDTH-TIMELINEWIDTH-MAJORBORDER*2-MINORBORDER*3;
    c.fillRect(
      READYROOMSX,
      TOPMINORBOXY,
      RIGHTBOXESWIDTH,
      READYROOMSHEIGHT
    );
    c.fillStyle = UICOLOURS.WHITE;
    const READYROOMSTEXTWIDTH = c.measureText("RR").width + TITLEPADDING;
    c.fillText("RR", READYROOMSX + (RIGHTBOXESWIDTH)/2, TOPMINORBOXY + 12);
    c.strokeStyle = UICOLOURS.DARKEST;
    c.beginPath();
    c.moveTo(READYROOMSX+BORDERINDENT, TOPMINORBOXY+BORDERINDENT);
    c.lineTo(READYROOMSX+BORDERINDENT+(RIGHTBOXESWIDTH-BORDERINDENT*2)/2-READYROOMSTEXTWIDTH/2, TOPMINORBOXY+BORDERINDENT);
    c.lineTo(READYROOMSX+BORDERINDENT+(RIGHTBOXESWIDTH-BORDERINDENT*2)/2-READYROOMSTEXTWIDTH/2, TOPMINORBOXY+BORDERINDENT+TEXTHEIGHT);
    c.lineTo(READYROOMSX+BORDERINDENT+(RIGHTBOXESWIDTH-BORDERINDENT*2)/2+READYROOMSTEXTWIDTH/2, TOPMINORBOXY+BORDERINDENT+TEXTHEIGHT);
    c.lineTo(READYROOMSX+BORDERINDENT+(RIGHTBOXESWIDTH-BORDERINDENT*2)/2+READYROOMSTEXTWIDTH/2, TOPMINORBOXY+BORDERINDENT);
    c.lineTo(READYROOMSX+BORDERINDENT+RIGHTBOXESWIDTH-BORDERINDENT*2, TOPMINORBOXY+BORDERINDENT);
    c.lineTo(READYROOMSX+BORDERINDENT+RIGHTBOXESWIDTH-BORDERINDENT*2, TOPMINORBOXY+BORDERINDENT+READYROOMSHEIGHT-BORDERINDENT*2);
    c.lineTo(READYROOMSX+BORDERINDENT, TOPMINORBOXY+BORDERINDENT+READYROOMSHEIGHT-BORDERINDENT*2);
    c.closePath();
    c.stroke();

    // ITS Box
    c.fillStyle = UICOLOURS.LIGHTEST;
    const ITSY = TOPMINORBOXY+READYROOMSHEIGHT+MINORBORDER;
    c.fillRect(
      READYROOMSX,
      ITSY,
      RIGHTBOXESWIDTH,
      TOTALHEIGHT-MAJORBORDER*2-MINORBORDER*3-READYROOMSHEIGHT
    );
    c.fillStyle = UICOLOURS.WHITE;
    const ITSTEXTWIDTH = c.measureText("ITS").width + TITLEPADDING;
    c.fillText("ITS", READYROOMSX + (RIGHTBOXESWIDTH)/2, ITSY + 12);
    c.strokeStyle = UICOLOURS.DARKEST;
    c.beginPath();
    c.moveTo(READYROOMSX+BORDERINDENT, ITSY+BORDERINDENT);
    c.lineTo(READYROOMSX+BORDERINDENT+(RIGHTBOXESWIDTH-BORDERINDENT*2)/2-ITSTEXTWIDTH/2, ITSY+BORDERINDENT);
    c.lineTo(READYROOMSX+BORDERINDENT+(RIGHTBOXESWIDTH-BORDERINDENT*2)/2-ITSTEXTWIDTH/2, ITSY+BORDERINDENT+TEXTHEIGHT);
    c.lineTo(READYROOMSX+BORDERINDENT+(RIGHTBOXESWIDTH-BORDERINDENT*2)/2+ITSTEXTWIDTH/2, ITSY+BORDERINDENT+TEXTHEIGHT);
    c.lineTo(READYROOMSX+BORDERINDENT+(RIGHTBOXESWIDTH-BORDERINDENT*2)/2+ITSTEXTWIDTH/2, ITSY+BORDERINDENT);
    c.lineTo(READYROOMSX+BORDERINDENT+RIGHTBOXESWIDTH-BORDERINDENT*2, ITSY+BORDERINDENT);
    c.lineTo(READYROOMSX+BORDERINDENT+RIGHTBOXESWIDTH-BORDERINDENT*2, ITSY+BORDERINDENT+TOTALHEIGHT-MAJORBORDER*2-MINORBORDER*3-READYROOMSHEIGHT-BORDERINDENT*2);
    c.lineTo(READYROOMSX+BORDERINDENT, ITSY+BORDERINDENT+TOTALHEIGHT-MAJORBORDER*2-MINORBORDER*3-READYROOMSHEIGHT-BORDERINDENT*2);
    c.closePath();
    c.stroke();

    // Timeline Components
    const TIMELINEBORDER = 8;
    const TIMELINEWINDOWHEIGHT = 70;
    const TIMELINEBLOCKSX = MAJORBORDER+MINORBORDER+BORDERINDENT+TIMELINEBORDER;
    const READYROOMSTIMELINEWINDOWY = TOPMINORBOXY+BORDERINDENT+20;
    const ITSTIMELINEWINDOWY = TOPMINORBOXY+BORDERINDENT+110;
    const TIMELINEWINDOWWIDTH = TIMELINEWIDTH-BORDERINDENT*2-TIMELINEBORDER*2;
    const boxes = new Path2D();
    boxes.rect(
      TIMELINEBLOCKSX,
      READYROOMSTIMELINEWINDOWY,
      TIMELINEWINDOWWIDTH,
      TIMELINEWINDOWHEIGHT
    );
    boxes.rect(
      TIMELINEBLOCKSX,
      ITSTIMELINEWINDOWY,
      TIMELINEWINDOWWIDTH,
      TIMELINEWINDOWHEIGHT / 1.84
    );
    c.fillStyle = UICOLOURS.DARKEST;
    c.fill(boxes);

    const TIMELINECENTERX = MAJORBORDER+MINORBORDER+BORDERINDENT+TIMELINEBORDER+(TIMELINEWIDTH-BORDERINDENT*2-TIMELINEBORDER*2)/2;
    c.fillStyle = UICOLOURS.WHITE;
    c.font = rotr.font(12);
    c.textAlign = "center";
    c.fillText("READY ROOMS", TIMELINECENTERX, TOPMINORBOXY + 18);
    c.fillText("ITS", TIMELINECENTERX, TOPMINORBOXY + 108);

    const TIMELINEBLOCKBORDER = 7;
    const TIMELINEBLOCKHEIGHT = TIMELINEWINDOWHEIGHT/2 - TIMELINEBLOCKBORDER * 1.5;

    c.fillStyle = "#86acff";
    const blockYs = {
      0 : READYROOMSTIMELINEWINDOWY+TIMELINEBLOCKBORDER,
      1 : READYROOMSTIMELINEWINDOWY+TIMELINEBLOCKBORDER+TIMELINEBLOCKHEIGHT+TIMELINEBLOCKBORDER,
      2 : ITSTIMELINEWINDOWY+TIMELINEBLOCKBORDER
    };
    // Timeline lines
    const TIMELINEUNITSPERMILLISECOND = 350;
    const TIMELINEVERTICALLINESPACINGMILLISECONDS = 5000;
    c.strokeStyle = UICOLOURS.LIGHTEST;
    c.beginPath();
    const LINESTODRAW = Math.floor(
      (TIMELINEWINDOWWIDTH + TIMELINEBLOCKSX) / TIMELINEVERTICALLINESPACINGMILLISECONDS * TIMELINEUNITSPERMILLISECOND
    );
    for (let i=1;i<LINESTODRAW;i++) {
      const x = TIMELINEBLOCKSX + TIMELINEWINDOWWIDTH -
      (
        (
          i * TIMELINEVERTICALLINESPACINGMILLISECONDS
          - cg.graphics.its.clock % TIMELINEVERTICALLINESPACINGMILLISECONDS
        )
        / TIMELINEUNITSPERMILLISECOND
      );
      c.moveTo(x, READYROOMSTIMELINEWINDOWY);
      c.lineTo(x, READYROOMSTIMELINEWINDOWY + TIMELINEWINDOWHEIGHT);
      c.moveTo(x, ITSTIMELINEWINDOWY);
      c.lineTo(x, ITSTIMELINEWINDOWY + TIMELINEWINDOWHEIGHT);
    }
    c.save();
    c.lineWidth = 0.3;
    c.stroke();
    c.restore();

    // Timeline event blocks
    const eventBlocks = [];

    function appendEvent(event, startTime, endTime, isPrimary) {
      const y = blockYs[event.slot];
      const timeUntilStart = startTime - cg.graphics.its.clock;
      const timeUntilEnd = endTime - cg.graphics.its.clock;
      let startX = TIMELINEBLOCKSX + TIMELINEWINDOWWIDTH - timeUntilStart / TIMELINEUNITSPERMILLISECOND;
      let endX = TIMELINEBLOCKSX + TIMELINEWINDOWWIDTH - timeUntilEnd / TIMELINEUNITSPERMILLISECOND;
      if (startX < TIMELINEBLOCKSX && endX < TIMELINEBLOCKSX) {
        return;
      }
      let centreX = endX + (startX - endX) / 2;
      if (timeUntilStart < 0) {
        startX = TIMELINEBLOCKSX + TIMELINEWINDOWWIDTH;
      }
      if (endX < TIMELINEBLOCKSX) {
        endX = TIMELINEBLOCKSX;
      }
      const eventBlock = {
        event : event,
        endX : endX,
        y : y,
        startX : startX,
        centreX : centreX,
        isPrimary : isPrimary
      };
      eventBlocks.push(eventBlock);
      return eventBlock;
    }

    for (const event of cg.graphics.its.events) {
      let eventBlock = appendEvent(event, event.startTime, event.endTime, true);
      if (eventBlock?.endX > TIMELINEBLOCKSX) {
        let eventBlock = appendEvent(event, event.nextStartTime, event.nextEndTime, false);
        if (eventBlock?.endX > TIMELINEBLOCKSX) {
          appendEvent(event, event.nextNextStartTime, event.nextNextEndTime, false);
        }
      }
    }

    for (const eventBlock of eventBlocks) {
      const visibleWidth = eventBlock.startX - eventBlock.endX;
      c.fillStyle = eventBlock.event.getColour(eventBlock);
      c.beginPath();
      c.rect(
        eventBlock.endX + 0.15,
        eventBlock.y,
        eventBlock.startX - eventBlock.endX - 0.3,
        TIMELINEBLOCKHEIGHT
      );
      c.fill();
      c.strokeStyle = UICOLOURS.BLACK;
      c.lineWidth = 1.5;
      c.stroke();

      const title = eventBlock.event.getTitle(eventBlock);
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(11);
      c.textAlign = "center";
      const FADEDISTANCE = 10;
      const textWidth = c.measureText(title).width + 12;
      if (textWidth < visibleWidth) {
        if (eventBlock.centreX > TIMELINEBLOCKSX + TIMELINEWINDOWWIDTH - textWidth / 2) {
          eventBlock.centreX = TIMELINEBLOCKSX + TIMELINEWINDOWWIDTH - textWidth / 2;
        }
        if (eventBlock.centreX < TIMELINEBLOCKSX + textWidth / 2) {
          eventBlock.centreX = TIMELINEBLOCKSX + textWidth / 2;
        }
        if (visibleWidth - textWidth < FADEDISTANCE) {
          c.globalAlpha = (visibleWidth - textWidth) / FADEDISTANCE;
        }
        c.fillText(title, eventBlock.centreX, eventBlock.y + TIMELINEBLOCKHEIGHT / 2 + 3);
        c.globalAlpha = 1;
      }
    }

    c.save();
    c.strokeStyle = UICOLOURS.BLACK;
    c.lineWidth = 1.5;
    c.stroke(boxes);
    c.restore();

    // Timeline Bottom Details
    c.fillStyle = cg.Input.buttons.preshowsLog.hovered ? UICOLOURS.WHITE : UICOLOURS.MEDIUM;
    c.fillRect(
      TIMELINEBLOCKSX+190,
      ITSTIMELINEWINDOWY+46,
      TIMELINEWINDOWWIDTH-190,
      30
    );
    c.fillStyle = cg.Input.buttons.preshowsLog.hovered ? UICOLOURS.MEDIUM : UICOLOURS.WHITE;
    c.font = rotr.font(18);
    c.textAlign = "center";
    c.fillText("LOG", TIMELINEBLOCKSX+228, ITSTIMELINEWINDOWY+66);

    if (this.hasSetPreshowButtons===false) {
      cg.Input.buttons.preshowsLog.transform.x = TIMELINEBLOCKSX+190 + (TIMELINEWINDOWWIDTH-190)/2;
      cg.Input.buttons.preshowsLog.transform.y = ITSTIMELINEWINDOWY+46 + 30/2;
      cg.Input.buttons.preshowsLog.width = TIMELINEWINDOWWIDTH-190 +10;
      cg.Input.buttons.preshowsLog.height = 30 + 10;
    }

    c.font = rotr.font(7.5);
    const CENSUSX = TIMELINEBLOCKSX;
    const CENSUSY = ITSTIMELINEWINDOWY+48;
    c.fillStyle = UICOLOURS.WHITE;
    c.textAlign = "right";
    c.fillText("M QUEUE", CENSUSX+57, CENSUSY);
    c.fillText("MERGE", CENSUSX+57, CENSUSY+9.5*1);
    c.fillText("RR 1", CENSUSX+57, CENSUSY+9.5*2);
    c.fillText("RR 2", CENSUSX+57, CENSUSY+9.5*3);
    c.textAlign = "left";
    c.fillText(preshows.censuses.mainQueue+preshows.queueBuffer, CENSUSX+63, CENSUSY);
    c.fillText(preshows.censuses.merge + "/49", CENSUSX+63, CENSUSY+9.5*1);
    c.fillText(preshows.censuses.readyRoomNorth + "/49", CENSUSX+63, CENSUSY+9.5*2);
    c.fillText(preshows.censuses.readyRoomSouth + "/49", CENSUSX+63, CENSUSY+9.5*3);

    c.textAlign = "right";
    c.fillText("ITS 1", CENSUSX+150, CENSUSY);
    c.fillText("ITS 2", CENSUSX+150, CENSUSY+9.5*1);
    c.fillText("ITS 3", CENSUSX+150, CENSUSY+9.5*2);
    if (preshows.lastHangerOverloadAlertTime + 5000 > cg.clock
      && (cg.clock+100) % 2000 < 500
      && cg.graphics.its.pauseUntilHangerAlertIsClear) {
      c.fillStyle = "#b80707"; // red
    }
    c.fillText("D QUEUE", CENSUSX+150, CENSUSY+9.5*3);
    c.fillStyle = "white";
    c.textAlign = "left";
    c.fillText(preshows.censuses.its0 + "/49", CENSUSX+156, CENSUSY);
    c.fillText(preshows.censuses.its1 + "/49", CENSUSX+156, CENSUSY+9.5*1);
    c.fillText(preshows.censuses.its2 + "/49", CENSUSX+156, CENSUSY+9.5*2);
    c.fillText(preshows.censuses.destroyerQueueLeft+preshows.censuses.destroyerQueueRight, CENSUSX+156, CENSUSY+9.5*3);

    // Ready Room Components
    const LABELSXO = 31;
    const LABEL1YO = 33;
    c.textAlign = "center";
    c.fillStyle = UICOLOURS.WHITE;
    c.font = rotr.font(8);
    c.fillText("READY", READYROOMSX + LABELSXO, TOPMINORBOXY + LABEL1YO);
    c.fillText("ROOM", READYROOMSX + LABELSXO, TOPMINORBOXY + LABEL1YO + 7);
    c.font = rotr.font(22);
    c.fillText("1", READYROOMSX + LABELSXO, TOPMINORBOXY + LABEL1YO + 27);
    const LABEL2YO = 80;
    c.font = rotr.font(8);
    c.fillText("READY", READYROOMSX + LABELSXO, TOPMINORBOXY + LABEL2YO);
    c.fillText("ROOM", READYROOMSX + LABELSXO, TOPMINORBOXY + LABEL2YO + 7);
    c.font = rotr.font(22);
    c.fillText("2", READYROOMSX + LABELSXO, TOPMINORBOXY + LABEL2YO + 27);

    const RRKNOBSXO = 68;

    drawKnob(
      READYROOMSX + RRKNOBSXO,
      TOPMINORBOXY + 33,
      cg.graphics.readyRoomNorthEntranceDoor.isOpen
    );

    const northEntranceDoorStateColour = this.rrEntranceDoorState("North");

    if (cg.Input.buttons.preshowsReadyRoom1.hovered && (northEntranceDoorStateColour === INDICATOR_COLOUR.GREEN || northEntranceDoorStateColour === INDICATOR_COLOUR.BLUE)) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        READYROOMSX + RRKNOBSXO,
        TOPMINORBOXY + 33,
        11,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawIndicator(
      READYROOMSX + RRKNOBSXO + 14.5,
      TOPMINORBOXY + 33 - 9.5,
      8,
      19,
      northEntranceDoorStateColour
    );

    drawKnob(
      READYROOMSX + RRKNOBSXO,
      TOPMINORBOXY + 33+23,
      cg.graphics.readyRoomNorthExitDoor.isOpen
    );

    const northExitDoorStateColour = this.rrExitDoorState("North");

    if (cg.Input.buttons.preshowsReadyRoom1.hovered && (northExitDoorStateColour === INDICATOR_COLOUR.GREEN || northExitDoorStateColour === INDICATOR_COLOUR.BLUE)) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        READYROOMSX + RRKNOBSXO,
        TOPMINORBOXY + 33+23,
        11,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawIndicator(
      READYROOMSX + RRKNOBSXO + 14.5,
      TOPMINORBOXY + 33 + 23 - 9.5,
      8,
      19,
      northExitDoorStateColour
    );

    drawKnob(
      READYROOMSX + RRKNOBSXO,
      TOPMINORBOXY + 82,
      cg.graphics.readyRoomSouthEntranceDoor.isOpen
    );

    const southEntranceDoorStateColour = this.rrEntranceDoorState("South");

    if (cg.Input.buttons.preshowsReadyRoom2.hovered && (southEntranceDoorStateColour === INDICATOR_COLOUR.GREEN || southEntranceDoorStateColour === INDICATOR_COLOUR.BLUE)) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        READYROOMSX + RRKNOBSXO,
        TOPMINORBOXY + 82,
        11,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawIndicator(
      READYROOMSX + RRKNOBSXO + 14.5,
      TOPMINORBOXY + 82 - 9.5,
      8,
      19,
      southEntranceDoorStateColour
    );

    drawKnob(
      READYROOMSX + RRKNOBSXO,
      TOPMINORBOXY + 82+23,
      cg.graphics.readyRoomSouthExitDoor.isOpen
    );

    const southExitDoorStateColour = this.rrExitDoorState("South");

    if (cg.Input.buttons.preshowsReadyRoom2.hovered && (southExitDoorStateColour === INDICATOR_COLOUR.GREEN || southExitDoorStateColour === INDICATOR_COLOUR.BLUE)) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        READYROOMSX + RRKNOBSXO,
        TOPMINORBOXY + 82+23,
        11,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawIndicator(
      READYROOMSX + RRKNOBSXO + 14.5,
      TOPMINORBOXY + 82 + 23 - 9.5,
      8,
      19,
      southExitDoorStateColour
    );

    if (automation.enabled.READYROOMS) {
      c.globalAlpha = 0.6;
      c.fillStyle = UICOLOURS.LIGHTEST;
      c.fillRect(
        READYROOMSX + 10,
        TOPMINORBOXY + 22,
        82,
        95
      );
      c.globalAlpha = 1;
    }

    if (this.hasSetPreshowButtons===false) {
      const BUTTONHEIGHT = 50;
      cg.Input.buttons.preshowsReadyRoom1.transform.x = READYROOMSX + RIGHTBOXESWIDTH/2;
      cg.Input.buttons.preshowsReadyRoom1.transform.y = TOPMINORBOXY + 43;
      cg.Input.buttons.preshowsReadyRoom1.width = RIGHTBOXESWIDTH;
      cg.Input.buttons.preshowsReadyRoom1.height = BUTTONHEIGHT;

      cg.Input.buttons.preshowsReadyRoom2.transform.x = READYROOMSX + RIGHTBOXESWIDTH/2;
      cg.Input.buttons.preshowsReadyRoom2.transform.y = TOPMINORBOXY + 43 + BUTTONHEIGHT;
      cg.Input.buttons.preshowsReadyRoom2.width = RIGHTBOXESWIDTH;
      cg.Input.buttons.preshowsReadyRoom2.height = BUTTONHEIGHT;
    }

    // ITS Components
    c.fillStyle = UICOLOURS.WHITE;

    c.font = rotr.font(7);
    const ENTERXO = 33;
    const EXITXO = 71;
    c.fillText("ENTER", READYROOMSX + ENTERXO, ITSY + 27);
    c.fillText("EXIT", READYROOMSX + EXITXO, ITSY + 27);

    drawKnob(
      READYROOMSX + ENTERXO,
      ITSY + 41,
      preshows.isITSEntranceOpen
    );

    const entranceITSDoorStateColour = this.itsDoorState("Entrance");
    const exitITSDoorStateColour = this.itsDoorState("Exit");

    if (cg.Input.buttons.preshowsITSEnter.hovered && entranceITSDoorStateColour === INDICATOR_COLOUR.GREEN) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        READYROOMSX + ENTERXO,
        ITSY + 41,
        11,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawIndicator(
      READYROOMSX + ENTERXO - 9.5,
      ITSY + 41 + 13,
      19,
      8,
      entranceITSDoorStateColour === INDICATOR_COLOUR.GREEN ? (cg.clock%500 < 250 ? INDICATOR_COLOUR.OFF : INDICATOR_COLOUR.GREEN) : entranceITSDoorStateColour
    );

    drawKnob(
      READYROOMSX + EXITXO,
      ITSY + 41,
      preshows.isITSExitOpen
    );

    if (cg.Input.buttons.preshowsITSExit.hovered && exitITSDoorStateColour === INDICATOR_COLOUR.GREEN) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        READYROOMSX + EXITXO,
        ITSY + 41,
        11,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawIndicator(
      READYROOMSX + EXITXO - 9.5,
      ITSY + 41 + 13,
      19,
      8,
      exitITSDoorStateColour === INDICATOR_COLOUR.GREEN ? (cg.clock%500 < 250 ? INDICATOR_COLOUR.OFF : INDICATOR_COLOUR.GREEN) : exitITSDoorStateColour
    );

    c.strokeStyle = INDICATOR_COLOUR_CODES[INDICATOR_COLOUR.RED];

    c.beginPath();
    if (cg.graphics.its.pauseClockUntilEntranceClosed && cg.clock % 500 > 350) {
      c.roundRect(
        READYROOMSX + ENTERXO - 18,
        ITSY + 19.5,
        36,
        44,
        2
      );
    }

    if (cg.graphics.its.pauseClockUntilExitClosed && cg.clock % 500 < 150) {
      c.roundRect(
        READYROOMSX + EXITXO - 18,
        ITSY + 19.5,
        36,
        44,
        2
      );
    }
    c.stroke();

    if (automation.enabled.ITS) {
      c.globalAlpha = 0.6;
      c.fillStyle = UICOLOURS.LIGHTEST;
      c.fillRect(
        READYROOMSX + 10,
        ITSY + 20,
        82,
        44
      );
      c.globalAlpha = 1;
    }

    if (this.hasSetPreshowButtons===false) {
      const BUTTONHEIGHT = TOTALHEIGHT-MAJORBORDER*2-MINORBORDER*3-READYROOMSHEIGHT;
      cg.Input.buttons.preshowsITSEnter.transform.x = READYROOMSX + RIGHTBOXESWIDTH*0.25;
      cg.Input.buttons.preshowsITSEnter.transform.y = ITSY + BUTTONHEIGHT/2;
      cg.Input.buttons.preshowsITSEnter.width = RIGHTBOXESWIDTH/2;
      cg.Input.buttons.preshowsITSEnter.height = BUTTONHEIGHT;

      cg.Input.buttons.preshowsITSExit.transform.x = READYROOMSX + RIGHTBOXESWIDTH*0.75;
      cg.Input.buttons.preshowsITSExit.transform.y = ITSY + BUTTONHEIGHT/2;
      cg.Input.buttons.preshowsITSExit.width = RIGHTBOXESWIDTH/2;
      cg.Input.buttons.preshowsITSExit.height = BUTTONHEIGHT;
    }
  }
}
cg.createGraphic({type:"preshowsControl"},"preshowsControl");

cg.graphicTypes.mainControl = {
  setup() {
    this.hasSetMainButtons = false;

    this.selectedLoad = null;
    this.selectedUnload = null;

    this.alphaLevel = 0;
    this.bravoLevel = 0;

    this.volumes = [0,0.1,0.5,1];
    this.savedVolume = 1;

    this.interrogationDoorState = (loadNumber) => {
      if (disco.canOpenInterrogationMainDoor(loadNumber)||disco.canCloseInterrogationMainDoor(loadNumber)) {
        return INDICATOR_COLOUR.GREEN;
      } else {
        const door = cg.graphics["interrogationDoor"+loadNumber];
        const changeTime = door.isOpen ? door.openTime : door.closeTime;
        if (changeTime + door.changeDuration > cg.clock) {
          return INDICATOR_COLOUR.YELLOW;
        } else {
          return INDICATOR_COLOUR.RED;
        }
      }
    }

    this.cutDoorState = (loadNumber) => {
      if (disco.canOpenInterrogationCutDoor(loadNumber)||disco.canCloseInterrogationCutDoor(loadNumber)) {
        return INDICATOR_COLOUR.GREEN;
      } else {
        const door = cg.graphics["cutDoor"+loadNumber];
        const changeTime = door.isOpen ? door.openTime : door.closeTime;
        if (changeTime + door.changeDuration > cg.clock
          || disco["interro"+loadNumber+"S"] === disco.IS_SURPRISE
        ) {
          return INDICATOR_COLOUR.YELLOW;
        } else {
          return INDICATOR_COLOUR.RED;
        }
      }
    }

    this.loadCheckState = (loadNumber) => {
      if (disco.canCheck(loadNumber)) {
        return INDICATOR_COLOUR.GREEN;
      } else {
        if (disco[`load${loadNumber}S`]===disco.LS_CHECKING) {
          return INDICATOR_COLOUR.YELLOW;
        } else {
          return INDICATOR_COLOUR.RED;
        }
      }
    }

    this.enqueueState = (loadNumber) => {
      if (disco.canEnqueue(loadNumber)) {
        if (disco[`load${loadNumber}S`]===disco.LS_READY_TO_ENQUEUE) {
          return INDICATOR_COLOUR.GREEN;
        } else {
          return INDICATOR_COLOUR.BLUE;
        }
      } else {
        return INDICATOR_COLOUR.RED;
      }
    }

    this.unloadCheckState = (side) => {
      if (resistance.canCheck(side)) {
        return INDICATOR_COLOUR.GREEN;
      } else {
        if (resistance[`unload${side}S`]===resistance.US_CHECKING) {
          return INDICATOR_COLOUR.YELLOW;
        } else {
          return INDICATOR_COLOUR.RED;
        }
      }
    }

    this.gateState = (side) => {
      if (resistance[`unload${side}S`]===resistance.US_READY_TO_UNLOCK
        || resistance[`unload${side}S`]===resistance.US_READY_TO_CLOSE
      ) {
        return INDICATOR_COLOUR.GREEN;
      } else if (resistance[`unload${side}S`]===resistance.US_UNLOADING) {
        return INDICATOR_COLOUR.YELLOW;
      } else {
        return INDICATOR_COLOUR.RED;
      }
    }

    this.dispatchState = (side) => {
      if (resistance.canDispatch(side)&&resistance[`unload${side}S`]===resistance.US_READY_TO_DISPATCH) {
        return INDICATOR_COLOUR.GREEN;
      } else {
        return INDICATOR_COLOUR.RED;
      }
    }

    this.unloadKnobState = (side) => {
      if (resistance[`unload${side}S`]===resistance.US_UNLOADING
        || resistance[`unload${side}S`]===resistance.US_READY_TO_CHECK
        || resistance[`unload${side}S`]===resistance.US_CHECKING
        || resistance[`unload${side}S`]===resistance.US_READY_TO_CLOSE
      ) {
        return true;
      } else {
        return false;
      }
    }
  },
  /** @param {CanvasRenderingContext2D} c */
  draw(c,ax,ay,canvas) {
    // Panel
    const TOTALWIDTH = 807;
    const TOTALHEIGHT = 316;
    const MAJORBORDER = 9;
    const MINORBORDER = 7;
    const BORDERINDENT = 4.5;
    const TITLEPADDING = 15;
    const RIGHTPADDINGWIDTH = 50;

    const LOADWIDTH = 380;
    c.textBaseline = "alphabetic";
    c.lineWidth = 3;
    c.textAlign = "center";

    c.fillStyle = UICOLOURS.DARKEST;
    c.fillRect(0,0,TOTALWIDTH,TOTALHEIGHT);

    // RIGHT SIDE GRIP LINES
    const LINESPACING = 10;
    const LINESTODRAW = Math.floor((TOTALHEIGHT - MAJORBORDER * 2)/LINESPACING)+1;
    const LINELEFTX = TOTALWIDTH - RIGHTPADDINGWIDTH;
    const LINERIGHTX = TOTALWIDTH - MAJORBORDER;
    c.beginPath();
    c.lineWidth = 4;
    c.strokeStyle = UICOLOURS.MEDIUM;
    for (let i=0;i<LINESTODRAW;i++) {
      const y = MAJORBORDER + i * LINESPACING + 4;
      c.moveTo(LINELEFTX,y);
      c.lineTo(LINERIGHTX,y);
    }
    c.stroke();

    c.fillStyle = UICOLOURS.MEDIUM;
    c.fillRect(
      MAJORBORDER,
      MAJORBORDER,
      TOTALWIDTH-MAJORBORDER*2-RIGHTPADDINGWIDTH,
      TOTALHEIGHT-MAJORBORDER*2
    );
    const TOPMINORBOXY = MAJORBORDER+MINORBORDER;

    // Load Boxes
    const LOADBOXHEIGHT = (TOTALHEIGHT-MAJORBORDER*2-MINORBORDER*5)/4;
    for (let i=0;i<4;i++) {
      // BOXES
      c.fillStyle = UICOLOURS.LIGHTEST;
      c.fillRect(
        MAJORBORDER+MINORBORDER,
        TOPMINORBOXY+i*(LOADBOXHEIGHT+MINORBORDER),
        LOADWIDTH,
        LOADBOXHEIGHT
      );
      c.strokeStyle = this.selectedLoad === (i+1) ? UICOLOURS.WHITE : UICOLOURS.DARKEST;
      const LOADBORDERY = TOPMINORBOXY+i*(LOADBOXHEIGHT+MINORBORDER)+BORDERINDENT;
      c.strokeRect(
        MAJORBORDER+MINORBORDER+BORDERINDENT,
        LOADBORDERY,
        LOADWIDTH-BORDERINDENT*2,
        LOADBOXHEIGHT-BORDERINDENT*2
      );

      if (this.hasSetMainButtons===false) {
        const cellButton = cg.Input.buttons["load"+(i+1)+"Cell"];
        const cellWidth = LOADWIDTH*0.48;
        const vehiclesButton = cg.Input.buttons["load"+(i+1)+"Vehicles"];
        const vehiclesWidth = LOADWIDTH*0.52;

        cellButton.transform.x = MAJORBORDER+MINORBORDER + cellWidth/2 + cg.scenes.main.items.mainControl.transform.x;
        cellButton.transform.y = TOPMINORBOXY+i*(LOADBOXHEIGHT+MINORBORDER) + LOADBOXHEIGHT/2 + cg.scenes.main.items.mainControl.transform.y;
        cellButton.width = cellWidth;
        cellButton.height = LOADBOXHEIGHT;

        vehiclesButton.transform.x = MAJORBORDER+MINORBORDER + cellWidth + vehiclesWidth/2 + cg.scenes.main.items.mainControl.transform.x;
        vehiclesButton.transform.y = TOPMINORBOXY+i*(LOADBOXHEIGHT+MINORBORDER) + LOADBOXHEIGHT/2 + cg.scenes.main.items.mainControl.transform.y;
        vehiclesButton.width = vehiclesWidth;
        vehiclesButton.height = LOADBOXHEIGHT;
      }

      // LOAD NUMBER
      c.fillStyle = UICOLOURS.WHITE;
      const LOADTEXTX = MAJORBORDER+MINORBORDER+40;
      const LOADTEXTY = LOADBORDERY+16;
      c.font = rotr.font(13);
      c.fillText("LOAD",LOADTEXTX,LOADTEXTY);
      const LOADNUMBERY = LOADTEXTY+30;
      c.font = rotr.font(34);
      c.fillText(i+1,LOADTEXTX,LOADNUMBERY);

      const KNOBINDICATORY = LOADBORDERY+37;
      c.font = rotr.font(13);
      // CELL
      const CELLX = LOADTEXTX + 80;
      c.fillText("CELL",CELLX,LOADTEXTY);

      // INTERROGATION TIMERS
      if (disco["interro"+(i+1)+"StartTime"] + disco.interroDuration > cg.clock) {
        const phase = (cg.clock - disco["interro"+(i+1)+"StartTime"]) / disco.interroDuration;
        const PROGRESSBARWIDTH = 80;
        const PROGRESSBARX = CELLX - PROGRESSBARWIDTH/2;
        const PROGRESSBARY = LOADBORDERY + 6;
        c.fillStyle = UICOLOURS.LIGHTEST;
        c.fillRect(
          PROGRESSBARX,
          PROGRESSBARY,
          PROGRESSBARWIDTH,
          13
        );
        c.fillStyle = UICOLOURS.WHITE;
        c.fillRect(
          PROGRESSBARX,
          PROGRESSBARY,
          PROGRESSBARWIDTH * phase,
          13
        );
        c.lineWidth = 2;
        c.strokeStyle = UICOLOURS.DARKEST;
        c.strokeRect(
          PROGRESSBARX,
          PROGRESSBARY,
          PROGRESSBARWIDTH,
          13
        );
      }

      c.fillStyle = UICOLOURS.WHITE;
      const KNOBSEPARATION = 35;
      const INDICATORSEPARATION = 10;
      const KNOBWIDTH = 10;
      const KNOBHEIGHT = 26;

      drawKnob(
        CELLX-KNOBSEPARATION,
        KNOBINDICATORY,
        cg.graphics["interrogationDoor"+(i+1)].isOpen,
        1.2
      );

      const interrogationDoorStateColour = this.interrogationDoorState(i+1);
      const cutDoorStateColour = this.cutDoorState(i+1);

      if (cg.Input.buttons["load"+(i+1)+"Cell"].hovered && interrogationDoorStateColour === INDICATOR_COLOUR.GREEN) {
        c.save();
        c.strokeStyle = UICOLOURS.WHITE;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(
          CELLX-KNOBSEPARATION,
          KNOBINDICATORY,
          KNOBHEIGHT/2 + 1,
          0,
          Math.PI * 2
        )
        c.stroke();
        c.restore();
      }

      drawKnob(
        CELLX+KNOBSEPARATION,
        KNOBINDICATORY,
        cg.graphics["cutDoor"+(i+1)].isOpen,
        1.2
      );

      if (cg.Input.buttons["load"+(i+1)+"Cell"].hovered && cutDoorStateColour === INDICATOR_COLOUR.GREEN) {
        c.save();
        c.strokeStyle = UICOLOURS.WHITE;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(
          CELLX+KNOBSEPARATION,
          KNOBINDICATORY,
          KNOBHEIGHT/2 + 1,
          0,
          Math.PI * 2
        )
        c.stroke();
        c.restore();
      }

      drawIndicator(
        CELLX - INDICATORSEPARATION - KNOBWIDTH/2,
        KNOBINDICATORY - KNOBHEIGHT/2 + 0.5,
        KNOBWIDTH,
        KNOBHEIGHT,
        interrogationDoorStateColour
      );

      drawIndicator(
        CELLX + INDICATORSEPARATION - KNOBWIDTH/2,
        KNOBINDICATORY - KNOBHEIGHT/2 + 0.5,
        KNOBWIDTH,
        KNOBHEIGHT,
        cutDoorStateColour
      );

      // CHECK
      const loadCheckStateColour = this.loadCheckState(i+1);
      const enqueueStateColour = this.enqueueState(i+1);

      const CHECKX = CELLX + 90;
      c.fillText("CHECK",CHECKX,LOADTEXTY);

      drawLight(
        CHECKX,
        KNOBINDICATORY,
        13,
        loadCheckStateColour
      );

      if (cg.Input.buttons["load"+(i+1)+"Vehicles"].hovered && loadCheckStateColour === INDICATOR_COLOUR.GREEN) {
        c.save();
        c.strokeStyle = UICOLOURS.WHITE;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(
          CHECKX,
          KNOBINDICATORY,
          KNOBHEIGHT/2 + 1,
          0,
          Math.PI * 2
        )
        c.stroke();
        c.restore();
      }

      // DISPATCH QUEUE
      const DISPATCHX = CHECKX + 70;

      drawLight(
        DISPATCHX,
        LOADBORDERY+(LOADBOXHEIGHT-BORDERINDENT*2)/2,
        18,
        enqueueStateColour
      );

      if (cg.Input.buttons["load"+(i+1)+"Vehicles"].hovered && (enqueueStateColour === INDICATOR_COLOUR.GREEN || enqueueStateColour === INDICATOR_COLOUR.BLUE)) {
        c.save();
        c.strokeStyle = UICOLOURS.WHITE;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(
          DISPATCHX,
          LOADBORDERY+(LOADBOXHEIGHT-BORDERINDENT*2)/2,
          18 + 1,
          0,
          Math.PI * 2
        )
        c.stroke();
        c.restore();
      }

      c.lineWidth = 3;
      const QUEUETIMERBORDER = 10;
      const QUEUETIMERSIZE = LOADBOXHEIGHT-BORDERINDENT*2-QUEUETIMERBORDER;
      const QUEUETIMERX = MAJORBORDER+MINORBORDER+BORDERINDENT+LOADWIDTH-BORDERINDENT*2-QUEUETIMERSIZE-QUEUETIMERBORDER/2;
      const QUEUETIMERY = LOADBORDERY+LOADBOXHEIGHT/2-LOADBOXHEIGHT/2+QUEUETIMERBORDER/2;
      c.fillStyle = UICOLOURS.DARKEST;
      c.fillRect(
        QUEUETIMERX,
        QUEUETIMERY,
        QUEUETIMERSIZE,
        QUEUETIMERSIZE
      );

      let timerText = "-";
      const queuePosition = disco.dispatchQueue.indexOf(i+1);
      if (queuePosition!==-1) {
        if (queuePosition===0) {
          const timeTillDispatch = Math.floor((disco.nextDispatchTime - cg.clock)/1000+1);
          if (timeTillDispatch>=0) {
            timerText = timeTillDispatch;
          } else {
            timerText = "...";
          }
        } else if (queuePosition===1) {
          timerText = "--|-";
        } else if (queuePosition===2) {
          timerText = "-|--";
        } else {
          timerText = "|---";
        }
      }
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(20);
      c.fillText(
        timerText,
        QUEUETIMERX + QUEUETIMERSIZE / 2,
        QUEUETIMERY + QUEUETIMERSIZE / 2 + 7
      );

      if (automation.enabled["LOAD"+(i+1)]) {
        c.globalAlpha = 0.6;
        c.fillStyle = UICOLOURS.LIGHTEST;
        c.fillRect(
          MAJORBORDER+MINORBORDER + 9,
          TOPMINORBOXY+i*(LOADBOXHEIGHT+MINORBORDER) + 8,
          362,
          50
        );
        c.globalAlpha = 1;
      }
    }

    function drawPauseSymbol(x,y) {
      c.fillStyle = UICOLOURS.DARKEST;
      const SEPARATION = 25;
      const WIDTH = 15;
      const HEIGHT = 45;
      c.fillRect(
        x - SEPARATION/2 - WIDTH/2,
        y - HEIGHT/2,
        WIDTH,
        HEIGHT
      );
      c.fillRect(
        x + SEPARATION/2 - WIDTH/2,
        y - HEIGHT/2,
        WIDTH,
        HEIGHT
      );
    }

    function drawSoundSymbol(x,y) {
      c.save();
      const SCALER = 0.95;
      x -= 10;
      c.strokeStyle = UICOLOURS.DARKEST;
      c.fillStyle = UICOLOURS.DARKEST;
      c.lineCap = "round";
      c.beginPath();
      // Speaker part
      c.moveTo(x-20*SCALER, y-15*SCALER);
      c.lineTo(x-20*SCALER, y+15*SCALER);
      c.lineTo(x-6*SCALER, y+15*SCALER);
      c.lineTo(x+6*SCALER, y+27*SCALER);
      c.lineTo(x+10*SCALER, y+27*SCALER);
      c.lineTo(x+10*SCALER, y-27*SCALER);
      c.lineTo(x+6*SCALER, y-27*SCALER);
      c.lineTo(x-6*SCALER, y-15*SCALER);
      c.closePath();
      c.fill();
      // Liney parts...
      c.lineWidth = 4;
      const muted = cg.Audio.masterVolume===0;
      if (cg.Audio.masterVolume>=cg.graphics.mainControl.volumes[1]||muted) {
        c.strokeStyle = UICOLOURS.DARKEST;
      } else {
        c.strokeStyle = "#636363";
      }
      c.beginPath();
      c.moveTo(x+10*SCALER+Math.cos(-1)*10*SCALER, y+Math.sin(-1)*10*SCALER);
      c.arc(x+10*SCALER, y, 10*SCALER, -1, 1);
      c.stroke();
      if (cg.Audio.masterVolume>=cg.graphics.mainControl.volumes[2]||muted) {
        c.strokeStyle = UICOLOURS.DARKEST;
      } else {
        c.strokeStyle = "#636363";
      }
      c.beginPath();
      c.moveTo(x+10*SCALER+Math.cos(-1)*20*SCALER, y+Math.sin(-1)*20*SCALER);
      c.arc(x+10*SCALER, y, 20*SCALER, -1, 1);
      c.stroke();
      if (cg.Audio.masterVolume>=cg.graphics.mainControl.volumes[3]||muted) {
        c.strokeStyle = UICOLOURS.DARKEST;
      } else {
        c.strokeStyle = "#636363";
      }
      c.beginPath();
      c.moveTo(x+10*SCALER+Math.cos(-1)*30*SCALER, y+Math.sin(-1)*30*SCALER);
      c.arc(x+10*SCALER, y, 30*SCALER, -1, 1);
      c.stroke();
      c.lineWidth = 10;
      c.strokeStyle = INDICATOR_COLOUR_CODES[INDICATOR_COLOUR.RED];
      // Cross out
      if (muted) {
        c.beginPath();
        c.moveTo(x-15, y-25);
        c.lineTo(x+30, y+25);
        c.stroke();
      }
      c.restore();
    }

    function drawVehicleSymbol(x,y) {
      canvas.drawImage(
        cg.images.vehicle_button,
        x,
        y,
        60,
        60
      );
    }

    // RIGHT BUTTONS
    const RIGHTBUTTONSSIZE = (TOTALHEIGHT-MAJORBORDER*2-MINORBORDER*4)/3;
    const RIGHTBUTTONSX = TOTALWIDTH-MAJORBORDER-MINORBORDER-RIGHTBUTTONSSIZE-RIGHTPADDINGWIDTH;
    for (let i=0;i<3;i++) {
      const button = cg.Input.buttons[["mainPause","mainSwitchVolume","mainVehicles"][i]];
      c.fillStyle = UICOLOURS.LIGHTEST;
      const BUTTONY = TOPMINORBOXY+i*(RIGHTBUTTONSSIZE+MINORBORDER);
      c.fillRect(
        RIGHTBUTTONSX,
        BUTTONY,
        RIGHTBUTTONSSIZE,
        RIGHTBUTTONSSIZE
      );
      if (!this.hasSetMainButtons) {
        button.transform.x = RIGHTBUTTONSX + cg.scenes.main.items.mainControl.transform.x + RIGHTBUTTONSSIZE/2;
        button.transform.y = BUTTONY + cg.scenes.main.items.mainControl.transform.y + RIGHTBUTTONSSIZE/2;
        button.width = RIGHTBUTTONSSIZE;
        button.height = RIGHTBUTTONSSIZE;
      }
      c.strokeStyle = button.hovered ? UICOLOURS.WHITE : UICOLOURS.DARKEST;
      c.strokeRect(
        RIGHTBUTTONSX + BORDERINDENT,
        BUTTONY + BORDERINDENT,
        RIGHTBUTTONSSIZE - BORDERINDENT*2,
        RIGHTBUTTONSSIZE - BORDERINDENT*2
      );

      if (i===0) {
        drawPauseSymbol(
          RIGHTBUTTONSX + RIGHTBUTTONSSIZE / 2,
          BUTTONY + RIGHTBUTTONSSIZE / 2
        );
      } else if (i===1) {
        drawSoundSymbol(
          RIGHTBUTTONSX + RIGHTBUTTONSSIZE / 2,
          BUTTONY + RIGHTBUTTONSSIZE / 2
        );
      } else if (i===2) {
        drawVehicleSymbol(
          RIGHTBUTTONSX + RIGHTBUTTONSSIZE / 2,
          BUTTONY + RIGHTBUTTONSSIZE / 2
        );
      }
    }
    this.hasSetMainButtons = true;

    // UNLOAD BOX
    const UNLOADX = MAJORBORDER+MINORBORDER+LOADWIDTH+MINORBORDER;
    const UNLOADWIDTH = TOTALWIDTH-MAJORBORDER*2-MINORBORDER*4-RIGHTBUTTONSSIZE-LOADWIDTH-RIGHTPADDINGWIDTH;
    const UNLOADHEIGHT = LOADBOXHEIGHT*2+MINORBORDER;
    const UNLOADTEXTHEIGHT = 17;
    c.fillRect(
      UNLOADX,
      TOPMINORBOXY,
      UNLOADWIDTH,
      UNLOADHEIGHT
    );
    c.fillStyle = UICOLOURS.WHITE;
    c.font = rotr.font(13);
    const UNLOADTEXTWIDTH = c.measureText("UNLOAD").width + TITLEPADDING;
    c.fillText("UNLOAD", UNLOADX + (UNLOADWIDTH)/2, TOPMINORBOXY + 16);
    c.strokeStyle = UICOLOURS.DARKEST;
    c.beginPath();
    c.moveTo(UNLOADX+BORDERINDENT, TOPMINORBOXY+BORDERINDENT);
    c.lineTo(UNLOADX+BORDERINDENT+(UNLOADWIDTH-BORDERINDENT*2)/2-UNLOADTEXTWIDTH/2, TOPMINORBOXY+BORDERINDENT);
    c.lineTo(UNLOADX+BORDERINDENT+(UNLOADWIDTH-BORDERINDENT*2)/2-UNLOADTEXTWIDTH/2, TOPMINORBOXY+BORDERINDENT+UNLOADTEXTHEIGHT);
    c.lineTo(UNLOADX+BORDERINDENT+(UNLOADWIDTH-BORDERINDENT*2)/2+UNLOADTEXTWIDTH/2, TOPMINORBOXY+BORDERINDENT+UNLOADTEXTHEIGHT);
    c.lineTo(UNLOADX+BORDERINDENT+(UNLOADWIDTH-BORDERINDENT*2)/2+UNLOADTEXTWIDTH/2, TOPMINORBOXY+BORDERINDENT);
    c.lineTo(UNLOADX+BORDERINDENT+UNLOADWIDTH-BORDERINDENT*2, TOPMINORBOXY+BORDERINDENT);
    c.lineTo(UNLOADX+BORDERINDENT+UNLOADWIDTH-BORDERINDENT*2, TOPMINORBOXY+BORDERINDENT+UNLOADHEIGHT-BORDERINDENT*2);
    c.lineTo(UNLOADX+BORDERINDENT, TOPMINORBOXY+BORDERINDENT+UNLOADHEIGHT-BORDERINDENT*2);
    c.closePath();
    c.stroke();

    const SELECTIONINSET = 30;

    if (this.selectedUnload===resistance.UNLOAD_2) {
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(UNLOADX+BORDERINDENT, TOPMINORBOXY+BORDERINDENT + SELECTIONINSET);
      c.lineTo(UNLOADX+BORDERINDENT, TOPMINORBOXY+BORDERINDENT+UNLOADHEIGHT-BORDERINDENT*2 - SELECTIONINSET);
      c.stroke();
    } else if (this.selectedUnload===resistance.UNLOAD_1) {
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(UNLOADX+BORDERINDENT+UNLOADWIDTH-BORDERINDENT*2, TOPMINORBOXY+BORDERINDENT + SELECTIONINSET);
      c.lineTo(UNLOADX+BORDERINDENT+UNLOADWIDTH-BORDERINDENT*2, TOPMINORBOXY+BORDERINDENT+UNLOADHEIGHT-BORDERINDENT*2 - SELECTIONINSET);
      c.stroke();
    }

    // UNLOAD COMPONENTS
    const UNLOADCENTREX = UNLOADX + UNLOADWIDTH / 2;
    const DISPATCHY = TOPMINORBOXY + UNLOADHEIGHT / 2 - 25
    const GATESY = TOPMINORBOXY + UNLOADHEIGHT / 2 + 10;
    const CHECKY = TOPMINORBOXY + UNLOADHEIGHT / 2 + 45;
    const INDICATOROFFSET = 85;
    c.font = rotr.font(14);
    c.fillText(
      "DISPATCH",
      UNLOADCENTREX,
      DISPATCHY
    );
    c.fillText(
      "GATES",
      UNLOADCENTREX,
      GATESY
    );
    c.fillText(
      "CHECK",
      UNLOADCENTREX,
      CHECKY
    );

    const leftDispatchStateColour = this.dispatchState(resistance.UNLOAD_2);

    drawLight(
      UNLOADCENTREX - INDICATOROFFSET,
      DISPATCHY-5,
      15,
      leftDispatchStateColour
    );

    if (cg.Input.buttons["unloadLeft"].hovered && leftDispatchStateColour === INDICATOR_COLOUR.GREEN) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        UNLOADCENTREX - INDICATOROFFSET,
        DISPATCHY-5,
        15 + 1,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawKnob(
      UNLOADCENTREX - INDICATOROFFSET,
      GATESY-5,
      this.unloadKnobState(resistance.UNLOAD_2),
      1.4
    );

    const leftGateStateColour = this.gateState(resistance.UNLOAD_2);

    if (cg.Input.buttons["unloadLeft"].hovered && leftGateStateColour === INDICATOR_COLOUR.GREEN) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        UNLOADCENTREX - INDICATOROFFSET,
        GATESY-5,
        15 + 1,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawIndicator(
      UNLOADCENTREX - INDICATOROFFSET + 20,
      GATESY - 20,
      10,
      30,
      leftGateStateColour
    );

    const leftUnloadCheckStateColour = this.unloadCheckState(resistance.UNLOAD_2);

    drawLight(
      UNLOADCENTREX - INDICATOROFFSET,
      CHECKY-5,
      15,
      leftUnloadCheckStateColour
    );

    if (cg.Input.buttons["unloadLeft"].hovered && leftUnloadCheckStateColour === INDICATOR_COLOUR.GREEN) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        UNLOADCENTREX - INDICATOROFFSET,
        CHECKY-5,
        15 + 1,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    const rightDispatchStateColour = this.dispatchState(resistance.UNLOAD_1);

    drawLight(
      UNLOADCENTREX + INDICATOROFFSET,
      DISPATCHY-5,
      15,
      rightDispatchStateColour
    );

    if (cg.Input.buttons["unloadRight"].hovered && rightDispatchStateColour === INDICATOR_COLOUR.GREEN) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        UNLOADCENTREX + INDICATOROFFSET,
        DISPATCHY-5,
        15 + 1,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawKnob(
      UNLOADCENTREX + INDICATOROFFSET,
      GATESY-5,
      this.unloadKnobState(resistance.UNLOAD_1),
      1.4
    );

    const rightGateStateColour = this.gateState(resistance.UNLOAD_1);

    if (cg.Input.buttons["unloadRight"].hovered && rightGateStateColour === INDICATOR_COLOUR.GREEN) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        UNLOADCENTREX + INDICATOROFFSET,
        GATESY-5,
        15 + 1,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    drawIndicator(
      UNLOADCENTREX + INDICATOROFFSET - 30,
      GATESY - 20,
      10,
      30,
      rightGateStateColour
    );

    const rightUnloadCheckStateColour = this.unloadCheckState(resistance.UNLOAD_1);

    drawLight(
      UNLOADCENTREX + INDICATOROFFSET,
      CHECKY-5,
      15,
      rightUnloadCheckStateColour
    );

    if (cg.Input.buttons["unloadRight"].hovered && rightUnloadCheckStateColour === INDICATOR_COLOUR.GREEN) {
      c.save();
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(
        UNLOADCENTREX + INDICATOROFFSET,
        CHECKY-5,
        15 + 1,
        0,
        Math.PI * 2
      )
      c.stroke();
      c.restore();
    }

    if (automation.enabled.UNLOAD2) {
      c.globalAlpha = 0.6;
      c.fillStyle = UICOLOURS.LIGHTEST;
      c.fillRect(
        UNLOADCENTREX - INDICATOROFFSET - 20,
        DISPATCHY-22,
        53,
        105
      );
      c.globalAlpha = 1;
    }

    if (automation.enabled.UNLOAD1) {
      c.globalAlpha = 0.6;
      c.fillStyle = UICOLOURS.LIGHTEST;
      c.fillRect(
        UNLOADCENTREX + INDICATOROFFSET - 34,
        DISPATCHY-22,
        53,
        105
      );
      c.globalAlpha = 1;
    }

    this.hasSetMainButtons=false;
    if (this.hasSetMainButtons===false) {
      const leftButton = cg.Input.buttons.unloadLeft;
      const rightButton = cg.Input.buttons.unloadRight;

      leftButton.transform.x = UNLOADX + UNLOADWIDTH/4 + cg.scenes.main.items.mainControl.transform.x;
      leftButton.transform.y = TOPMINORBOXY + UNLOADHEIGHT/2 + cg.scenes.main.items.mainControl.transform.y;
      leftButton.width = UNLOADWIDTH/2;
      leftButton.height = UNLOADHEIGHT;

      rightButton.transform.x = UNLOADX + UNLOADWIDTH/2 + UNLOADWIDTH/4 + cg.scenes.main.items.mainControl.transform.x;
      rightButton.transform.y = TOPMINORBOXY + UNLOADHEIGHT/2 + cg.scenes.main.items.mainControl.transform.y;
      rightButton.width = UNLOADWIDTH/2;
      rightButton.height = UNLOADHEIGHT;
    }

    // LIFT STATUS BOX
    const LIFTX = MAJORBORDER+MINORBORDER+LOADWIDTH+MINORBORDER;
    const LIFTY = TOPMINORBOXY + UNLOADHEIGHT + MINORBORDER;
    const LIFTWIDTH = TOTALWIDTH-MAJORBORDER*2-MINORBORDER*4-RIGHTBUTTONSSIZE-LOADWIDTH-RIGHTPADDINGWIDTH;
    const LIFTHEIGHT = LOADBOXHEIGHT*2+MINORBORDER;
    const LIFTTEXTHEIGHT = 17;

    c.fillStyle = UICOLOURS.LIGHTEST;
    c.fillRect(
      LIFTX,
      LIFTY,
      LIFTWIDTH,
      LIFTHEIGHT
    );

    c.lineWidth = 3;
    c.fillStyle = UICOLOURS.WHITE;
    c.font = rotr.font(13);
    const LIFTSTATUSTEXTWIDTH = c.measureText("LIFT STATUS").width + TITLEPADDING;
    c.fillText("LIFT STATUS", LIFTX + (LIFTWIDTH)/2, LIFTY + 16);
    c.strokeStyle = UICOLOURS.DARKEST;
    c.beginPath();
    c.moveTo(LIFTX+BORDERINDENT, LIFTY+BORDERINDENT);
    c.lineTo(LIFTX+BORDERINDENT+(LIFTWIDTH-BORDERINDENT*2)/2-LIFTSTATUSTEXTWIDTH/2, LIFTY+BORDERINDENT);
    c.lineTo(LIFTX+BORDERINDENT+(LIFTWIDTH-BORDERINDENT*2)/2-LIFTSTATUSTEXTWIDTH/2, LIFTY+BORDERINDENT+LIFTTEXTHEIGHT);
    c.lineTo(LIFTX+BORDERINDENT+(LIFTWIDTH-BORDERINDENT*2)/2+LIFTSTATUSTEXTWIDTH/2, LIFTY+BORDERINDENT+LIFTTEXTHEIGHT);
    c.lineTo(LIFTX+BORDERINDENT+(LIFTWIDTH-BORDERINDENT*2)/2+LIFTSTATUSTEXTWIDTH/2, LIFTY+BORDERINDENT);
    c.lineTo(LIFTX+BORDERINDENT+LIFTWIDTH-BORDERINDENT*2, LIFTY+BORDERINDENT);
    c.lineTo(LIFTX+BORDERINDENT+LIFTWIDTH-BORDERINDENT*2, LIFTY+BORDERINDENT+LIFTHEIGHT-BORDERINDENT*2);
    c.lineTo(LIFTX+BORDERINDENT, LIFTY+BORDERINDENT+LIFTHEIGHT-BORDERINDENT*2);
    c.closePath();
    c.stroke();

    // LIFT STATUS COMPONENTS
    const LIGHTSTOPLEFTX = LIFTX + 80;
    const LIGHTSTOPLEFTY = LIFTY + 45;
    const LIFTROWSPACING = 25;
    const LIFTCOLUMNSPACING = 27;
    for (let i=0;i<6;i++) {
      let level = 0;
      if (i===0) {
        level = this.alphaLevel;
      } else if (i===1) {
        level = this.bravoLevel;
      } else if (i===2||i===3) {
        if (resistance.escapePodsLeftExitTime > cg.clock && resistance.escapePodsLeftExitTime < Infinity) {
          level = 1;
        } else if (resistance.leftEscapePodsUp) {
          level = 2;
        } else {
          level = 0;
        }
      } else if (i===4||i===5) {
        if (resistance.escapePodsRightExitTime > cg.clock && resistance.escapePodsRightExitTime < Infinity) {
          level = 1;
        } else if (resistance.rightEscapePodsUp) {
          level = 2;
        } else {
          level = 0;
        }
      }
      drawLight(
        LIGHTSTOPLEFTX + i*LIFTCOLUMNSPACING,
        LIGHTSTOPLEFTY,
        8,
        level===2 ? INDICATOR_COLOUR.WHITE : INDICATOR_COLOUR.OFF
      );
      drawLight(
        LIGHTSTOPLEFTX + i*LIFTCOLUMNSPACING,
        LIGHTSTOPLEFTY + LIFTROWSPACING,
        8,
        level===1 ? INDICATOR_COLOUR.WHITE : INDICATOR_COLOUR.OFF
      );
      drawLight(
        LIGHTSTOPLEFTX + i*LIFTCOLUMNSPACING,
        LIGHTSTOPLEFTY + LIFTROWSPACING * 2,
        8,
        level===0 ? INDICATOR_COLOUR.WHITE : INDICATOR_COLOUR.OFF
      );
      c.textAlign = "center";
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(13);
      c.fillText(
        ["A","B","C","D","E","F"][i],
        LIGHTSTOPLEFTX + i*LIFTCOLUMNSPACING,
        LIGHTSTOPLEFTY + LIFTROWSPACING * 2 + 25
      );
    }
    c.font = rotr.font(10);
    c.textAlign = "right";
    c.fillText(
      "UPPER",
      LIGHTSTOPLEFTX - 17,
      LIGHTSTOPLEFTY + 2
    );
    c.fillText(
      "FLUX",
      LIGHTSTOPLEFTX - 17,
      LIGHTSTOPLEFTY + LIFTROWSPACING + 2
    );
    c.fillText(
      "LOWER",
      LIGHTSTOPLEFTX - 17,
      LIGHTSTOPLEFTY + LIFTROWSPACING * 2 + 2
    );
  }
}
cg.createGraphic({type:"mainControl"},"mainControl");

const automation = new class Automation {
  enabled = {
    READYROOMS : false,
    ITS : false,
    LOAD1 : false,
    LOAD2 : false,
    LOAD3 : false,
    LOAD4 : false,
    UNLOAD1 : false,
    UNLOAD2 : false
  }

  persist = {
    READYROOMS : false,
    ITS : false,
    LOAD1 : false,
    LOAD2 : false,
    LOAD3 : false,
    LOAD4 : false,
    UNLOAD1 : false,
    UNLOAD2 : false
  }

  savePersistance() {
    for (const key in this.persist) {
      if (this.enabled[key]) {
        this.persist[key] = this.enabled[key];
      }
    }
  }

  update() {
    if (automation.enabled.READYROOMS) {
      if (cg.graphics.readyRoomSouthEntranceDoor.isOpen) {
        preshows.closeReadyRoomSouthEntranceDoor();
      } else if (preshows.censuses.merge === 49) {
        preshows.openReadyRoomSouthEntranceDoor();
      }
      if (cg.graphics.readyRoomNorthEntranceDoor.isOpen) {
        preshows.closeReadyRoomNorthEntranceDoor();
      } else if (preshows.censuses.merge === 49) {
        preshows.openReadyRoomNorthEntranceDoor();
      }
      if (cg.graphics.readyRoomNorthExitDoor.isOpen) {
        preshows.closeReadyRoomNorthExitDoor();
      }
      if (cg.graphics.readyRoomSouthExitDoor.isOpen) {
        preshows.closeReadyRoomSouthExitDoor();
      }
    }
    if (automation.enabled.ITS) {
      if (preshows.isITSEntranceOpen) {
        preshows.closeITSEntranceDoor();
      }
      if (preshows.isITSExitOpen) {
        preshows.closeITSExitDoor();
      }
    }
    for (let loadNumber=1;loadNumber<=4;loadNumber++) {
      if (automation.enabled["LOAD"+loadNumber]) {
        if (disco.interrogationDoors[loadNumber].graphic.isOpen) {
          disco.closeInterrogationMainDoor(loadNumber);
        } else {
          disco.openInterrogationMainDoor(loadNumber);
        }
        if (disco.cutDoors[loadNumber].graphic.isOpen) {
          disco.closeInterrogationCutDoor(loadNumber);
        } else {
          disco.openInterrogationCutDoor(loadNumber);
        }
        if (disco.canCheck(loadNumber)) {
          disco.check(loadNumber);
        } else if (disco.canEnqueue(loadNumber)&&disco[`load${loadNumber}S`]===disco.LS_READY_TO_ENQUEUE) {
          disco.enqueue(loadNumber);
        }
      }
    }
    for (let i=0;i<2;i++) {
      const unload = resistance["UNLOAD_"+(i+1)];
      if (automation.enabled["UNLOAD"+(i+1)]) {
        if (resistance.canUnlock(unload)) {
          resistance.unlock(unload);
        } else if (resistance.canCheck(unload)) {
          resistance.check(unload);
        } else if (resistance.canCloseGates(unload)) {
          resistance.closeGates(unload);
        } else if (resistance.canDispatch(unload)) {
          resistance.dispatch(unload);
        }
      }
    }
  }
}

cg.createEvent({
  duration : 100,
  loop : true,
  end : automation.update
},"automationLoop")

cg.graphicTypes.menus = {
  setup() {
    this.page = "main";

    this.allowMapButtons = false;

    this.hasPressedPlayOrGuests = false;

    this.cloneCanvas = document.createElement("canvas");
    this.cloneCanvas.width = cg.canvases.main.width;
    this.cloneCanvas.height = cg.canvases.main.height;
    this.cloneCanvasContext = this.cloneCanvas.getContext("2d");

    this.hotkeyButtonIds = ["SelectLoad1","SelectLoad2","SelectLoad3","SelectLoad4","ToggleCellDoor","ToggleLoadDoor","CheckLoad","EnqueueDispatch","ShowHotkeys","ToggleEnterReadyRoom1","ToggleExitReadyRoom1","ToggleEnterReadyRoom2","ToggleExitReadyRoom2","ToggleITSEntranceDoor","ToggleITSExitDoor","SelectUnload2","SelectUnload1","DispatchUnload","ToggleUnloadGates","CheckUnload"];

    this.defaultHotkeys = ["1","2","3","4","q","w","e","space","h","u","i","j","k","l","o","a","d","s","z","x"];
    this.hotkeys = [];
    for (let i=0;i<this.hotkeyButtonIds.length;i++) {
      this.hotkeys[i] = this.defaultHotkeys[i];
    }

    this.hotkeyActions = {
      SELECTLOAD1 : 0,
      SELECTLOAD2 : 1,
      SELECTLOAD3 : 2,
      SELECTLOAD4 : 3,
      TOGGLECELLDOOR : 4,
      TOGGLELOADDOOR : 5,
      CHECKLOAD : 6,
      ENQUEUEDISPATCH : 7,
      SHOWHOTKEYS : 8,
      TOGGLEREADYROOM1ENTER : 9,
      TOGGLEREADYROOM1EXIT : 10,
      TOGGLEREADYROOM2ENTER : 11,
      TOGGLEREADYROOM2EXIT : 12,
      TOGGLEITSENTEREDOOR : 13,
      TOGGLEITSEXITDOOR : 14,
      SELECTUNLOAD2 : 15,
      SELECTUNLOAD1 : 16,
      DISPATCHUNLOAD : 17,
      TOGGLEUNLOADGATES : 18,
      CHECKUNLOAD : 19
    }

    for (let i=0;i<this.hotkeyButtonIds.length;i++) {
      this.hotkeyButtonIds[i] = "hotkey" + this.hotkeyButtonIds[i];
    }

    this.keyRenaming = {
      "conactiontop" : "AT",
      "conactionbottom" : "AB",
      "conactionleft" : "AL",
      "conactionright" : "AR",
      "condpadup" : "DU",
      "condpaddown" : "DD",
      "condpadleft" : "DL",
      "condpadright" : "DR",
      "conleftstick" : "LS",
      "conrightstick" : "RS",
      "constart" : "STRT",
      "conselect" : "SEL",
      "conleftbumper" : "LB",
      "conrightbumper" : "RB",
      "conlefttrigger" : "LT",
      "conrighttrigger" : "RT",
      "conleftstickup" : "LSU",
      "conleftstickdown" : "LSD",
      "conleftstickleft" : "LSL",
      "conleftstickright" : "LSR",
      "conrightstickup" : "RSU",
      "conrightstickdown" : "RSD",
      "conrightstickleft" : "RSL",
      "conrightstickright" : "RSR"
    }

    for (let i=0;i<this.hotkeyButtonIds.length;i++) {
      const id = this.hotkeyButtonIds[i];
      cg.Input.createButton({
        type : "rectangle",
        check : "hotkeys",
        index : i,
        down : (button, event) => {
          if (event.pointerType!=="mouse") {
            return;
          }
          if (event.button==2) {
            this.hotkeys[button.index] = this.defaultHotkeys[button.index];
            cg.graphics.menus.rebindSelection = null;
          } else {
            cg.graphics.menus.rebindSelection = button.index;
            cg.graphics.menus.rebindTime = ChoreoGraph.nowint;
          }
        }
      },id);
    }

    this.getKeyText = (index) => {
      let keyText = this.hotkeys[index];
      if (index===this.rebindSelection) {
        keyText = ChoreoGraph.nowint%500>250?"":"...";
      }
      return keyText.toUpperCase();
    }

    this.isHotkeyModified = (index) => {
      return this.hotkeys[index]!==this.defaultHotkeys[index];
    }

    this.hasChangedHotkeys = () => {
      for (let i=0;i<this.hotkeyButtonIds.length;i++) {
        if (this.hotkeys[i]!==this.defaultHotkeys[i]) {
          return true;
        }
      }
      return false;
    }

    this.resetAllHotkeys = () => {
      for (let i=0;i<this.hotkeyButtonIds.length;i++) {
        this.hotkeys[i] = this.defaultHotkeys[i];
      }
    }

    this.rebindSelection = null;
    this.rebindTime = -Infinity;
    this.hasRebinded = false;

    this.hasSetMainButtons = false;
    this.hasSetHotkeysButtons = false;
    this.hasSetSettingsButtons = false;
    this.hasSetLogButtons = false;
    this.hasSetVehiclesButtons = false;

    this.drawKey = (c,text,x,y,w,h,hovered=false,outline=false) => {
      // w - Width, h - Height, r(O/I) - Radius (outside/inside), p - Padding
      if (this.keyRenaming[text.toLowerCase()]!==undefined) {
        text = this.keyRenaming[text.toLowerCase()];
        forceLarge = true;
      }

      const colText = "#ffffff";
      const colMain = "#414141";
      const colBorderA = "#2a2a2a";
      const colBorderB = "#333333";
      const colHovered = "#5c5c5c";
      const p = 9;
      const rO = 8;
      const rI = 3;
      const pi = Math.PI;
      c.lineWidth = 1.2;
      c.fillStyle = colBorderA;
      c.beginPath();
      c.arc(x+rO,y+h-rO,rO,pi/2+pi/4,pi,false);
      c.arc(x+rO,y+rO,rO,pi,pi*1.5,false);
      c.arc(x+w-rO,y+rO,rO,-pi/2,-pi/4,false);
      c.lineTo(x+w-p,y+p);
      c.lineTo(x+p,y+h-p);
      c.fill();
      c.fillStyle = colBorderB;
      c.beginPath();
      c.arc(x+w-rO,y+rO,rO,-pi/4,0,false);
      c.arc(x+w-rO,y+h-rO,rO,0,pi/2,false);
      c.arc(x+rO,y+h-rO,rO,pi/2,pi/2+pi/4,false);
      c.lineTo(x+p,y+h-p);
      c.lineTo(x+w-p,y+p);
      c.fill();
      c.fillStyle = hovered ? colHovered : colMain;
      c.beginPath();
      c.arc(x+p+rI,y+p+rI,rI,pi,pi*1.5,false);
      c.arc(x+w-p-rI,y+p+rI,rI,-pi/2,0,false);
      c.arc(x+w-p-rI,y+h-p-rI,rI,0,pi/2,false);
      c.arc(x+p+rI,y+h-p-rI,rI,pi/2,pi,false);
      c.fill();
      if (outline) {
        c.closePath();
        c.strokeStyle = "#999";
        c.stroke();
      }
      c.font = "bold 26px Arial";
      const textWidth = c.measureText(text).width;
      if (textWidth > w - 15 && forceLarge===false) {
        c.font = "bold 10px Arial";
        y -= 6;
      }
      c.fillStyle = colText;
      c.textAlign = "center";
      c.fillText(text,x+w/2,y+h/2+9,w-15)
    }

    this.drawCross = (c,x,y,hovered=false) => {
      const CROSSWIDTH = 80;
      const CROSSHEIGHT = 80;
      const BACKGROUNDOPACITY = 0.7;
      if (hovered) {
        c.globalAlpha = 1;
        c.fillStyle = UICOLOURS.WHITE;
      } else {
        c.globalAlpha = BACKGROUNDOPACITY;
        c.fillStyle = UICOLOURS.MENU_BACKGROUND;
      }
      c.fillRect(x,y,CROSSWIDTH,CROSSHEIGHT);
      c.globalAlpha = 1;
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 4;
      c.strokeRect(x,y,CROSSWIDTH,CROSSHEIGHT);
      c.strokeStyle = hovered ? UICOLOURS.BLACK : UICOLOURS.WHITE;
      c.lineWidth = 6;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(x+20,y+20);
      c.lineTo(x+CROSSWIDTH-20,y+CROSSHEIGHT-20);
      c.moveTo(x+CROSSWIDTH-20,y+20);
      c.lineTo(x+20,y+CROSSHEIGHT-20);
      c.stroke();
    }
  },
  /** @param {CanvasRenderingContext2D} c @param {number} ax @param {number} ay @param {cgCanvas} canvas  */
  draw(c,ax,ay,canvas) {
    if (this.page==="vehicles") {
      this.cloneCanvasContext.drawImage(canvas.element,0,0,canvas.width,canvas.height);
    }
    c.globalAlpha = rotr.ended ? 1 : 0.4;
    c.fillStyle = rotr.ended ? UICOLOURS.LIGHTEST : "black";
    c.textBaseline = "alphabetic";
    c.fillRect(-cg.canvas.width/2,-cg.canvas.height/2,cg.canvas.width,cg.canvas.height);

    if (rotr.ended) {
      c.font = rotr.font(60);
      c.fillStyle = UICOLOURS.WHITE;
      c.textAlign = "center";
      c.fillText("SESSION LOGGED",0,0);
      return;
    }

    const MAINMARGIN = 25;
    const MINORMARGIN = 20;
    const BACKGROUNDOPACITY = 0.7;

    const HALFWIDTH = cg.canvases.main.width/2;
    const HALFHEIGHT = cg.canvases.main.height/2;

    if (this.page==="main") {
      const TOTALWIDTH = 600;
      const TOTALHEIGHT = 600;
      c.globalAlpha = BACKGROUNDOPACITY;
      c.fillStyle = UICOLOURS.MENU_BACKGROUND;
      c.fillRect(-TOTALWIDTH/2,-TOTALHEIGHT/2,TOTALWIDTH,TOTALHEIGHT);
      c.globalAlpha = 1;
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 4;
      c.strokeRect(-TOTALWIDTH/2,-TOTALHEIGHT/2,TOTALWIDTH,TOTALHEIGHT);

      const BUTTONHEIGHT = 121;
      const BUTTONX = -TOTALWIDTH/2 + MAINMARGIN;
      const BUTTONWIDTH = TOTALWIDTH - MAINMARGIN * 2;
      for (let i=0;i<3;i++) {
        if (this.hasPressedPlayOrGuests&&i>2) {
          continue;
        }
        const BUTTONID = ["menuPlay","menuHotkeys","menuSettings"][i];
        const BUTTONNAME = ["PLAY","HOTKEYS","SETTINGS"][i];
        const BUTTONY = -TOTALHEIGHT/2 + MAINMARGIN + i * (BUTTONHEIGHT + MINORMARGIN);
        c.strokeRect(
          BUTTONX,
          BUTTONY,
          BUTTONWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.WHITE;
        if (cg.Input.buttons[BUTTONID].hovered) {
          c.fillRect(
            BUTTONX,
            BUTTONY,
            BUTTONWIDTH,
            BUTTONHEIGHT
          );
        }
        c.textAlign = "center";
        if (cg.Input.buttons[BUTTONID].hovered) {
          c.fillStyle = UICOLOURS.BLACK;
        }
        c.font = rotr.font(48);
        c.fillText(
          BUTTONNAME,
          0,
          BUTTONY + BUTTONHEIGHT / 2 + 16
        );

        if (this.hasSetMainButtons===false) {
          cg.Input.buttons[BUTTONID].transform.x = cg.canvases.main.width/2;
          cg.Input.buttons[BUTTONID].transform.y = cg.canvases.main.height/2 + BUTTONY + BUTTONHEIGHT / 2;
          cg.Input.buttons[BUTTONID].width = BUTTONWIDTH;
          cg.Input.buttons[BUTTONID].height = BUTTONHEIGHT;
        }
      }

      // GUESTS DISPATCHES PLAYTIME STATS
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(30);
      const STATSY = -TOTALHEIGHT/2 + MAINMARGIN + 3 * (BUTTONHEIGHT + MINORMARGIN) + 30;
      const STATSEPARATION = 40;
      c.fillText(
        "GUESTS: " + rotr.guests,
        0,
        STATSY
      );
      c.fillText(
        "DISPATCHES: " + rotr.dispatches,
        0,
        STATSY + STATSEPARATION
      );
      let time_played;
      let hours   = Math.floor(rotr.playtime/1000 / 3600);
      let minutes = Math.floor((rotr.playtime/1000 - (hours * 3600)) / 60);
      let seconds = Math.floor(rotr.playtime/1000 - (hours * 3600) - (minutes * 60));

      if (rotr.playtime/1000>=3600) {
        time_played = hours + "H " + minutes + "M " + seconds + "S";
      } else if (rotr.playtime/1000>=60) {
        time_played = minutes + "M " + seconds + "S";
      } else {
        time_played = seconds + "S";
      }
      c.fillText(
        "SESSION TIME: "+time_played,
        0,
        STATSY + STATSEPARATION * 2
      );

      // FONT SELECTION
      const FONTSX = TOTALWIDTH/2 + 50;
      const FONTSYBOTTOM = -TOTALHEIGHT/2 + TOTALHEIGHT;
      const FONTSWIDTH = 250;
      const FONTSHEIGHT = 180;
      c.globalAlpha = BACKGROUNDOPACITY;
      c.fillStyle = UICOLOURS.MENU_BACKGROUND;
      c.fillRect(
        FONTSX,
        FONTSYBOTTOM - FONTSHEIGHT,
        FONTSWIDTH,
        FONTSHEIGHT
      );
      c.globalAlpha = 1;
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 4;
      c.strokeRect(
        FONTSX,
        FONTSYBOTTOM - FONTSHEIGHT,
        FONTSWIDTH,
        FONTSHEIGHT
      );

      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(35);
      c.textAlign = "center";
      c.fillText(
        "FONT",
        FONTSX + FONTSWIDTH/2,
        FONTSYBOTTOM - FONTSHEIGHT + 45
      );

      const LISTY = 90;
      const LISTSPACING = 30;
      c.font = "bold 22px Verdana";
      c.globalAlpha = rotr.selectedFont === "readable"||cg.Input.buttons.menuArial.hovered ? 1 : 0.6;
      c.fillText(
        "Verdana",
        FONTSX + FONTSWIDTH/2,
        FONTSYBOTTOM - FONTSHEIGHT + LISTY - 1
      );
      c.globalAlpha = rotr.selectedFont === "themed"||cg.Input.buttons.menuAurebeshEng.hovered ? 1 : 0.6;
      c.font = "19px Aurebesh_english";
      c.fillText(
        "Aurebesh Eng",
        FONTSX + FONTSWIDTH/2,
        FONTSYBOTTOM - FONTSHEIGHT + LISTY + LISTSPACING - 1
      );
      c.globalAlpha = rotr.selectedFont === "aurebesh"||cg.Input.buttons.menuAurebeshAF.hovered ? 1 : 0.6;
      c.font = "17px Aurebesh_AF";
      c.fillText(
        "Aurebesh AF",
        FONTSX + FONTSWIDTH/2,
        FONTSYBOTTOM - FONTSHEIGHT + LISTY + LISTSPACING * 2
      );

      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.menuArial.transform.x = FONTSX + FONTSWIDTH/2 + HALFWIDTH;
        cg.Input.buttons.menuArial.transform.y = FONTSYBOTTOM - FONTSHEIGHT + LISTY - 7 + HALFHEIGHT;
        cg.Input.buttons.menuArial.width = FONTSWIDTH;
        cg.Input.buttons.menuArial.height = LISTSPACING;

        cg.Input.buttons.menuAurebeshEng.transform.x = FONTSX + FONTSWIDTH/2 + HALFWIDTH;
        cg.Input.buttons.menuAurebeshEng.transform.y = FONTSYBOTTOM - FONTSHEIGHT + LISTY + LISTSPACING - 7 + HALFHEIGHT;
        cg.Input.buttons.menuAurebeshEng.width = FONTSWIDTH;
        cg.Input.buttons.menuAurebeshEng.height = LISTSPACING;

        cg.Input.buttons.menuAurebeshAF.transform.x = FONTSX + FONTSWIDTH/2 + HALFWIDTH;
        cg.Input.buttons.menuAurebeshAF.transform.y = FONTSYBOTTOM - FONTSHEIGHT + LISTY + LISTSPACING * 2 - 7 + HALFHEIGHT;
        cg.Input.buttons.menuAurebeshAF.width = FONTSWIDTH;
        cg.Input.buttons.menuAurebeshAF.height = LISTSPACING;

      }

      // START WITH GUESTS
      if (this.hasPressedPlayOrGuests===false) {
        const SWGWIDTH = 350;
        const SWGHEIGHT = 210;
        const SWGX = -TOTALWIDTH/2 - SWGWIDTH - 50;
        const SWGY = -TOTALHEIGHT/2;
        c.globalAlpha = BACKGROUNDOPACITY;
        c.fillStyle = UICOLOURS.MENU_BACKGROUND;
        c.fillRect(
          SWGX,
          SWGY,
          SWGWIDTH,
          SWGHEIGHT
        );
        c.globalAlpha = 1;
        c.strokeStyle = UICOLOURS.WHITE;
        c.strokeRect(
          SWGX,
          SWGY,
          SWGWIDTH,
          SWGHEIGHT
        );

        c.fillStyle = UICOLOURS.WHITE;
        c.font = rotr.font(35);
        c.textAlign = "center";
        c.fillText(
          "START WITH",
          SWGX + SWGWIDTH/2,
          SWGY + 45
        );
        c.fillText(
          "GUESTS",
          SWGX + SWGWIDTH/2,
          SWGY + 35 + 45
        );

        const SWGBUTTONX = SWGX + MAINMARGIN;
        const SWGBUTTONY = SWGY + SWGHEIGHT - MAINMARGIN - 80;
        const SWGBUTTONWIDTH = SWGWIDTH - MAINMARGIN * 2;
        const SWGBUTTONHEIGHT = 80;

        c.strokeStyle = UICOLOURS.WHITE;
        c.strokeRect(
          SWGBUTTONX,
          SWGBUTTONY,
          SWGBUTTONWIDTH,
          SWGBUTTONHEIGHT
        );

        if (cg.Input.buttons.menuStartWithGuests.hovered) {
          c.fillStyle = UICOLOURS.WHITE;
          c.fillRect(
            SWGBUTTONX,
            SWGBUTTONY,
            SWGBUTTONWIDTH,
            SWGBUTTONHEIGHT
          );
        }

        if (this.hasSetMainButtons===false) {
          cg.Input.buttons.menuStartWithGuests.transform.x = SWGBUTTONX + SWGBUTTONWIDTH/2 + HALFWIDTH;
          cg.Input.buttons.menuStartWithGuests.transform.y = SWGBUTTONY + SWGBUTTONHEIGHT/2 + HALFHEIGHT;
          cg.Input.buttons.menuStartWithGuests.width = SWGBUTTONWIDTH;
          cg.Input.buttons.menuStartWithGuests.height = SWGBUTTONHEIGHT;
        }

        c.fillStyle = cg.Input.buttons.menuStartWithGuests.hovered ? UICOLOURS.BLACK : UICOLOURS.WHITE;
        c.font = rotr.font(40);
        c.fillText(
          "YES",
          SWGX + SWGWIDTH/2,
          SWGBUTTONY + SWGBUTTONHEIGHT/2 + 14
        );
      }

      this.hasSetMainButtons = true;

    } else if (this.page==="hotkeys") {
      drawHotkeysMenu(c,BACKGROUNDOPACITY,HALFWIDTH,HALFHEIGHT,true,true);

    } else if (this.page==="settings") {
      const TITLEMARGIN = 40;
      const PANELWIDTH = 450;
      const PANELHEIGHT = 590;
      const PANELSPACING = 60;
      const PANELY = -PANELHEIGHT/2 + TITLEMARGIN;
      const CONTENTY = PANELY + MAINMARGIN;
      const LEFTPANELX = -PANELWIDTH - PANELSPACING -PANELWIDTH/2;
      const MIDDLEPANELX = -PANELWIDTH/2;
      const RIGHTPANELX = PANELWIDTH/2 + PANELSPACING;
      const LEFTCONTENTX = -PANELWIDTH - PANELSPACING -PANELWIDTH/2 + MAINMARGIN;
      const MIDDLECONTENTX = -PANELWIDTH/2 + MAINMARGIN;
      const RIGHTCONTENTX = PANELWIDTH/2 + PANELSPACING + MAINMARGIN;
      const CONTENTWIDTH = PANELWIDTH - MAINMARGIN * 2;
      c.globalAlpha = BACKGROUNDOPACITY;
      c.fillStyle = UICOLOURS.MENU_BACKGROUND;
      c.fillRect(LEFTPANELX,PANELY,PANELWIDTH,PANELHEIGHT - TITLEMARGIN);
      c.fillRect(MIDDLEPANELX,PANELY,PANELWIDTH,PANELHEIGHT - TITLEMARGIN);
      c.fillRect(RIGHTPANELX,PANELY,PANELWIDTH,PANELHEIGHT - TITLEMARGIN);
      c.globalAlpha = 1;
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 4;
      c.strokeRect(LEFTPANELX,PANELY,PANELWIDTH,PANELHEIGHT - TITLEMARGIN);
      c.strokeRect(MIDDLEPANELX,PANELY,PANELWIDTH,PANELHEIGHT - TITLEMARGIN);
      c.strokeRect(RIGHTPANELX,PANELY,PANELWIDTH,PANELHEIGHT - TITLEMARGIN);

      const CROSSX = RIGHTPANELX + PANELWIDTH + 20;
      const CROSSY = PANELY;
      this.drawCross(
        c,
        CROSSX,
        CROSSY,
        cg.Input.buttons.settingsCloseMenu.hovered
      );

      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsCloseMenu.transform.x = CROSSX + HALFWIDTH + 40;
        cg.Input.buttons.settingsCloseMenu.transform.y = CROSSY + HALFHEIGHT + 40;
        cg.Input.buttons.settingsCloseMenu.width = 80;
        cg.Input.buttons.settingsCloseMenu.height = 80;
      }

      const LEFTCENTREX = LEFTPANELX + PANELWIDTH / 2;
      const MIDDLECENTREX = MIDDLEPANELX + PANELWIDTH / 2;
      const RIGHTCENTREX = RIGHTPANELX + PANELWIDTH / 2;

      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 4;
      c.font = rotr.font(40);
      c.textAlign = "center";
      c.fillStyle = UICOLOURS.WHITE;
      c.fillText(
        "AUTOMATION",
        LEFTCENTREX,
        PANELY - 20
      );
      c.fillText(
        "SIMULATION",
        MIDDLECENTREX,
        PANELY - 20
      );
      c.fillText(
        "GAMEPLAY",
        RIGHTCENTREX,
        PANELY - 20
      );

      const BUTTONHEIGHT = 85;

      // LEFT PANEL
      c.fillStyle = UICOLOURS.WHITE;
      if (automation.enabled.READYROOMS) {
        c.fillRect(
          LEFTCONTENTX,
          CONTENTY,
          CONTENTWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.strokeStyle = cg.Input.buttons.settingsAutomationReadyRooms.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        LEFTCONTENTX,
        CONTENTY,
        CONTENTWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsAutomationReadyRooms.transform.x = LEFTCONTENTX + HALFWIDTH + CONTENTWIDTH/2;
        cg.Input.buttons.settingsAutomationReadyRooms.transform.y = CONTENTY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsAutomationReadyRooms.width = CONTENTWIDTH;
        cg.Input.buttons.settingsAutomationReadyRooms.height = BUTTONHEIGHT;
      }
      c.font = rotr.font(34);
      c.fillText(
        "READY ROOMS",
        LEFTCONTENTX + CONTENTWIDTH / 2,
        CONTENTY + BUTTONHEIGHT / 2 + 10
      )

      c.fillStyle = UICOLOURS.WHITE;
      if (automation.enabled.ITS) {
        c.fillRect(
          LEFTCONTENTX,
          CONTENTY + BUTTONHEIGHT + MINORMARGIN,
          CONTENTWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.strokeStyle = cg.Input.buttons.settingsAutomationITS.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        LEFTCONTENTX,
        CONTENTY + BUTTONHEIGHT + MINORMARGIN,
        CONTENTWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsAutomationITS.transform.x = LEFTCONTENTX + HALFWIDTH + CONTENTWIDTH/2;
        cg.Input.buttons.settingsAutomationITS.transform.y = CONTENTY + BUTTONHEIGHT + MINORMARGIN + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsAutomationITS.width = CONTENTWIDTH;
        cg.Input.buttons.settingsAutomationITS.height = BUTTONHEIGHT;
      }
      c.font = rotr.font(34);
      c.fillText(
        "ITS",
        LEFTCONTENTX + CONTENTWIDTH / 2,
        CONTENTY + BUTTONHEIGHT / 2 + BUTTONHEIGHT + MINORMARGIN + 10
      )

      const LOADBUTTONY = CONTENTY + (BUTTONHEIGHT + MINORMARGIN) * 2 + 45;
      const FOURCOLUMNBUTTONWIDTH = (CONTENTWIDTH - MINORMARGIN * 3) / 4;
      c.fillStyle = UICOLOURS.WHITE;
      c.fillText(
        "LOAD",
        LEFTCONTENTX + CONTENTWIDTH / 2,
        LOADBUTTONY - 20
      )

      for (let i=0;i<4;i++) {
        c.fillStyle = UICOLOURS.WHITE;
        if (automation.enabled["LOAD"+(i+1)]) {
          c.fillRect(
            LEFTCONTENTX + (FOURCOLUMNBUTTONWIDTH + MINORMARGIN) * i,
            LOADBUTTONY,
            FOURCOLUMNBUTTONWIDTH,
            BUTTONHEIGHT
          );
          c.fillStyle = UICOLOURS.BLACK;
        }
        c.strokeStyle = cg.Input.buttons["settingsAutomationLoad"+(i+1)].hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
        c.strokeRect(
          LEFTCONTENTX + (FOURCOLUMNBUTTONWIDTH + MINORMARGIN) * i,
          LOADBUTTONY,
          FOURCOLUMNBUTTONWIDTH,
          BUTTONHEIGHT
        );
        if (this.hasSetSettingsButtons===false) {
          cg.Input.buttons["settingsAutomationLoad"+(i+1)].transform.x = LEFTCONTENTX + (FOURCOLUMNBUTTONWIDTH + MINORMARGIN) * i + HALFWIDTH + FOURCOLUMNBUTTONWIDTH/2;
          cg.Input.buttons["settingsAutomationLoad"+(i+1)].transform.y = LOADBUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
          cg.Input.buttons["settingsAutomationLoad"+(i+1)].width = FOURCOLUMNBUTTONWIDTH;
          cg.Input.buttons["settingsAutomationLoad"+(i+1)].height = BUTTONHEIGHT;
        }
        c.font = rotr.font(45);
        c.fillText(
          ["1","2","3","4"][i],
          LEFTCONTENTX + (FOURCOLUMNBUTTONWIDTH + MINORMARGIN) * i + FOURCOLUMNBUTTONWIDTH / 2,
          LOADBUTTONY + BUTTONHEIGHT / 2 + 14
        )
      }

      const TWOCOLUMNBUTTONWIDTH = (CONTENTWIDTH - MINORMARGIN) / 2;
      const UNLOADBUTTONY = PANELY + PANELHEIGHT - TITLEMARGIN - MAINMARGIN - BUTTONHEIGHT;

      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(36);
      c.fillText(
        "UNLOAD",
        LEFTCONTENTX + CONTENTWIDTH / 2,
        UNLOADBUTTONY - 20
      )
      c.fillStyle = UICOLOURS.WHITE;
      if (automation.enabled.UNLOAD2) {
        c.fillRect(
          LEFTCONTENTX,
          UNLOADBUTTONY,
          TWOCOLUMNBUTTONWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.strokeStyle = cg.Input.buttons.settingsAutomationUnloadLeft.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        LEFTCONTENTX,
        UNLOADBUTTONY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsAutomationUnloadLeft.transform.x = LEFTCONTENTX + HALFWIDTH + TWOCOLUMNBUTTONWIDTH/2;
        cg.Input.buttons.settingsAutomationUnloadLeft.transform.y = UNLOADBUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsAutomationUnloadLeft.width = TWOCOLUMNBUTTONWIDTH;
        cg.Input.buttons.settingsAutomationUnloadLeft.height = BUTTONHEIGHT;
      }
      c.font = rotr.font(34);
      c.fillText(
        "LEFT",
        LEFTCONTENTX + TWOCOLUMNBUTTONWIDTH / 2,
        UNLOADBUTTONY + BUTTONHEIGHT / 2 + 10
      )
      c.fillStyle = UICOLOURS.WHITE;
      if (automation.enabled.UNLOAD1) {
        c.fillRect(
          LEFTCONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN,
          UNLOADBUTTONY,
          TWOCOLUMNBUTTONWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.strokeStyle = cg.Input.buttons.settingsAutomationUnloadRight.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        LEFTCONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN,
        UNLOADBUTTONY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsAutomationUnloadRight.transform.x = LEFTCONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN + HALFWIDTH + TWOCOLUMNBUTTONWIDTH/2;
        cg.Input.buttons.settingsAutomationUnloadRight.transform.y = UNLOADBUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsAutomationUnloadRight.width = TWOCOLUMNBUTTONWIDTH;
        cg.Input.buttons.settingsAutomationUnloadRight.height = BUTTONHEIGHT;
      }
      c.fillText(
        "RIGHT",
        LEFTCONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN + TWOCOLUMNBUTTONWIDTH / 2,
        UNLOADBUTTONY + BUTTONHEIGHT / 2 + 10
      )

      // MIDDLE PANEL
      const QUEUESY = CONTENTY + 50;

      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(36);
      c.fillText(
        "QUEUE ENABLE",
        MIDDLECONTENTX + CONTENTWIDTH / 2,
        QUEUESY - 20
      )

      c.fillStyle = UICOLOURS.WHITE;
      if (preshows.mainQueueEnable) {
        c.fillRect(
          MIDDLECONTENTX,
          QUEUESY,
          TWOCOLUMNBUTTONWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.strokeStyle = cg.Input.buttons.settingsSimulationQueueMain.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        MIDDLECONTENTX,
        QUEUESY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsSimulationQueueMain.transform.x = MIDDLECONTENTX + HALFWIDTH + TWOCOLUMNBUTTONWIDTH/2;
        cg.Input.buttons.settingsSimulationQueueMain.transform.y = QUEUESY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsSimulationQueueMain.width = TWOCOLUMNBUTTONWIDTH;
        cg.Input.buttons.settingsSimulationQueueMain.height = BUTTONHEIGHT;
      }
      c.font = rotr.font(34);
      c.fillText(
        "MAIN",
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH / 2,
        QUEUESY + BUTTONHEIGHT / 2 + 10
      )
      c.fillStyle = UICOLOURS.WHITE;
      if (preshows.llQueueEnable) {
        c.fillRect(
          MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN,
          QUEUESY,
          TWOCOLUMNBUTTONWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.strokeStyle = cg.Input.buttons.settingsSimulationQueueLL.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN,
        QUEUESY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsSimulationQueueLL.transform.x = MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN + HALFWIDTH + TWOCOLUMNBUTTONWIDTH/2;
        cg.Input.buttons.settingsSimulationQueueLL.transform.y = QUEUESY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsSimulationQueueLL.width = TWOCOLUMNBUTTONWIDTH;
        cg.Input.buttons.settingsSimulationQueueLL.height = BUTTONHEIGHT;
      }
      c.fillText(
        "LL",
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN + TWOCOLUMNBUTTONWIDTH / 2,
        QUEUESY + BUTTONHEIGHT / 2 + 10
      )

      const BUSYNESSBUTTONY = QUEUESY + BUTTONHEIGHT + MINORMARGIN + 75;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(36);
      c.fillText(
        "BUSYNESS",
        MIDDLECONTENTX + CONTENTWIDTH / 2,
        BUSYNESSBUTTONY - 20
      )

      c.beginPath();
      c.roundRect(
        MIDDLECONTENTX,
        BUSYNESSBUTTONY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT,
        10
      );
      c.fillStyle = UICOLOURS.WHITE;
      if (preshows.busyness==="low") {
        c.fill();
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.strokeStyle = cg.Input.buttons.settingsSimulationBusynessLow.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.stroke();
      c.font = rotr.font(34);
      c.fillText(
        "LOW",
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH / 2,
        BUSYNESSBUTTONY + BUTTONHEIGHT / 2 + 10
      )
      c.beginPath();
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsSimulationBusynessLow.transform.x = MIDDLECONTENTX + HALFWIDTH + TWOCOLUMNBUTTONWIDTH/2;
        cg.Input.buttons.settingsSimulationBusynessLow.transform.y = BUSYNESSBUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsSimulationBusynessLow.width = TWOCOLUMNBUTTONWIDTH;
        cg.Input.buttons.settingsSimulationBusynessLow.height = BUTTONHEIGHT;
      }
      c.roundRect(
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN,
        BUSYNESSBUTTONY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT,
        10
      );
      c.fillStyle = UICOLOURS.WHITE;
      if (preshows.busyness==="high") {
        c.fill();
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.strokeStyle = cg.Input.buttons.settingsSimulationBusynessHigh.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.stroke();
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsSimulationBusynessHigh.transform.x = MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN + HALFWIDTH + TWOCOLUMNBUTTONWIDTH/2;
        cg.Input.buttons.settingsSimulationBusynessHigh.transform.y = BUSYNESSBUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsSimulationBusynessHigh.width = TWOCOLUMNBUTTONWIDTH;
        cg.Input.buttons.settingsSimulationBusynessHigh.height = BUTTONHEIGHT;
      }
      c.fillText(
        "HIGH",
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN + TWOCOLUMNBUTTONWIDTH / 2,
        BUSYNESSBUTTONY + BUTTONHEIGHT / 2 + 10
      )


      const BMODESBUTTONY = PANELY + PANELHEIGHT - TITLEMARGIN - MAINMARGIN - BUTTONHEIGHT;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(36);
      c.fillText(
        "A/B Modes",
        MIDDLECONTENTX + CONTENTWIDTH / 2,
        BMODESBUTTONY - 20
      )

      c.globalAlpha = 0.5;
      c.fillStyle = rotr.effects.cannons === "a" ? "#3e4bae" : "#8b0000"
      c.fillRect(
        MIDDLECONTENTX,
        BMODESBUTTONY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT
      );
      c.globalAlpha = 1;
      c.strokeStyle = cg.Input.buttons.settingsSimulationABCannon.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        MIDDLECONTENTX,
        BMODESBUTTONY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsSimulationABCannon.transform.x = MIDDLECONTENTX + HALFWIDTH + TWOCOLUMNBUTTONWIDTH/2;
        cg.Input.buttons.settingsSimulationABCannon.transform.y = BMODESBUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsSimulationABCannon.width = TWOCOLUMNBUTTONWIDTH;
        cg.Input.buttons.settingsSimulationABCannon.height = BUTTONHEIGHT;
      }
      c.globalAlpha = 0.5;
      c.fillStyle = rotr.effects.kylo === "a" ? "#3e4bae" : "#8b0000"
      c.fillRect(
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN,
        BMODESBUTTONY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT
      );
      c.globalAlpha = 1;
      c.strokeStyle = cg.Input.buttons.settingsSimulationABKylo.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN,
        BMODESBUTTONY,
        TWOCOLUMNBUTTONWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsSimulationABKylo.transform.x = MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN + HALFWIDTH + TWOCOLUMNBUTTONWIDTH/2;
        cg.Input.buttons.settingsSimulationABKylo.transform.y = BMODESBUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsSimulationABKylo.width = TWOCOLUMNBUTTONWIDTH;
        cg.Input.buttons.settingsSimulationABKylo.height = BUTTONHEIGHT;
      }
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(20);
      c.fillText(
        rotr.effects.cannons === "a" ? "CANNON A" : "CANNON B",
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH / 2,
        BMODESBUTTONY + BUTTONHEIGHT / 2 + 6
      )
      c.fillText(
        rotr.effects.kylo === "a" ? "KYLO A" : "KYLO B",
        MIDDLECONTENTX + TWOCOLUMNBUTTONWIDTH + MINORMARGIN + TWOCOLUMNBUTTONWIDTH / 2,
        BMODESBUTTONY + BUTTONHEIGHT / 2 + 6
      )

      // RIGHT PANEL
      c.fillStyle = UICOLOURS.WHITE;
      if (cg.scenes.main.items.keyOverlay.transform.o===1) {
        c.fillRect(
          RIGHTCONTENTX,
          CONTENTY,
          CONTENTWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.font = rotr.font(34);
      c.fillText(
        "KEY OVERLAY",
        RIGHTCONTENTX + CONTENTWIDTH / 2,
        CONTENTY + BUTTONHEIGHT / 2 + 10
      )
      c.strokeStyle = cg.Input.buttons.settingsGameplayKeyOverlay.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        RIGHTCONTENTX,
        CONTENTY,
        CONTENTWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsGameplayKeyOverlay.transform.x = RIGHTCONTENTX + HALFWIDTH + CONTENTWIDTH/2;
        cg.Input.buttons.settingsGameplayKeyOverlay.transform.y = CONTENTY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsGameplayKeyOverlay.width = CONTENTWIDTH;
        cg.Input.buttons.settingsGameplayKeyOverlay.height = BUTTONHEIGHT;
      }

      const STATIONBUTTONY = CONTENTY + BUTTONHEIGHT + MINORMARGIN + 55;
      c.fillStyle = UICOLOURS.WHITE;
      c.fillText(
        "STATION ENABLE",
        RIGHTCONTENTX + CONTENTWIDTH / 2,
        STATIONBUTTONY - 20
      )

      for (let i=0;i<4;i++) {
        c.fillStyle = UICOLOURS.WHITE;
        if (disco["load"+(i+1)+"Active"]) {
          c.fillRect(
            RIGHTCONTENTX + (FOURCOLUMNBUTTONWIDTH + MINORMARGIN) * i,
            STATIONBUTTONY,
            FOURCOLUMNBUTTONWIDTH,
            BUTTONHEIGHT
          );
          c.fillStyle = UICOLOURS.BLACK;
        }
        c.font = rotr.font(45);
        c.fillText(
          ["1","2","3","4"][i],
          RIGHTCONTENTX + (FOURCOLUMNBUTTONWIDTH + MINORMARGIN) * i + FOURCOLUMNBUTTONWIDTH / 2,
          STATIONBUTTONY + BUTTONHEIGHT / 2 + 14
        )
        c.strokeStyle = cg.Input.buttons["settingsGameplayStation"+(i+1)].hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
        c.strokeRect(
          RIGHTCONTENTX + (FOURCOLUMNBUTTONWIDTH + MINORMARGIN) * i,
          STATIONBUTTONY,
          FOURCOLUMNBUTTONWIDTH,
          BUTTONHEIGHT
        );
        if (this.hasSetSettingsButtons===false) {
          cg.Input.buttons["settingsGameplayStation"+(i+1)].transform.x = RIGHTCONTENTX + (FOURCOLUMNBUTTONWIDTH + MINORMARGIN) * i + HALFWIDTH + FOURCOLUMNBUTTONWIDTH/2;
          cg.Input.buttons["settingsGameplayStation"+(i+1)].transform.y = STATIONBUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
          cg.Input.buttons["settingsGameplayStation"+(i+1)].width = FOURCOLUMNBUTTONWIDTH;
          cg.Input.buttons["settingsGameplayStation"+(i+1)].height = BUTTONHEIGHT;
        }
      }

      const MAPBUTTONSY = STATIONBUTTONY + BUTTONHEIGHT + MINORMARGIN + 20;
      c.fillStyle = UICOLOURS.WHITE;
      if (cg.graphics.menus.allowMapButtons) {
        c.fillRect(
          RIGHTCONTENTX,
          MAPBUTTONSY,
          CONTENTWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.font = rotr.font(34);
      c.fillText(
        "MAP BUTTONS",
        RIGHTCONTENTX + CONTENTWIDTH / 2,
        MAPBUTTONSY + BUTTONHEIGHT / 2 + 10
      )
      c.strokeStyle = cg.Input.buttons.settingsGameplayMapButtons.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        RIGHTCONTENTX,
        MAPBUTTONSY,
        CONTENTWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsGameplayMapButtons.transform.x = RIGHTCONTENTX + HALFWIDTH + CONTENTWIDTH/2;
        cg.Input.buttons.settingsGameplayMapButtons.transform.y = MAPBUTTONSY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsGameplayMapButtons.width = CONTENTWIDTH;
        cg.Input.buttons.settingsGameplayMapButtons.height = BUTTONHEIGHT;
      }

      const HIDECONSOLESY = PANELY + PANELHEIGHT - TITLEMARGIN - MAINMARGIN - BUTTONHEIGHT;
      c.fillStyle = UICOLOURS.WHITE;
      if (cg.scenes.main.items.mainControl.transform.o===0) {
        c.fillRect(
          RIGHTCONTENTX,
          HIDECONSOLESY,
          CONTENTWIDTH,
          BUTTONHEIGHT
        );
        c.fillStyle = UICOLOURS.BLACK;
      }
      c.font = rotr.font(34);
      c.fillText(
        "HIDE CONSOLE",
        RIGHTCONTENTX + CONTENTWIDTH / 2,
        HIDECONSOLESY + BUTTONHEIGHT / 2 + 10
      )
      c.strokeStyle = cg.Input.buttons.settingsGameplayConsoles.hovered ? UICOLOURS.YELLOW : UICOLOURS.WHITE;
      c.strokeRect(
        RIGHTCONTENTX,
        HIDECONSOLESY,
        CONTENTWIDTH,
        BUTTONHEIGHT
      );
      if (this.hasSetSettingsButtons===false) {
        cg.Input.buttons.settingsGameplayConsoles.transform.x = RIGHTCONTENTX + HALFWIDTH + CONTENTWIDTH/2;
        cg.Input.buttons.settingsGameplayConsoles.transform.y = HIDECONSOLESY + HALFHEIGHT + BUTTONHEIGHT/2;
        cg.Input.buttons.settingsGameplayConsoles.width = CONTENTWIDTH;
        cg.Input.buttons.settingsGameplayConsoles.height = BUTTONHEIGHT;
      }

      const tipTexts = {
        settingsAutomationReadyRooms : "Toggle automatic control of ready rooms",
        settingsAutomationITS : "Toggle automatic control of ITS",
        settingsAutomationLoad1 : "Toggle automatic control of Load 1",
        settingsAutomationLoad2 : "Toggle automatic control of Load 2",
        settingsAutomationLoad3 : "Toggle automatic control of Load 3",
        settingsAutomationLoad4 : "Toggle automatic control of Load 4",
        settingsAutomationUnloadLeft : "Toggle automatic control of Unload 2",
        settingsAutomationUnloadRight : "Toggle automatic control of Unload 1",
        settingsSimulationQueueMain : "Disable/enable the main queue",
        settingsSimulationQueueLL : "Disable/enable the LL queue",
        settingsSimulationBusynessLow : "Limit guest spawning, not reaching full capacity",
        settingsSimulationBusynessHigh : "Full capacity",
        settingsSimulationABCannon : "Set if cannons are working or not",
        settingsSimulationABKylo : "Set if Kylo is working or not",
        settingsGameplayKeyOverlay : "Show hotkeys relative to appropriate areas on map",
        settingsGameplayStation1 : "Enable/disable sending guests to load 1",
        settingsGameplayStation2 : "Enable/disable sending guests to load 2",
        settingsGameplayStation3 : "Enable/disable sending guests to load 3",
        settingsGameplayStation4 : "Enable/disable sending guests to load 4",
        settingsGameplayMapButtons : "Allow clicking on stations/doors/etc to control them",
        settingsGameplayConsoles : "Show/hide the consoles replacing them with forest stuffs"
      }

      const TIPFADETIME = 1500;

      let tipText = null;
      let mostRecentTime = -Infinity;
      let mostRecentText = "";
      for (const buttonId in tipTexts) {
        const button = cg.Input.buttons[buttonId];
        if (button.hovered) {
          tipText = tipTexts[buttonId];
        }
        if (button.exitTime > mostRecentTime) {
          mostRecentTime = button.exitTime;
          mostRecentText = tipTexts[buttonId];
        }
      }
      let opacityMultiplier = 1;
      if (ChoreoGraph.nowint - mostRecentTime < TIPFADETIME && tipText===null) {
        opacityMultiplier = 1 - ((ChoreoGraph.nowint - mostRecentTime) / TIPFADETIME);
        tipText = mostRecentText;
      }

      if (tipText) {
        const TIPBOXY = PANELY + PANELHEIGHT - TITLEMARGIN + 15;
        const TIPBOXHEIGHT = 60;
        const TIPBOXWIDTH = PANELWIDTH*3 + PANELSPACING*2;
        c.globalAlpha = BACKGROUNDOPACITY*opacityMultiplier;
        c.fillStyle = UICOLOURS.MENU_BACKGROUND;
        c.fillRect(LEFTPANELX,TIPBOXY,TIPBOXWIDTH,TIPBOXHEIGHT);
        c.globalAlpha = opacityMultiplier;
        c.strokeStyle = UICOLOURS.WHITE;
        c.lineWidth = 4;
        c.strokeRect(LEFTPANELX,TIPBOXY,TIPBOXWIDTH,TIPBOXHEIGHT);

        c.fillStyle = UICOLOURS.WHITE;
        c.font = rotr.font(24);
        c.textAlign = "center";
        c.fillText(
          tipText,
          0,
          TIPBOXY + TIPBOXHEIGHT / 2 + 8
        )
      }

    } else if (this.page==="log") {
      const TOTALWIDTH = 600;
      const TOTALHEIGHT = 300;
      c.globalAlpha = BACKGROUNDOPACITY;
      c.fillStyle = UICOLOURS.MENU_BACKGROUND;
      c.fillRect(-TOTALWIDTH/2,-TOTALHEIGHT/2,TOTALWIDTH,TOTALHEIGHT);
      c.globalAlpha = 1;
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 4;
      c.strokeRect(-TOTALWIDTH/2,-TOTALHEIGHT/2,TOTALWIDTH,TOTALHEIGHT);

      const CROSSX = TOTALWIDTH/2 + 20;
      const CROSSY = -TOTALHEIGHT/2;
      this.drawCross(
        c,
        CROSSX,
        CROSSY,
        cg.Input.buttons.logsCloseMenu.hovered
      );

      if (this.hasSetLogButtons===false) {
        cg.Input.buttons.logsCloseMenu.transform.x = CROSSX + HALFWIDTH + 40;
        cg.Input.buttons.logsCloseMenu.transform.y = CROSSY + HALFHEIGHT + 40;
        cg.Input.buttons.logsCloseMenu.width = 80;
        cg.Input.buttons.logsCloseMenu.height = 80;
      }

      c.font = rotr.font(50);
      c.textAlign = "center";
      c.fillStyle = UICOLOURS.WHITE;
      c.fillText(
        "LOG SESSION",
        0,
        -TOTALHEIGHT/2 + 70
      );

      c.font = rotr.font(20);
      c.textAlign = "center";
      if (rotr.simSessionId==null) {
        c.fillText("You must be logged in to",0, -10);
        c.fillText("log sessions. This will allow",0, 20);
        c.fillText("you to track statistics from",0, -10+30*2);
        c.fillText("your ride operations!",0, -10+30*3);
      } else if (rotr.dispatches==0) {
        c.fillText("You must dispatch a vehicle",0, 0);
        c.fillText("before logging your session.",0, 30);
        c.fillText("Otherwise its pretty pointless.",0, 30*2);
      } else {
        c.fillText("This will end the session",0, -35);
        c.fillText("and log all statistics so they",0, -15);
        c.fillText("can show on your profile.",0, 5);

        c.fillStyle = UICOLOURS.WHITE;
        if (cg.Input.buttons.logLog.hovered) {
          c.fillRect(-200, 30, 400, 100);
          c.fillStyle = UICOLOURS.BLACK;
        }
        c.strokeStyle = UICOLOURS.WHITE;
        c.strokeRect(-200, 30, 400, 100);
        c.font = rotr.font(35);
        c.fillText("LOG SESSION",0, 90);

        if (this.hasSetLogButtons===false) {
          cg.Input.buttons.logLog.transform.x = -200 + HALFWIDTH + 400/2;
          cg.Input.buttons.logLog.transform.y = 30 + HALFHEIGHT + 100/2;
          cg.Input.buttons.logLog.width = 400;
          cg.Input.buttons.logLog.height = 100;
        }

        this.hasSetLogButtons = true;

      }
    } else if (this.page==="vehicles") {
      const TOTALWIDTH = 1150;
      const TOTALHEIGHT = 600;
      const CONTENTMARGIN = 50;
      c.globalAlpha = BACKGROUNDOPACITY;
      c.fillStyle = UICOLOURS.MENU_BACKGROUND;
      c.fillRect(-TOTALWIDTH/2,-TOTALHEIGHT/2,TOTALWIDTH,TOTALHEIGHT);
      c.globalAlpha = 1;
      c.strokeStyle = UICOLOURS.WHITE;
      c.lineWidth = 4;
      c.strokeRect(-TOTALWIDTH/2,-TOTALHEIGHT/2,TOTALWIDTH,TOTALHEIGHT);

      const CROSSX = TOTALWIDTH/2 + 20;
      const CROSSY = -TOTALHEIGHT/2;
      this.drawCross(
        c,
        CROSSX,
        CROSSY,
        cg.Input.buttons.vehiclesCloseMenu.hovered
      );

      if (this.hasSetVehiclesButtons===false) {
        cg.Input.buttons.vehiclesCloseMenu.transform.x = CROSSX + HALFWIDTH + 40;
        cg.Input.buttons.vehiclesCloseMenu.transform.y = CROSSY + HALFHEIGHT + 40;
        cg.Input.buttons.vehiclesCloseMenu.width = 80;
        cg.Input.buttons.vehiclesCloseMenu.height = 80;
      }

      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(35);
      c.textAlign = "left";
      c.fillText(
        "STORAGE",
        -TOTALWIDTH/2 + CONTENTMARGIN + 10,
        -TOTALHEIGHT/2 + CONTENTMARGIN + 55
      );

      const COLUMNS = 8;
      const ROWS = 5;

      const ROWHEIGHT = (TOTALHEIGHT - CONTENTMARGIN * 2) / ROWS;
      const COLUMNWIDTH = (TOTALWIDTH - CONTENTMARGIN * 2) / COLUMNS;

      const TOPLEFTX = -TOTALWIDTH/2 + CONTENTMARGIN;
      const TOPLEFTY = -TOTALHEIGHT/2 + CONTENTMARGIN;

      const VEHICLECELLMARGIN = 5;
      const VEHICLEIMAGEBOXSIZE = 50;

      c.lineWidth = 2;
      let vehicleNumber = 0;
      for (let row=0;row<ROWS;row++) {
        for (let col=0;col<COLUMNS;col++) {
          if (row===0&&(col===0||col===1)) { continue; }
          vehicleNumber++;
          c.globalAlpha = 0.6;
          c.fillStyle = UICOLOURS.LIGHTEST;
          c.fillRect(
            TOPLEFTX + COLUMNWIDTH * col + VEHICLECELLMARGIN,
            TOPLEFTY + ROWHEIGHT * row + VEHICLECELLMARGIN,
            COLUMNWIDTH - VEHICLECELLMARGIN * 2,
            ROWHEIGHT - VEHICLECELLMARGIN * 2
          );
          c.globalAlpha = 1;

          const vehicle = vehicles[vehicleNumber];

          c.fillStyle = UICOLOURS.WHITE;
          c.font = rotr.font(20);
          c.textAlign = "left";
          c.fillText(
            vehicleNumber,
            TOPLEFTX + COLUMNWIDTH * col + VEHICLECELLMARGIN + 5,
            TOPLEFTY + ROWHEIGHT * row + VEHICLECELLMARGIN + 20
          );

          c.font = rotr.font(8.5);
          c.fillText(
            vehicle.scene.length <= 3 ? "SCENE " + vehicle.scene : vehicle.scene,
            TOPLEFTX + COLUMNWIDTH * col + VEHICLECELLMARGIN + 5,
            TOPLEFTY + ROWHEIGHT * row + VEHICLECELLMARGIN + 42
          );

          c.fillStyle = "#252424";
          const VEHICLEIMAGEBOXX = TOPLEFTX + COLUMNWIDTH * col + VEHICLECELLMARGIN + COLUMNWIDTH - VEHICLECELLMARGIN * 2 - VEHICLEIMAGEBOXSIZE;
          const VEHICLEIMAGEBOXY = TOPLEFTY + ROWHEIGHT * row + VEHICLECELLMARGIN;
          c.fillRect(
            VEHICLEIMAGEBOXX,
            VEHICLEIMAGEBOXY,
            VEHICLEIMAGEBOXSIZE,
            VEHICLEIMAGEBOXSIZE
          );

          if (vehicle.inStorage) {
            c.save();
            ChoreoGraph.transformContext(
              canvas.camera,
              VEHICLEIMAGEBOXX+VEHICLEIMAGEBOXSIZE/2 + TOTALWIDTH * 0.8095,
              VEHICLEIMAGEBOXY+VEHICLEIMAGEBOXSIZE/2 + TOTALHEIGHT * 0.666,
              vehicle.transform.r
            )
            vehicle.Graphic.graphic.draw(c,0,0,canvas);
            c.restore();
          } else {
            c.drawImage(
              this.cloneCanvas,
              vehicle.transform.x - VEHICLEIMAGEBOXSIZE / 2,
              vehicle.transform.y - VEHICLEIMAGEBOXSIZE / 2,
              VEHICLEIMAGEBOXSIZE,
              VEHICLEIMAGEBOXSIZE,
              VEHICLEIMAGEBOXX,
              VEHICLEIMAGEBOXY,
              VEHICLEIMAGEBOXSIZE,
              VEHICLEIMAGEBOXSIZE
            );
          }

          c.strokeStyle = "#252424";
          c.lineWidth = 5;
          c.strokeRect(
            VEHICLEIMAGEBOXX + 2.5,
            VEHICLEIMAGEBOXY + 2.5,
            VEHICLEIMAGEBOXSIZE - 5,
            VEHICLEIMAGEBOXSIZE - 5
          );

          const BUTTONX = TOPLEFTX + COLUMNWIDTH * col + VEHICLECELLMARGIN;
          const BUTTONY = TOPLEFTY + ROWHEIGHT * row + VEHICLECELLMARGIN + VEHICLEIMAGEBOXSIZE;
          const BUTTONWIDTH = COLUMNWIDTH - VEHICLECELLMARGIN * 2;
          const BUTTONHEIGHT = ROWHEIGHT - VEHICLECELLMARGIN * 2 - VEHICLEIMAGEBOXSIZE;
          let buttonText;
          if (vehicle.inStorage) {
            if (vehicle.storageTag === STORAGE_TAGS.SHOW) {
              c.fillStyle = "#00a600";
              buttonText = "ADDING";
            } else {
              c.fillStyle = "#006400";
              buttonText = "ADD";
            }
          } else {
            if (vehicle.storageTag === STORAGE_TAGS.SHOW) {
              c.fillStyle = "#640000";
              buttonText = "REMOVE";
            } else {
              c.fillStyle = "#ad0000";
              buttonText = "REMOVING";
            }
          }
          c.fillRect(
            BUTTONX,
            BUTTONY,
            BUTTONWIDTH,
            BUTTONHEIGHT
          );
          c.fillStyle = UICOLOURS.WHITE;
          c.font = rotr.font(15);
          c.textAlign = "center";
          c.fillText(
            buttonText,
            BUTTONX + BUTTONWIDTH / 2,
            BUTTONY + BUTTONHEIGHT / 2 + 5
          );

          if (this.hasSetVehiclesButtons===false) {
            cg.Input.buttons["vehiclesVehicle"+vehicleNumber].transform.x = BUTTONX + HALFWIDTH + BUTTONWIDTH/2;
            cg.Input.buttons["vehiclesVehicle"+vehicleNumber].transform.y = BUTTONY + HALFHEIGHT + BUTTONHEIGHT/2;
            cg.Input.buttons["vehiclesVehicle"+vehicleNumber].width = BUTTONWIDTH;
            cg.Input.buttons["vehiclesVehicle"+vehicleNumber].height = BUTTONHEIGHT;
          }

          if (cg.Input.buttons["vehiclesVehicle"+vehicleNumber].hovered) {
            c.fillStyle = UICOLOURS.BLACK;
            c.globalAlpha = 0.3;
            c.fillRect(
              BUTTONX,
              BUTTONY,
              BUTTONWIDTH,
              BUTTONHEIGHT
            );
          }
        }
      }

      this.hasSetVehiclesButtons = true;
    }
  }
}
cg.createGraphic({type:"menus"},"menus");

function drawHotkeysMenu(c,BACKGROUNDOPACITY,HALFWIDTH,HALFHEIGHT,showPrompts=false,showCross=false) {
  if (cg.graphics.menus.rebindSelection!==null&&ChoreoGraph.nowint - cg.graphics.menus.rebindTime > 8000) {
    cg.graphics.menus.rebindSelection = null;
  }

  const TOTALWIDTH = 1150;
  const TOTALHEIGHT = 600;
  const CONTENTMARGIN = 50;
  const LEFTPADDING = 30;
  const KEYSIZE = 50;
  const KEYSPACING = 7;
  const ACTIONFONT = rotr.font(15);
  c.globalAlpha = BACKGROUNDOPACITY;
  c.fillStyle = UICOLOURS.MENU_BACKGROUND;
  c.fillRect(-TOTALWIDTH/2,-TOTALHEIGHT/2,TOTALWIDTH,TOTALHEIGHT);
  c.globalAlpha = 1;
  c.strokeStyle = UICOLOURS.WHITE;
  c.lineWidth = 4;
  c.strokeRect(-TOTALWIDTH/2,-TOTALHEIGHT/2,TOTALWIDTH,TOTALHEIGHT);

  const CROSSX = TOTALWIDTH/2 + 20;
  const CROSSY = -TOTALHEIGHT/2;
  if (showCross) {
    cg.graphics.menus.drawCross(
      c,
      CROSSX,
      CROSSY,
      cg.Input.buttons.hotkeysCloseMenu.hovered
    );
  }

  if (cg.graphics.menus.hasSetHotkeysButtons===false) {
    cg.Input.buttons.hotkeysCloseMenu.transform.x = CROSSX + HALFWIDTH + 40;
    cg.Input.buttons.hotkeysCloseMenu.transform.y = CROSSY + HALFHEIGHT + 40;
    cg.Input.buttons.hotkeysCloseMenu.width = 80;
    cg.Input.buttons.hotkeysCloseMenu.height = 80;
  }

  const TITLEX = -TOTALWIDTH/2 + CONTENTMARGIN;
  const TITLEY = -TOTALHEIGHT/2 + CONTENTMARGIN - 6;
  c.textAlign = "left";
  c.fillStyle = UICOLOURS.WHITE;
  c.font = rotr.font(50);
  c.fillText(
    "HOTKEYS",
    TITLEX,
    TITLEY + 40
  );

  const LOADX = -TOTALWIDTH/2 + CONTENTMARGIN + LEFTPADDING;
  const LOADY = -TOTALHEIGHT/2 + CONTENTMARGIN + 100;
  c.font = rotr.font(30);
  c.fillText(
    "LOAD",
    LOADX,
    LOADY
  );
  for (let i=0;i<4;i++) {
    const button = cg.Input.buttons[cg.graphics.menus.hotkeyButtonIds[i]];
    const keyText = cg.graphics.menus.getKeyText(i);
    const KEYX = LOADX + (KEYSIZE + KEYSPACING) * i;
    const KEYY = LOADY + 15;
    cg.graphics.menus.drawKey(
      c,
      keyText,
      KEYX,
      KEYY,
      KEYSIZE,
      KEYSIZE,
      button.hovered,
      cg.graphics.menus.isHotkeyModified(i)
    );
    if (!cg.graphics.menus.hasSetHotkeysButtons) {
      button.transform.x = KEYX + HALFWIDTH + KEYSIZE/2;
      button.transform.y = KEYY + HALFHEIGHT + KEYSIZE/2;
      button.width = KEYSIZE;
      button.height = KEYSIZE;
    }
  }
  c.textAlign = "left";
  c.font = ACTIONFONT;
  const SELECTSTATIONX = LOADX + (KEYSIZE + KEYSPACING) * 4 + 10;
  const SELECTSTATIONY = LOADY + 43;
  c.fillText(
    "- SELECT STATION",
    SELECTSTATIONX,
    SELECTSTATIONY
  );

  for (let i=0;i<4;i++) {
    const button = cg.Input.buttons[cg.graphics.menus.hotkeyButtonIds[i+4]];
    const keyText = cg.graphics.menus.getKeyText(i+4);
    const KEYX = LOADX;
    const KEYY = LOADY + 95 + (KEYSIZE + KEYSPACING) * i;
    cg.graphics.menus.drawKey(
      c,
      keyText,
      KEYX,
      KEYY,
      KEYSIZE + (keyText==="SPACE" ? 65 : 0),
      KEYSIZE,
      button.hovered,
      cg.graphics.menus.isHotkeyModified(i+4)
    );
    const ACTIONX = KEYX + KEYSIZE + 15;
    const ACTIONY = KEYY + 30;
    c.textAlign = "left";
    c.font = ACTIONFONT;
    c.fillText(
      ["- TOGGLE CELL DOOR","- TOGGLE LOAD DOOR","- CHECK","- ENQUEUE DISPATCH"][i],
      ACTIONX + (keyText==="SPACE" ? 65 : 0),
      ACTIONY
    );
    if (!cg.graphics.menus.hasSetHotkeysButtons) {
      button.transform.x = KEYX + HALFWIDTH + KEYSIZE/2;
      button.transform.y = KEYY + HALFHEIGHT + KEYSIZE/2;
      button.width = KEYSIZE;
      button.height = KEYSIZE;
    }
  }

  const SHOWHOTKEYKEYY = TOTALHEIGHT/2 - CONTENTMARGIN - KEYSIZE/2;
  const showHotkeysButton = cg.Input.buttons[cg.graphics.menus.hotkeyButtonIds[8]];
  const showHotKeyText = cg.graphics.menus.getKeyText(8);
  cg.graphics.menus.drawKey(
    c,
    showHotKeyText,
    LOADX,
    SHOWHOTKEYKEYY - KEYSIZE/2,
    KEYSIZE + (showHotKeyText==="SPACE" ? 65 : 0),
    KEYSIZE,
    showHotkeysButton.hovered,
    cg.graphics.menus.isHotkeyModified(8)
  );
  if (!cg.graphics.menus.hasSetHotkeysButtons) {
    showHotkeysButton.transform.x = LOADX + HALFWIDTH + KEYSIZE/2;
    showHotkeysButton.transform.y = SHOWHOTKEYKEYY - KEYSIZE/2 + HALFHEIGHT + KEYSIZE/2;
    showHotkeysButton.width = KEYSIZE;
    showHotkeysButton.height = KEYSIZE;
  }
  c.font = ACTIONFONT;
  c.textAlign = "left";
  c.fillText(
    "- SHOW HOTKEYS",
    LOADX + KEYSIZE + 15 + (showHotKeyText==="SPACE" ? 65 : 0),
    SHOWHOTKEYKEYY + 6
  );

  const RIGHTCOLUMNX = 50;
  const READYROOMSITSY = -TOTALHEIGHT/2 + CONTENTMARGIN + 22;
  c.font = rotr.font(32);
  c.textAlign = "left";
  c.fillText(
    "READY ROOMS & ITS",
    RIGHTCOLUMNX,
    READYROOMSITSY
  );
  for (let i=0;i<3;i++) {
    const KEYY = -TOTALHEIGHT/2 + CONTENTMARGIN + 40 + (KEYSIZE + KEYSPACING) * i;
    for (let j=0;j<2;j++) {
      const KEYX = RIGHTCOLUMNX + (KEYSIZE + KEYSPACING)*j;
      const button = cg.Input.buttons[cg.graphics.menus.hotkeyButtonIds[9 + i * 2 + j]];
      const keyText = cg.graphics.menus.getKeyText(9 + i * 2 + j);
      cg.graphics.menus.drawKey(
        c,
        keyText,
        KEYX,
        KEYY,
        KEYSIZE,
        KEYSIZE,
        button.hovered,
        cg.graphics.menus.isHotkeyModified(9 + i * 2 + j)
      );
      if (!cg.graphics.menus.hasSetHotkeysButtons) {
        button.transform.x = KEYX + HALFWIDTH + KEYSIZE/2;
        button.transform.y = KEYY + HALFHEIGHT + KEYSIZE/2;
        button.width = KEYSIZE;
        button.height = KEYSIZE;
      }
    }
    const ACTIONTEXT = ["- READY ROOM 1","- READY ROOM 2","- ITS"][i];
    c.font = ACTIONFONT;
    c.textAlign = "left";
    c.fillText(
      ACTIONTEXT,
      RIGHTCOLUMNX + 125,
      KEYY + 30
    );
  }
  c.font = rotr.font(10);
  c.textAlign = "center";
  c.fillText(
    "ENTER",
    RIGHTCOLUMNX + 26,
    READYROOMSITSY + 195
  );
  c.fillText(
    "EXIT",
    RIGHTCOLUMNX + 26 + (KEYSIZE + KEYSPACING),
    READYROOMSITSY + 195
  );

  const UNLOADBOTTOMY = TOTALHEIGHT/2 - CONTENTMARGIN - KEYSIZE/2;
  const UNLOADTITLEY = UNLOADBOTTOMY - (KEYSIZE + KEYSPACING) * 4 + 14;
  c.font = rotr.font(32);
  c.textAlign = "left";
  c.fillText(
    "UNLOAD",
    RIGHTCOLUMNX,
    UNLOADTITLEY
  );
  for (let i=0;i<4;i++) {
    const button = cg.Input.buttons[cg.graphics.menus.hotkeyButtonIds[cg.graphics.menus.hotkeyButtonIds.length-1 - i - (i===3?1:0)]];
    const keyText = cg.graphics.menus.getKeyText(cg.graphics.menus.hotkeyButtonIds.length-1 - i - (i===3?1:0));
    const KEYX = RIGHTCOLUMNX;
    const KEYY = UNLOADBOTTOMY - (KEYSIZE + KEYSPACING) * i - 25;
    cg.graphics.menus.drawKey(
      c,
      keyText,
      KEYX,
      KEYY,
      KEYSIZE + (keyText==="SPACE"&&i!=3 ? 65 : 0),
      KEYSIZE,
      button.hovered,
      cg.graphics.menus.isHotkeyModified(cg.graphics.menus.hotkeyButtonIds.length-1 - i - (i===3?1:0))
    );
    if (!cg.graphics.menus.hasSetHotkeysButtons) {
      button.transform.x = KEYX + HALFWIDTH + KEYSIZE/2;
      button.transform.y = KEYY + HALFHEIGHT + KEYSIZE/2;
      button.width = KEYSIZE;
      button.height = KEYSIZE;
    }
    if (i<3) {
      const ACTIONY = KEYY + 30;
      c.font = ACTIONFONT;
      c.textAlign = "left";
      c.fillText(
        ["- CHECK","- TOGGLE GATES","- DISPATCH"][i],
        KEYX + KEYSIZE + 15 + (keyText==="SPACE" ? 65 : 0),
        ACTIONY
      );
    }
  }
  const checkUnloadButton = cg.Input.buttons[cg.graphics.menus.hotkeyButtonIds[16]];
  cg.graphics.menus.drawKey(
    c,
    cg.graphics.menus.getKeyText(16),
    RIGHTCOLUMNX + KEYSIZE + KEYSPACING,
    UNLOADBOTTOMY - (KEYSIZE + KEYSPACING) * 3 - 25,
    KEYSIZE,
    KEYSIZE,
    checkUnloadButton.hovered,
    cg.graphics.menus.isHotkeyModified(16)
  );
  if (!cg.graphics.menus.hasSetHotkeysButtons) {
    checkUnloadButton.transform.x = RIGHTCOLUMNX + KEYSIZE + KEYSPACING + HALFWIDTH + KEYSIZE/2;
    checkUnloadButton.transform.y = UNLOADBOTTOMY - (KEYSIZE + KEYSPACING) * 3 - 25 + HALFHEIGHT + KEYSIZE/2;
    checkUnloadButton.width = KEYSIZE;
    checkUnloadButton.height = KEYSIZE;
  }
  c.font = ACTIONFONT;
  c.textAlign = "left";
  c.fillText(
    "- SELECT STATION",
    RIGHTCOLUMNX + KEYSIZE + KEYSPACING + 65,
    UNLOADBOTTOMY - (KEYSIZE + KEYSPACING) * 3 + 5,
  );

  if (showPrompts) {
    c.textAlign = "right";
    c.fillText(
      "Left click key to rebind",
      TOTALWIDTH/2 - 20,
      TOTALHEIGHT/2 - 20 - (cg.graphics.menus.hasRebinded ? 20 : 0)
    );
    if (cg.graphics.menus.hasRebinded) {
      c.fillText(
        "Right click to reset",
        TOTALWIDTH/2 - 20,
        TOTALHEIGHT/2 - 20
      );
    }
  }

  c.lineWidth = 4;
  c.strokeStyle = UICOLOURS.WHITE;
  const RESETWIDTH = 200;
  const RESETHEIGHT = 50;
  const RESETX = TOTALWIDTH/2 - RESETWIDTH - 20;
  const RESETY = TOTALHEIGHT/2 - RESETHEIGHT - 65;
  const resetButton = cg.Input.buttons.hotkeysReset;

  if (!cg.graphics.menus.hasSetHotkeysButtons) {
    resetButton.transform.x = RESETX + HALFWIDTH + RESETWIDTH/2;
    resetButton.transform.y = RESETY + HALFHEIGHT + RESETHEIGHT/2;
    resetButton.width = RESETWIDTH;
    resetButton.height = RESETHEIGHT;
  }

  if (cg.graphics.menus.hasChangedHotkeys()) {
    c.strokeRect(
      RESETX,
      RESETY,
      RESETWIDTH,
      RESETHEIGHT
    );

    if (resetButton.hovered) {
      c.fillStyle = UICOLOURS.WHITE;
      c.fillRect(
        RESETX,
        RESETY,
        RESETWIDTH,
        RESETHEIGHT
      );
    }

    c.fillStyle = resetButton.hovered ? UICOLOURS.BLACK : UICOLOURS.WHITE;
    c.font = rotr.font(25);
    c.textAlign = "center";
    c.fillText(
      "RESET",
      RESETX + RESETWIDTH/2,
      RESETY + RESETHEIGHT/2 + 8
    );
  }

  cg.graphics.menus.hasSetHotkeysButtons = true;
}

cg.callbacks.listen("core","loading",(checkData) => {
  const c = cg.canvases.main.c;
  c.resetTransform();
  let total = 0;
  let loaded = 0;
  for (let i=0;i<Object.keys(checkData).length;i++) {
    let key = Object.keys(checkData)[i];
    total += checkData[key].total;
    loaded += checkData[key].loaded;
  }

  c.textAlign = "center";
  c.fillStyle = "#7f7f7f";
  c.fillRect(0,0,cg.canvases.main.width,cg.canvases.main.height);
  c.font = "80px Verdana";
  c.fillStyle = "#ffffff";
  c.fillText("LOADING",cg.canvases.main.width/2,(cg.canvases.main.height/2)-100);
  c.font = "30px Verdana";
  c.fillText("Downloading images, audio & fonts...",cg.canvases.main.width/2,(cg.canvases.main.height/2)-50);
  c.font = "20px Verdana";
  c.fillText(loaded + "/" + total,cg.canvases.main.width/2,cg.canvases.main.height/2);
  c.strokeStyle = "#ffffff";
  c.lineWidth = 5;
  c.strokeRect(cg.canvases.main.width/2-400,cg.canvases.main.height/2+40,800,80)
  c.fillRect(cg.canvases.main.width/2-400,cg.canvases.main.height/2+40,800*(loaded/total),80)
})

cg.graphicTypes.keyOverlay = {
  setup() {
    this.loadPositions = [
      {
        cell : [1005,29],
        load : [1005,84],
        enqueueCheck : [1065,97]
      },
      {
        cell : [911,29],
        load : [911,84],
        enqueueCheck : [968,95]
      },
      {
        cell : [815,113],
        load : [865,113],
        enqueueCheck : [878,173]
      },
      {
        cell : [815,209],
        load : [865,209],
        enqueueCheck : [878,278]
      }
    ];

    this.unloadPositions = [
      {
        gate : [850,641],
        checkDispatch : [850,609]
      },
      {
        gate : [771,641],
        checkDispatch : [771,609]
      }
    ];

    this.readyRoomPositions = [
      {
        enter : [311,372],
        exit : [366,373]
      },
      {
        enter : [292,441],
        exit : [340,470]
      }
    ];

    this.ITSPositions = {
      enter : [455,383],
      exit : [519,277]
    }
  },
  draw(c) {
    c.textBaseline = "alphabetic";
    const SINGLERADIUS = 10;
    const MULTIPLERADIUS = 25;

    const hotkeys = cg.graphics.menus.hotkeys;
    const actions = cg.graphics.menus.hotkeyActions;

    for (let i=0;i<4;i++) {
      c.fillStyle = INDICATOR_COLOUR_CODES[cg.graphics.mainControl.interrogationDoorState(i+1)];
      c.globalAlpha = 0.5;
      let cellText;
      if (cg.graphics.mainControl.selectedLoad!==(i+1)) {
        cellText = hotkeys[actions[`SELECTLOAD`+(i+1)]].toUpperCase();
      } else {
        cellText = hotkeys[actions.TOGGLECELLDOOR].toUpperCase();
      }
      c.beginPath();
      c.arc(
        this.loadPositions[i].cell[0],
        this.loadPositions[i].cell[1],
        cellText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
        0,
        Math.PI * 2
      );
      c.fill();
      c.globalAlpha = 0.8;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(13);
      c.textAlign = "center";
      c.fillText(
        cellText,
        this.loadPositions[i].cell[0],
        this.loadPositions[i].cell[1] + 4,
        MULTIPLERADIUS*2
      );

      c.fillStyle = INDICATOR_COLOUR_CODES[cg.graphics.mainControl.cutDoorState(i+1)];
      c.globalAlpha = 0.5;
      let loadText;
      if (cg.graphics.mainControl.selectedLoad!==(i+1)) {
        loadText = hotkeys[actions[`SELECTLOAD`+(i+1)]].toUpperCase();
      } else {
        loadText = hotkeys[actions.TOGGLELOADDOOR].toUpperCase();
      }
      c.beginPath();
      c.arc(
        this.loadPositions[i].load[0],
        this.loadPositions[i].load[1],
        loadText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
        0,
        Math.PI * 2
      );
      c.fill();
      c.globalAlpha = 0.8;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(13);
      c.textAlign = "center";
      c.fillText(
        loadText,
        this.loadPositions[i].load[0],
        this.loadPositions[i].load[1] + 4,
        MULTIPLERADIUS*2
      );

      const loadCheckState = cg.graphics.mainControl.loadCheckState(i+1);
      const loadEnqueueState = cg.graphics.mainControl.enqueueState(i+1);
      let enqueueCheckState;
      let enqueueText;
      if (loadEnqueueState===INDICATOR_COLOUR.BLUE||loadEnqueueState===INDICATOR_COLOUR.GREEN) {
        enqueueCheckState = loadEnqueueState;
      } else {
        enqueueCheckState = loadCheckState;
      }
      if (cg.graphics.mainControl.selectedLoad!==(i+1)) {
        enqueueText = hotkeys[actions[`SELECTLOAD`+(i+1)]].toUpperCase();
      } else {
        if (loadEnqueueState===INDICATOR_COLOUR.BLUE||loadEnqueueState===INDICATOR_COLOUR.GREEN) {
          enqueueText = hotkeys[actions.ENQUEUEDISPATCH].toUpperCase();
        } else {
          enqueueText = hotkeys[actions.CHECKLOAD].toUpperCase();
        }
      }
      c.fillStyle = INDICATOR_COLOUR_CODES[enqueueCheckState];
      c.globalAlpha = 0.5;
      c.beginPath();
      c.arc(
        this.loadPositions[i].enqueueCheck[0],
        this.loadPositions[i].enqueueCheck[1],
        enqueueText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
        0,
        Math.PI * 2
      );
      c.fill();
      c.globalAlpha = 0.8;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(13);
      c.textAlign = "center";
      c.fillText(
        enqueueText,
        this.loadPositions[i].enqueueCheck[0],
        this.loadPositions[i].enqueueCheck[1] + 4,
        MULTIPLERADIUS*2
      );
    }

    for (let i=0;i<2;i++) {
      c.fillStyle = INDICATOR_COLOUR_CODES[cg.graphics.mainControl.gateState(i+1)];
      c.globalAlpha = 0.5;
      let gatesText;
      if (cg.graphics.mainControl.selectedUnload!==(i+1)) {
        gatesText = hotkeys[actions[`SELECTUNLOAD`+(i+1)]].toUpperCase();
      } else {
        gatesText = hotkeys[actions.TOGGLEUNLOADGATES].toUpperCase();
      }
      c.beginPath();
      c.arc(
        this.unloadPositions[i].gate[0],
        this.unloadPositions[i].gate[1],
        gatesText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
        0,
        Math.PI * 2
      );
      c.fill();
      c.globalAlpha = 0.8;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(13);
      c.textAlign = "center";
      c.fillText(
        gatesText,
        this.unloadPositions[i].gate[0],
        this.unloadPositions[i].gate[1] + 4,
        MULTIPLERADIUS*2
      );

      const unloadCheckState = cg.graphics.mainControl.unloadCheckState(i+1);
      const unloadDispatchState = cg.graphics.mainControl.dispatchState(i+1);
      let dispatchCheckState;
      let dispatchText;
      if (unloadDispatchState===INDICATOR_COLOUR.BLUE||unloadDispatchState===INDICATOR_COLOUR.GREEN) {
        dispatchCheckState = unloadDispatchState;
      } else {
        dispatchCheckState = unloadCheckState;
      }
      if (cg.graphics.mainControl.selectedUnload!==(i+1)) {
        dispatchText = hotkeys[actions[`SELECTUNLOAD`+(i+1)]].toUpperCase();
      } else {
        if (unloadDispatchState===INDICATOR_COLOUR.BLUE||unloadDispatchState===INDICATOR_COLOUR.GREEN) {
          dispatchText = hotkeys[actions.DISPATCHUNLOAD].toUpperCase();
        } else {
          dispatchText = hotkeys[actions.CHECKUNLOAD].toUpperCase();
        }
      }
      c.fillStyle = INDICATOR_COLOUR_CODES[dispatchCheckState];
      c.globalAlpha = 0.5;
      c.beginPath();
      c.arc(
        this.unloadPositions[i].checkDispatch[0],
        this.unloadPositions[i].checkDispatch[1],
        dispatchText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
        0,
        Math.PI * 2
      );
      c.fill();
      c.globalAlpha = 0.8;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(13);
      c.textAlign = "center";
      c.fillText(
        dispatchText,
        this.unloadPositions[i].checkDispatch[0],
        this.unloadPositions[i].checkDispatch[1] + 4,
        MULTIPLERADIUS*2
      );
    }

    for (let i=0;i<2;i++) {
      const side = ["North","South"][i];

      c.fillStyle = INDICATOR_COLOUR_CODES[cg.graphics.preshowsControl.rrEntranceDoorState(side)];
      c.globalAlpha = 0.5;
      let enterText = hotkeys[actions[`TOGGLEREADYROOM${i+1}ENTER`]].toUpperCase();
      c.beginPath();
      c.arc(
        this.readyRoomPositions[i].enter[0],
        this.readyRoomPositions[i].enter[1],
        enterText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
        0,
        Math.PI * 2
      );
      c.fill();
      c.globalAlpha = 0.8;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(13);
      c.textAlign = "center";
      c.fillText(
        enterText,
        this.readyRoomPositions[i].enter[0],
        this.readyRoomPositions[i].enter[1] + 4,
        MULTIPLERADIUS*2
      );

      c.fillStyle = INDICATOR_COLOUR_CODES[cg.graphics.preshowsControl.rrExitDoorState(side)];
      c.globalAlpha = 0.5;
      let exitText = hotkeys[actions[`TOGGLEREADYROOM${i+1}EXIT`]].toUpperCase();
      c.beginPath();
      c.arc(
        this.readyRoomPositions[i].exit[0],
        this.readyRoomPositions[i].exit[1],
        exitText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
        0,
        Math.PI * 2
      );
      c.fill();
      c.globalAlpha = 0.8;
      c.fillStyle = UICOLOURS.WHITE;
      c.font = rotr.font(13);
      c.textAlign = "center";
      c.fillText(
        exitText,
        this.readyRoomPositions[i].exit[0],
        this.readyRoomPositions[i].exit[1] + 4,
        MULTIPLERADIUS*2
      );
    }

    c.fillStyle = INDICATOR_COLOUR_CODES[cg.graphics.preshowsControl.itsDoorState("Entrance")];
    c.globalAlpha = 0.5;
    let itsEnterText = hotkeys[actions.TOGGLEITSENTEREDOOR].toUpperCase();
    c.beginPath();
    c.arc(
      this.ITSPositions.enter[0],
      this.ITSPositions.enter[1],
      itsEnterText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
      0,
      Math.PI * 2
    );
    c.fill();
    c.globalAlpha = 0.8;
    c.fillStyle = UICOLOURS.WHITE;
    c.font = rotr.font(13);
    c.textAlign = "center";
    c.fillText(
      itsEnterText,
      this.ITSPositions.enter[0],
      this.ITSPositions.enter[1] + 4,
      MULTIPLERADIUS*2
    );

    c.fillStyle = INDICATOR_COLOUR_CODES[cg.graphics.preshowsControl.itsDoorState("Exit")];
    c.globalAlpha = 0.5;
    let itsExitText = hotkeys[actions.TOGGLEITSEXITDOOR].toUpperCase();
    c.beginPath();
    c.arc(
      this.ITSPositions.exit[0],
      this.ITSPositions.exit[1],
      itsExitText.length > 1 ? MULTIPLERADIUS : SINGLERADIUS,
      0,
      Math.PI * 2
    );
    c.fill();
    c.globalAlpha = 0.8;
    c.fillStyle = UICOLOURS.WHITE;
    c.font = rotr.font(13);
    c.textAlign = "center";
    c.fillText(
      itsExitText,
      this.ITSPositions.exit[0],
      this.ITSPositions.exit[1] + 4,
      MULTIPLERADIUS*2
    );
  }
}
cg.createGraphic({type:"keyOverlay"},"keyOverlay");

cg.Input.createButton({
  type : "rectangle",
  check : "gameplay",
  down : () => {
    cg.settings.core.timeScale = 0;
    cg.graphics.menus.page = "main";
    cg.scenes.main.items.menus.transform.o = 1;
    rotra.pause();
  }
},"mainPause");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    const volumes = cg.graphics.mainControl.volumes;
    const nextVolume = volumes[(volumes.indexOf(cg.Audio.masterVolume)+1)%volumes.length];
    cg.Audio.masterVolume = nextVolume;
  }
},"mainSwitchVolume");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.scenes.main.items.menus.transform.o = 1;
    cg.graphics.menus.page = "vehicles";
  }
},"mainVehicles");

cg.Input.createButton({
  type : "rectangle",
  check : "mainMenu",
  down : () => {
    cg.settings.core.timeScale = 1;
    cg.scenes.main.items.menus.transform.o = 0;
    cg.graphics.menus.hasPressedPlayOrGuests = true;
    rotra.unpause();
  }
},"menuPlay");

cg.Input.createButton({
  type : "rectangle",
  check : "mainMenu",
  down : () => {
    cg.graphics.menus.page = "hotkeys";
  }
},"menuHotkeys");

cg.Input.createButton({
  type : "rectangle",
  check : "mainMenu",
  down : () => {
    cg.graphics.menus.page = "settings";
  }
},"menuSettings");

cg.Input.createButton({
  type : "rectangle",
  check : "menuStartWithGuests",
  down : () => {
    cg.graphics.menus.hasPressedPlayOrGuests = true;
    preshows.createStartingGuests();
  }
},"menuStartWithGuests");

cg.Input.createButton({
  type : "rectangle",
  check : "mainMenu",
  down : () => {
    rotr.selectedFont = "readable";
  }
},"menuArial");

cg.Input.createButton({
  type : "rectangle",
  check : "mainMenu",
  down : () => {
    rotr.selectedFont = "themed";
  }
},"menuAurebeshEng");

cg.Input.createButton({
  type : "rectangle",
  check : "mainMenu",
  down : () => {
    rotr.selectedFont = "aurebesh";
  }
},"menuAurebeshAF");

cg.Input.createButton({
  type : "rectangle",
  check : "hotkeys",
  down : () => {
    cg.graphics.menus.page = "main";
  }
},"hotkeysCloseMenu");

cg.Input.createButton({
  type : "rectangle",
  check : "hotkeysReset",
  down : () => {
    cg.graphics.menus.resetAllHotkeys();
  }
},"hotkeysReset");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    automation.enabled.READYROOMS = !automation.enabled.READYROOMS;
  }
},"settingsAutomationReadyRooms");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    automation.enabled.ITS = !automation.enabled.ITS;
  }
},"settingsAutomationITS");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    automation.enabled.LOAD1 = !automation.enabled.LOAD1;
  }
},"settingsAutomationLoad1");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    automation.enabled.LOAD2 = !automation.enabled.LOAD2;
  }
},"settingsAutomationLoad2");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    automation.enabled.LOAD3 = !automation.enabled.LOAD3;
  }
},"settingsAutomationLoad3");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    automation.enabled.LOAD4 = !automation.enabled.LOAD4;
  }
},"settingsAutomationLoad4");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    automation.enabled.UNLOAD2 = !automation.enabled.UNLOAD2;
  }
},"settingsAutomationUnloadLeft");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    automation.enabled.UNLOAD1 = !automation.enabled.UNLOAD1;
  }
},"settingsAutomationUnloadRight");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    preshows.mainQueueEnable = !preshows.mainQueueEnable;
  }
},"settingsSimulationQueueMain");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    preshows.llQueueEnable = !preshows.llQueueEnable;
  }
},"settingsSimulationQueueLL");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    preshows.busyness = "low";
  }
},"settingsSimulationBusynessLow");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    preshows.busyness = "high";
  }
},"settingsSimulationBusynessHigh");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    rotr.effects.cannons = rotr.effects.cannons === "a" ? "b" : "a";
  }
},"settingsSimulationABCannon");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    rotr.effects.kylo = rotr.effects.kylo === "a" ? "b" : "a";
  }
},"settingsSimulationABKylo");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    cg.scenes.main.items.keyOverlay.transform.o = cg.scenes.main.items.keyOverlay.transform.o===0 ? 1 : 0;
  }
},"settingsGameplayKeyOverlay");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    disco.load1Active = !disco.load1Active;
  }
},"settingsGameplayStation1");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    disco.load2Active = !disco.load2Active;
  }
},"settingsGameplayStation2");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    disco.load3Active = !disco.load3Active;
  }
},"settingsGameplayStation3");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    disco.load4Active = !disco.load4Active;
  }
},"settingsGameplayStation4");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    cg.graphics.menus.allowMapButtons = !cg.graphics.menus.allowMapButtons;
  }
},"settingsGameplayMapButtons");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    cg.scenes.main.items.mainControl.transform.o = cg.scenes.main.items.mainControl.transform.o===0 ? 1 : 0;
    cg.scenes.main.items.preshowsControl.transform.o = cg.scenes.main.items.preshowsControl.transform.o===0 ? 1 : 0;
  }
},"settingsGameplayConsoles");

cg.Input.createButton({
  type : "rectangle",
  check : "settings",
  down : () => {
    cg.graphics.menus.page = "main";
    for (const area in automation.enabled) {
      if (automation.enabled[area]) {
        automation.persist[area] = true;
      }
    }
  }
},"settingsCloseMenu");

cg.Input.createButton({
  type : "rectangle",
  check : "logLog",
  down : () => {
    rotr.logSession();
  }
},"logLog");

cg.Input.createButton({
  type : "rectangle",
  check : "log",
  down : () => {
    cg.scenes.main.items.menus.transform.o = 0;
  }
},"logsCloseMenu");

cg.Input.createButton({
  type : "rectangle",
  check : "vehicles",
  down : () => {
    cg.scenes.main.items.menus.transform.o = 0;
  }
},"vehiclesCloseMenu");

for (let i=1;i<=38;i++) {
  cg.Input.createButton({
    type : "rectangle",
    check : "vehicles",
    vehicleNumber : i,
    down : (button) => {
      const prevTag = vehicles[button.vehicleNumber].storageTag;
      vehicles[button.vehicleNumber].storageTag = prevTag === STORAGE_TAGS.SHOW ? STORAGE_TAGS.STORE : STORAGE_TAGS.SHOW;
    }
  },"vehiclesVehicle"+i);
}

cg.Input.updateButtonChecks = () => {
  const inMenu = cg.scenes.main.items.menus !== undefined ? cg.scenes.main.items.menus.transform.o == 1 : true;
  const output = {
    gameplay : !inMenu,
    consoles : !inMenu && cg.scenes.main.items.mainControl.transform.o===1,
    gameplayMap : !inMenu && cg.graphics.menus.allowMapButtons,
    mainMenu : inMenu && cg.graphics.menus.page == "main",
    menuStartWithGuests : inMenu && cg.graphics.menus.page == "main" && !cg.graphics.menus.hasPressedPlayOrGuests,
    hotkeys : inMenu && cg.graphics.menus.page == "hotkeys",
    hotkeysReset : inMenu && cg.graphics.menus.page == "hotkeys" && cg.graphics.menus.hasChangedHotkeys(),
    settings : inMenu && cg.graphics.menus.page == "settings",
    logLog : inMenu && cg.graphics.menus.page == "log" && rotr.simSessionId!==null && rotr.dispatches>0,
    log : inMenu && cg.graphics.menus.page == "log",
    vehicles : inMenu && cg.graphics.menus.page == "vehicles"
  }
  if (rotr.ended||!cg.ready) {
    for (const key in output) {
      output[key] = false;
    }
  }
  return output;
}

cg.callbacks.listen("core","overlay",()=>{
  if (ChoreoGraph.Input.keyStates[cg.graphics.menus.hotkeys[cg.graphics.menus.hotkeyActions.SHOWHOTKEYS]]&&cg.scenes.main.items.menus.transform.o===0) {
    const BACKGROUNDOPACITY = 0.7;
    const HALFWIDTH = cg.canvases.main.width/2;
    const HALFHEIGHT = cg.canvases.main.height/2;
    ChoreoGraph.transformContext(cg.cameras.main,HALFWIDTH,HALFHEIGHT);
    drawHotkeysMenu(cg.canvases.main.c,BACKGROUNDOPACITY,HALFWIDTH,HALFHEIGHT);
  }
})

cg.callbacks.listen("input","keyDown",(key)=>{
  if (!cg.ready) { return; }
  if (rotr.ended) {
    return;
  }
  if (key==="m"&&cg.graphics.menus.hotkeys.indexOf("m")===-1&&cg.graphics.menus.rebindSelection===null) {
    if (cg.Audio.masterVolume > 0) {
      cg.graphics.mainControl.savedVolume = cg.Audio.masterVolume;
      cg.Audio.masterVolume = 0;
    } else {
      cg.Audio.masterVolume = cg.graphics.mainControl.savedVolume;
    }
    return;
  }

  if (cg.scenes.main.items.menus.transform.o!==0) {
    if (key==="escape"&&ChoreoGraph.Audio.interacted) {
      cg.graphics.menus.rebindSelection = null;
      cg.scenes.main.items.menus.transform.o = 0;
      cg.settings.core.timeScale = 1;
      rotra.unpause();
    }
    return;
  }

  if (key==="escape") {
    cg.scenes.main.items.menus.transform.o = 1;
    cg.graphics.menus.page = "main";
    cg.settings.core.timeScale = 0;
    rotra.pause();
    return;
  }

  const hotkeys = cg.graphics.menus.hotkeys;
  const actions = cg.graphics.menus.hotkeyActions;

  if (key===hotkeys[actions.SELECTLOAD1]) {
    cg.graphics.mainControl.selectedLoad = 1;
  }
  if (key===hotkeys[actions.SELECTLOAD2]) {
    cg.graphics.mainControl.selectedLoad = 2;
  }
  if (key===hotkeys[actions.SELECTLOAD3]) {
    cg.graphics.mainControl.selectedLoad = 3;
  }
  if (key===hotkeys[actions.SELECTLOAD4]) {
    cg.graphics.mainControl.selectedLoad = 4;
  }

  const selectedLoad = cg.graphics.mainControl.selectedLoad;
  if (selectedLoad!==null) {
    if (key===hotkeys[actions.TOGGLECELLDOOR]) {
      cg.Input.actions[`toggleInterrogation${selectedLoad}MainDoor`].down();
    }
    if (key===hotkeys[actions.TOGGLELOADDOOR]) {
      cg.Input.actions[`toggleInterrogation${selectedLoad}CutDoor`].down();
    }
    if (key===hotkeys[actions.CHECKLOAD]) {
      cg.Input.actions[`checkLoad${selectedLoad}`].down();
    }
    if (key===hotkeys[actions.ENQUEUEDISPATCH]) {
      cg.Input.actions[`queueLoad${selectedLoad}`].down();
    }
  }
  if (key===hotkeys[actions.SELECTUNLOAD1]) {
    cg.graphics.mainControl.selectedUnload = 1;
  }
  if (key===hotkeys[actions.SELECTUNLOAD2]) {
    cg.graphics.mainControl.selectedUnload = 2;
  }

  const selectedUnload = cg.graphics.mainControl.selectedUnload;
  if (selectedUnload!==null) {
    const unload = resistance[`UNLOAD_${selectedUnload}`];
    if (key===hotkeys[actions.DISPATCHUNLOAD] && resistance.canDispatch(unload)) {
      resistance.dispatch(unload);
    }
    if (key===hotkeys[actions.TOGGLEUNLOADGATES] && resistance.canUnlock(unload)) {
      resistance.unlock(unload);
    }
    if (key===hotkeys[actions.TOGGLEUNLOADGATES] && resistance.canCloseGates(unload)) {
      resistance.closeGates(unload);
    }
    if (key===hotkeys[actions.CHECKUNLOAD] && resistance.canCheck(unload)) {
      resistance.check(unload);
    }
  }

  if (key===hotkeys[actions.TOGGLEREADYROOM1ENTER]) {
    if (cg.graphics.readyRoomNorthEntranceDoor.isOpen) {
      preshows.closeReadyRoomNorthEntranceDoor();
    } else {
      preshows.openReadyRoomNorthEntranceDoor();
    }
  }
  if (key===hotkeys[actions.TOGGLEREADYROOM2ENTER]) {
    if (cg.graphics.readyRoomSouthEntranceDoor.isOpen) {
      preshows.closeReadyRoomSouthEntranceDoor();
    } else {
      preshows.openReadyRoomSouthEntranceDoor();
    }
  }
  if (key===hotkeys[actions.TOGGLEREADYROOM1EXIT]) {
    if (cg.graphics.readyRoomNorthExitDoor.isOpen) {
      preshows.closeReadyRoomNorthExitDoor();
    } else {
      preshows.openReadyRoomNorthExitDoor();
    }
  }
  if (key===hotkeys[actions.TOGGLEREADYROOM2EXIT]) {
    if (cg.graphics.readyRoomSouthExitDoor.isOpen) {
      preshows.closeReadyRoomSouthExitDoor();
    } else {
      preshows.openReadyRoomSouthExitDoor();
    }
  }
  if (key===hotkeys[actions.TOGGLEITSENTEREDOOR]) {
    if (preshows.isITSEntranceOpen) {
      preshows.closeITSEntranceDoor();
    } else if (cg.graphics.debug.active) {
      const loadITS = cg.graphics.its.rotationState % 3;
      preshows.openITSEntranceDoor(loadITS);
    }
  }
  if (key===hotkeys[actions.TOGGLEITSEXITDOOR]) {
    if (preshows.isITSExitOpen) {
      preshows.closeITSExitDoor();
    } else if (cg.graphics.debug.active) {
      const unloadITS = (cg.graphics.its.rotationState + 1) % 3;
      preshows.openITSExitDoor(unloadITS);
    }
  }
});

cg.callbacks.listen("input","keyDown",(key)=>{
  if (!cg.ready
    || cg.scenes.main.items.menus.transform.o===0
    || cg.graphics.menus.page!=="hotkeys"
    || cg.graphics.menus.rebindSelection===null) {
    return;
  }

  const allowedKeys = [
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0","left","right","up","down","space","enter","backspace","tab","pageup","pagedown","end","home","insert","delete","pause",";","=",",","-",".","/","`","[","]","'","^",":","!","<",">","?","~","{","|","}",'"',"@","#","$","%","&","*","(",")","_","+","f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","f13","f14","f15","f16","f17","f18","f19","f20","f21","f22","f23","f24",
    "conactiontop","conactionbottom","conactionleft","conactionright","condpadup","condpaddown","condpadleft","condpadright","conleftstick","conrightstick","constart","conselect","conleftbumper","conrightbumper","conlefttrigger","conrighttrigger","conleftstickup","conleftstickdown","conleftstickleft","conleftstickright","conrightstickup","conrightstickdown","conrightstickleft","conrightstickright"
  ];

  if (!allowedKeys.includes(key)) {
    return;
  }

  cg.graphics.menus.hotkeys[cg.graphics.menus.rebindSelection] = key;
  cg.graphics.menus.hasRebinded = true;
  cg.graphics.menus.rebindSelection = null;
});