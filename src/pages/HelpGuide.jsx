import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  ClipboardCheck,
  Cpu,
  Gauge,
  HelpCircle,
  Plane,
  Radio,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  WifiOff,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";


/* ============================================================
   FAQ HELPER

   This keeps the FAQ database easier to maintain.
   ============================================================ */

function FAQ(
  category,
  question,
  answer,
  tags = [],
  options = {}
) {
  return {
    category,
    question,
    answer,
    tags,
    ...options,
  };
}


/* ============================================================
   FAQ CATEGORIES
   ============================================================ */

const categories = [
  {
    id: "all",
    name: "All Topics",
    icon: CircleHelp,
  },

  {
    id: "getting-started",
    name: "Getting Started",
    icon: Plane,
  },

  {
    id: "cockpit-inspection",
    name: "Cockpit Inspection",
    icon: ClipboardCheck,
  },

  {
    id: "engine-starting",
    name: "Engine Starting",
    icon: Settings,
  },

  {
    id: "before-taxi",
    name: "Before Taxi",
    icon: Plane,
  },

  {
    id: "run-up",
    name: "Run-Up",
    icon: Gauge,
  },

  {
    id: "before-takeoff",
    name: "Before Takeoff",
    icon: Plane,
  },

  {
    id: "after-landing",
    name: "After Landing",
    icon: Plane,
  },

  {
    id: "shutdown",
    name: "Shutdown",
    icon: Settings,
  },

  {
    id: "cockpit-controls",
    name: "Cockpit Controls",
    icon: Settings,
  },

  {
    id: "instruments",
    name: "Gauges & Values",
    icon: Gauge,
  },

  {
    id: "communications",
    name: "ATC Communication",
    icon: Radio,
  },

  {
    id: "grading",
    name: "Scoring & Performance",
    icon: Trophy,
  },

  {
    id: "accounts",
    name: "Student Account",
    icon: UserRound,
  },

  {
    id: "system",
    name: "System & Raspberry Pi",
    icon: Cpu,
  },

  {
    id: "troubleshooting",
    name: "Troubleshooting",
    icon: AlertTriangle,
  },

  {
    id: "safety",
    name: "Training Limitations",
    icon: ShieldCheck,
  },
];


/* ============================================================
   POPULAR SEARCHES
   ============================================================ */

const popularSearches = [
  "engine start",
  "parking brakes",
  "master switch",
  "fuel pump",
  "fuel selector",
  "flaps",
  "trim",
  "voltmeter",
  "RPM",
  "run-up",
  "magnetos",
  "holding point",
  "ATC",
  "callsign",
  "runway 17",
  "29.95",
  "score",
  "shutdown",
  "offline",
];


/* ============================================================
   FAQ DATABASE

   IMPORTANT:
   This database follows the CURRENT CONFIGURED TRAINING
   CHECKLIST supplied for the project.

   Where the checklist is incomplete or ambiguous, the FAQ
   does not invent an aircraft value or procedure.

   Approved checklist / POH / instructor guidance takes
   precedence.
   ============================================================ */

