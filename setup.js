/** @typedef {import('../../ChoreoGraph/3.2.1/types/choreograph') } ChoreoGraphCore */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/develop') } ChoreoGraphDevelop */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/input') } ChoreoGraphInput */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/audio') } ChoreoGraphAudio */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animation') } ChoreoGraphAnimation */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animationeditor') } ChoreoGraphAnimationEditor */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/blockcontroller') } ChoreoGraphBlockController */

/** @global */
const cg = ChoreoGraph.instantiate({
  core : {
    baseImagePath : "art/",
    frustumCulling : false,
    debugCGScale : 0.5,
    timeScale : 0
  },
  audio : {
    baseAudioPath : "audio/"
  },
  input : {
    preventDefaultKeys : ["space","up","down","left","right"],
    preventContextMenu : true
  },
  animationeditor : {
    snapGridSize : 0.5
  },
  animation : {
    rawProcessing : {
      consistentSpeed : 10
    },
    debug : {
      markerStyle : {
        size : 3.5,
        fontSize : 4
      }
    }
  },
  blockcontroller : {
    debug : {}
  }
});

cg.createCamera({
  transformInit : {x:1863/2, y:800/2}
},"main")
.addScene(cg.createScene({},"main"));

cg.createCanvas({element:document.getElementsByTagName("canvas")[0],
  width : 1863,
  height : 800,
  background : "black",
  imageRendering : "pixelated"
},"main").setCamera(cg.cameras.main);

cg.scenes.main.createItem("collection",{},"background");
cg.scenes.main.createItem("collection",{},"vehicles");
cg.scenes.main.createItem("collection",{},"midground");
cg.scenes.main.createItem("collection",{},"foreground");
cg.scenes.main.createItem("collection",{},"interface");

const graphicalImages = {
  "bottom_roof" : {
    "file":"bottom_roof.png"
  },
  "bottom_floor" : {
    "file":"bottom_floor.png"
  },
  "top_roof" : {
    "file":"top_roof.png"
  },
  "top_floor" : {
    "file":"top_floor.png"
  },
  "outside" : {
    "file":"outside.png"
  },
  "queue_cover_rocks" : {
    "file":"queue_cover_rocks.png"
  },
  "its_empty" : {
    "file":"itsempty.png",
    "height":124,
    "width":65
  },
  "its_disc" : {
    "file":"its_disc.png",
    "height":195,
    "width":195
  },
  "escape_pod" : {
    "file":"escape_pod.png",
    "height":60,
    "width":60
  },
  "interrogation_lights" : {
    "file":"interrogation_lights.png",
    "height":67,
    "width":50
  },
  "cannon" : {
    "file":"cannon.png",
    "height":60,
    "width":60
  },
  "cannon_lights" : {
    "file":"cannon_lights.png"
  },
  "alarm_lights" : {
    "file":"alarm_lights.png",
    "height":128,
    "width":96
  },
  "unload_dispatch" : {
    "file":"unload_dispatch.png",
    "height":28,
    "width":56
  },
  "blast" : {
    "file":"blast.png",
    "height":30,
    "width":30
  },
  "its_attack" : {
    "file":"its_attack.png"
  },
  "bb8" : {
    "file":"bb8.png",
    "height":8,
    "width":8
  },
  "pod_darkness_left" : {
    "file":"pod_darkness_left.png",
    "height":156,
    "width":75
  },
  "pod_darkness_right" : {
    "file":"pod_darkness_right.png",
    "height":156,
    "width":75
  },
  "rr1" : {
    "file":"rr1.png",
    "height":182,
    "width":97
  },
  "rr2" : {
    "file":"rr2.png",
    "height":182,
    "width":97
  },
  "destroyer_zap" : {
    "file":"destroyer_zap.png",
    "height":63,
    "width":17
  },
  "atat_flashes" : {
    "file":"atat_flashes.png",
    "height":152,
    "width":123
  },
  "vehicle_button" : {
    "file":"vehicle_button.png"
  }
};

for (let key in graphicalImages) {
  let data = graphicalImages[key];
  let image = cg.createImage({file:data.file},key);
  cg.createGraphic({
    type:"image",
    image:image,
    width:data.width,
    height:data.height
  },key);
}

