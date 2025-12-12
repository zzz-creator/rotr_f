/** @typedef {import('../../ChoreoGraph/3.2.1/types/choreograph') } ChoreoGraphCore */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/develop') } ChoreoGraphDevelop */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/input') } ChoreoGraphInput */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/audio') } ChoreoGraphAudio */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animation') } ChoreoGraphAnimation */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/animationeditor') } ChoreoGraphAnimationEditor */
/** @typedef {import('../../ChoreoGraph/3.2.1/types/blockcontroller') } ChoreoGraphBlockController */

cg.graphicTypes.interogationDoor = {
  setup() {
    this.openTime = -Infinity;
    this.closeTime = -Infinity;
    this.isOpen = false;
    this.changeDuration = 4000;

    this.open = () => {
      this.openTime = cg.clock;
      this.isOpen = true;
    }
    this.close = () => {
      this.closeTime = cg.clock;
      this.isOpen = false;
    }

    this.colour = "#6b7479";
  },
  /** @param {CanvasRenderingContext2D} c */
  draw(c,ax,ay,canvas) {
    let phase = 1;
    if (this.isOpen) {
      phase = Math.max(0, 1 - (cg.clock - this.openTime) / this.changeDuration);
    } else {
      phase = Math.min(1, (cg.clock - this.closeTime) / this.changeDuration);
    }
    phase = -(Math.cos(Math.PI * phase) - 1) / 2;

    c.fillStyle = this.colour;
    c.fillRect(-30 + phase * 20,-1.50,20,3);
  }
}

cg.graphicTypes.cutDoor = {
  setup() {
    this.openTime = -Infinity;
    this.closeTime = -Infinity;
    this.isOpen = false;
    this.changeDuration = 5000;
    this.phaseInterval = 0.1;
    this.slideLeft = true;

    this.open = () => {
      this.openTime = cg.clock;
      this.isOpen = true;
    }
    this.close = () => {
      this.closeTime = cg.clock;
      this.isOpen = false;
    }

    this.colour = "#746f74";
  },
  /** @param {CanvasRenderingContext2D} c */
  draw(c,ax,ay,canvas) {
    let phase = 0;
    // 0 is closed, 1 is open
    if (this.isOpen) {
      phase = Math.min(1, (cg.clock - this.openTime) / this.changeDuration);
    } else {
      phase = Math.max(0, 1 - (cg.clock - this.closeTime) / this.changeDuration);
    }
    const componentPhaseDuration = 0.5 - this.phaseInterval/2;
    let backPhase = 0;
    let sidePhase = 0;
    if (phase < componentPhaseDuration) {
      backPhase = phase / componentPhaseDuration;
    } else if (phase > componentPhaseDuration + this.phaseInterval) {
      backPhase = 1;
      sidePhase = (phase - componentPhaseDuration - this.phaseInterval) / componentPhaseDuration;
    } else if (phase >= componentPhaseDuration) {
      backPhase = 1;
      sidePhase = 0;
    }
    backPhase = -(Math.cos(Math.PI * backPhase) - 1) / 2;
    sidePhase = -(Math.cos(Math.PI * sidePhase) - 1) / 2;

    const width = 14;
    const height = 3.5;
    const backDistance = 3.5;
    const sideDistance = this.slideLeft ? 14 : -14;
    c.fillStyle = this.colour;
    c.fillRect(-width/2 + sideDistance * sidePhase,-height/2 + backDistance * backPhase,width,height);
  }
}

cg.graphicTypes.selectedLoad = {
  /** @param {CanvasRenderingContext2D} c */
  draw(c,ax,ay,canvas) {
    if (cg.graphics.mainControl.selectedLoad===null) { return; }
    const consoles = [
      [[1039,63],[1021,120]],
      [[944,63],[928,120]],
      [[902,127],[845,148]],
      [[901,226],[845,242]]
    ];


    for (const position of consoles[cg.graphics.mainControl.selectedLoad-1]) {
      const x = position[0];
      const y = position[1];
      const radius = 3;
      const colour = cg.canvases.main.c.createRadialGradient(x, y, 0, x, y, radius);
      colour.addColorStop(0, 'rgba(27, 233, 30, 1)');
      colour.addColorStop(1, 'rgba(27, 233, 30, 0)');
      c.fillStyle = colour;
      c.globalAlpha = 1;
      c.beginPath();
      c.arc(x, y, radius, 0, 2 * Math.PI);
      c.fill();
    }
  }
}
cg.createGraphic({
  type : "selectedLoad"
},"selectedLoad");