const faqs = [

  /* ==========================================================
     GETTING STARTED
     ========================================================== */

  FAQ(
    "getting-started",

    "How do I start a training session?",

    "Log in using your registered username or Student ID and six-digit PIN. Open Choose Checklist, select the procedure you want to practice, then begin the checklist. The training session is associated with your student profile.",

    [
      "start",
      "training",
      "login",
      "session",
      "checklist",
    ],

    {
      link: "/controls",
      linkLabel: "Open Choose Checklist",
      source: "System Guide",
    }
  ),


  FAQ(
    "getting-started",

    "How do I start a checklist?",

    "Open Choose Checklist and select the Tecnam P2002JF procedure you want to practice. The application will guide you through the configured sequence step by step.",

    [
      "start checklist",
      "procedure",
      "training",
    ],

    {
      link: "/controls",
      linkLabel: "Choose a Checklist",
      source: "System Guide",
    }
  ),


  FAQ(
    "getting-started",

    "Which checklists are included?",

    "The current trainer includes Cockpit Inspection, Engine Starting, Before Taxi, Run-Up, Before Takeoff, After Landing and Engine Shutdown.",

    [
      "procedures",
      "checklists",
      "engine",
      "taxi",
      "shutdown",
    ],

    {
      source: "Tecnam Training Checklist",
    }
  ),


  FAQ(
    "getting-started",

    "Do I need to complete every checklist in one session?",

    "No. The trainer can be used to practice individual available procedures. You can select the checklist you need from the Choose Checklist page.",

    [
      "individual",
      "practice",
      "procedure",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "getting-started",

    "Can I repeat a checklist after finishing it?",

    "Yes. You can start the checklist again as another training attempt. The new attempt can be stored separately so your later performance can be compared with previous sessions.",

    [
      "repeat",
      "retry",
      "restart",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "getting-started",

    "Where can I see what I need to do next?",

    "The active checklist panel displays the current expected action, control position, communication task or touchscreen confirmation. Complete the current requirement before continuing.",

    [
      "next",
      "current step",
      "active step",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "getting-started",

    "What happens when I complete a checklist?",

    "The trainer records the completed procedure and available grading events. When the training session is finalized, its results can be stored under your student profile and reviewed through History and Performance.",

    [
      "complete",
      "finish",
      "result",
    ],

    {
      source: "System Guide",
    }
  ),


  /* ==========================================================
     COCKPIT INSPECTION
     ========================================================== */

  FAQ(
    "cockpit-inspection",

    "What is the first item in the Cockpit Inspection Checklist?",

    "The configured Cockpit Inspection Checklist begins with the parking brakes. The checklist expects the parking brakes to be engaged.",

    [
      "first",
      "parking brakes",
      "cockpit inspection",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What should the parking brakes be during cockpit inspection?",

    "The configured checklist requires the parking brakes to be engaged at the beginning of Cockpit Inspection.",

    [
      "park brakes",
      "engaged",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What does the ARROW document check require?",

    "The checklist instructs the student to check that all required ARROW documents are onboard the aircraft.",

    [
      "arrow",
      "documents",
      "aircraft documents",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What does A.R.R.O.W. mean?",

    "The checklist provided to the trainer requires the ARROW documents to be onboard, but the supplied checklist does not define or expand the acronym. Use the instructor-approved reference or aircraft documentation for the official definition.",

    [
      "arrow meaning",
      "documents",
      "acronym",
    ],

    {
      source: "Cockpit Inspection Checklist",
      warning: false,
    }
  ),


  FAQ(
    "cockpit-inspection",

    "How are the flight controls checked during cockpit inspection?",

    "The checklist describes moving the control stick right and left to check aileron movement, pulling and pushing the stick to check stabilator movement, and checking right and left rudder movement. The expected confirmation is that the flight controls are free and correct.",

    [
      "flight controls",
      "ailerons",
      "stabilator",
      "rudder",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What should happen when the control stick is moved to the right?",

    "According to the configured checklist, with the stick to the right, the right aileron should be up and the left aileron should be down.",

    [
      "stick right",
      "right aileron",
      "left aileron",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What should happen when the control stick is moved to the left?",

    "According to the configured checklist, with the stick to the left, the left aileron should be up and the right aileron should be down.",

    [
      "stick left",
      "ailerons",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What should happen when the control stick is pulled?",

    "The configured checklist states that pulling the stick should result in the stabilators moving up.",

    [
      "stick pull",
      "stabilator",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What should happen when the control stick is pushed?",

    "The configured checklist states that pushing the stick should result in the stabilators moving down.",

    [
      "stick push",
      "stabilator",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What is the expected result of the flight-control check?",

    "The expected checklist confirmation is: Flight Controls Are Free and Correct.",

    [
      "free and correct",
      "flight controls",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What do I do with the throttle friction during cockpit inspection?",

    "The configured checklist requires the throttle friction to be adjusted.",

    [
      "throttle friction",
      "friction adjust",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What should I check on the circuit breakers?",

    "The checklist requires all circuit breakers to be in.",

    [
      "circuit breakers",
      "all in",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "When is the Master Switch turned on?",

    "During Cockpit Inspection, the configured checklist instructs the student to turn the Master Switch on before continuing with the electrical and fuel-system checks.",

    [
      "master switch",
      "on",
      "cockpit inspection",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What happens when the electric fuel pump is turned on during cockpit inspection?",

    "The checklist instructs the student to turn the electric fuel pump on and check the fuel-pressure indication. The expected training confirmation is that fuel pressure is increasing.",

    [
      "electric fuel pump",
      "fuel pressure",
      "increasing",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "Do I turn the electric fuel pump back off during cockpit inspection?",

    "Yes. After the configured fuel-pressure check, the Cockpit Inspection Checklist includes turning the electric fuel pump off.",

    [
      "fuel pump off",
      "electric fuel pump",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "How are the flaps checked during cockpit inspection?",

    "The checklist first calls for a full-flap check, including checking the right and left wings, and then deploying the flaps to the takeoff position for another check.",

    [
      "flaps",
      "full",
      "takeoff",
      "t/o",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What position should the flaps be left in after the cockpit-inspection flap check?",

    "The configured checklist calls for the flaps to be deployed to the Take Off position after the full-flap check.",

    [
      "flaps",
      "take off",
      "position",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What position should the trim be in?",

    "The Cockpit Inspection Checklist requires the trim to be checked in the Neutral position.",

    [
      "trim",
      "neutral",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What fuel quantity does the current checklist show?",

    "The supplied checklist states 50 liters on the right wing and 50 liters on the left wing for the fuel-quantity check.",

    [
      "fuel quantity",
      "50 liters",
      "left wing",
      "right wing",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "Which fuel tank should the Fuel Selector be set to during cockpit inspection?",

    "The supplied checklist says to switch the fuel-feeding tank to the 'less tank' and shows 'LEFT TANK CHECK' as its output. Because those instructions may depend on the actual fuel condition and the wording is potentially ambiguous, the final trainer behavior should follow the instructor-approved configuration.",

    [
      "fuel selector",
      "less tank",
      "left tank",
    ],

    {
      source: "Cockpit Inspection Checklist",
      warning: true,
    }
  ),


  FAQ(
    "cockpit-inspection",

    "Why does the trainer ask about the less tank and left tank?",

    "That wording comes from the supplied checklist. It states 'less tank' in the procedure while the output says 'LEFT TANK CHECK.' The trainer should not independently resolve that ambiguity. The final expected position must be confirmed by the instructor/client.",

    [
      "less tank",
      "left tank",
      "fuel selector ambiguity",
    ],

    {
      source: "Cockpit Inspection Checklist",
      warning: true,
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What do I do with the seat during cockpit inspection?",

    "The checklist requires the seat to be adjusted.",

    [
      "seat",
      "adjust",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What do I do with the seatbelt and shoulder harness?",

    "The checklist requires the seatbelt and shoulder harness to be fastened.",

    [
      "seatbelt",
      "shoulder harness",
      "fastened",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "When do I turn the Avionics Master on during cockpit inspection?",

    "After the seat and harness items, the configured checklist calls for the Avionics Master to be turned on.",

    [
      "avionics master",
      "on",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "When do I turn the intercom on?",

    "The Cockpit Inspection Checklist calls for the intercom to be turned on before the radio communication sequence.",

    [
      "intercom",
      "on",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "When do I turn the radio on?",

    "The Cockpit Inspection Checklist calls for the radio to be turned on before making the initial Binalonan Radio call.",

    [
      "radio",
      "on",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  FAQ(
    "cockpit-inspection",

    "What happens after the engine-start communication during cockpit inspection?",

    "After completing the configured engine-start communication exchange, the checklist calls for the radio to be turned off, followed by the intercom and Avionics Master being turned off.",

    [
      "radio off",
      "intercom off",
      "avionics off",
    ],

    {
      source: "Cockpit Inspection Checklist",
    }
  ),


  /* ==========================================================
     ENGINE STARTING
     ========================================================== */

  FAQ(
    "engine-starting",

    "What is the first step of the Engine Starting Checklist?",

    "The configured Engine Starting Checklist begins by starting the chronometer or clock.",

    [
      "chronometer",
      "clock",
      "engine start",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What voltage should the voltmeter show before engine start?",

    "The supplied Engine Starting Checklist instructs the student to check for 12 volts.",

    [
      "voltmeter",
      "12 volts",
      "12v",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "Where will I see the 12-volt reading if the physical voltmeter does not work?",

    "In this trainer, the required voltmeter value can be shown on the touchscreen because the physical gauges are not required to operate. The touchscreen value represents the configured training condition.",

    [
      "12 volt",
      "touchscreen",
      "physical gauge",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "engine-starting",

    "What should the ammeter indicate before engine start?",

    "The supplied checklist identifies the ammeter check as 'Ammeter on Standby.' The trainer should display or confirm that configured condition.",

    [
      "ammeter",
      "standby",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What should the throttle be set to before starting the engine?",

    "The Engine Starting Checklist requires the throttle to be at Idle.",

    [
      "throttle",
      "idle",
      "engine start",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "How is throttle idle represented in this trainer?",

    "The current hardware design uses RPM or throttle-condition preset buttons rather than a continuously variable analog throttle. The student selects the configured Idle condition when the checklist requires throttle idle.",

    [
      "idle button",
      "rpm",
      "throttle",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "engine-starting",

    "What should I do with the choke before engine start?",

    "The supplied checklist states 'Choke — As needed.' The exact use of choke should follow the instructor-approved procedure configured for the trainer.",

    [
      "choke",
      "as needed",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "Which fuel tank is selected during Engine Starting?",

    "The supplied Engine Starting Checklist states 'Fuel selector valve, left tank check' and uses 'LEFT TANK CHECK' as the expected output.",

    [
      "fuel selector",
      "left tank",
      "engine start",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What should happen when the electric fuel pump is turned on during engine start?",

    "The checklist requires the electric fuel pump to be turned on and expects fuel pressure to be increasing.",

    [
      "fuel pump",
      "fuel pressure increasing",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What do I check before engaging the starter?",

    "The checklist includes a propeller-area check of left, front and right, with the expected confirmation that the propeller area is clear.",

    [
      "prop clear",
      "propeller",
      "left front right",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "When are the navigation and strobe lights turned on?",

    "The configured Engine Starting Checklist calls for the navigation light and strobe light to be turned on before the ignition-start action.",

    [
      "nav light",
      "strobe",
      "engine start",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "How does the ignition-start step work in the trainer?",

    "The supplied checklist describes moving the ignition switch through its configured positions and then to Start while holding the required throttle condition. The trainer should follow the implemented switch sequence exactly as approved by the instructor.",

    [
      "ignition",
      "start",
      "left",
      "right",
      "both",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "Will the trainer play an engine-start sound?",

    "The checklist identifies the point where the engine start-up sound begins. The simulator may use an audio effect at that stage to provide training feedback.",

    [
      "engine sound",
      "startup sound",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What oil pressure is checked immediately after engine start?",

    "The supplied checklist calls for an oil-pressure indication of 4 bars and identifies it as being in the green range.",

    [
      "oil pressure",
      "4 bars",
      "green",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "Will the physical oil-pressure gauge show 4 bars?",

    "No physical gauge movement is required under the current project scope. The trainer may display the configured 4-bar oil-pressure condition on the touchscreen for the checklist confirmation.",

    [
      "oil pressure",
      "physical gauge",
      "4 bars",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "engine-starting",

    "What does the Choke Off step mean?",

    "The supplied checklist contains a 'Choke Off' step but its associated wording refers to signaling the AMT to remove 'chokes from the tire.' Because that wording is ambiguous, the trainer should not invent an interpretation. The final action should be confirmed by the instructor/client.",

    [
      "choke off",
      "amt",
      "tire",
      "ambiguous",
    ],

    {
      source: "Engine Starting Checklist",
      warning: true,
    }
  ),


  FAQ(
    "engine-starting",

    "When is the Generator switched on?",

    "After the oil-pressure and configured Choke Off step, the Engine Starting Checklist calls for the Generator switch to be turned on.",

    [
      "generator",
      "on",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What should the ammeter show after the Generator is turned on?",

    "The supplied checklist requires the ammeter to indicate charging and identifies the ammeter as being in the green.",

    [
      "ammeter",
      "charging",
      "green",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What voltage should be checked after the Generator is on?",

    "The Engine Starting Checklist calls for a 14-volt voltmeter indication and identifies it as being in the green.",

    [
      "14v",
      "14 volts",
      "voltmeter",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What should I check on the engine instruments after start?",

    "The supplied checklist requires the engine instruments and suction gauge to be checked and confirmed in the green.",

    [
      "engine instruments",
      "suction gauge",
      "green",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What RPM should be selected after the initial engine checks?",

    "The supplied Engine Starting Checklist calls for the throttle to be set to 1,000 to 1,200 RPM.",

    [
      "1000",
      "1200",
      "rpm",
      "engine start",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "How will 1,000 to 1,200 RPM work with the trainer's RPM buttons?",

    "The trainer uses preset RPM conditions instead of a continuously variable throttle. The final button or buttons representing the 1,000-to-1,200 RPM condition must follow the client/instructor-approved hardware configuration.",

    [
      "1000",
      "1200",
      "rpm buttons",
    ],

    {
      source: "Trainer Implementation",
      warning: true,
    }
  ),


  FAQ(
    "engine-starting",

    "When is the electric fuel pump turned off after engine start?",

    "After the configured 1,000-to-1,200 RPM step, the checklist calls for the electric fuel pump to be turned off.",

    [
      "fuel pump off",
      "engine start",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "engine-starting",

    "What should the fuel pressure indicate after the electric fuel pump is turned off?",

    "The Engine Starting Checklist requires the fuel pressure to be checked and confirmed in the green. No numeric fuel-pressure range is stated at this specific engine-starting step in the supplied checklist.",

    [
      "fuel pressure",
      "green",
      "engine starting",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  /* ==========================================================
     BEFORE TAXI
     ========================================================== */

  FAQ(
    "before-taxi",

    "What is the first step of the Before Taxi Checklist?",

    "The configured Before Taxi Checklist begins by turning the Avionics Master on.",

    [
      "before taxi",
      "avionics master",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "Should the intercom be on before taxi?",

    "Yes. The Before Taxi Checklist requires the intercom to be on.",

    [
      "intercom",
      "before taxi",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What do I do with the radios and VOR before taxi?",

    "The supplied checklist requires all radios and VOR to be on and set.",

    [
      "radio",
      "vor",
      "on and set",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What position should the transponder be in before taxi?",

    "The Before Taxi Checklist requires the transponder to be set to Standby.",

    [
      "transponder",
      "standby",
      "stby",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What do I do with the GPS before taxi?",

    "The supplied checklist requires the GPS to be on and set.",

    [
      "gps",
      "on",
      "set",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "Which aircraft instruments are checked before taxi?",

    "The supplied checklist includes the airspeed indicator, attitude indicator, altimeter, vertical-speed indicator, heading indicator, magnetic compass reference, and turn coordinator.",

    [
      "aircraft instruments",
      "airspeed",
      "attitude",
      "altimeter",
      "vsi",
      "heading",
      "turn coordinator",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What should the airspeed indicator show before taxi?",

    "The checklist states that the airspeed indicator should be at 0.",

    [
      "airspeed indicator",
      "zero",
      "0",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What should the attitude indicator show before taxi?",

    "The supplied checklist states that the attitude indicator should be aligned with the artificial horizon.",

    [
      "attitude indicator",
      "artificial horizon",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What should the altimeter show during the Before Taxi instrument check?",

    "The supplied training checklist states that the altimeter should be at 0 for this configured checklist check.",

    [
      "altimeter",
      "0",
      "zero",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What should the vertical speed indicator show before taxi?",

    "The supplied checklist states that the vertical speed indicator should be at 0.",

    [
      "vertical speed",
      "vsi",
      "zero",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What should the heading indicator be compared with?",

    "The supplied checklist states that the heading indicator should be aligned with the magnetic compass.",

    [
      "heading indicator",
      "magnetic compass",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What should the turn coordinator show before taxi?",

    "The checklist states that the turn coordinator should show wings level with the ball centered.",

    [
      "turn coordinator",
      "wings level",
      "ball centered",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "Will these aircraft-instrument values be shown on physical gauges?",

    "Not necessarily. The current project does not require the physical gauges to function. Required training indications can be displayed or confirmed through the touchscreen.",

    [
      "instruments",
      "physical gauges",
      "touchscreen",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "before-taxi",

    "When should the landing light be on before taxi?",

    "The supplied checklist indicates the landing light should be on if visibility is poor and may remain in the configured standby condition otherwise.",

    [
      "landing light",
      "poor visibility",
      "standby",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What happens after receiving taxi clearance?",

    "After the taxi communication exchange, the checklist includes a brake-check call, release of the parking brakes, and a braking procedure before taxiing to the run-up area.",

    [
      "taxi clearance",
      "brake check",
      "parking brakes",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What should I say before checking the brakes?",

    "The supplied checklist includes the student call: 'Brakes check, Capt.' before releasing the parking brakes and performing the brake check.",

    [
      "brakes check",
      "capt",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What happens during the brake check?",

    "The supplied checklist describes releasing the brakes, keeping the heels on the floor, applying a little power, allowing the aircraft to move, returning power to idle, applying back pressure and brakes, then confirming the brakes are good and checking with the Captain.",

    [
      "brake check",
      "heels on floor",
      "power",
      "captain",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  FAQ(
    "before-taxi",

    "What does 'My controls' and 'Your controls' mean in the trainer?",

    "The supplied checklist contains a Captain/Student exchange of 'MY CONTROLS' followed by 'YOUR CONTROLS.' The simulator should present that exchange according to the configured training sequence. Instructor guidance should be used for its operational meaning and execution.",

    [
      "my controls",
      "your controls",
      "captain",
    ],

    {
      source: "Before Taxi Checklist",
    }
  ),


  /* ==========================================================
     RUN-UP
     ========================================================== */

  FAQ(
    "run-up",

    "What is the first step of the Run-Up Checklist?",

    "The Run-Up Checklist begins with the parking brakes engaged.",

    [
      "run-up",
      "parking brakes",
      "engaged",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What oil-temperature range is shown in the Run-Up Checklist?",

    "The supplied checklist specifies an oil-temperature check of 50 to 110 degrees Celsius and identifies it as being in the green.",

    [
      "oil temperature",
      "50",
      "110",
      "celsius",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What is the maximum cylinder-head-temperature value in the checklist?",

    "The supplied Run-Up Checklist states a maximum cylinder heat temperature of 135 degrees Celsius.",

    [
      "cht",
      "cylinder head",
      "135",
      "temperature",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What oil-pressure range is checked during run-up?",

    "The supplied Run-Up Checklist specifies an oil-pressure range of 2 to 5 bars and identifies it as being in the green.",

    [
      "oil pressure",
      "2 to 5",
      "bars",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What fuel-pressure range is checked during run-up?",

    "The supplied Run-Up Checklist specifies a fuel-pressure range of 2.2 to 5.8 PSI and identifies it as being in the green.",

    [
      "fuel pressure",
      "2.2",
      "5.8",
      "psi",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "How will the Run-Up engine values be displayed?",

    "Because the current project does not require the physical gauges to move, the touchscreen may display the configured oil temperature, cylinder-head temperature, oil pressure and fuel-pressure values or conditions needed for training confirmation.",

    [
      "run-up values",
      "touchscreen",
      "gauges",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "run-up",

    "What happens during the Generator Light check?",

    "The supplied checklist describes switching the Generator off and checking that the alternator light is on and the ammeter is discharging, then switching the Generator back on and checking that the alternator light is off and the ammeter is charging.",

    [
      "generator light",
      "alternator",
      "ammeter",
      "charging",
      "discharging",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "Which fuel tank is selected during run-up?",

    "The supplied checklist instructs the student to choose the fullest tank, but first to turn on the electric fuel pump.",

    [
      "fullest tank",
      "fuel selector",
      "fuel pump",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What RPM is required before the ignition or magneto check?",

    "The supplied Run-Up Checklist specifies 1,640 RPM before the ignition-switch check.",

    [
      "1640",
      "rpm",
      "run-up",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "Will there be a 1,640 RPM button?",

    "The physical trainer uses preset RPM controls. Because the Run-Up Checklist requires 1,640 RPM, the final hardware should provide an approved way to select that condition. The exact button layout must be confirmed before final wiring.",

    [
      "1640 rpm button",
      "run-up button",
      "throttle",
    ],

    {
      source: "Trainer Implementation",
      warning: true,
    }
  ),


  FAQ(
    "run-up",

    "How is the ignition or magneto check performed in the supplied checklist?",

    "The checklist describes checking the right magnetos, returning to Both, checking the left magnetos and returning to Both. It also states a maximum RPM drop of 40 and a difference of none. The final trainer implementation should follow the instructor-approved sequence because the exact switch-click wording in the supplied checklist should be validated before final use.",

    [
      "magneto",
      "ignition",
      "rpm drop",
      "40",
      "both",
    ],

    {
      source: "Run-Up Checklist",
      warning: true,
    }
  ),


  FAQ(
    "run-up",

    "What is the maximum RPM drop during the configured magneto check?",

    "The supplied checklist states a maximum RPM drop of 40. This value should remain subject to final instructor validation before the trainer is treated as an approved training reference.",

    [
      "rpm drop",
      "40",
      "magneto",
    ],

    {
      source: "Run-Up Checklist",
      warning: true,
    }
  ),


  FAQ(
    "run-up",

    "What does the checklist require for Carburetor Heat during run-up?",

    "The supplied Run-Up Checklist includes a Carburetor Heat check. The source does not provide additional detail in that row, so the trainer should follow the instructor-approved implementation rather than inventing additional procedure.",

    [
      "carb heat",
      "carburetor heat",
      "check",
    ],

    {
      source: "Run-Up Checklist",
      warning: true,
    }
  ),


  FAQ(
    "run-up",

    "What happens at Full Power during run-up?",

    "The supplied checklist instructs the student to apply full power, check static RPM, and confirm the engine instruments and suction gauge are in the green.",

    [
      "full power",
      "static rpm",
      "engine instruments",
      "suction gauge",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What static RPM should be displayed at Full Power?",

    "The supplied checklist contains a blank for the Full Power static RPM value. Because no value is provided, the trainer should not invent one. The correct training value must be supplied or approved by the instructor/client before implementation.",

    [
      "static rpm",
      "full power",
      "blank",
    ],

    {
      source: "Run-Up Checklist",
      warning: true,
    }
  ),


  FAQ(
    "run-up",

    "What happens when throttle is returned to Idle during run-up?",

    "The supplied checklist calls for power to Idle and includes checking for unusual engine vibration, with the expected result being no unusual engine vibration.",

    [
      "idle",
      "vibration",
      "run-up",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What static RPM should be shown at Idle during run-up?",

    "The supplied checklist also contains a blank static-RPM value at the Idle step. The trainer should not invent this value. It must be confirmed by the instructor/client if it is required in the final system.",

    [
      "idle static rpm",
      "blank",
      "rpm",
    ],

    {
      source: "Run-Up Checklist",
      warning: true,
    }
  ),


  FAQ(
    "run-up",

    "What RPM is selected after the Idle check?",

    "The supplied Run-Up Checklist calls for power to be returned to 1,000 RPM.",

    [
      "1000 rpm",
      "power back",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What happens to the friction lock after the RPM checks?",

    "The Run-Up Checklist requires the friction lock to be set.",

    [
      "friction lock",
      "set",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  FAQ(
    "run-up",

    "What happens to the parking brakes before taxiing to the holding point?",

    "After completing the configured run-up items, the checklist requires the parking brakes to be released before the communication and taxi to Holding Point 17.",

    [
      "parking brakes",
      "release",
      "holding point",
    ],

    {
      source: "Run-Up Checklist",
    }
  ),


  /* ==========================================================
     BEFORE TAKEOFF
     ========================================================== */

  FAQ(
    "before-takeoff",

    "What is the first step of the Before Takeoff Checklist?",

    "The configured Before Takeoff Checklist begins by engaging the parking brakes.",

    [
      "before takeoff",
      "parking brakes",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "What position should the transponder be in before takeoff?",

    "The supplied checklist requires the transponder to be set to ALT.",

    [
      "transponder",
      "alt",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "Should the landing lights be on before takeoff?",

    "The supplied Before Takeoff Checklist requires the landing lights to be on.",

    [
      "landing light",
      "on",
      "before takeoff",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "What flap position is checked before takeoff?",

    "The supplied checklist requires the flaps to be checked in the Take Off position, including right-wing and left-wing checks.",

    [
      "flaps",
      "t/o",
      "take off",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "Should the electric fuel pump be on before takeoff?",

    "The supplied Before Takeoff Checklist calls for the electric fuel pump to be on.",

    [
      "fuel pump",
      "before takeoff",
      "on",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "What position should Carburetor Heat be in before takeoff?",

    "The supplied checklist specifies Carburetor Heat OFF.",

    [
      "carb heat",
      "off",
      "before takeoff",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "Are the flight controls checked again before takeoff?",

    "Yes. The Before Takeoff Checklist again includes checking the ailerons, stabilators and rudders, with the expected confirmation that the flight controls are free and correct.",

    [
      "flight controls",
      "before takeoff",
      "free and correct",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "What should the trim position be before takeoff?",

    "The supplied checklist requires the trim to be Neutral.",

    [
      "trim",
      "neutral",
      "before takeoff",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "What should I do with the seatbelt and harness before takeoff?",

    "The supplied checklist requires the seatbelt and harness to be adjusted and fastened.",

    [
      "seatbelt",
      "harness",
      "fastened",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "What should the canopy position be before takeoff?",

    "The supplied checklist requires the canopy to be closed.",

    [
      "canopy",
      "closed",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  FAQ(
    "before-takeoff",

    "When are the parking brakes released before line-up?",

    "The supplied checklist states that the parking brakes are released after reporting, before taxiing to Runway 17.",

    [
      "parking brakes",
      "release",
      "line up",
    ],

    {
      source: "Before Takeoff Checklist",
    }
  ),


  /* ==========================================================
     AFTER LANDING
     ========================================================== */

  FAQ(
    "after-landing",

    "What happens to the transponder after landing?",

    "The supplied After Landing Checklist requires the transponder to be set to Standby.",

    [
      "transponder",
      "standby",
      "after landing",
    ],

    {
      source: "After Landing Checklist",
    }
  ),


  FAQ(
    "after-landing",

    "What happens to the landing light after landing?",

    "The supplied After Landing Checklist shows the landing light as ON.",

    [
      "landing light",
      "after landing",
    ],

    {
      source: "After Landing Checklist",
    }
  ),


  FAQ(
    "after-landing",

    "What happens to the flaps after landing?",

    "The supplied checklist requires the flaps to be retracted to UP.",

    [
      "flaps",
      "up",
      "retract",
    ],

    {
      source: "After Landing Checklist",
    }
  ),


  FAQ(
    "after-landing",

    "What happens to the electric fuel pump after landing?",

    "The After Landing Checklist requires the electric fuel pump to be turned off.",

    [
      "fuel pump",
      "off",
      "after landing",
    ],

    {
      source: "After Landing Checklist",
    }
  ),


  /* ==========================================================
     SHUTDOWN
     ========================================================== */

  FAQ(
    "shutdown",

    "What is the first step of the Engine Shutdown Checklist?",

    "The supplied Shutdown Checklist begins with the parking brakes engaged.",

    [
      "shutdown",
      "parking brakes",
      "engaged",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "What RPM condition is required before shutting the engine down?",

    "The supplied checklist states that the engine should remain running at 1,000 to 1,200 RPM for one minute before continuing with shutdown.",

    [
      "shutdown",
      "1000",
      "1200",
      "one minute",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "Why does the checklist keep the engine at 1,000 to 1,200 RPM for one minute?",

    "The supplied checklist states that this is done to reduce what it calls 'LA-TENT HEAT.' The checklist does not further define that wording. The exact technical explanation should therefore come from the instructor-approved aircraft documentation rather than being invented by the FAQ.",

    [
      "latent heat",
      "la-tent heat",
      "one minute",
      "rpm",
    ],

    {
      source: "Engine Shutdown Checklist",
      warning: true,
    }
  ),


  FAQ(
    "shutdown",

    "What happens to the throttle after the one-minute shutdown period?",

    "The supplied checklist then requires power to be reduced to Idle.",

    [
      "throttle",
      "idle",
      "shutdown",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "When are the radios turned off during shutdown?",

    "After the throttle is set to Idle, the supplied checklist calls for all radios to be turned off.",

    [
      "radio off",
      "shutdown",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "When is the intercom turned off during shutdown?",

    "The checklist calls for the intercom to be turned off after the radios.",

    [
      "intercom",
      "off",
      "shutdown",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "When is the Avionics Master turned off?",

    "The Engine Shutdown Checklist requires the Avionics Master to be turned off after the radio and intercom shutdown items.",

    [
      "avionics master",
      "off",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "What position should the transponder be in during shutdown?",

    "The supplied Shutdown Checklist requires the transponder to be set to OFF.",

    [
      "transponder",
      "off",
      "shutdown",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "When is the GPS turned off?",

    "The Engine Shutdown Checklist calls for the GPS to be turned off after the transponder.",

    [
      "gps",
      "off",
      "shutdown",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "How does the ignition-switch shutdown sequence work?",

    "The supplied checklist describes placing the key at Both, waiting three seconds, moving to Left and waiting three seconds, moving to Right and waiting three seconds, and then turning the ignition completely Off.",

    [
      "ignition",
      "both",
      "left",
      "right",
      "3 seconds",
      "off",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "Does the trainer enforce the three-second ignition waits?",

    "The checklist contains three-second waits in the shutdown ignition sequence. Whether those waits are implemented as enforced timers or displayed instructions depends on the final trainer configuration.",

    [
      "3 seconds",
      "timer",
      "ignition",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "shutdown",

    "When are the navigation and strobe lights turned off?",

    "The Shutdown Checklist calls for the navigation and strobe lights to be turned off after the ignition-switch shutdown step.",

    [
      "nav light",
      "strobe",
      "off",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "When is the Generator turned off?",

    "The supplied Shutdown Checklist requires the Generator switch to be turned off after the navigation and strobe lights.",

    [
      "generator",
      "off",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "When is the Master Switch turned off?",

    "The supplied Shutdown Checklist requires the Master Switch to be turned off after the Generator.",

    [
      "master switch",
      "off",
      "shutdown",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "What position should the Fuel Selector be in after shutdown?",

    "The supplied checklist requires the Fuel Selector Valve to be switched to OFF.",

    [
      "fuel selector",
      "off",
      "shutdown",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "What happens to the chronometer at the end of shutdown?",

    "The supplied checklist requires the chronometer or clock to be stopped.",

    [
      "chronometer",
      "clock",
      "stop",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  FAQ(
    "shutdown",

    "What is the final parking-brake action in the supplied shutdown checklist?",

    "The final listed item requires the parking brakes to be released.",

    [
      "parking brakes",
      "release",
      "final step",
    ],

    {
      source: "Engine Shutdown Checklist",
    }
  ),


  /* ==========================================================
     PHYSICAL COCKPIT CONTROLS
     ========================================================== */

  FAQ(
    "cockpit-controls",

    "How do the physical switches communicate with the trainer?",

    "Supported switches and buttons are connected to the Raspberry Pi through GPIO or an I/O expansion interface. The detected state is passed to the same checklist-validation logic used by the application.",

    [
      "physical",
      "gpio",
      "switch",
      "raspberry pi",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "cockpit-controls",

    "Do physical switches and touchscreen controls use the same checklist logic?",

    "Yes. The architecture is designed so supported physical and virtual controls use the same logical control IDs and checklist-validation path wherever practical.",

    [
      "same logic",
      "touchscreen",
      "physical",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "cockpit-controls",

    "What happens if I move the wrong physical switch?",

    "If the active checklist expects another action, the attempt can be recorded as incorrect or out of sequence depending on the configured checklist rule.",

    [
      "wrong switch",
      "incorrect",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "cockpit-controls",

    "What happens if I move the correct switch too early?",

    "The control may be correct but still be recorded as out of sequence if it is performed before the expected checklist step.",

    [
      "early",
      "sequence",
      "out of order",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "cockpit-controls",

    "Can I use the touchscreen instead of every physical control?",

    "During development, virtual controls may be used for testing. In the final cockpit, mapped physical controls should normally be used for their corresponding steps. Touchscreen confirmation remains appropriate for conditions that cannot be physically detected.",

    [
      "touchscreen",
      "physical control",
      "virtual",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "cockpit-controls",

    "What controls are expected to be physical?",

    "The project can use toggle switches, push buttons, rotary or multi-position selectors, position switches and RPM preset buttons for controls included in the approved hardware map.",

    [
      "toggle",
      "push button",
      "rotary",
      "selector",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "cockpit-controls",

    "Does the trainer include every control found in a real Tecnam P2002JF?",

    "No. The prototype implements the controls required by the agreed training checklist and physical cockpit design. It is not intended to reproduce every aircraft system.",

    [
      "all controls",
      "real aircraft",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "cockpit-controls",

    "How does the throttle work in this trainer?",

    "The current project uses physical preset buttons for the RPM conditions required by the checklist instead of continuously measuring an analog throttle position.",

    [
      "throttle",
      "rpm",
      "buttons",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "cockpit-controls",

    "Why are RPM buttons used instead of an analog throttle?",

    "The prototype focuses on procedural training. Preset RPM controls make it possible to validate required RPM conditions without implementing a continuously variable mechanical throttle sensor.",

    [
      "rpm buttons",
      "analog throttle",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "cockpit-controls",

    "Which RPM presets may be required?",

    "The supplied checklist includes Idle, 1,000 RPM, a 1,000-to-1,200 RPM range, and 1,640 RPM, as well as Full Power. The final hardware button layout should be approved against the final checklist before wiring is finalized.",

    [
      "idle",
      "1000",
      "1200",
      "1640",
      "full power",
    ],

    {
      source: "Trainer Implementation",
      warning: true,
    }
  ),


  /* ==========================================================
     GAUGES & VALUES
     ========================================================== */

  FAQ(
    "instruments",

    "Do the physical gauges work?",

    "No. The existing physical gauges are not required to move or provide live values under the current project scope.",

    [
      "gauges",
      "physical gauges",
      "working",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "instruments",

    "Will the physical gauge needles move?",

    "No. Servo-driven, motorized or electronically moving physical gauge needles are outside the current scope.",

    [
      "needle",
      "servo",
      "gauge",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "instruments",

    "Where will I see voltage, pressure, temperature and RPM values?",

    "Checklist values that cannot be physically detected can be displayed on the touchscreen as training values or conditions.",

    [
      "voltage",
      "pressure",
      "temperature",
      "rpm",
      "screen",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "instruments",

    "Are touchscreen gauge values live aircraft measurements?",

    "No, not unless a specific real sensor has been installed and integrated. The current trainer primarily uses configured simulated/training values.",

    [
      "live",
      "sensor",
      "simulated",
    ],

    {
      source: "Trainer Implementation",
    }
  ),


  FAQ(
    "instruments",

    "Can the system display 12 volts and 14 volts at different checklist stages?",

    "Yes. The supplied checklist calls for 12 volts early in Engine Starting and 14 volts after the Generator is on. The touchscreen can present the appropriate configured value for the active checklist step.",

    [
      "12v",
      "14v",
      "voltmeter",
    ],

    {
      source: "Engine Starting Checklist",
    }
  ),


  FAQ(
    "instruments",

    "Why is fuel pressure sometimes numeric and sometimes only shown as green?",

    "The supplied checklist uses different requirements at different stages. Engine Starting includes a general fuel-pressure-increasing or green confirmation, while Run-Up provides a numeric range of 2.2 to 5.8 PSI.",

    [
      "fuel pressure",
      "green",
      "2.2",
      "5.8",
    ],

    {
      source: "Tecnam Training Checklist",
    }
  ),


  /* ==========================================================
     ATC COMMUNICATION - EXACT CHECKLIST COMMUNICATIONS
     ========================================================== */

  FAQ(
    "communications",

    "What is the first radio call in the checklist?",

    "The supplied checklist uses: 'Binalonan Radio, RP-C1234, Good Morning.'",

    [
      "first call",
      "binalonan radio",
      "good morning",
      "rpc1234",
    ],

    {
      source: "Cockpit Inspection Communication",
    }
  ),


  FAQ(
    "communications",

    "What does the Tower reply to the initial radio call?",

    "The supplied checklist Tower response is: 'RP-C1234, Good morning, go ahead.'",

    [
      "tower",
      "go ahead",
      "good morning",
    ],

    {
      source: "Cockpit Inspection Communication",
    }
  ),


  FAQ(
    "communications",

    "How do I request engine startup?",

    "The supplied checklist uses: 'Binalonan Radio RP-C1234, request for engine start up.'",

    [
      "engine start request",
      "startup",
      "binalonan",
    ],

    {
      source: "Cockpit Inspection Communication",
    }
  ),


  FAQ(
    "communications",

    "What does the Tower say after the engine-start request?",

    "The configured response is: 'RP-C1234, Runway 17 in use, altimeter setting 29.95, startup approved.'",

    [
      "startup approved",
      "runway 17",
      "29.95",
    ],

    {
      source: "Cockpit Inspection Communication",
    }
  ),


  FAQ(
    "communications",

    "What is the expected engine-start readback?",

    "The supplied checklist uses: 'Runway 17 in use, altimeter setting 29.95, may start up, RP-C1234.'",

    [
      "readback",
      "runway 17",
      "29.95",
      "may start up",
    ],

    {
      source: "Cockpit Inspection Communication",
    }
  ),


  FAQ(
    "communications",

    "Is 'Good Morning' required in the initial call?",

    "The supplied checklist includes 'Good Morning' in the initial student call. Whether it is treated as required or optional by grading should follow the final communication-validator configuration and instructor approval.",

    [
      "good morning",
      "optional",
      "required",
    ],

    {
      source: "Cockpit Inspection Communication",
      warning: true,
    }
  ),


  FAQ(
    "communications",

    "What is the taxi request from the ramp?",

    "The supplied checklist uses: 'Binalonan Radio RP-C1234, at ramp, request to taxi to run-up area.'",

    [
      "taxi",
      "ramp",
      "run-up area",
    ],

    {
      source: "Before Taxi Communication",
    }
  ),


  FAQ(
    "communications",

    "What does the Tower reply to the ramp taxi request?",

    "The supplied Tower response is: 'RP-C1234, may taxi to run-up area.'",

    [
      "may taxi",
      "run-up area",
    ],

    {
      source: "Before Taxi Communication",
    }
  ),


  FAQ(
    "communications",

    "What is the expected taxi readback to the run-up area?",

    "The supplied checklist uses: 'May taxi to run-up area, RP-C1234.'",

    [
      "taxi readback",
      "run-up area",
      "callsign",
    ],

    {
      source: "Before Taxi Communication",
    }
  ),


  FAQ(
    "communications",

    "What do I say when requesting taxi from the run-up area to Holding Point 17?",

    "The supplied checklist uses: 'Binalonan Radio RP-C1234, at run-up area, request taxi to holding point 17.'",

    [
      "holding point 17",
      "run-up area",
      "request taxi",
    ],

    {
      source: "Run-Up Communication",
    }
  ),


  FAQ(
    "communications",

    "What does the Tower reply when taxi to Holding Point 17 is approved?",

    "The supplied response is: 'RP-C1234, may taxi to holding point 17.'",

    [
      "holding point 17",
      "may taxi",
    ],

    {
      source: "Run-Up Communication",
    }
  ),


  FAQ(
    "communications",

    "What is the readback for taxi to Holding Point 17?",

    "The supplied checklist uses: 'May taxi to holding point 17, RP-C1234.'",

    [
      "holding point readback",
      "17",
      "callsign",
    ],

    {
      source: "Run-Up Communication",
    }
  ),


  FAQ(
    "communications",

    "What do I say when ready to line up?",

    "The supplied checklist uses: 'Binalonan radio RP-C1234, at holding point 17, request to line up.'",

    [
      "line up",
      "holding point 17",
      "request",
    ],

    {
      source: "Before Takeoff Communication",
    }
  ),


  FAQ(
    "communications",

    "What does the Tower say when line-up is approved?",

    "The supplied Tower response is: 'RP-C1234, may line up runway 17.'",

    [
      "may line up",
      "runway 17",
    ],

    {
      source: "Before Takeoff Communication",
    }
  ),


  FAQ(
    "communications",

    "What is the expected line-up readback?",

    "The supplied checklist uses: 'May line up runway 17, RP-C1234.'",

    [
      "line up readback",
      "runway 17",
      "callsign",
    ],

    {
      source: "Before Takeoff Communication",
    }
  ),


  /* ==========================================================
     ATC SYSTEM BEHAVIOR
     ========================================================== */

  FAQ(
    "communications",

    "How does the AI-assisted ATC system work?",

    "The student holds Push-to-Talk and speaks through the microphone. Offline AI speech recognition converts the audio into text. The communication validator checks required content and critical values, then the Tower produces the configured response or clarification.",

    [
      "ai",
      "atc",
      "whisper",
      "speech recognition",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "communications",

    "Is the ATC really using AI?",

    "Yes. The speech-recognition stage uses an AI model. The transcript is then passed to deterministic communication-validation rules so important aviation values are checked consistently.",

    [
      "ai",
      "speech",
      "whisper",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "communications",

    "Is the Tower a generative AI chatbot?",

    "Not in the current design. AI is used for speech recognition, while the Tower communication logic uses predefined scenario and validation rules to determine whether the transmission is correct, incomplete or requires clarification.",

    [
      "generative ai",
      "chatbot",
      "tower",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "communications",

    "How do I use Push-to-Talk correctly?",

    "Press and hold Push-to-Talk, wait briefly for recording to begin, speak clearly, finish the complete transmission, then release the button.",

    [
      "ptt",
      "push to talk",
      "hold",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Why does the Tower say 'Say again'?",

    "The communication validator may have detected missing, unclear or incorrect required information. The Tower can request a specific missing element or ask for the complete readback again.",

    [
      "say again",
      "repeat",
      "clarification",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Can the Tower ask me to repeat only my callsign?",

    "Yes. For an appropriate targeted clarification, the system can request only the missing or unclear callsign instead of restarting the entire exchange.",

    [
      "callsign",
      "say again",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Can the Tower ask me to repeat only my request?",

    "Yes. If the callsign and other required information are acceptable but the request is missing or unclear, the configured validator may request the request portion again.",

    [
      "request",
      "repeat only",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "When will the Tower ask for the complete readback again?",

    "For an operationally significant or critical readback error, the system can require the student to repeat the complete readback rather than only one fragment.",

    [
      "full readback",
      "critical error",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Why is RP-C1234 checked strictly?",

    "The aircraft callsign is treated as critical identifying information. The validator may tolerate transcription formatting differences, but it should not intentionally convert genuinely wrong callsign digits into the correct callsign.",

    [
      "rpc1234",
      "callsign",
      "strict",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "What happens if I say the wrong callsign?",

    "A genuinely incorrect callsign should not pass simply because the rest of the transmission is correct. The system may request the callsign again or mark the relevant communication element incorrect.",

    [
      "wrong callsign",
      "critical",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Why is Runway 17 checked strictly?",

    "Runway 17 is a configured safety-critical value in the current communication scenario. A different runway number should not be silently converted into Runway 17.",

    [
      "runway 17",
      "strict",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "What happens if I say Runway 7 instead of Runway 17?",

    "The communication validator is designed not to treat a genuinely different runway value as Runway 17. The response may require the student to repeat or correct the runway/readback.",

    [
      "runway 7",
      "runway 17",
      "wrong runway",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Why is Holding Point 17 checked strictly?",

    "Holding Point 17 is treated as a critical location value in the configured taxi communication. The validator should preserve the difference between correct and incorrect holding-point numbers.",

    [
      "holding point 17",
      "critical",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Why is 29.95 checked strictly?",

    "The altimeter setting 29.95 is a critical numerical value in the configured engine-start communication scenario. A genuinely different value should not be automatically accepted.",

    [
      "29.95",
      "altimeter",
      "strict",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "How does the Tower pronounce RP-C1234?",

    "The voice-output formatter can pronounce the configured callsign as 'Romeo Papa Charlie One Two Three Four.'",

    [
      "romeo papa charlie",
      "callsign pronunciation",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "How does the Tower pronounce Runway 17?",

    "The voice output can pronounce it as 'Runway One Seven.'",

    [
      "runway one seven",
      "pronunciation",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "How does the Tower pronounce 29.95?",

    "The configured voice formatting can pronounce 29.95 as 'Two Niner Niner Five.'",

    [
      "two niner niner five",
      "29.95",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Does the speech recognizer have to transcribe every word perfectly?",

    "No. Reasonable transcription differences in non-critical words may be tolerated when the communication meaning remains clear. Critical values remain more strictly checked.",

    [
      "transcript",
      "fuzzy",
      "speech recognition",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Why does the transcript sometimes look different from what I said?",

    "Speech recognition estimates the spoken words from audio. Accent, noise, microphone quality, clipping and short transmissions can cause transcription differences.",

    [
      "transcription",
      "wrong text",
      "whisper",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Does microphone quality affect ATC recognition?",

    "Yes. Excessive background noise, low microphone level, clipping or poor microphone placement can reduce speech-recognition accuracy.",

    [
      "microphone",
      "noise",
      "headset",
    ],

    {
      source: "Communication System Guide",
    }
  ),


  FAQ(
    "communications",

    "Can the ATC communication work offline?",

    "Yes. The final Raspberry Pi design uses locally hosted speech recognition and local communication-validation logic. Continuous internet access is not required for the core communication workflow after installation.",

    [
      "offline",
      "atc",
      "internet",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "communications",

    "Will the ATC system that works on the laptop also work on Raspberry Pi?",

    "The React communication interface, scenarios and validation logic are designed to remain the same. Raspberry Pi deployment requires the Linux/ARM build of the speech-recognition service and correct microphone/audio configuration.",

    [
      "laptop",
      "raspberry pi",
      "atc",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "communications",

    "Will the Tower voice sound exactly the same on Raspberry Pi?",

    "Not necessarily. Browser voices available on Windows and Raspberry Pi may differ. A local offline voice engine can be used later if a consistent Tower voice is required.",

    [
      "tower voice",
      "raspberry pi",
      "tts",
    ],

    {
      source: "System Guide",
    }
  ),


  /* ==========================================================
     GRADING
     ========================================================== */

  FAQ(
    "grading",

    "How is my overall score calculated?",

    "The current project rubric has a maximum of 100 points. Checklist Performance contributes up to 60 points and Communications Performance contributes up to 40 points.",

    [
      "overall score",
      "100",
    ],

    {
      link: "/performance",
      linkLabel: "View Performance",
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "How is the 60-point Checklist score divided?",

    "Checklist Performance is currently divided into Accuracy worth 30 points, Sequence worth 15 points, Completion worth 10 points and Recovery worth 5 points.",

    [
      "60",
      "checklist score",
      "accuracy",
      "sequence",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "How is the 40-point Communication score divided?",

    "Communications Performance is divided into Critical-Value Accuracy worth 20 points, Required Communication Elements worth 12 points and Recovery worth 8 points.",

    [
      "40",
      "communication score",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does Checklist Accuracy mean?",

    "Accuracy measures whether the expected cockpit actions and control selections were performed correctly.",

    [
      "accuracy",
      "correct action",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does Checklist Sequence mean?",

    "Sequence measures whether applicable checklist actions were completed in the expected order.",

    [
      "sequence",
      "order",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "Can a correct action still affect my Sequence score?",

    "Yes. An action may be correct in isolation but still be out of sequence if it was performed before or after the expected point in the procedure.",

    [
      "correct but early",
      "sequence",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does Checklist Completion mean?",

    "Completion measures whether the required checklist items were completed during the training session.",

    [
      "completion",
      "skipped",
      "missed",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does Recovery mean?",

    "Recovery evaluates how the student responds after an error, retry or clarification event according to the configured grading logic.",

    [
      "recovery",
      "retry",
      "mistake",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What is Critical-Value Accuracy?",

    "Critical-Value Accuracy evaluates configured communication values such as the aircraft callsign, runway, holding point and altimeter setting.",

    [
      "critical values",
      "callsign",
      "runway",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What are Required Communication Elements?",

    "These are the required pieces of information for the current communication step, such as station name, callsign, position, request, runway or readback components.",

    [
      "required elements",
      "communication",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "Does AI randomly decide my grade?",

    "No. AI speech recognition converts voice into text, but the numerical grading is calculated from predefined deterministic validation and scoring rules.",

    [
      "ai grading",
      "random",
      "deterministic",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does Excellent mean?",

    "The current project-specific rating labels an overall score from 90 to 100 as Excellent.",

    [
      "excellent",
      "90",
      "100",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does Proficient mean?",

    "The current project-specific rating labels an overall score from 80 to 89 as Proficient.",

    [
      "proficient",
      "80",
      "89",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does Developing mean?",

    "The current project-specific rating labels an overall score from 70 to 79 as Developing.",

    [
      "developing",
      "70",
      "79",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does Needs Improvement mean?",

    "The current project-specific rating labels an overall score below 70 as Needs Improvement.",

    [
      "needs improvement",
      "below 70",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "Are these official CAAP or ICAO grades?",

    "No. The score and performance labels are project-specific training metrics. They are not represented as official CAAP, ICAO, Tecnam or manufacturer grading standards.",

    [
      "caap",
      "icao",
      "official grade",
    ],

    {
      source: "Training Grading System",
      warning: true,
    }
  ),


  FAQ(
    "grading",

    "What does REVIEW REQUIRED mean?",

    "REVIEW REQUIRED is a separate safety-review status that may appear when a configured critical training error is recorded.",

    [
      "review required",
      "critical",
      "safety",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "Can I get a high score and still have REVIEW REQUIRED?",

    "Yes. The safety-review status is separate from the numerical score so a critical error can still be flagged even if the overall score is high.",

    [
      "high score",
      "review required",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "What does CLEAR mean?",

    "CLEAR means the session did not trigger the currently configured critical-error review condition. It does not mean every action was perfect.",

    [
      "clear",
      "safety status",
    ],

    {
      source: "Training Grading System",
    }
  ),


  FAQ(
    "grading",

    "Where can I see my detailed score?",

    "Open Performance for averages and category scores. Open History to inspect your completed training sessions and their available details.",

    [
      "performance",
      "history",
      "scores",
    ],

    {
      link: "/performance",
      linkLabel: "Open Performance",
      source: "System Guide",
    }
  ),


  FAQ(
    "grading",

    "How is my average score calculated?",

    "The Performance page calculates averages from the logged-in student's completed graded training sessions.",

    [
      "average",
      "performance",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "grading",

    "How does the Leaderboard rank students?",

    "The current design ranks students primarily by average overall score from completed sessions. More completed sessions can be used as a tie-breaker, followed by best score and then a consistent final ordering.",

    [
      "leaderboard",
      "ranking",
      "average",
    ],

    {
      source: "System Guide",
    }
  ),


  /* ==========================================================
     STUDENT ACCOUNT
     ========================================================== */

  FAQ(
    "accounts",

    "How do I register as a student?",

    "From the Login page, select Register New Student and provide the required student information, username and six-digit PIN.",

    [
      "register",
      "student account",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "accounts",

    "What information is requested during registration?",

    "The current registration design includes student name, course, year level, flight progress, username, six-digit PIN and PIN confirmation.",

    [
      "registration",
      "course",
      "year level",
      "flight progress",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "accounts",

    "What is my Student ID?",

    "The system can generate a human-readable student number such as WCC-0001. An internal student ID is also used to link your training records correctly.",

    [
      "student id",
      "wcc-0001",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "accounts",

    "Can I log in using my Student ID?",

    "Yes. The current authentication design can support either Username + PIN or Student ID + PIN.",

    [
      "login",
      "student id",
      "username",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "accounts",

    "Is my PIN stored as plain text?",

    "The production local authentication system is designed to store a hashed form of the PIN rather than intentionally storing the six-digit PIN in plain text.",

    [
      "pin",
      "security",
      "hash",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "accounts",

    "Are my training records separate from other students?",

    "Yes. Training sessions are linked to the logged-in student's unique student ID.",

    [
      "student records",
      "separate",
      "privacy",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "accounts",

    "Can another student see my detailed ATC transcript?",

    "The student-facing History and Performance views are intended to show the logged-in student's own detailed records. The Leaderboard displays aggregate ranking information and should not expose another student's detailed transcript or cockpit errors.",

    [
      "privacy",
      "transcript",
      "leaderboard",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "accounts",

    "Is my training progress saved?",

    "Training-session information is stored through the local training-record system and associated with the logged-in student when the session is recorded or finalized.",

    [
      "saved",
      "progress",
      "session",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "accounts",

    "What does Flight Progress mean?",

    "Flight Progress is a student-profile field used by the trainer to record the student's configured training-progress status. The exact terminology should follow the final school/client configuration.",

    [
      "flight progress",
      "student",
    ],

    {
      source: "System Guide",
    }
  ),


  /* ==========================================================
     SYSTEM / RASPBERRY PI
     ========================================================== */

  FAQ(
    "system",

    "Can the complete core trainer work offline?",

    "Yes. The core architecture is designed to run locally on the Raspberry Pi after installation, including student records, checklist logic, GPIO controls, speech recognition, communication validation, grading, History, Performance and Leaderboard.",

    [
      "offline",
      "internet",
      "raspberry pi",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "Does the FAQ itself need AI?",

    "No. This Help & FAQ page uses predefined verified answers stored in the application. It does not require a language model.",

    [
      "faq",
      "ai",
      "offline",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "Does the FAQ need internet?",

    "No. Because the FAQ content is stored locally in the React application, searching and reading the FAQ can work without internet access.",

    [
      "faq offline",
      "internet",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "What does the Raspberry Pi do?",

    "The Raspberry Pi is intended to be the main local computer for the final cockpit trainer. It can host the touchscreen application, backend, database, offline speech recognition and physical-control interface.",

    [
      "raspberry pi",
      "main controller",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "What is SQLite used for?",

    "SQLite is the planned local database for storing student information, training sessions and related records.",

    [
      "sqlite",
      "database",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "What is FastAPI used for?",

    "FastAPI provides the local backend/API used for features such as student registration, login, training-session storage and other Raspberry Pi services.",

    [
      "fastapi",
      "backend",
      "api",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "What is whisper.cpp used for?",

    "whisper.cpp runs the local AI speech-recognition model used to transcribe student radio communication.",

    [
      "whisper",
      "speech",
      "ai",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "Will the touchscreen show a full interactive 3D cockpit?",

    "The current final interface design does not require a navigable 3D cockpit model on the screen. The physical cockpit provides the control interaction, while the touchscreen displays checklist guidance, required values, communication and student information.",

    [
      "3d",
      "cockpit",
      "touchscreen",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "What is displayed on the touchscreen?",

    "The touchscreen can display checklist instructions, required gauge or instrument values, communication controls, student information, scoring, History, Performance, Leaderboard and Help.",

    [
      "touchscreen",
      "screen",
      "display",
    ],

    {
      source: "System Guide",
    }
  ),


  FAQ(
    "system",

    "Can the trainer start automatically when the Raspberry Pi is powered on?",

    "The final Raspberry Pi deployment can be configured to start the required services automatically and launch Chromium in kiosk mode.",

    [
      "automatic startup",
      "boot",
      "kiosk",
    ],

    {
      source: "System Guide",
    }
  ),


  /* ==========================================================
     TROUBLESHOOTING
     ========================================================== */

  FAQ(
    "troubleshooting",

    "Why is my physical switch not being detected?",

    "Check that the switch is included in the configured hardware map, the GPIO or I/O-expander connection is working, the wiring is secure and the Raspberry Pi control service is running.",

    [
      "switch not detected",
      "gpio",
      "wiring",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why can't I continue to the next checklist step?",

    "The active step may still require a physical control position, touchscreen confirmation or communication exchange. Review the current instruction and make sure its required condition has been satisfied.",

    [
      "stuck",
      "next step",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why is a correct switch being marked out of sequence?",

    "The control may be correct but may have been operated before the checklist expected it. Sequence validation checks both the action and when it occurs.",

    [
      "out of sequence",
      "correct switch",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why isn't my microphone recording?",

    "Check that the headset or microphone is connected, Chromium has microphone permission, the correct audio input is selected and the device is recognized by the operating system.",

    [
      "microphone",
      "not recording",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why does Whisper keep mishearing me?",

    "Reduce background noise, move the microphone to an appropriate position, speak clearly at a normal radio pace and avoid releasing Push-to-Talk before finishing the final word.",

    [
      "whisper",
      "mishear",
      "noise",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why did ATC reject my transmission when most of it was correct?",

    "A required communication element may be missing or a critical value may be incorrect. Check the Tower clarification to determine which element needs to be repeated or corrected.",

    [
      "atc rejected",
      "mostly correct",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why isn't the Tower voice playing?",

    "Check the speaker or headset output, system volume and browser audio permissions. Raspberry Pi voice support may use a different local voice implementation from the Windows development laptop.",

    [
      "voice not playing",
      "speaker",
      "audio",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why is my History page empty?",

    "History only displays records associated with the currently logged-in student. Complete and save a training session under the current student account. Older development records without the correct student ID may not appear.",

    [
      "history empty",
      "student id",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why is my Performance page empty?",

    "Performance calculations require completed graded sessions associated with the logged-in student.",

    [
      "performance empty",
      "no score",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "Why am I not on the Leaderboard?",

    "The current Leaderboard requires at least one completed graded session with a valid overall score before a student can be ranked.",

    [
      "leaderboard",
      "not showing",
    ],

    {
      source: "Troubleshooting Guide",
    }
  ),


  FAQ(
    "troubleshooting",

    "How do I start over with a new training attempt?",

    "Return to Choose Checklist and begin another checklist session. A new attempt should be recorded separately from completed previous attempts.",

    [
      "reset",
      "start over",
      "new attempt",
    ],

    {
      link: "/controls",
      linkLabel: "Choose Checklist",
      source: "Troubleshooting Guide",
    }
  ),


  /* ==========================================================
     SAFETY / LIMITATIONS
     ========================================================== */

  FAQ(
    "safety",

    "Is this trainer a certified Full Flight Simulator?",

    "No. The project is a cockpit familiarization and procedure-training prototype. It is not represented as a certified Full Flight Simulator or certified Flight Training Device.",

    [
      "certified",
      "simulator",
      "ffd",
    ],

    {
      source: "Training Limitation",
      warning: true,
    }
  ),


  FAQ(
    "safety",

    "Can this system replace actual flight training?",

    "No. It is intended to supplement cockpit familiarization, procedure practice and radio communication training. Actual flight training and qualified instructor supervision remain necessary.",

    [
      "replace flight training",
      "instructor",
    ],

    {
      source: "Training Limitation",
      warning: true,
    }
  ),


  FAQ(
    "safety",

    "Can I use this FAQ instead of the approved aircraft checklist?",

    "No. The approved aircraft checklist, aircraft documentation and qualified instructor guidance take precedence over the FAQ and prototype.",

    [
      "approved checklist",
      "faq",
    ],

    {
      source: "Training Limitation",
      warning: true,
    }
  ),


  FAQ(
    "safety",

    "Can I use the trainer instead of the Pilot Operating Handbook?",

    "No. The Pilot Operating Handbook and other approved aircraft documentation take precedence over information in this prototype.",

    [
      "poh",
      "pilot operating handbook",
    ],

    {
      source: "Training Limitation",
      warning: true,
    }
  ),


  FAQ(
    "safety",

    "Are all numerical values in the trainer official aircraft limitations?",

    "Only values specifically validated against the approved training source should be treated as configured training values. The software should not invent missing aircraft values or limitations.",

    [
      "official values",
      "limitations",
    ],

    {
      source: "Training Limitation",
      warning: true,
    }
  ),


  FAQ(
    "safety",

    "What happens when the supplied checklist contains a blank value?",

    "The trainer should not invent the missing value. The value must be supplied or approved by the client or qualified instructor before it is treated as a checklist requirement.",

    [
      "blank value",
      "missing value",
      "static rpm",
    ],

    {
      source: "Training Limitation",
      warning: true,
    }
  ),


  FAQ(
    "safety",

    "What happens when the checklist wording is ambiguous?",

    "The trainer should flag the item for instructor/client confirmation rather than silently deciding what the aircraft procedure should be.",

    [
      "ambiguous",
      "instructor confirmation",
    ],

    {
      source: "Training Limitation",
      warning: true,
    }
  ),


  FAQ(
    "safety",

    "Does this trainer simulate full aircraft aerodynamics?",

    "No. Full aerodynamic and flight-dynamics simulation is outside the current project scope.",

    [
      "aerodynamics",
      "flight dynamics",
    ],

    {
      source: "Training Limitation",
    }
  ),


  FAQ(
    "safety",

    "Does the trainer control a real aircraft engine?",

    "No. The switches, RPM buttons and displayed values are part of a procedural training prototype and do not operate an actual aircraft engine.",

    [
      "real engine",
      "aircraft",
    ],

    {
      source: "Training Limitation",
    }
  ),


  FAQ(
    "safety",

    "Who should approve the final checklist values?",

    "Final checklist wording, RPM presets, ambiguous procedures, instrument values and safety-critical training conditions should be reviewed and approved by the client and qualified aviation instructor before formal use.",

    [
      "approval",
      "instructor",
      "values",
    ],

    {
      source: "Training Limitation",
      warning: true,
    }
  ),
];


/* ============================================================
   POPULAR TOPICS
   ============================================================ */

const popularTopics = [
  {
    category: "engine-starting",
    title: "Engine Starting Procedure",
    icon: Plane,
  },

  {
    category: "cockpit-inspection",
    title: "Cockpit Inspection",
    icon: ClipboardCheck,
  },

  {
    category: "run-up",
    title: "Run-Up & RPM Checks",
    icon: Gauge,
  },

  {
    category: "before-takeoff",
    title: "Before Takeoff",
    icon: Plane,
  },

  {
    category: "communications",
    title: "AI-Assisted ATC Communication",
    icon: Radio,
  },

  {
    category: "grading",
    title: "Scoring & Performance",
    icon: Trophy,
  },

  {
    category: "instruments",
    title: "Gauges & Screen Values",
    icon: Gauge,
  },

  {
    category: "system",
    title: "Offline Raspberry Pi System",
    icon: WifiOff,
  },
];


/* ============================================================
   RECENT / COMMON QUESTION EXAMPLES

   Static examples only.
   These are not actual student messages.
   ============================================================ */

const recentQuestions = [
  {
    question:
      "How do I request engine startup?",

    meta:
      "ATC Communication",
  },

  {
    question:
      "What RPM is required during run-up?",

    meta:
      "Run-Up Checklist",
  },

  {
    question:
      "What happens if I skip a checklist step?",

    meta:
      "Scoring & Performance",
  },

  {
    question:
      "Why doesn't the physical voltmeter move?",

    search:
      "physical gauges",

    meta:
      "Gauges & Values",
  },

  {
    question:
      "What does REVIEW REQUIRED mean?",

    meta:
      "Scoring & Performance",
  },

  {
    question:
      "Can the ATC communication work offline?",

    meta:
      "ATC Communication",
  },
];


/* ============================================================
   HELP GUIDE
   ============================================================ */

function HelpGuide() {
  const [
    search,
    setSearch,
  ] = useState("");


  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");


  const [
    openQuestion,
    setOpenQuestion,
  ] = useState(
    faqs[0]?.question ||
      null
  );


  const [
    sent,
    setSent,
  ] = useState(false);


  const [
    subject,
    setSubject,
  ] = useState("");


  /* ==========================================================
     FILTERED FAQ
     ========================================================== */

  const filtered =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return faqs.filter(
          (
            faq
          ) => {
            const matchesCategory =
              selectedCategory ===
                "all" ||
              faq.category ===
                selectedCategory;


            const searchableText = [
              faq.question,
              faq.answer,
              faq.category,
              faq.source || "",
              ...(faq.tags || []),
            ]
              .join(" ")
              .toLowerCase();


            const matchesSearch =
              !query ||
              searchableText.includes(
                query
              );


            return (
              matchesCategory &&
              matchesSearch
            );
          }
        );
      },
      [
        search,
        selectedCategory,
      ]
    );


  /* ==========================================================
     CATEGORY DETAILS
     ========================================================== */

  const selectedCategoryData =
    categories.find(
      (
        category
      ) =>
        category.id ===
        selectedCategory
    );


  /* ==========================================================
     CATEGORY COUNTS
     ========================================================== */

  const categoryCounts =
    useMemo(
      () => {
        const result = {};


        categories.forEach(
          (
            category
          ) => {
            if (
              category.id ===
              "all"
            ) {
              result[
                category.id
              ] =
                faqs.length;

              return;
            }


            result[
              category.id
            ] =
              faqs.filter(
                (
                  faq
                ) =>
                  faq.category ===
                  category.id
              ).length;
          }
        );


        return result;
      },
      []
    );


  /* ==========================================================
     POPULAR SEARCH
     ========================================================== */

  function usePopularSearch(
    value
  ) {
    setSearch(
      value
    );

    setSelectedCategory(
      "all"
    );

    setOpenQuestion(
      null
    );
  }


  /* ==========================================================
     CHOOSE CATEGORY
     ========================================================== */

  function chooseCategory(
    categoryId
  ) {
    setSelectedCategory(
      categoryId
    );

    setSearch("");

    setOpenQuestion(
      null
    );
  }


  /* ==========================================================
     CLEAR FILTERS
     ========================================================== */

  function clearFilters() {
    setSearch("");

    setSelectedCategory(
      "all"
    );

    setOpenQuestion(
      faqs[0]?.question ||
        null
    );
  }


  /* ==========================================================
     OPEN FAQ FROM COMMON QUESTIONS
     ========================================================== */

  function openFaqByText(
    questionText,
    alternateSearch = null
  ) {
    const match =
      faqs.find(
        (
          faq
        ) =>
          faq.question
            .toLowerCase() ===
          questionText
            .toLowerCase()
      );


    setSelectedCategory(
      "all"
    );


    if (
      match
    ) {
      setSearch(
        match.question
      );

      setOpenQuestion(
        match.question
      );
    } else {
      setSearch(
        alternateSearch ||
          questionText
      );

      setOpenQuestion(
        null
      );
    }


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* ==========================================================
     SEND INQUIRY
     ========================================================== */

  function submitInquiry(
    event
  ) {
    event.preventDefault();


    /*
      CURRENT BEHAVIOR:
      Local demonstration only.

      OPTIONAL LATER:
      POST inquiry to FastAPI
      and save it in SQLite.

      No AI is required.
    */


    setSent(
      true
    );


    setTimeout(
      () => {
        setSent(
          false
        );
      },
      5000
    );
  }


  return (
    <>
      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <PageHeader
        title="FAQ & Help Guide"

        subtitle="Search Tecnam P2002JF checklist procedures, cockpit controls, ATC communication, grading, troubleshooting and trainer operation."
      />


      {/* ======================================================
          SEARCH
          ====================================================== */}

      <GlassCard className="mb-4 p-4">

        <div className="relative">

          <Search
            size={19}

            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />


          <input
            value={
              search
            }

            onChange={(
              event
            ) => {
              setSearch(
                event.target.value
              );

              setOpenQuestion(
                null
              );
            }}

            placeholder="Search engine start, fuel pump, RPM, runway, ATC, score..."

            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />


          {search && (

            <button
              type="button"

              onClick={() => {
                setSearch("");
                setOpenQuestion(null);
              }}

              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            >

              <X
                size={18}
              />

            </button>

          )}

        </div>


        {/* POPULAR SEARCHES */}

        <div className="mt-4 flex flex-wrap items-center gap-2">

          <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Popular Searches:
          </span>


          {popularSearches.map(
            (
              item
            ) => (

              <button
                type="button"

                key={
                  item
                }

                onClick={() =>
                  usePopularSearch(
                    item
                  )
                }

                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >

                {
                  item
                }

              </button>

            )
          )}

        </div>

      </GlassCard>


      {/* ======================================================
          CATEGORY FILTER
          ====================================================== */}

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">

        {categories.map(
          (
            category
          ) => {
            const Icon =
              category.icon;


            const active =
              selectedCategory ===
              category.id;


            return (

              <button
                type="button"

                key={
                  category.id
                }

                onClick={() =>
                  chooseCategory(
                    category.id
                  )
                }

                className={`
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-3.5
                  py-2.5
                  text-xs
                  font-semibold
                  transition

                  ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600"
                  }
                `}
              >

                <Icon
                  size={14}
                />


                {
                  category.name
                }


                <span
                  className={`
                    rounded-full
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-black

                    ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-400"
                    }
                  `}
                >
                  {
                    categoryCounts[
                      category.id
                    ] ||
                    0
                  }
                </span>

              </button>

            );

          }
        )}

      </div>


      {/* ======================================================
          MAIN GRID
          ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">

        {/* ====================================================
            FAQ LIST
            ==================================================== */}

        <GlassCard className="p-6">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                <CircleHelp
                  size={20}
                />

              </div>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Frequently Asked Questions
                </p>


                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {
                    selectedCategoryData
                      ?.name ||
                    "Help Topics"
                  }
                </h2>

              </div>

            </div>


            <div className="text-right">

              <p className="text-xs font-semibold text-slate-500">
                {
                  filtered.length
                }{" "}
                result
                {filtered.length ===
                1
                  ? ""
                  : "s"}
              </p>


              <p className="mt-1 text-[10px] text-slate-400">
                {
                  faqs.length
                }{" "}
                total help topics
              </p>


              {(search ||
                selectedCategory !==
                  "all") && (

                <button
                  type="button"

                  onClick={
                    clearFilters
                  }

                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                >

                  <RotateCcw
                    size={11}
                  />

                  Clear filters

                </button>

              )}

            </div>

          </div>


          {/* NO RESULTS */}

          {filtered.length ===
            0 && (

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">

              <HelpCircle
                size={34}

                className="mx-auto text-slate-300"
              />


              <h3 className="mt-4 font-bold text-slate-700">
                No matching question found
              </h3>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Try another keyword, browse a checklist category or send an inquiry for review.
              </p>


              <button
                type="button"

                onClick={
                  clearFilters
                }

                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
              >
                Show All Questions
              </button>

            </div>

          )}


          {/* FAQ ACCORDION */}

          <div className="mt-6 space-y-3">

            {filtered.map(
              (
                faq
              ) => {
                const open =
                  openQuestion ===
                  faq.question;


                const category =
                  categories.find(
                    (
                      item
                    ) =>
                      item.id ===
                      faq.category
                  );


                return (

                  <div
                    key={
                      faq.question
                    }

                    className={`
                      overflow-hidden
                      rounded-2xl
                      border
                      transition

                      ${
                        faq.warning
                          ? open
                            ? "border-amber-200 bg-amber-50/40"
                            : "border-amber-100 bg-white/70 hover:border-amber-200"
                          : open
                            ? "border-blue-200 bg-blue-50/30"
                            : "border-slate-200 bg-white/70 hover:border-slate-300"
                      }
                    `}
                  >

                    <button
                      type="button"

                      onClick={() =>
                        setOpenQuestion(
                          open
                            ? null
                            : faq.question
                        )
                      }

                      className="flex w-full items-center justify-between gap-5 p-5 text-left"
                    >

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p
                            className={`
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-wider

                              ${
                                faq.warning
                                  ? "text-amber-600"
                                  : "text-blue-500"
                              }
                            `}
                          >
                            {
                              category
                                ?.name ||
                              "Help"
                            }
                          </p>


                          {faq.warning && (

                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-700">
                              Verify
                            </span>

                          )}

                        </div>


                        <span className="mt-1 block font-semibold leading-6 text-slate-800">
                          {
                            faq.question
                          }
                        </span>

                      </div>


                      <div
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg

                          ${
                            faq.warning
                              ? "bg-amber-50 text-amber-500"
                              : "bg-slate-50 text-slate-400"
                          }
                        `}
                      >

                        {open ? (

                          <ChevronUp
                            size={17}
                          />

                        ) : (

                          <ChevronDown
                            size={17}
                          />

                        )}

                      </div>

                    </button>


                    {open && (

                      <div className="border-t border-slate-100 px-5 py-5">

                        <p className="text-sm leading-7 text-slate-600">
                          {
                            faq.answer
                          }
                        </p>


                        {faq.warning && (

                          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">

                            <AlertTriangle
                              size={15}

                              className="mt-0.5 shrink-0 text-amber-600"
                            />


                            <p className="text-[10px] leading-5 text-amber-700">
                              This item contains an incomplete, ambiguous or instructor-dependent requirement. Use the approved checklist and instructor guidance before treating it as a final aircraft-training value.
                            </p>

                          </div>

                        )}


                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">

                          <div>

                            {faq.source && (

                              <>
                                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                  Reference
                                </p>


                                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                                  {
                                    faq.source
                                  }
                                </p>
                              </>

                            )}

                          </div>


                          {faq.link && (

                            <Link
                              to={
                                faq.link
                              }

                              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 transition hover:text-blue-700"
                            >

                              <BookOpen
                                size={14}
                              />

                              {
                                faq.linkLabel ||
                                "Open Related Section"
                              }

                            </Link>

                          )}

                        </div>

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>

        </GlassCard>


        {/* ====================================================
            RIGHT COLUMN
            ==================================================== */}

        <div className="space-y-6">

          {/* ==================================================
              POPULAR TOPICS
              ================================================== */}

          <GlassCard className="p-6">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Popular Topics
            </p>


            <div className="mt-4 space-y-2">

              {popularTopics.map(
                (
                  topic
                ) => {
                  const Icon =
                    topic.icon;


                  const count =
                    categoryCounts[
                      topic.category
                    ] ||
                    0;


                  return (

                    <button
                      type="button"

                      key={
                        topic.title
                      }

                      onClick={() =>
                        chooseCategory(
                          topic.category
                        )
                      }

                      className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-blue-100 hover:bg-blue-50"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">

                        <Icon
                          size={17}
                        />

                      </div>


                      <div className="min-w-0 flex-1">

                        <span className="block text-sm font-medium text-slate-700">
                          {
                            topic.title
                          }
                        </span>


                        <span className="mt-0.5 block text-[9px] text-slate-400">
                          {
                            count
                          }{" "}
                          questions
                        </span>

                      </div>

                    </button>

                  );

                }
              )}

            </div>

          </GlassCard>


          {/* ==================================================
              CHECKLIST QUICK GUIDE
              ================================================== */}

          <GlassCard className="p-6">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Checklist Quick Guide
            </p>


            <div className="mt-4 space-y-2">

              {[
                [
                  "cockpit-inspection",
                  "Cockpit Inspection",
                ],

                [
                  "engine-starting",
                  "Engine Starting",
                ],

                [
                  "before-taxi",
                  "Before Taxi",
                ],

                [
                  "run-up",
                  "Run-Up",
                ],

                [
                  "before-takeoff",
                  "Before Takeoff",
                ],

                [
                  "after-landing",
                  "After Landing",
                ],

                [
                  "shutdown",
                  "Engine Shutdown",
                ],
              ].map(
                (
                  [
                    category,
                    name,
                  ],
                  index
                ) => (

                  <button
                    type="button"

                    key={
                      category
                    }

                    onClick={() =>
                      chooseCategory(
                        category
                      )
                    }

                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-blue-50"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-600">
                      {
                        index +
                        1
                      }
                    </div>


                    <div className="flex-1">

                      <p className="text-sm font-semibold text-slate-700">
                        {
                          name
                        }
                      </p>


                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {
                          categoryCounts[
                            category
                          ] ||
                          0
                        }{" "}
                        help questions
                      </p>

                    </div>

                  </button>

                )
              )}

            </div>

          </GlassCard>


        

        </div>

      </div>


      {/* ======================================================
          COMMON STUDENT QUESTIONS
          ====================================================== */}

      <GlassCard className="mt-6 overflow-hidden">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Common Student Questions
            </p>


            <h2 className="mt-1 text-xl font-bold">
              Quick Help
            </h2>

          </div>


          <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600">
            {
              faqs.length
            }{" "}
            Help Topics
          </div>

        </div>


        {recentQuestions.map(
          (
            item,
            index
          ) => (

            <button
              type="button"

              key={
                item.question
              }

              onClick={() =>
                openFaqByText(
                  item.question,
                  item.search
                )
              }

              className="flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4 text-left transition last:border-0 hover:bg-slate-50"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600">
                {
                  String.fromCharCode(
                    65 +
                      index
                  )
                }
              </div>


              <div className="min-w-0 flex-1">

                <p className="font-semibold text-slate-800">
                  {
                    item.question
                  }
                </p>


                <p className="mt-1 text-xs text-slate-400">
                  {
                    item.meta
                  }
                </p>

              </div>


              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                Answered
              </span>

            </button>

          )
        )}

      </GlassCard>


      {/* ======================================================
          IMPORTANT REFERENCE NOTICE
          ====================================================== */}

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-5">

        <AlertTriangle
          size={19}

          className="mt-0.5 shrink-0 text-amber-600"
        />


        <div>

          <p className="text-sm font-bold text-amber-800">
            Training Reference Notice
          </p>


          <p className="mt-1 text-xs leading-6 text-amber-700">
            This Help & FAQ module follows the configured training checklist and simulator behavior. It is not a substitute for the approved aircraft checklist, Pilot Operating Handbook, Aircraft Flight Manual, instructor guidance or applicable aviation regulations. Items marked Verify contain checklist wording, values or procedures that require final instructor/client confirmation.
          </p>

        </div>

      </div>
    </>
  );
}


export default HelpGuide;