cg.callbacks.listen("core","start",(cg) => {
  let sceneHierarchy = {
    background : [
      {graphic:"outside",x:0,y:0},
      {graphic:"bottom_floor",x:411,y:0},
      {graphic:"top_floor",x:1273,y:0},
      {graphic:"its",x:555,y:369}
    ],
    midground : [
      {graphic:"selectedLoad",x:0,y:0}
    ],
    foreground : [
      {graphic:"bottom_roof",x:411,y:0},
      {graphic:"top_roof",x:1273,y:0},
      {graphic:"queue_cover_rocks",x:0,y:402},
      {graphic:"itsFlashes",x:555,y:369,r:120}
    ],
    interface : [
      {graphic:"preshowsControl",x:0,y:0},
      {graphic:"mainControl",x:1056,y:484},
      {graphic:"keyOverlay",o:0},
      {graphic:"menus",o:1,x:cg.canvases.main.width/2,y:cg.canvases.main.height/2},
    ]
  };

  for (let collection in sceneHierarchy) {
    for (let data of sceneHierarchy[collection]) {
      let graphic = cg.graphics[data.graphic];
      if (graphic.type=="image") {
        data.x += graphic.width/2;
        data.y += graphic.height/2;
      }
      cg.scenes.main.createItem("graphic",{
        graphic:graphic,
        transform:cg.createTransform(data)
      },data.graphic,collection);
      delete data.graphic;
    }
  }
})

cg.loadChecks.push(()=>{
  const c = cg.canvases.main.c;
  c.font = "2px Aurebesh_english";
  c.fillText(".", 0, 0);
  const loaded = document.fonts.check(c.font);
  return ["Aurebesh_english", loaded, loaded?1:0, 1];
});

cg.loadChecks.push(()=>{
  const c = cg.canvases.main.c;
  c.font = "2px Aurebesh_AF";
  c.fillText(".", 0, 0);
  const loaded = document.fonts.check(c.font);
  return ["Aurebesh_AF", loaded, loaded?1:0, 1];
});