const disco = new class Disco {
  load1Active = true;
  load2Active = true;
  load3Active = true;
  load4Active = true;

  nextDispatchGroup = 0;

  // RED ORANGE BLUE GREY
  leftGrouperRequests = [0,0,0,0];
  rightGrouperRequests = [0,0,0,0];
  leftGrouperSatisfaction = [false,false,false,false];
  rightGrouperSatisfaction = [false,false,false,false];

  GROUPER_RED = 0;
  GROUPER_ORANGE = 1;
  GROUPER_BLUE = 2;
  GROUPER_GREY = 3;

  DESTROYER_LEFT = 0;
  DESTROYER_RIGHT = 1;

  selectedGrouperSideIsLeft = true;
  selectedGrouperColour = this.GROUPER_RED;
  selectedDestroyerSide = this.DESTROYER_LEFT;

  leftGrouperGuests = [];
  rightGrouperGuests = [];

  grouperGuestsByColour = {
    1 : {
      [this.GROUPER_RED] : [],
      [this.GROUPER_ORANGE] : [],
      [this.GROUPER_BLUE] : [],
      [this.GROUPER_GREY] : []
    },
    2 : {
      [this.GROUPER_RED] : [],
      [this.GROUPER_ORANGE] : [],
      [this.GROUPER_BLUE] : [],
      [this.GROUPER_GREY] : []
    },
    3 : {
      [this.GROUPER_RED] : [],
      [this.GROUPER_ORANGE] : [],
      [this.GROUPER_BLUE] : [],
      [this.GROUPER_GREY] : []
    },
    4 : {
      [this.GROUPER_RED] : [],
      [this.GROUPER_ORANGE] : [],
      [this.GROUPER_BLUE] : [],
      [this.GROUPER_GREY] : []
    }
  }

  grouperResetStartTimes = {
    1 : -Infinity,
    2 : -Infinity,
    3 : -Infinity,
    4 : -Infinity
  }
  grouperResetDuration = 30000;

  pathToLeftGrouper = cg.createPath([[792,29],[801,26],[807,21]],"pathToLeftGrouper");
  pathToRightGrouper = cg.createPath([[790,31],[795,33],[798,39]],"pathToRightGrouper");

  leftGrouperPositions = cg.createPath([[873,13],[868,14],[865,12],[861,15],[858,12],[854,13],[849,12],[845,14],[840,12],[835,14],[830,13],[826,11],[823,14],[818,11],[814,15],[810,11]],"leftGrouper");
  rightGrouperPositions = cg.createPath([[792,77],[795,75],[792,72],[796,69],[792,67],[796,64],[792,62],[796,58],[791,58],[795,55],[792,54],[796,51],[791,49],[795,46],[791,44],[795,41]],"rightGrouper");

  interrogationEnterPaths = {
    1 : cg.createPath([[1001,38],[1004,41],[1005,49],[1005,57],[1005,63]],"interrogation1Red"),
    2 : cg.createPath([[911,40],[911,46],[911,55],[911,61]],"interrogation2Red"),
    3 : cg.createPath([[820,113],[827,113],[836,113],[845,113]],"interrogation3Red"),
    4 : cg.createPath([[818,206],[821,208],[827,209],[836,209],[847,209]],"interrogation4Red")
  }

  interrogationPositions = {
    1 : {
      [this.GROUPER_RED] : cg.createPath([[994,75],[999,74],[1002,79],[997,80]],"interrogation1Red"),
      [this.GROUPER_ORANGE] : cg.createPath([[1012,85],[1011,90],[1009,95],[1007,87]],"interrogation1Orange"),
      [this.GROUPER_BLUE] : cg.createPath([[1008,77],[1009,82],[1014,80],[1014,74]],"interrogation1Blue"),
      [this.GROUPER_GREY] : cg.createPath([[998,85],[1003,87],[1003,94],[998,89]],"interrogation1Grey")
    },
    2 : {
      [this.GROUPER_RED] : cg.createPath([[908,78],[910,82],[903,81],[903,74]],"interrogation2Red"),
      [this.GROUPER_ORANGE] : cg.createPath([[914,87],[918,84],[917,92],[913,91]],"interrogation2Orange"),
      [this.GROUPER_BLUE] : cg.createPath([[919,75],[920,79],[915,82],[915,77]],"interrogation2Blue"),
      [this.GROUPER_GREY] : cg.createPath([[904,86],[910,87],[909,94],[905,90]],"interrogation2Grey")
    },
    3 : {
      [this.GROUPER_RED] : cg.createPath([[867,109],[871,106],[875,110],[870,111]],"interrogation3Red"),
      [this.GROUPER_ORANGE] : cg.createPath([[857,119],[862,115],[863,121],[858,124]],"interrogation3Orange"),
      [this.GROUPER_BLUE] : cg.createPath([[866,117],[874,114],[873,119],[868,120]],"interrogation3Blue"),
      [this.GROUPER_GREY] : cg.createPath([[857,106],[860,103],[864,107],[860,110]],"interrogation3Grey")
    },
    4 : {
      [this.GROUPER_RED] : cg.createPath([[866,207],[868,202],[872,202],[874,206]],"interrogation4Red"),
      [this.GROUPER_ORANGE] : cg.createPath([[857,216],[862,211],[864,217],[860,219]],"interrogation4Orange"),
      [this.GROUPER_BLUE] : cg.createPath([[867,213],[871,211],[875,215],[870,216]],"interrogation4Blue"),
      [this.GROUPER_GREY] : cg.createPath([[857,203],[861,199],[864,203],[859,207]],"interrogation4Grey")
    }
  }

  interrogationGuestsByColour = {
    1 : {
      [this.GROUPER_RED] : [],
      [this.GROUPER_ORANGE] : [],
      [this.GROUPER_BLUE] : [],
      [this.GROUPER_GREY] : []
    },
    2 : {
      [this.GROUPER_RED] : [],
      [this.GROUPER_ORANGE] : [],
      [this.GROUPER_BLUE] : [],
      [this.GROUPER_GREY] : []
    },
    3 : {
      [this.GROUPER_RED] : [],
      [this.GROUPER_ORANGE] : [],
      [this.GROUPER_BLUE] : [],
      [this.GROUPER_GREY] : []
    },
    4 : {
      [this.GROUPER_RED] : [],
      [this.GROUPER_ORANGE] : [],
      [this.GROUPER_BLUE] : [],
      [this.GROUPER_GREY] : []
    }
  }

  interrogationOpenTimes = {
    1 : -Infinity,
    2 : -Infinity,
    3 : -Infinity,
    4 : -Infinity
  }
  interrogationEnterCheckBuffer = 10000;

  interrogationLights = [];

  interrogationExitPaths = {
    1 : cg.createPath([[1015,88],[1022,90],[1031,92]],"interrogation1Exit"),
    2 : cg.createPath([[921,87],[928,90],[936,93]],"interrogation2Exit"),
    3 : cg.createPath([[868,124],[872,132],[874,139]],"interrogation3Exit"),
    4 : cg.createPath([[868,220],[872,228],[875,236]],"interrogation4Exit")
  }

  // From the door
  loadRowColours = {
    1 : [this.GROUPER_ORANGE,this.GROUPER_GREY,this.GROUPER_RED,this.GROUPER_BLUE],
    2 : [this.GROUPER_ORANGE,this.GROUPER_GREY,this.GROUPER_RED,this.GROUPER_BLUE],
    3 : [this.GROUPER_BLUE,this.GROUPER_RED,this.GROUPER_GREY,this.GROUPER_ORANGE],
    4 : [this.GROUPER_BLUE,this.GROUPER_RED,this.GROUPER_GREY,this.GROUPER_ORANGE]
  }

  interrogationCutTimes = {
    1 : -Infinity,
    2 : -Infinity,
    3 : -Infinity,
    4 : -Infinity
  }

  surpriseDuration = 6000;
  escapeCheckBuffer = 15000;

  // Grouper States:
  GS_READY_FOR_GUESTS = 0;
  GS_APPROACHING = 1;
  GS_READY_TO_ENTER = 2;
  GS_RESETTING = 3;

  // Interrogation States:
  IS_READY_FOR_GUESTS = 0;
  IS_ENTERING = 1;
  IS_READY_TO_CLOSE = 2;
  IS_WAITING_FOR_INTERROGATION = 3;
  IS_INTERROGATING = 4;
  IS_READY_TO_ESCAPE = 5;
  IS_SURPRISE = 6;
  IS_ESCAPING = 7;
  IS_CLEAR_FOR_RESET = 8;
  IS_RESET = 9;

  // Load States:
  LS_READY_FOR_GUESTS = 0;
  LS_LOADING = 1;
  LS_READY_TO_CHECK = 2;
  LS_CHECKING = 3;
  LS_READY_TO_ENQUEUE = 4;
  LS_QUEUED = 5;
  LS_RESETTING = 6;

  grouper1S = this.GS_READY_FOR_GUESTS;
  grouper2S = this.GS_READY_FOR_GUESTS;
  grouper3S = this.GS_READY_FOR_GUESTS;
  grouper4S = this.GS_READY_FOR_GUESTS;

  interro1S = this.IS_READY_FOR_GUESTS;
  interro2S = this.IS_READY_FOR_GUESTS;
  interro3S = this.IS_READY_FOR_GUESTS;
  interro4S = this.IS_READY_FOR_GUESTS;

  load1S = this.LS_READY_FOR_GUESTS;
  load2S = this.LS_READY_FOR_GUESTS;
  load3S = this.LS_READY_FOR_GUESTS;
  load4S = this.LS_READY_FOR_GUESTS;

  load1VF = null;
  load1VB = null;
  load2VF = null;
  load2VB = null;
  load3VF = null;
  load3VB = null;
  load4VF = null;
  load4VB = null;

  replaceVL = null;
  replaceVR = null;

  return0V = null;
  return1V = null;
  return2V = null;
  return3V = null;
  return4V = null;
  return5V = null;
  return6V = null;
  return7V = null;
  return8V = null;
  return9V = null;

  addFV = null;
  addBV = null;

  lastVehicleAddTime = -Infinity;
  vehicleAddBufferDuration = 4000;

  dispatchQueue = [];
  dispatchInterval = 30000;
  immediateDispatchDelay = 15000;
  returnVehicleDispatchDelay = 20000;
  lastQueueTime = -Infinity;
  nextDispatchTime = -Infinity;
  lastDispatchTime = -Infinity;

  interro1StartTime = -Infinity;
  interro2StartTime = -Infinity;
  interro3StartTime = -Infinity;
  interro4StartTime = -Infinity;
  interroDuration = 40000;
  interroDoorCloseStartBufferDuration = 5000;

  interroEnterOverrides = [false,false,false,false];

  interrogationDoorOrigins = cg.createPath([[1005,47],[911,47],[827,113],[827.5,209]],"interrogationDoorOrigins");

  interrogationDoors = {
    1 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "interogationDoor",
      },"interrogationDoor1"),
      transformInit : {
        x : this.interrogationDoorOrigins[0][0],
        y : this.interrogationDoorOrigins[0][1],
        r : 0
      }
    },"interrogationDoor1","midground"),

    2 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "interogationDoor",
      },"interrogationDoor2"),
      transformInit : {
        x : this.interrogationDoorOrigins[1][0],
        y : this.interrogationDoorOrigins[1][1],
        r : 0
      }
    },"interrogationDoor2","midground"),

    3 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "interogationDoor",
      },"interrogationDoor3"),
      transformInit : {
        x : this.interrogationDoorOrigins[2][0],
        y : this.interrogationDoorOrigins[2][1],
        r : 90
      }
    },"interrogationDoor3","midground"),

    4 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "interogationDoor",
      },"interrogationDoor4"),
      transformInit : {
        x : this.interrogationDoorOrigins[3][0],
        y : this.interrogationDoorOrigins[3][1],
        r : 90
      }
    },"interrogationDoor4","midground")
  }

  cutDoorOrigins = cg.createPath([[1017.4,88.5],[923.7,87.5],[869,126.2],[869,222.1]],"cutDoorOrigins");

  cutDoors = {
    1 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "cutDoor",
        slideLeft : false
      },"cutDoor1"),
      transformInit : {
        x : this.cutDoorOrigins[0][0],
        y : this.cutDoorOrigins[0][1],
        r : -72
      }
    },"cutDoor1","midground"),

    2 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "cutDoor",
        slideLeft : false
      },"cutDoor2"),
      transformInit : {
        x : this.cutDoorOrigins[1][0],
        y : this.cutDoorOrigins[1][1],
        r : -72
      }
    },"cutDoor2","midground"),

    3 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "cutDoor"
      },"cutDoor3"),
      transformInit : {
        x : this.cutDoorOrigins[2][0],
        y : this.cutDoorOrigins[2][1],
        r : -18
      }
    },"cutDoor3","midground"),

    4 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "cutDoor"
      },"cutDoor4"),
      transformInit : {
        x : this.cutDoorOrigins[3][0],
        y : this.cutDoorOrigins[3][1],
        r : -18
      }
    },"cutDoor4","midground")
  }

  loadDoorOrigins = cg.createPath([[1046.5,128.5],[957,128.5],[910.5,170],[910.5,261]],"loadDoorOrigins");

  loadDoors = {
    1 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
      },"loadDoor1"),
      transformInit : {
        x : this.loadDoorOrigins[0][0],
        y : this.loadDoorOrigins[0][1],
        r : 0
      }
    },"loadDoor1","midground").graphic,

    2 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
      },"loadDoor2"),
      transformInit : {
        x : this.loadDoorOrigins[1][0],
        y : this.loadDoorOrigins[1][1],
        r : 0
      }
    },"loadDoor2","midground").graphic,

    3 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
      },"loadDoor3"),
      transformInit : {
        x : this.loadDoorOrigins[2][0],
        y : this.loadDoorOrigins[2][1],
        r : 90
      }
    },"loadDoor3","midground").graphic,

    4 : cg.scenes.main.createItem("graphic",{
      graphic : cg.createGraphic({
        type : "bigDoor",
      },"loadDoor4"),
      transformInit : {
        x : this.loadDoorOrigins[3][0],
        y : this.loadDoorOrigins[3][1],
        r : 90
      }
    },"loadDoor4","midground").graphic
  }

  discoPositions = {
    load1VF : [1050,109,20],
    load1VB : [1059,78,-5],
    load2VF : [957,109,375],
    load2VB : [960,78,340],
    load3VF : [894,167,70],
    load3VB : [864,164,100],
    load4VF : [894,263,70],
    load4VB : [864,262,95],
    replaceVL : [990,270,0],
    replaceVR : [1045,270,0],
    return0V : [1023,300,0],
    return1V : [1050,323,310],
    return2V : [1052,360,0],
    return3V : [1052,395,0],
    return4V : [1040,435,-90],
    return5V : [1010,463,225],
    return6V : [988,498,210],
    return7V : [970,529,210],
    return8V : [946,562,250],
    return9V : [910,565,270]
  }

  grouperPaths = {
    1 : cg.createPath([[873,18],[884,21],[902,24],[924,25],[944,25]],"grouper1"),
    2 : cg.createPath([[873,15],[879,18]],"grouper2"),
    3 : cg.createPath([[795,78],[798,83]],"grouper3"),
    4 : cg.createPath([[799,82],[805,104],[805,132],[806,151]],"grouper4"),
  }

  grouperPositions = {
    1 : {
      [this.GROUPER_RED] : cg.createPath([[996,12],[990,12],[983,12],[977,12]],"grouper1Red"),
      [this.GROUPER_ORANGE] : cg.createPath([[995,38],[989,38],[983,38],[977,38]],"grouper1Orange"),
      [this.GROUPER_BLUE] : cg.createPath([[970,12],[964,12],[958,12],[952,12]],"grouper1Blue"),
      [this.GROUPER_GREY] : cg.createPath([[970,38],[964,38],[958,38],[952,38]],"grouper1Grey")
    },
    2 : {
      [this.GROUPER_RED] : cg.createPath([[901,12],[895,12],[889,12],[883,12]],"grouper2Red"),
      [this.GROUPER_ORANGE] : cg.createPath([[901,38],[895,38],[889,38],[883,38]],"grouper2Orange"),
      [this.GROUPER_BLUE] : cg.createPath([[939,12],[933,12],[927,12],[921,12]],"grouper2Blue"),
      [this.GROUPER_GREY] : cg.createPath([[939,38],[933,38],[927,38],[921,38]],"grouper2Grey")
    },
    3 : {
      [this.GROUPER_RED] : cg.createPath([[793,103],[793,97],[793,91],[793,85]],"grouper3Red"),
      [this.GROUPER_ORANGE] : cg.createPath([[819,103],[819,97],[819,91],[819,85]],"grouper3Orange"),
      [this.GROUPER_BLUE] : cg.createPath([[793,141],[793,135],[793,129],[793,123]],"grouper3Blue"),
      [this.GROUPER_GREY] : cg.createPath([[819,141],[819,135],[819,129],[819,123]],"grouper3Grey")
    },
    4 : {
      [this.GROUPER_RED] : cg.createPath([[793,198],[793,193],[793,186],[793,180]],"grouper4Red"),
      [this.GROUPER_ORANGE] : cg.createPath([[819,198],[819,192],[819,186],[819,180]],"grouper4Orange"),
      [this.GROUPER_BLUE] : cg.createPath([[793,173],[793,167],[793,161],[793,155]],"grouper4Blue"),
      [this.GROUPER_GREY] : cg.createPath([[819,173],[819,167],[819,161],[819,155]],"grouper4Grey")
    },
  }

  setNewGrouperRequests(sideIsLeft=true) {
    for (let i=0;i<4;i++) {
      let count;
      const randomNumber = Math.random();
      if (randomNumber<0.01) {
        count = 2;
      } else if (randomNumber<0.1) {
        count = 3;
      } else {
        count = 4;
      }
      if (sideIsLeft) {
        this.leftGrouperRequests[i] = count;
      } else {
        this.rightGrouperRequests[i] = count;
      }
    }
  }

  update() {
    disco.pullGuestsFromDestroyerQueue();
    disco.pullGuestsToInterrogationGroupers();
    disco.checkGrouperApproaches();
    disco.updateInterrogations();
    disco.checkLoadResets();
    disco.checkReturns();
  }

  pickGrouperColour() {
    const satisfied = this.selectedGrouperSideIsLeft ? this.leftGrouperSatisfaction : this.rightGrouperSatisfaction;
    if (!satisfied[this.GROUPER_RED]) {
      this.selectedGrouperColour = this.GROUPER_RED;
    } else if (!satisfied[this.GROUPER_ORANGE]) {
      this.selectedGrouperColour = this.GROUPER_ORANGE;
    } else if (!satisfied[this.GROUPER_BLUE]) {
      this.selectedGrouperColour = this.GROUPER_BLUE;
    } else if (!satisfied[this.GROUPER_GREY]) {
      this.selectedGrouperColour = this.GROUPER_GREY;
    }
  }

  stayAwayFromDisabledLoads() {
    if (
      this.selectedGrouperSideIsLeft
      &&this.load1Active===false&&this.load2Active===false
      &&this.leftGrouperSatisfaction[0]===false
      &&this.leftGrouperSatisfaction[1]===false
      &&this.leftGrouperSatisfaction[2]===false
      &&this.leftGrouperSatisfaction[3]===false) {
      this.selectedGrouperSideIsLeft = false;
    } else if (
      !this.selectedGrouperSideIsLeft
      &&this.load3Active===false&&this.load4Active===false
      &&this.rightGrouperSatisfaction[0]===false
      &&this.rightGrouperSatisfaction[1]===false
      &&this.rightGrouperSatisfaction[2]===false
      &&this.rightGrouperSatisfaction[3]===false) {
      this.selectedGrouperSideIsLeft = true;
    } else {
      return false;
    }
    return true;
  }

  pickGrouperSideAndColour() {
    this.stayAwayFromDisabledLoads();

    const satisfied = this.selectedGrouperSideIsLeft ? this.leftGrouperSatisfaction : this.rightGrouperSatisfaction;

    // If current selection is not satisfied, dont change
    if (!satisfied[this.selectedGrouperColour]) {
      return;
    }

    this.pickGrouperColour();

    if (satisfied[this.selectedGrouperColour]) {
      this.selectedGrouperSideIsLeft = !this.selectedGrouperSideIsLeft;
      this.selectedGrouperColour = Math.floor(Math.random()*4);
    }

    this.stayAwayFromDisabledLoads();
  }

  pullGuestsFromDestroyerQueue() {
    this.pickGrouperSideAndColour();

    const satisfied = this.selectedGrouperSideIsLeft ? this.leftGrouperSatisfaction : this.rightGrouperSatisfaction;
    const requests = this.selectedGrouperSideIsLeft ? this.leftGrouperRequests : this.rightGrouperRequests;

    // If already satisfied, return
    if (satisfied[this.selectedGrouperColour]) {
      return;
    }

    // Don't pull if both loads are not active
    if (this.stayAwayFromDisabledLoads()) {
      return;
    }

    // Randomly change between the selected destroyer queue side
    if (Math.random()<0.2) {
      this.selectedDestroyerSide = [1,0][this.selectedDestroyerSide];
    }

    const destroyerCensus = preshows.censuses["destroyerQueue"+["Left","Right"][this.selectedDestroyerSide]];
    const otherDestroyerCensus = preshows.censuses["destroyerQueue"+["Right","Left"][this.selectedDestroyerSide]];

    // Decide how many guests are being pulled to the current unsatisfied colour
    let guestsToPull = 0;
    if (destroyerCensus===0&&otherDestroyerCensus>0) {
      this.selectedDestroyerSide = [1,0][this.selectedDestroyerSide];
      if (otherDestroyerCensus<requests[this.selectedGrouperColour]) {
        guestsToPull = requests[this.selectedGrouperColour]-destroyerCensus;
      } else {
        guestsToPull = requests[this.selectedGrouperColour];
      }
    } else if (destroyerCensus<requests[this.selectedGrouperColour]&&destroyerCensus>0) {
      guestsToPull = destroyerCensus;
      requests[this.selectedGrouperColour] = destroyerCensus;
    } else {
      guestsToPull = requests[this.selectedGrouperColour];
    }

    const guests = humanishCircles.filter(
      (guest) => guest.state === "queue"
      && guest.space === SPACES["DESTROYERQUEUE"+["LEFT","RIGHT"][this.selectedDestroyerSide]]
      && guest.queueData === queues["destroyer"+["Left","Right"][this.selectedDestroyerSide]]
      && guest.queuePosition < guestsToPull
      && guest.path.length <= 6
    );

    if (guests.length!==guestsToPull) {
      return;
    }

    preshows.censuses["destroyerQueue"+["Left","Right"][this.selectedDestroyerSide]] -= guestsToPull;

    satisfied[this.selectedGrouperColour] = true;

    const guestsOfSide = this.selectedGrouperSideIsLeft ? this.leftGrouperGuests : this.rightGrouperGuests;

    for (const guest of guests) {
      guest.state = "generic";
      guest.assignedColour = this.selectedGrouperColour;

      for (let i=guest.queuePosition;i>0;i--) {
        guest.path.push(queues["destroyer"+["Left","Right"][this.selectedDestroyerSide]].points[i]);
      }

      guestsOfSide.push(guest);

      const pathToSide = this["pathTo" + (this.selectedGrouperSideIsLeft ? "Left" : "Right") + "Grouper"];
      for (let i=0;i<pathToSide.length;i++) {
        let x = pathToSide[i][0];
        let y = pathToSide[i][1];
        x += (Math.random()-0.5)*5;
        y += (Math.random()-0.5)*5;
        guest.path.push([x,y]);
      }

      const positions = this.selectedGrouperSideIsLeft ? this.leftGrouperPositions : this.rightGrouperPositions;
      const position = positions[guestsOfSide.length-1];
      const posX = position[0] + (Math.random()-0.5);
      const posY = position[1] + (Math.random()-0.5);
      guest.path.push([posX,posY]);
      guest.path.push([posX,posY]);

      guest.space = this.selectedGrouperSideIsLeft ? SPACES.LEFTGROUPER : SPACES.RIGHTGROUPER;
      guest.queueData.occupied[guest.queuePosition] = false;
    }
  }

  pullGuestsToInterrogationGroupers() {
    this.pullGuestsToInterrogationGroupersBySide(true);
    this.pullGuestsToInterrogationGroupersBySide(false);
  }

  pullGuestsToInterrogationGroupersBySide(sideIsLeft) {
    const satisfied = sideIsLeft ? this.leftGrouperSatisfaction : this.rightGrouperSatisfaction;

    let destroyerQueueEmpty = preshows.censuses.destroyerQueueLeft === 0 && preshows.censuses.destroyerQueueRight === 0;

    if (!destroyerQueueEmpty && (!satisfied[0] || !satisfied[1] || !satisfied[2] || !satisfied[3])) {
      // Destroyer queue not empty so wait for satisfaction
      return;
    } else if (destroyerQueueEmpty && (!satisfied[0] && !satisfied[1] && !satisfied[2] && !satisfied[3])) {
      // Destroyer queue empty but no satisfaction
      return;
    }

    let selectedLoadNumber;

    if (sideIsLeft&&this.grouper1S===this.GS_READY_FOR_GUESTS&&this.load1Active) {
      selectedLoadNumber = 1;
    } else if (sideIsLeft&&this.grouper2S===this.GS_READY_FOR_GUESTS&&(this.load2Active||(!this.load1Active&&!this.load2Active))) {
      selectedLoadNumber = 2;
    } else if (!sideIsLeft&&this.grouper3S===this.GS_READY_FOR_GUESTS&&this.load3Active) {
      selectedLoadNumber = 3;
    } else if (!sideIsLeft&&this.grouper4S===this.GS_READY_FOR_GUESTS&&(this.load4Active||(!this.load3Active&&!this.load4Active))) {
      selectedLoadNumber = 4;
    } else {
      return;
    }

    moveCM("grouper"+selectedLoadNumber,"grouper"+selectedLoadNumber+"Lure");

    satisfied[0] = false;
    satisfied[1] = false;
    satisfied[2] = false;
    satisfied[3] = false;

    const grouperGuests = sideIsLeft ? this.leftGrouperGuests : this.rightGrouperGuests;

    for (const guest of grouperGuests) {
      const colour = guest.assignedColour;
      const colourGuestList = this.grouperGuestsByColour[selectedLoadNumber][colour];
      colourGuestList.push(guest);

      const pathToGrouper = this["grouperPaths"][selectedLoadNumber];

      for (let i=0;i<pathToGrouper.length;i++) {
        let x = pathToGrouper[i][0];
        let y = pathToGrouper[i][1];
        x += (Math.random()-0.5)*2;
        y += (Math.random()-0.5)*2;
        guest.path.push([x,y]);
      }

      const position = this.grouperPositions[selectedLoadNumber][colour][colourGuestList.length-1];
      const posX = position[0] + (Math.random()-0.5);
      const posY = position[1] + (Math.random()-0.5);
      guest.path.push([posX,posY]);
      guest.path.push([posX,posY]);
    }

    grouperGuests.length = 0;
    this["grouper"+selectedLoadNumber+"S"] = this.GS_APPROACHING;

    disco.setNewGrouperRequests(sideIsLeft);
  }

  checkGrouperApproaches() {
    for (let loadNumber=1;loadNumber<=4;loadNumber++) {
      if (this["grouper"+loadNumber+"S"]===this.GS_APPROACHING) {
        const guests = this.grouperGuestsByColour[loadNumber][0].concat(
          this.grouperGuestsByColour[loadNumber][1],
          this.grouperGuestsByColour[loadNumber][2],
          this.grouperGuestsByColour[loadNumber][3]
        );
        let arrived = true;
        for (const guest of guests) {
          if (guest.path.length>0) {
            arrived = false;
            break;
          }
        }
        if (arrived) {
          this["grouper"+loadNumber+"S"] = this.GS_READY_TO_ENTER;
        }
      }
    }
  }

  updateInterrogations() {
    for (let loadNumber=1;loadNumber<=4;loadNumber++) {
      // CHECK IF GUESTS CAN BE PULLED IN
      const entranceDoorOpen = this.interrogationDoors[loadNumber].graphic.isOpen;
      if (this["grouper"+loadNumber+"S"]===this.GS_READY_TO_ENTER
        && this["interro"+loadNumber+"S"]===this.IS_READY_FOR_GUESTS
        && entranceDoorOpen
        && this.interroEnterOverrides[loadNumber-1]===false) {
        this.pullGuestsIntoInterrogation(loadNumber);
        this.interrogationOpenTimes[loadNumber] = cg.clock;
      }

      // CHECK IF ALL GUESTS ARE IN
      if (this["interro"+loadNumber+"S"]===this.IS_ENTERING) {
        const guests = this.interrogationGuestsByColour[loadNumber][0].concat(
          this.interrogationGuestsByColour[loadNumber][1],
          this.interrogationGuestsByColour[loadNumber][2],
          this.interrogationGuestsByColour[loadNumber][3]
        );
        let arrived = true;
        for (const guest of guests) {
          if (guest.path.length>2) {
            arrived = false;
            break;
          }
        }
        if (arrived && this.interrogationOpenTimes[loadNumber] + this.interrogationEnterCheckBuffer <= cg.clock) {
          this["interro"+loadNumber+"S"] = this.IS_READY_TO_CLOSE;
        }
      }

      // CHECK IF GROUPER CAN RESET
      if (this["grouper"+loadNumber+"S"]===this.GS_RESETTING) {
        if (cg.clock - this.grouperResetStartTimes[loadNumber] >= this.grouperResetDuration) {
          this["grouper"+loadNumber+"S"] = this.GS_READY_FOR_GUESTS;
        }
      }

      // CHECK IF GUESTS CAN ESCAPE
      if (this["interro"+loadNumber+"S"]===this.IS_SURPRISE
        && this.cutDoors[loadNumber].graphic.isOpen
        && this.interrogationCutTimes[loadNumber] + this.surpriseDuration <= cg.clock) {
        this["interro"+loadNumber+"S"] = this.IS_ESCAPING;
        this.sendGuestsToVehicles(loadNumber);
      }

      // CHECK IF INTERROGATION CAN START
      if (this["interro"+loadNumber+"S"]===this.IS_WAITING_FOR_INTERROGATION) {
        this.interrogate(loadNumber);
      }

      // CHECK IF INTERROGATION CAN RESET
      if (this["interro"+loadNumber+"S"]===this.IS_ESCAPING&&this.interrogationCutTimes[loadNumber]+this.escapeCheckBuffer<=cg.clock) {
        const guests = this[`load${loadNumber}VF`].frontGuests
        .concat(this[`load${loadNumber}VF`].backGuests)
        .concat(this[`load${loadNumber}VB`].frontGuests)
        .concat(this[`load${loadNumber}VB`].backGuests);
        const surpriseCM = ["r","r","l","l"][loadNumber-1];
        const doorCM = ["l","l","r","r"][loadNumber-1];

        let allEscaped = true; // Everyone in vehicles
        let canCheckCell = CMs[`load${loadNumber}${doorCM}`].path.length===0; // Everyone nearly in vehicles
        for (const guest of guests) {
          if (guest.path.length>0) {
            allEscaped = false;
          }
          if (guest.path.length>4) {
            canCheckCell = false;
          }
        }

        if (allEscaped) {
          this["interro"+loadNumber+"S"] = this.IS_CLEAR_FOR_RESET;
          this["load"+loadNumber+"S"] = this.LS_READY_TO_CHECK;
          moveCM(`load${loadNumber}${surpriseCM}`,`load${loadNumber}${surpriseCM}Check`+(disco.dispatchQueue.length>1?"":"Short"));
        }
        if (canCheckCell) {
          moveCM(`load${loadNumber}${doorCM}`,`load${loadNumber}${doorCM}Check`+(disco.dispatchQueue.length>1?"":"Short"));
        }
      }

      // CHECK IF INTERROGATION IS RESET
      if (this["interro"+loadNumber+"S"]===this.IS_RESET
        && this.cutDoors[loadNumber].graphic.closeTime + this.cutDoors[loadNumber].graphic.changeDuration <= cg.clock) {
        this["interro"+loadNumber+"S"] = this.IS_READY_FOR_GUESTS;
      }
    }
  }

  pullGuestsIntoInterrogation(loadNumber) {
    this["grouper"+loadNumber+"S"] = this.GS_RESETTING;
    this.grouperResetStartTimes[loadNumber] = cg.clock;
    moveCM("grouper"+loadNumber,"grouper"+loadNumber+"Incarcerate");

    const colourWaits = {
      1 : {
        [this.GROUPER_RED] : 8000,
        [this.GROUPER_ORANGE] : 1500,
        [this.GROUPER_BLUE] : 11000,
        [this.GROUPER_GREY] : 4500
      },
      2 : {
        [this.GROUPER_RED] : 8000,
        [this.GROUPER_ORANGE] : 1500,
        [this.GROUPER_BLUE] : 11000,
        [this.GROUPER_GREY] : 4500
      },
      3 : {
        [this.GROUPER_RED] : 1500,
        [this.GROUPER_ORANGE] : 10000,
        [this.GROUPER_BLUE] : 4500,
        [this.GROUPER_GREY] : 13000
      },
      4 : {
        [this.GROUPER_RED] : 1500,
        [this.GROUPER_ORANGE] : 10000,
        [this.GROUPER_BLUE] : 4500,
        [this.GROUPER_GREY] : 13000
      }
    }

    for (let colour=0;colour<=3;colour++) {
      const guests = this.grouperGuestsByColour[loadNumber][colour];
      const interrogationPositions = this.interrogationPositions[loadNumber][colour];
      const pathToInterrogation = this.interrogationEnterPaths[loadNumber];

      for (let i=0;i<guests.length;i++) {
        const path = [];
        for (let i=0;i<pathToInterrogation.length;i++) {
          let x = pathToInterrogation[i][0];
          let y = pathToInterrogation[i][1];
          x += (Math.random()-0.5)*2;
          y += (Math.random()-0.5)*2;
          path.push([x,y]);
        }

        const position = interrogationPositions[i];
        const posX = position[0] + (Math.random()-0.5);
        const posY = position[1] + (Math.random()-0.5);
        path.push([posX,posY]);
        path.push([posX,posY]);

        const guest = guests[i];

        cg.createEvent({
          duration : i * 500 + colourWaits[loadNumber][colour],
          guest : guest,
          path : path,
          end : (event) => {
            for (let j=0;j<event.path.length;j++) {
              event.guest.path.push(event.path[j]);
            }
          }
        });

        guest.space = SPACES["LOAD"+loadNumber];
        this.interrogationGuestsByColour[loadNumber][colour].push(guest);
      }

      this.grouperGuestsByColour[loadNumber][colour].length = 0;
      this["interro"+loadNumber+"S"] = this.IS_ENTERING;
    }
  }

  canInterrogate(loadNumber) {
    const door = disco.interrogationDoors[loadNumber].graphic;
    return this["interro"+loadNumber+"S"] === this.IS_WAITING_FOR_INTERROGATION
    && door.closeTime + disco.interroDoorCloseStartBufferDuration < cg.clock
    && (
      this["load"+loadNumber+"S"] === this.LS_READY_FOR_GUESTS
      || this["load"+loadNumber+"S"] === this.LS_QUEUED
      || this["load"+loadNumber+"S"] === this.LS_RESETTING
    );
  }

  interrogate(loadNumber) {
    if (!this.canInterrogate(loadNumber)) { return; }
    this["interro"+loadNumber+"S"] = this.IS_INTERROGATING;
    this.interrogationLights[loadNumber].runSequence();
    this["interro"+loadNumber+"StartTime"] = cg.clock;
    rotra.trigger("interrogate",loadNumber);
    cg.createEvent({
      duration : disco.interroDuration,
      loadNumber : loadNumber,
      end : (event) => {
        disco["interro"+event.loadNumber+"S"] = disco.IS_READY_TO_ESCAPE;
      }
    })
  }

  sendGuestsToVehicles(loadNumber) {
    const guests = this.interrogationGuestsByColour[loadNumber][0].concat(
      this.interrogationGuestsByColour[loadNumber][1],
      this.interrogationGuestsByColour[loadNumber][2],
      this.interrogationGuestsByColour[loadNumber][3]
    );

    const exitPath = this.interrogationExitPaths[loadNumber];

    // sort by distance to door (exitPath[0])
    guests.sort((a,b) => {
      const dxA = a.x - exitPath[0][0];
      const dyA = a.y - exitPath[0][1];
      const distanceA = Math.sqrt(dxA*dxA + dyA*dyA);

      const dxB = b.x - exitPath[0][0];
      const dyB = b.y - exitPath[0][1];
      const distanceB = Math.sqrt(dxB*dxB + dyB*dyB);

      return distanceA - distanceB;
    });

    const rowCounting = {
      0 : 0,
      1 : 0,
      2 : 0,
      3 : 0
    };

    for (let g=0;g<guests.length;g++) {
      const guest = guests[g];
      const row = this.loadRowColours[loadNumber].indexOf(guest.assignedColour);
      const vehicle = row < 2 ? this["load"+loadNumber+"VF"] : this["load"+loadNumber+"VB"];
      const vehicleRow = row % 2;
      const vehicleSeat = rowCounting[row];
      rowCounting[row]++;

      const path = [];
      for (let i=0;i<exitPath.length;i++) {
        let x = exitPath[i][0];
        let y = exitPath[i][1];
        x += (Math.random()-0.5)*2;
        y += (Math.random()-0.5)*2;
        path.push([x,y]);
      }

      const vehicleRad = vehicle.transform.r * (Math.PI/180);
      const rowFirstSeatXO = guestVehicleLocations[vehicleRow*4][0];
      const rowFirstSeatYO = guestVehicleLocations[vehicleRow*4][1];

      const vehicleStepX = vehicle.transform.x + Math.cos(vehicleRad) * (rowFirstSeatXO - 3) - Math.sin(vehicleRad) * rowFirstSeatYO;
      const vehicleStepY = vehicle.transform.y + Math.sin(vehicleRad) * (rowFirstSeatXO - 3) + Math.cos(vehicleRad) * rowFirstSeatYO;

      path.push([vehicleStepX,vehicleStepY]);

      const guestSeatXO = guestVehicleLocations[(3-vehicleSeat)+vehicleRow*4][0] + .2;
      const guestSeatYO = guestVehicleLocations[(3-vehicleSeat)+vehicleRow*4][1];

      const seatX = vehicle.transform.x + Math.cos(vehicleRad) * guestSeatXO - Math.sin(vehicleRad) * guestSeatYO;
      const seatY = vehicle.transform.y + Math.sin(vehicleRad) * guestSeatXO + Math.cos(vehicleRad) * guestSeatYO;

      path.push([seatX,seatY]);

      vehicle[vehicleRow === 0 ? "frontGuests" : "backGuests"][vehicleSeat] = guest;
      guest.seatIndex = (3-vehicleSeat)+vehicleRow*4;
      guest.vehicle = vehicle;

      cg.createEvent({
        duration : g * 500,
        guest : guest,
        path : path,
        end : (event) => {
          event.guest.path = event.guest.path.concat(event.path);
        }
      })
    }

    // Reset interrogationGuestsByColour
    for (let i=0;i<4;i++) {
      this.interrogationGuestsByColour[loadNumber][i].length = 0;
    }
  }

  checkLoadResets() {
    for (let loadNumber=1;loadNumber<=4;loadNumber++) {
      if (this["load"+loadNumber+"S"]===this.LS_RESETTING) {
        const vehicleF = this["load"+loadNumber+"VF"];
        const vehicleB = this["load"+loadNumber+"VB"];
        if (vehicleF.Animator.animation === null && vehicleB.Animator.animation === null) {
          this["load"+loadNumber+"S"] = this.LS_READY_FOR_GUESTS;
          cg.createEvent({
            duration : 1000,
            loadNumber : loadNumber,
            end : (event) => {
              disco.loadDoors[event.loadNumber].isOpen = false;
            }
          })
        }
      }
    }
  }

  checkReturns() {
    if (disco.addBV!==null
    &&  disco.addBV.Animator.animation===null
    &&  disco.addFV===null) {
      disco.addBV.Animator.animation = cg.Animation.animations["add_wait_b-f"];
      disco.addFV = disco.addBV;
      disco.addBV = null;
    }
  }

  canEnqueue(loadNumber) {
    return this["load"+loadNumber+"S"] == this.LS_READY_TO_ENQUEUE || this["load"+loadNumber+"S"] == this.LS_READY_FOR_GUESTS;
  }

  enqueue(loadNumber,override=false) {
    if (!this.canEnqueue(loadNumber)&&!override) { return false; }
    this.lastQueueTime = cg.clock;
    if (this.dispatchQueue.length===0 && this.lastDispatchTime + this.immediateDispatchDelay <= cg.clock) {
      this.nextDispatchTime = cg.clock + this.immediateDispatchDelay;
    }

    if (this["load"+loadNumber+"S"] === this.LS_READY_TO_ENQUEUE) {
      rotr.dispatches++;
    }

    this["load"+loadNumber+"S"] = this.LS_QUEUED;

    this.dispatchQueue.push(loadNumber);
  }

  dispatchQueueUpdate() {
    if (disco.nextDispatchTime - 2000 < cg.clock && disco.dispatchQueue.length > 0) {
      const loadNumber = disco.dispatchQueue[0];
      disco.loadDoors[loadNumber].isOpen = true;
    }
    if (disco.nextDispatchTime < cg.clock && disco.dispatchQueue.length > 0) {
      const loadNumber = disco.dispatchQueue[0];
      if (disco.replaceVL === null || disco.replaceVR === null) {
        return;
      }
      if (disco.replaceVR.Animator.animation !== null || disco.replaceVL.Animator.animation !== null) {
        return;
      }
      disco.dispatch(loadNumber);
      disco.nextDispatchTime = cg.clock + disco.dispatchInterval;
      disco.dispatchQueue.shift()
    }
  }

  dispatch(loadNumber) {
    const vehicleF = this["load"+loadNumber+"VF"];
    const vehicleB = this["load"+loadNumber+"VB"];
    const replaceL = this.replaceVL;
    const replaceR = this.replaceVR;

    if (vehicleF === null || vehicleB === null || replaceL === null || replaceR === null) {
      console.error("Attempted to dispatch with missing vehicles!", vehicleF, vehicleB, replaceL, replaceR);
      return;
    }

    vehicleF.BlockController.group = this.nextDispatchGroup;
    vehicleB.BlockController.group = this.nextDispatchGroup;

    this.nextDispatchGroup++;

    this.lastDispatchTime = cg.clock;
    this["load"+loadNumber+"S"] = this.LS_RESETTING;

    this["load"+loadNumber+"VF"] = replaceR;
    this["load"+loadNumber+"VB"] = replaceL;
    this.replaceVL = null;
    this.replaceVR = null;

    vehicleF.Animator.animation = cg.Animation.animations[`l${loadNumber-1}fd`];
    vehicleB.Animator.animation = cg.Animation.animations[`l${loadNumber-1}bd`];
    replaceL.Animator.animation = cg.Animation.animations[`l${loadNumber-1}fr`];
    replaceR.Animator.animation = cg.Animation.animations[`l${loadNumber-1}br`];

    vehicleF.scene = "9";
    vehicleB.scene = "9";
    replaceL.scene = "8-"+loadNumber;
    replaceR.scene = "8-"+loadNumber;

    cg.createEvent({
      duration : 15000,
      end : () => {
        moveCM(`load${loadNumber}l`,`load${loadNumber}lPrepare`);
        moveCM(`load${loadNumber}r`,`load${loadNumber}rPrepare`);
      }
    })
  }

  advanceReturnVehicles() {
    if (disco.replaceVL === null
    && disco.replaceVR === null
    && disco.return0V !== null
    && disco.return0V.Animator.animation === null
    && disco.lastDispatchTime + disco.returnVehicleDispatchDelay <= cg.clock) {
      disco.replaceVL = disco.return0V;
      disco.replaceVL.Animator.animation = cg.Animation.animations["q0-rep1"];
      disco.replaceVL.Animator.restart();
      disco.return0V = null;
    } else if (disco.replaceVL !== null
    && disco.replaceVR === null
    && disco.return0V !== null
    && disco.return0V.Animator.animation === null) {
      disco.replaceVR = disco.return0V;
      disco.replaceVR.Animator.animation = cg.Animation.animations["q0-rep0"];
      disco.replaceVR.Animator.restart();
      disco.return0V = null;
    }

    for (let i=8;i>=0;i--) {
      if (i===3&&(disco.addFV!==null||disco.addBV!==null)) {
        if (disco.addFV!==null&&disco.addFV.Animator.animation===null&&disco.return3V===null) {
          disco.addFV.Animator.animation = cg.Animation.animations["add_wait_f-q3"];
          disco.return3V = disco.addFV;
          disco.addFV = null;
        }
        continue;
      }
      if (i===3
      && disco["return"+(i+1)+"V"] !== null
      && disco["return"+(i+1)+"V"].storageTag === STORAGE_TAGS.STORE
      && disco["return"+(i+1)+"V"].Animator.animation === null
      && disco.addFV===null
      && disco.addBV===null) {
        if (disco.return3V!==null&&disco.return3V.Animator.animation!==null) {
          continue;
        }
        disco["return"+(i+1)+"V"].Animator.animation = cg.Animation.animations.remove;
        disco.return4V = null;
        continue;
      }
      if (disco["return"+i+"V"] === null
      && disco["return"+(i+1)+"V"] !== null
      && disco["return"+(i+1)+"V"].Animator.animation === null) {
        disco["return"+i+"V"] = disco["return"+(i+1)+"V"];
        disco["return"+i+"V"].Animator.animation = cg.Animation.animations["q"+(i+1)+"-q"+(i)];
        disco["return"+i+"V"].Animator.restart();
        disco["return"+(i+1)+"V"] = null;
      }
    }
  }

  canOpenInterrogationMainDoor(loadNumber) {
    return disco["interro"+loadNumber+"S"] === disco.IS_READY_FOR_GUESTS
    && disco["grouper"+loadNumber+"S"] === disco.GS_READY_TO_ENTER
    && this.interrogationDoors[loadNumber].graphic.isOpen === false;
  }

  openInterrogationMainDoor(loadNumber) {
    if (this.canOpenInterrogationMainDoor(loadNumber)) {
      this.interrogationDoors[loadNumber].graphic.open();
    }
  }

  canCloseInterrogationMainDoor(loadNumber) {
    return disco["interro"+loadNumber+"S"] === disco.IS_READY_TO_CLOSE
    && this.interrogationDoors[loadNumber].graphic.isOpen;
  }

  closeInterrogationMainDoor(loadNumber) {
    if (this.canCloseInterrogationMainDoor(loadNumber)) {
      this.interrogationDoors[loadNumber].graphic.close();
      this["interro"+loadNumber+"S"] = this.IS_WAITING_FOR_INTERROGATION;
      moveCM("grouper"+loadNumber,"grouper"+loadNumber+"Return");
      rotra.trigger("closeInterrogationMainDoor",loadNumber);
    }
  }

  canOpenInterrogationCutDoor(loadNumber) {
    return disco["interro"+loadNumber+"S"] === disco.IS_READY_TO_ESCAPE
    && disco["load"+loadNumber+"S"] === disco.LS_READY_FOR_GUESTS
    && this.cutDoors[loadNumber].graphic.isOpen === false
    && CMs[`load${loadNumber}l`].path.length === 0
    && CMs[`load${loadNumber}r`].path.length === 0;
  }

  openInterrogationCutDoor(loadNumber) {
    if (this.canOpenInterrogationCutDoor(loadNumber)) {
      cg.createEvent({
        duration : 1000,
        loadNumber : loadNumber,
        end : (event) => {
          disco.cutDoors[event.loadNumber].graphic.open();
        }
      })
      disco["interro"+loadNumber+"S"] = disco.IS_SURPRISE;
      disco["load"+loadNumber+"S"] = disco.LS_LOADING;
      this.interrogationCutTimes[loadNumber] = cg.clock;
      const surpriseCM = ["r","r","l","l"][loadNumber-1];
      cg.createEvent({
        duration : 5000,
        loadNumber : loadNumber,
        surpriseCM : surpriseCM,
        end : (event) => {
          moveCM(`load${event.loadNumber}${event.surpriseCM}`,`load${event.loadNumber}${event.surpriseCM}Surprise`);
        }
      })
      rotra.trigger("openInterrogationCutDoor",loadNumber);
    }
  }

  canCloseInterrogationCutDoor(loadNumber) {
    return disco["interro"+loadNumber+"S"] === disco.IS_CLEAR_FOR_RESET
    && this.cutDoors[loadNumber].graphic.isOpen;
  }

  closeInterrogationCutDoor(loadNumber) {
    if (this.canCloseInterrogationCutDoor(loadNumber)) {
      this.cutDoors[loadNumber].graphic.close();
      disco["interro"+loadNumber+"S"] = this.IS_RESET;
    }
  }

  canCheck(loadNumber) {
    return this["load"+loadNumber+"S"] === this.LS_READY_TO_CHECK;
  }

  check(loadNumber) {
    if (this.canCheck(loadNumber)) {
      this["load"+loadNumber+"S"] = this.LS_CHECKING;
      const guests = this["load"+loadNumber+"VF"].frontGuests
      .concat(this["load"+loadNumber+"VF"].backGuests)
      .concat(this["load"+loadNumber+"VB"].frontGuests)
      .concat(this["load"+loadNumber+"VB"].backGuests);

      for (const guest of guests) {
        guest.y -= 300;
        guest.targetY -= 300;
        guest.state = "invisible";
        guest.vehicle.Graphic.graphic.seatOccupancy[guest.seatIndex] = true;
      }

      cg.createEvent({
        duration : 10000,
        loadNumber : loadNumber,
        end : (event) => {
          this["load"+event.loadNumber+"S"] = this.LS_READY_TO_ENQUEUE;
        }
      })
    }
  }
}