const rotr = new class ROTR {
  constructor() {
    this.VERSION = "2.4"
    this.guests = 0;
    this.dispatches = 0;
    this.playtime = 0;
    this.simSessionId = null;
    this.ended = false;
    this.selectedFont = "themed";

    this.effects = {
      cannons : "a",
      kylo : "a"
    }
  }
  logSession() {
    if (this.simSessionId==null) { return; }
    let autoSet = "";
    if (automation.persist.READYROOMS) { autoSet += "y"; } else { autoSet += "n"; }
    if (automation.persist.ITS) { autoSet += "y"; } else { autoSet += "n"; }
    if (automation.persist.LOAD1) { autoSet += "y"; } else { autoSet += "n"; }
    if (automation.persist.LOAD2) { autoSet += "y"; } else { autoSet += "n"; }
    if (automation.persist.LOAD3) { autoSet += "y"; } else { autoSet += "n"; }
    if (automation.persist.LOAD4) { autoSet += "y"; } else { autoSet += "n"; }
    if (automation.persist.UNLOAD1) { autoSet += "y"; } else { autoSet += "n"; }
    if (automation.persist.UNLOAD2) { autoSet += "y"; } else { autoSet += "n"; }
    if (autoSet=="nnnnnnnn") { autoSet = ""; }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "../submit.php", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("sid="+this.simSessionId+"&playtime="+Math.floor(this.playtime/1000)+"&auto="+autoSet+"&guests="+this.guests+"&dispatches="+this.dispatches);
    this.ended = true;
    cg.Audio.masterVolume = 0;
  }
  updatePlaytime() {
    this.playtime += cg.timeSinceLastFrame * cg.settings.core.timeScale;
  }
  font(size,prefix="") {
    const sizeMultipliers = {
      themed : 1,
      readable : 1.05,
      aurebesh :  0.9
    };
    let font = {
      themed : "Aurebesh_english",
      readable : "Verdana",
      aurebesh :  "Aurebesh_AF"
    }[this.selectedFont];
    size = size * sizeMultipliers[this.selectedFont];
    if (font==="Verdana") {
      prefix += "bold";
    }
    return `${prefix} ${size}px ${font}`;
  }

  lsbsEvent = 0;
  lsbsCameraObject = null;
  lsbsVehicle = null;
  lsbsCameraOffsetX = 320;

  lsbsArmPreshowSequence = false;

  activateLSBSMode() {
    document.body.style.margin = 0;
    rotr.effects.cannons = "b";
    cg.graphics.menus.hotkeys[cg.graphics.menus.hotkeyActions.SHOWHOTKEYS] = "c";
    cg.Audio.masterVolume = 0;

    const newCamera = cg.createCamera({
      scaleMode : "minimum",
      size : this.lsbsCameraOffsetX
    },"lsbs");
    newCamera.addScene(cg.scenes.main);

    cg.canvases.main.setCamera(newCamera);

    this.lsbsCameraObject = cg.createObject({
      transformInit : {x:335,y:400}
    })
    .attach("Camera",{
      camera : newCamera,
      smoothing : 0.01,
      jump : true,
      jumpDistance : 400,
      transformInit : {x:120}
    });

    cg.scenes.main.addObject(this.lsbsCameraObject);

    cg.scenes.main.items.mainControl.transform.o = 0;
    cg.scenes.main.items.preshowsControl.transform.o = 0;

    vehicles[12].storageTag = STORAGE_TAGS.SHOW;
    vehicles[13].storageTag = STORAGE_TAGS.SHOW;
    vehicles[14].storageTag = STORAGE_TAGS.SHOW;
    vehicles[20].storageTag = STORAGE_TAGS.SHOW;
    vehicles[21].storageTag = STORAGE_TAGS.SHOW;
    vehicles[22].storageTag = STORAGE_TAGS.SHOW;
    vehicles[28].storageTag = STORAGE_TAGS.SHOW;
    vehicles[29].storageTag = STORAGE_TAGS.SHOW;
    vehicles[30].storageTag = STORAGE_TAGS.SHOW;
    vehicles[36].storageTag = STORAGE_TAGS.SHOW;

    rotr.moveLSBSCameraTo("readyRooms",0.01);

    cg.callbacks.listen("input","keyDown",(key)=>{
      if (key==="left") {
        if (rotr.lsbsEvent===1) {
          rotr.moveLSBSCameraTo("readyRooms",0.01);
        } else if (rotr.lsbsEvent===2) {
          console.info("outside");
          rotr.moveLSBSCameraTo("outside",0.01);
        } else if (rotr.lsbsEvent===3) {
          console.info("its");
          rotr.moveLSBSCameraTo("its",0.01);
        } else if (rotr.lsbsEvent===4) {
          console.info("hanger");
          rotr.moveLSBSCameraTo("hanger",0.01);
        } else if (rotr.lsbsEvent===5) {
          console.info("manual");
          rotr.moveLSBSCameraTo("hanger",0.00008);
        } else if (rotr.lsbsEvent===6) {
          console.info("grouper");
          rotr.moveLSBSCameraTo("grouper",0.01);
        } else if (rotr.lsbsEvent===7) {
          console.info("cell");
          rotr.moveLSBSCameraTo("cell",0.01);
        } else if (rotr.lsbsEvent===8) {
          rotr.lsbsCameraObject.transform.parent = null;
          rotr.lsbsVehicle = null;
          console.info("vehicle (position)");
          rotr.moveLSBSCameraTo("vehicle",0.01);
        } else if (rotr.lsbsEvent===9) {
          console.info("vehicle (not tracking)");
        } else if (rotr.lsbsEvent===10) {
          console.info("unload");
          rotr.moveLSBSCameraTo("unload",0.01);
        } else {
          rotr.lsbsEvent++;
        }
        rotr.lsbsEvent--;
      } else if (key==="right") {
        if (rotr.lsbsEvent===0) {
          console.info("outside");
          rotr.moveLSBSCameraTo("outside",0.0001);
        } else if (rotr.lsbsEvent===1) {
          console.info("its");
          rotr.moveLSBSCameraTo("its",0.00005);
        } else if (rotr.lsbsEvent===2) {
          console.info("hanger");
          rotr.moveLSBSCameraTo("hanger",0.00005);
          automation.enabled.ITS = true;
        } else if (rotr.lsbsEvent===3) {
          console.info("manual");
          rotr.moveLSBSCameraTo("hanger",0.0001);
        } else if (rotr.lsbsEvent===4) {
          console.info("grouper");
          rotr.moveLSBSCameraTo("grouper",0.00005);
        } else if (rotr.lsbsEvent===5) {
          console.info("cell");
          rotr.moveLSBSCameraTo("cell",0.00008);
        } else if (rotr.lsbsEvent===6) {
          console.info("vehicle (position)");
          rotr.moveLSBSCameraTo("vehicle",0.00008);
        } else if (rotr.lsbsEvent===7) {
          console.info("vehicle (tracking)");
          if (disco.load4VF!==null) {
            rotr.lsbsCameraObject.transform.parent = disco.load4VF.transform;
          }
          rotr.lsbsCameraObject.Camera.smoothing = 0.003;
          rotr.lsbsCameraObject.transform.x = 0;
          rotr.lsbsCameraObject.transform.y = 0;
          rotr.lsbsVehicle = disco.load4VF;
        } else if (rotr.lsbsEvent===8) {
          console.info("unload");
          rotr.lsbsCameraObject.transform.parent = null;
          rotr.moveLSBSCameraTo("unload",0.00008);
          rotr.lsbsVehicle = null;
        } else {
          rotr.lsbsEvent--;
        }
        rotr.lsbsEvent++;
      }
    });

    cg.callbacks.listen("core","process",()=>{
      const distance = ChoreoGraph.timeDelta * 0.05;
      if (rotr.lsbsEvent===4&&ChoreoGraph.Input.keyStates.t) {
        rotr.lsbsCameraObject.transform.y -= distance;
      }
      if (rotr.lsbsEvent===4&&ChoreoGraph.Input.keyStates.g) {
        rotr.lsbsCameraObject.transform.y += distance;
      }
      if (rotr.lsbsEvent===4&&ChoreoGraph.Input.keyStates.f) {
        rotr.lsbsCameraObject.transform.x -= distance;
      }
      if (rotr.lsbsEvent===4&&ChoreoGraph.Input.keyStates.h) {
        rotr.lsbsCameraObject.transform.x += distance;
      }
    });

    this.lowerLevelCover = cg.createPath([[1271,480],[1088,481],[1085,861],[1576,860],[1548,-353],[430,-342],[435,2],[1270,3],[1271,477]],"lowerLevelCover");
    this.upperLevelCover = cg.createPath([[1860,480],[1859,3],[1275,4],[1274,480],[1860,480],[1860,775.11],[1001,778],[978,-349],[2128,-336],[2159,788],[1860,775]],"upperLevelCover");
    this.lowerCoverWalls = cg.createPath([[435,3.5],[1272.5,3.5],[1272.5,480.5],[1035.83,480.5]],"lowerCoverWalls");
    this.upperCoverWalls = cg.createPath([[1860,480],[1271.97,480],[1271.97,3],[1860,3],[1860,480.03]],"upperCoverWalls");

    cg.graphicTypes.lsbsMap = {
      /** @param {CanvasRenderingContext2D} c */
      setup() {
        this.isUp = false;
      },
      draw(c) {
        c.save();
        c.fillStyle = "#4e4a4e";
        const cover = this.isUp ? cg.paths.upperLevelCover : cg.paths.lowerLevelCover;
        c.beginPath();
        c.moveTo(cover[0][0],cover[0][1]);
        for (let i=1;i<cover.length;i++) {
          c.lineTo(cover[i][0],cover[i][1]);
        }
        c.fill();

        c.beginPath();
        c.moveTo(cover[0][0],cover[0][1]);
        for (let i=1;i<cover.length;i++) {
          c.lineTo(cover[i][0],cover[i][1]);
        }
        c.clip();

        c.strokeStyle = "#413c40";
        c.lineWidth = 5;
        c.beginPath();
        for (let i=0;i<300;i++) {
          c.moveTo(i*16,-300);
          c.lineTo(i*16+1000,700);
        }
        c.stroke();

        const walls = this.isUp ? cg.paths.upperCoverWalls : cg.paths.lowerCoverWalls;
        c.lineWidth = 7;
        c.strokeStyle = "#746f74";
        c.lineCap = "square";
        c.beginPath();
        c.moveTo(walls[0][0],walls[0][1]);
        for (let i=1;i<walls.length;i++) {
          c.lineTo(walls[i][0],walls[i][1]);
        }
        c.stroke();
        c.restore();
      }
    }

    cg.graphicTypes.lsbsCanvas = {
      /** @param {CanvasRenderingContext2D} c */
      draw(c) {
        c.save();
        c.fillStyle = "#212020";
        const scale = (cg.canvases.main.height / cg.cameras.lsbs.size);
        c.fillRect(
          cg.canvases.main.width/2 + 250,
          0,
          cg.canvases.main.width,
          cg.cameras.lsbs.size*scale
        );

        c.translate(1180,-40);
        c.scale(2.1,2.1);
        cg.graphics.preshowsControl.draw(c,0,0,cg.canvases.main);
        c.restore();

        c.save();
        c.translate(420,-56);
        c.scale(2,2);
        c.beginPath();
        c.rect(410,190,220,100);
        c.clip();
        cg.graphics.mainControl.draw(c,0,0,cg.canvases.main);
        c.restore();

        c.fillStyle = "#7f7f7f";
        c.fillRect(1200,580,550,150);

        for (let i=0;i<4;i++) {
          c.fillStyle = "#424243";
          c.fillRect(1222+i*115,605,80,80);
          c.fillStyle = "#ffffff";
          c.font = rotr.font(55,"bold");
          c.textAlign = "center";
          let label = "-";
          if (disco.dispatchQueue[i]!==undefined) {
            label = disco.dispatchQueue[i];
          }
          c.fillText(label,1222+i*115+40,663);
        }
      }
    }

    cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "lsbsMap"
      },"lsbsMap")
    },"lsbsMap","interface");

    cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "lsbsCanvas"
      },"lsbsCanvas"),
      transformInit : {CGSpace : false,}
    },"lsbsCanvas","interface");
  };

  armLSBSDisco() {
    automation.enabled.LOAD1 = false;
    automation.enabled.LOAD2 = false;
    automation.enabled.LOAD3 = false;
    automation.enabled.LOAD4 = false;
    disco.load4Active = false;

    cg.createEvent({
      loop : true,
      duration : 200,
      end : rotr.checkDiscoSequenceStart.bind(rotr)
    },"lsbsDiscoSequenceStarter");
  };

  checkDiscoSequenceStart() {
    // LOAD 1
    if (disco[`interro1S`]===disco.IS_CLEAR_FOR_RESET||disco[`load1S`]===disco.LS_READY_FOR_GUESTS) {
      if (disco.interrogationDoors[1].graphic.isOpen) {
        disco.closeInterrogationMainDoor(1);
      } else {
        disco.openInterrogationMainDoor(1);
      }
      if (disco.cutDoors[1].graphic.isOpen) {
        disco.closeInterrogationCutDoor(1);
      } else {
        disco.openInterrogationCutDoor(1);
      }
    }
    if (disco.canCheck(1)) {
      disco.check(1);
    }

    // LOAD 2
    if (disco[`interro2S`]!==disco.IS_READY_TO_ESCAPE||disco[`load2S`]!==disco.LS_READY_TO_ENQUEUE) {
      if (disco.interrogationDoors[2].graphic.isOpen) {
        disco.closeInterrogationMainDoor(2);
      } else {
        disco.openInterrogationMainDoor(2);
      }
      if (disco.cutDoors[2].graphic.isOpen) {
        disco.closeInterrogationCutDoor(2);
      } else {
        disco.openInterrogationCutDoor(2);
      }
    }
    if (disco.canCheck(2)) {
      disco.check(2);
    }

    // LOAD 3
    if (disco[`interro3S`]!==disco.IS_READY_TO_ESCAPE||disco[`load3S`]!==disco.LS_READY_TO_ENQUEUE) {
      if (disco.interrogationDoors[3].graphic.isOpen) {
        disco.closeInterrogationMainDoor(3);
      } else {
        disco.openInterrogationMainDoor(3);
      }
      if (disco.cutDoors[3].graphic.isOpen) {
        disco.closeInterrogationCutDoor(3);
      }
    }
    if (disco[`load3S`]!==disco.LS_READY_FOR_GUESTS) {
      if (disco.canCheck(3)) {
        disco.check(3);
      } else if (disco.canEnqueue(3)&&disco[`load3S`]===disco.LS_READY_TO_ENQUEUE) {
        disco.enqueue(3);
      }
    }

    // LOAD 4
    if (disco[`interro4S`]!==disco.IS_READY_TO_ESCAPE||disco[`load4S`]!==disco.LS_READY_TO_ENQUEUE||disco[`grouper4S`]!==disco.GS_READY_FOR_GUESTS) {
      if (disco.interrogationDoors[4].graphic.isOpen) {
        disco.closeInterrogationMainDoor(4);
      } else {
        disco.openInterrogationMainDoor(4);
      }
      if (disco.cutDoors[4].graphic.isOpen) {
        disco.closeInterrogationCutDoor(4);
      } else {
        disco.openInterrogationCutDoor(4);
      }
    }
    if (disco[`load4S`]!==disco.LS_READY_TO_ENQUEUE) {
      if (disco.canCheck(4)) {
        disco.check(4);
      } else if (disco.canEnqueue(4)&&disco[`load4S`]===disco.LS_READY_TO_ENQUEUE) {
        disco.enqueue(4);
      }
    }

    let ready12 = false;
    let ready34 = false;

    if (
      disco.load1S===disco.LS_READY_TO_ENQUEUE
      && disco.interro1S===disco.IS_READY_FOR_GUESTS
      && disco.load2S===disco.LS_READY_TO_ENQUEUE
      && disco.interro2S===disco.IS_WAITING_FOR_INTERROGATION
      ) {
        ready12 = true;
    }

    if (
      disco.load3S===disco.LS_READY_FOR_GUESTS
      && disco.interro3S===disco.IS_READY_TO_ESCAPE
      && disco.load4S===disco.LS_READY_TO_ENQUEUE
      && disco.interro4S===disco.IS_WAITING_FOR_INTERROGATION
      && disco.grouper4S===disco.GS_READY_FOR_GUESTS
    ) {
      ready34 = true;
    }

    if (ready12&&ready34) {
      if (ChoreoGraph.Input.keyStates.g) {
        cg.events.lsbsDiscoSequenceStarter.delete();
        cg.sequences.lsbsDisco.run();
      }
    } else if (
      (disco.load4S===disco.LS_READY_FOR_GUESTS||disco.load4S===disco.LS_READY_TO_ENQUEUE)
      && disco.interro4S===disco.IS_READY_FOR_GUESTS
      && disco.grouper4S===disco.GS_READY_FOR_GUESTS
    ) {
      disco.load4Active = true;
    } else {
      disco.load4Active = false;
    }
  };

  moveLSBSCameraTo(positionName,smoothing) {
    const positions = {
      readyRooms : {x:335,y:400},
      outside : {x:410,y:415},
      its : {x:555,y:375},
      hanger : {x:560,y:200},
      grouper : {x:807,y:100},
      cell : {x:865,y:208},
      vehicle : {x:894,y:263},
      unload : {x:700,y:635}
    };

    const automations = {
      readyRooms : ["LOAD1","LOAD2","LOAD3","LOAD4","UNLOAD1","UNLOAD2"],
      outside : ["LOAD1","LOAD2","LOAD3","LOAD4","UNLOAD1","UNLOAD2"],
      its : ["READYROOMS","LOAD1","LOAD2","LOAD3","LOAD4","UNLOAD1","UNLOAD2"],
      hanger : ["ITS","READYROOMS","LOAD1","LOAD2","LOAD3","LOAD4","UNLOAD1","UNLOAD2"],
      grouper : ["ITS","READYROOMS","LOAD1","LOAD2","LOAD3","LOAD4","UNLOAD1","UNLOAD2"],
      unload : ["ITS","READYROOMS","LOAD1","LOAD2","LOAD3","LOAD4","UNLOAD1","UNLOAD2"]
    }

    if (positions[positionName]===undefined) {
      return;
    }

    if (automations[positionName]!==undefined) {
      for (const name in automation.enabled) {
        if (automations[positionName]&&automations[positionName].includes(name)) {
          automation.enabled[name] = true;
        } else {
          automation.enabled[name] = false;
        }
      }
    }

    const x = positions[positionName].x;
    const y = positions[positionName].y;

    rotr.lsbsCameraObject.transform.x = x;
    rotr.lsbsCameraObject.transform.y = y;
    rotr.lsbsCameraObject.Camera.smoothing = smoothing;
  }
}

cg.createSequence({
  data : [
    "announce",15000,

    "closeExitN",11000,"openEnterN",30000,"closeEnterN",5000,"closeITSExit",1000,"closeITSEnter",70000,

    "closeExitS",5000,"openEnterS",30000,"closeEnterS",5000,"closeITSExit",13000,"closeITSEnter",41000,

    "closeExitN",3000,"openEnterN",30000,"closeEnterN",10000,"closeITSEnter",37000,"closeITSExit",33000,

    "closeExitS",5000,"openEnterS",30000,"closeEnterS",5000,"closeITSExit",3000,"closeITSEnter",40000,

    "closeExitN",5000,"openEnterN",30000,"closeEnterN",5000,"closeITSExit",3000,"closeITSEnter",40000
  ],
  callbacks : {
    "announce" : () => {
      console.info("Running LSBS Preshow Sequence");
      rotr.lsbsArmPreshowSequence = false;
    },
    "openEnterN" : () => {
      console.info("openEnterN");
      preshows.openReadyRoomNorthEntranceDoor();
    },
    "closeEnterN" : () => {
      console.info("closeEnterN");
      preshows.closeReadyRoomNorthEntranceDoor();
    },
    "closeExitN" : () => {
      console.info("closeExitN");
      preshows.closeReadyRoomNorthExitDoor();
    },
    "openEnterS" : () => {
      console.info("openEnterS");
      preshows.openReadyRoomSouthEntranceDoor();
    },
    "closeEnterS" : () => {
      console.info("closeEnterS");
      preshows.closeReadyRoomSouthEntranceDoor();
    },
    "closeExitS" : () => {
      console.info("closeExitS");
      preshows.closeReadyRoomSouthExitDoor();
    },
    "closeITSExit" : () => {
      console.info("closeITSExit");
      preshows.closeITSExitDoor();
    },
    "closeITSEnter" : () => {
      console.info("closeITSEnter");
      preshows.closeITSEntranceDoor();
    }
  }
},"lsbsPreshows");