disco.setNewGrouperRequests(true);
disco.setNewGrouperRequests(false);

cg.createEvent({
  duration : 2000,
  loop : true,
  end : disco.update
},"discoUpdate");

cg.createEvent({
  duration : 200,
  loop : true,
  end : disco.advanceReturnVehicles
},"advanceReturnVehicles");

cg.createGraphic({
  type : "image",
  image : cg.images.interrogation_lights
},"interrogationLights");

cg.callbacks.listen("core","process",disco.dispatchQueueUpdate)

cg.Animation.createAnimationFromPacked("1:transform,o;1,v&variabletime=0,1,24,1,6,1,10,1&value=,0,1+1,0+1,1+1,0",{},"interrogationLightingSequence");

(function(){
  const interrogationLightPositions = [{x:1005,y:82,o:0},{x:911,y:82,o:0},{x:864.5,y:113,r:-90,o:0},{x:864.5,y:209,r:-90,o:0}];

  for (let i=1;i<=interrogationLightPositions.length;i++) {
    const object = cg.createObject({
      transformInit : interrogationLightPositions[i-1]
    },"interrogationLights"+i)
    .attach("Graphic",{
      graphic : cg.graphics.interrogationLights,
      collection : "midground"
    })
    .attach("Animator",{
      loop : false
    });

    object.runSequence = function() {
      this.Animator.animation = cg.Animation.animations.interrogationLightingSequence;
      this.Animator.restart();
    }

    disco.interrogationLights[i] = object;

    cg.scenes.main.addObject(object);
  }
})();

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedLoad = null;
  }
},"load1Cell");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedLoad = null;
  }
},"load2Cell");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedLoad = null;
  }
},"load3Cell");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedLoad = null;
  }
},"load4Cell");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedLoad = null;
  }
},"load1Vehicles");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedLoad = null;
  }
},"load2Vehicles");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedLoad = null;
  }
},"load3Vehicles");