cg.createSequence({
  data : [
    "announce",1000,

    "openMain1",5000,"enqueue4",5000,"enqueue2",19000,"reactivateLoad4",1000,"enqueue1",2000,"openCut3",19000,
    "openCut2",1000,"automate1","automate2",8000,"closeCut3",4000,"openMain3","automate3",30000,"openCut4",31000,"check4","closeCut4",13000,"overrideEnter4","openMain4",26000,"unoverrideEnter4",5000,"enqueue4",25000,"closeMain4",64000,"openCut4",30000,"closeCut4","check4",10000,"openMain4",40000,"enqueue4",5000,"automate4"
  ],
  callbacks : {
    "announce" : () => {
      console.info("Running LSBS Disco Sequence");
    },
    "reactivateLoad4" : () => {
      disco.load4Active = true;
    },
    "enqueue1" : () => {
      console.info("Enqueue 1");
      disco.enqueue(1);
    },
    "enqueue2" : () => {
      console.info("Enqueue 2");
      disco.enqueue(2);
    },
    "enqueue3" : () => {
      console.info("Enqueue 3");
      disco.enqueue(3);
    },
    "enqueue4" : () => {
      console.info("Enqueue 4");
      disco.enqueue(4);
    },
    "openCut1" : () => {
      console.info("Open Cut 1");
      disco.openInterrogationCutDoor(1);
    },
    "openCut2" : () => {
      console.info("Open Cut 2");
      disco.openInterrogationCutDoor(2);
    },
    "openCut3" : () => {
      console.info("Open Cut 3");
      disco.openInterrogationCutDoor(3);
    },
    "openCut4" : () => {
      console.info("Open Cut 4");
      disco.openInterrogationCutDoor(4);
    },
    "openMain1" : () => {
      console.info("Open Main 1");
      disco.openInterrogationMainDoor(1);
    },
    "openMain2" : () => {
      console.info("Open Main 2");
      disco.openInterrogationMainDoor(2);
    },
    "openMain3" : () => {
      console.info("Open Main 3");
      disco.openInterrogationMainDoor(3);
    },
    "openMain4" : () => {
      console.info("Open Main 4");
      disco.openInterrogationMainDoor(4);
    },
    "closeCut1" : () => {
      console.info("Close Cut 1");
      disco.closeInterrogationCutDoor(1);
    },
    "closeCut2" : () => {
      console.info("Close Cut 2");
      disco.closeInterrogationCutDoor(2);
    },
    "closeCut3" : () => {
      console.info("Close Cut 3");
      disco.closeInterrogationCutDoor(3);
    },
    "closeCut4" : () => {
      console.info("Close Cut 4");
      disco.closeInterrogationCutDoor(4);
    },
    "closeMain1" : () => {
      console.info("Close Main 1");
      disco.closeInterrogationMainDoor(1);
    },
    "closeMain2" : () => {
      console.info("Close Main 2");
      disco.closeInterrogationMainDoor(2);
    },
    "closeMain3" : () => {
      console.info("Close Main 3");
      disco.closeInterrogationMainDoor(3);
    },
    "closeMain4" : () => {
      console.info("Close Main 4");
      disco.closeInterrogationMainDoor(4);
    },
    "check1" : () => {
      console.info("Check 1");
      disco.check(1);
    },
    "check2" : () => {
      console.info("Check 2");
      disco.check(2);
    },
    "check3" : () => {
      console.info("Check 3");
      disco.check(3);
    },
    "check4" : () => {
      console.info("Check 4");
      disco.check(4);
    },
    "automate1" : () => {
      console.info("Automate LOAD1");
      automation.enabled.LOAD1 = true;
    },
    "automate2" : () => {
      console.info("Automate LOAD2");
      automation.enabled.LOAD2 = true;
    },
    "automate3" : () => {
      console.info("Automate LOAD3");
      automation.enabled.LOAD3 = true;
    },
    "automate4" : () => {
      console.info("Automate LOAD4");
      automation.enabled.LOAD4 = true;
    },
    "overrideEnter4" : () => {
      disco.interroEnterOverrides[3] = true;
    },
    "unoverrideEnter4" : () => {
      disco.interroEnterOverrides[3] = false;
    }
  }
},"lsbsDisco");

// LOAD LSBS MODE ON START
if (false) {
  cg.callbacks.listen("core","start",()=>{
    rotr.activateLSBSMode();
    cg.Input.buttons.menuStartWithGuests.down();
  });
}

cg.callbacks.listen("core","process",rotr.updatePlaytime.bind(rotr));

function drawKnob(x,y,active=false,scaler=1) {
  const size = 10.5*scaler;
  const c = cg.canvases.main.c;
  c.save();
  c.lineWidth = 1.2*scaler;
  c.beginPath();
  c.arc(x,y,size,0,2*Math.PI);
  c.fillStyle = active ? "#ffffff" : "#48484a";
  c.fill();
  c.strokeStyle = "#353536";
  c.stroke();

  c.lineWidth = 2.5*scaler;
  c.strokeStyle = "#7f7f7f";
  c.beginPath();
  c.moveTo((active?-1:1)*-(size-c.lineWidth)*Math.cos(Math.PI/4)+x,0-(size-c.lineWidth)*Math.sin(Math.PI/4)+y);
  c.lineTo((active?-1:1)*(size-c.lineWidth)*Math.cos(Math.PI/4)+x,0+(size-c.lineWidth)*Math.sin(Math.PI/4)+y);
  c.stroke();
  c.lineWidth = 1.5*scaler;
  c.strokeStyle = "#353536";
  c.beginPath();
  c.moveTo(x,y);
  c.lineTo((active?-1:1)*-(size-3*scaler)*Math.cos(Math.PI/4)+x,0-(size-3*scaler)*Math.sin(Math.PI/4)+y);
  c.stroke();
  c.restore();
}