cg.Input.createButton({
  type : "rectangle",
  check : "consoles",
  down : () => {
    cg.graphics.mainControl.selectedLoad = null;
  }
},"load4Vehicles");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 20,
  hoverCursor : "default",
  transformInit : {x:1005,y:47}
},"toggleInterrogation1MainDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleInterrogation1MainDoorMap,cg.Input.buttons.load1Cell],
  down : () => {
    if (disco.interrogationDoors[1].graphic.isOpen) {
      disco.closeInterrogationMainDoor(1);
    } else {
      disco.openInterrogationMainDoor(1);
    }
  }
},"toggleInterrogation1MainDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 20,
  hoverCursor : "default",
  transformInit : {x:911,y:47}
},"toggleInterrogation2MainDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleInterrogation2MainDoorMap,cg.Input.buttons.load2Cell],
  down : () => {
    if (disco.interrogationDoors[2].graphic.isOpen) {
      disco.closeInterrogationMainDoor(2);
    } else {
      disco.openInterrogationMainDoor(2);
    }
  }
},"toggleInterrogation2MainDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 20,
  hoverCursor : "default",
  transformInit : {x:827,y:112}
},"toggleInterrogation3MainDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleInterrogation3MainDoorMap,cg.Input.buttons.load3Cell],
  down : () => {
    if (disco.interrogationDoors[3].graphic.isOpen) {
      disco.closeInterrogationMainDoor(3);
    } else {
      disco.openInterrogationMainDoor(3);
    }
  }
},"toggleInterrogation3MainDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:827,y:209}
},"toggleInterrogation4MainDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleInterrogation4MainDoorMap,cg.Input.buttons.load4Cell],
  down : () => {
    if (disco.interrogationDoors[4].graphic.isOpen) {
      disco.closeInterrogationMainDoor(4);
    } else {
      disco.openInterrogationMainDoor(4);
    }
  }
},"toggleInterrogation4MainDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:1018,y:86}
},"toggleInterrogation1CutDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleInterrogation1CutDoorMap,cg.Input.buttons.load1Cell],
  down : () => {
    if (disco.cutDoors[1].graphic.isOpen) {
      disco.closeInterrogationCutDoor(1);
    } else {
      disco.openInterrogationCutDoor(1);
    }
  }
},"toggleInterrogation1CutDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:924,y:86}
},"toggleInterrogation2CutDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleInterrogation2CutDoorMap,cg.Input.buttons.load2Cell],
  down : () => {
    if (disco.cutDoors[2].graphic.isOpen) {
      disco.closeInterrogationCutDoor(2);
    } else {
      disco.openInterrogationCutDoor(2);
    }
  }
},"toggleInterrogation2CutDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:869,y:126}
},"toggleInterrogation3CutDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleInterrogation3CutDoorMap,cg.Input.buttons.load3Cell],
  down : () => {
    if (disco.cutDoors[3].graphic.isOpen) {
      disco.closeInterrogationCutDoor(3);
    } else {
      disco.openInterrogationCutDoor(3);
    }
  }
},"toggleInterrogation3CutDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:869,y:222}
},"toggleInterrogation4CutDoorMap");