const INDICATOR_COLOUR = {
  OFF : 0,
  RED : 1,
  YELLOW : 2,
  BLUE : 3,
  GREEN : 4,
  WHITE : 5
}

const INDICATOR_COLOUR_CODES = {
  0 : "#48484a", // off
  1 : "#58140e", // red
  2 : "#d6d445", // yellow
  3 : "#356eda", // blue
  4 : "#368f41", // green
  5 : "#ffffff" // white
}

const STORAGE_TAGS = {
  STORE : "store",
  SHOW : "show"
}

function drawIndicator(x,y,width,height,state=0) {
  const c = cg.canvases.main.c;
  c.save();
  c.fillStyle = INDICATOR_COLOUR_CODES[state];
  c.fillRect(x,y,width,height);
  c.strokeStyle = "#353536";
  c.lineWidth = 1;
  c.strokeRect(x,y,width,height);
  c.restore();
}

function drawLight(x,y,size,state=false) {
  const c = cg.canvases.main.c;
  c.fillStyle = INDICATOR_COLOUR_CODES[state];
  c.lineWidth = 1.8;
  c.beginPath();
  c.arc(x,y,size,0,2*Math.PI);
  c.fill();
  c.strokeStyle = "#353536";
  c.stroke();
}

cg.graphicTypes.bigDoor = {
  setup() {
    this.isOpen = false;
    this.colour = "#4e4a4e";
  },
  /** @param {CanvasRenderingContext2D} c */
  draw(c,ax,ay,canvas) {
    if (this.isOpen) {
      return;
    }
    c.fillStyle = this.colour;
    const width = 44;
    const height = 3;
    c.fillRect(-width/2,-height/2,width,height);
  }
}