cg.Input.createAction({
  keys : [cg.Input.buttons.toggleInterrogation4CutDoorMap,cg.Input.buttons.load4Cell],
  down : () => {
    if (disco.cutDoors[4].graphic.isOpen) {
      disco.closeInterrogationCutDoor(4);
    } else {
      disco.openInterrogationCutDoor(4);
    }
  }
},"toggleInterrogation4CutDoor");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:1058,y:93}
},"checkAndQueueLoad1Map");

cg.Input.createAction({
  keys : [cg.Input.buttons.checkAndQueueLoad1Map,cg.Input.buttons.load1Vehicles],
  down : () => {
    if (disco.canCheck(1)) {
      disco.check(1);
    }
  }
},"checkLoad1");

cg.Input.createAction({
  keys : [cg.Input.buttons.checkAndQueueLoad1Map,cg.Input.buttons.load1Vehicles],
  down : () => {
    if (disco.canEnqueue(1)) {
      disco.enqueue(1);
    }
  }
},"queueLoad1");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:965,y:93}
},"checkAndQueueLoad2Map");

cg.Input.createAction({
  keys : [cg.Input.buttons.checkAndQueueLoad2Map,cg.Input.buttons.load2Vehicles],
  down : () => {
    if (disco.canCheck(2)) {
      disco.check(2);
    }
  }
},"checkLoad2");