cg.graphicTypes.door = {
  setup() {
    this.openTime = -Infinity;
    this.closeTime = -Infinity;
    this.isOpen = false;
    this.changeDuration = 2000;

    this.open = () => {
      this.openTime = cg.clock;
      this.isOpen = true;
    }
    this.close = () => {
      this.closeTime = cg.clock;
      this.isOpen = false;
    }

    this.left = [0,0];
    this.right = [0,0];

    this.colour = "#6b7479";
  },
  /** @param {CanvasRenderingContext2D} c */
  draw(c,ax,ay,canvas) {
    this.midpoint = [(this.left[0]+this.right[0])/2, (this.left[1]+this.right[1])/2];

    let phase = 1;
    if (this.isOpen) {
      phase = Math.max(0, 1 - (cg.clock - this.openTime) / this.changeDuration);
    } else {
      phase = Math.min(1, (cg.clock - this.closeTime) / this.changeDuration);
    }
    phase = -(Math.cos(Math.PI * phase) - 1) / 2;

    c.beginPath();
    c.moveTo(this.left[0], this.left[1]);
    const leftExtentX = this.left[0] + (this.midpoint[0] - this.left[0]) * phase;
    const leftExtentY = this.left[1] + (this.midpoint[1] - this.left[1]) * phase;
    c.lineTo(leftExtentX, leftExtentY);
    c.moveTo(this.right[0], this.right[1]);
    const rightExtentX = this.right[0] + (this.midpoint[0] - this.right[0]) * phase;
    const rightExtentY = this.right[1] + (this.midpoint[1] - this.right[1]) * phase;
    c.lineTo(rightExtentX, rightExtentY);
    c.lineWidth = 1.5;
    c.strokeStyle = this.colour;
    c.stroke();
  }
}