cg.Input.createAction({
  keys : [cg.Input.buttons.checkAndQueueLoad2Map,cg.Input.buttons.load2Vehicles],
  down : () => {
    if (disco.canEnqueue(2)) {
      disco.enqueue(2);
    }
  }
},"queueLoad2");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:877,y:168}
},"checkAndQueueLoad3Map");

cg.Input.createAction({
  keys : [cg.Input.buttons.checkAndQueueLoad3Map,cg.Input.buttons.load3Vehicles],
  down : () => {
    if (disco.canCheck(3)) {
      disco.check(3);
    }
  }
},"checkLoad3");

cg.Input.createAction({
  keys : [cg.Input.buttons.checkAndQueueLoad3Map,cg.Input.buttons.load3Vehicles],
  down : () => {
    if (disco.canEnqueue(3)) {
      disco.enqueue(3);
    }
  }
},"queueLoad3");

cg.Input.createButton({
  type : "circle",
  check : "gameplayMap",
  radius : 22,
  hoverCursor : "default",
  transformInit : {x:877,y:266}
},"checkAndQueueLoad4Map");

cg.Input.createAction({
  keys : [cg.Input.buttons.checkAndQueueLoad4Map,cg.Input.buttons.load4Vehicles],
  down : () => {
    if (disco.canCheck(4)) {
      disco.check(4);
    }
  }
},"checkLoad4");

cg.Input.createAction({
  keys : [cg.Input.buttons.checkAndQueueLoad4Map,cg.Input.buttons.load4Vehicles],
  down : () => {
    if (disco.canEnqueue(4)) {
      disco.enqueue(4);
    }
  }
},"queueLoad4");