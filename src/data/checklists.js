// =============================================================
// CHECKLIST STEP TYPES
// =============================================================

const controlStep = ({
  id,
  title,
  instruction,
  controlId,
  expected,
  expectedLabel,
  note,
}) => ({
  id,
  type: "control",
  title,
  instruction,
  controlId,
  expected,
  expectedLabel,
  note,
});

const manualStep = ({
  id,
  title,
  instruction,
  actionLabel = "Confirm Check",
  note,
}) => ({
  id,
  type: "manual",
  title,
  instruction,
  actionLabel,
  note,
});

const futureStep = ({
  id,
  title,
  instruction,
  note,
}) => ({
  id,
  type: "future",
  title,
  instruction,
  actionLabel:
    "Mark Communication Complete",
  note,
});

const commsStep = ({
  id,
  title,
  instruction,
  scenario,
  note,
}) => ({
  id,
  type: "comms",
  title,
  instruction,
  scenario,
  note,
});

const sequenceStep = ({
  id,
  title,
  instruction,
  controlId,
  sequence,
  expectedLabel,
  note,
}) => ({
  id,
  type: "sequence",
  title,
  instruction,
  controlId,
  sequence,
  expectedLabel,
  note,
});

// =============================================================
// CHECKLISTS
// =============================================================

export const checklists = [
  // ===========================================================
  // 1. COCKPIT INSPECTION
  // ===========================================================
  {
    id: "cockpit-inspection",

    title:
      "Cockpit Inspection",

    phase: "Pre-Flight",

    description:
      "Initial cockpit inspection procedure.",

    duration: "8–12 min",

    difficulty: "Beginner",

    steps: [
      // -------------------------------------------------------
      // PARK BRAKES
      // -------------------------------------------------------
      controlStep({
        id: "ci-1",

        title:
          "Parking Brakes",

        instruction:
          "Engage the parking brakes.",

        controlId:
          "parking_brake",

        expected:
          "ENGAGED",

        expectedLabel:
          "Parking Brakes Engaged",
      }),

      // -------------------------------------------------------
      // A.R.R.O.W.
      // -------------------------------------------------------
      manualStep({
        id: "ci-2",

        title:
          "Aircraft Documents (A.R.R.O.W.)",

        instruction:
          "Check that all A.R.R.O.W. documents are onboard the aircraft.",

        actionLabel:
          "Confirm ARROW Onboard",
      }),

      // -------------------------------------------------------
      // FLIGHT CONTROLS
      // -------------------------------------------------------
      manualStep({
        id: "ci-3",

        title:
          "Flight Controls",

        instruction:
          "Move the stick right and left, pull and push the stick, and check right and left rudder movement. Confirm that the flight controls are free and correct.",

        actionLabel:
          "Confirm Free & Correct",
      }),

      // -------------------------------------------------------
      // THROTTLE FRICTION
      // -------------------------------------------------------
      controlStep({
        id: "ci-4",

        title:
          "Throttle Friction",

        instruction:
          "Adjust the throttle friction.",

        controlId:
          "friction_lock",

        expected:
          "ADJUSTED",

        expectedLabel:
          "Throttle Friction Adjusted",
      }),

      // -------------------------------------------------------
      // CIRCUIT BREAKERS
      // -------------------------------------------------------
      controlStep({
        id: "ci-5",

        title:
          "Circuit Breakers",

        instruction:
          "Check that all circuit breakers are in.",

        controlId:
          "circuit_breakers",

        expected:
          "ALL_IN",

        expectedLabel:
          "Circuit Breakers All In",
      }),

      // -------------------------------------------------------
      // MASTER
      // -------------------------------------------------------
      controlStep({
        id: "ci-6",

        title:
          "Master Switch",

        instruction:
          "Turn the Master Switch ON.",

        controlId:
          "master_switch",

        expected:
          "ON",

        expectedLabel:
          "Master Switch ON",
      }),

      // -------------------------------------------------------
      // FUEL PUMP ON
      // -------------------------------------------------------
      controlStep({
        id: "ci-7",

        title:
          "Electric Fuel Pump",

        instruction:
          "Turn the electric fuel pump ON and check that fuel pressure is increasing.",

        controlId:
          "fuel_pump",

        expected:
          "ON",

        expectedLabel:
          "Electric Fuel Pump ON / Fuel Pressure Increasing",
      }),

      // -------------------------------------------------------
      // FUEL PUMP OFF
      // -------------------------------------------------------
      controlStep({
        id: "ci-8",

        title:
          "Electric Fuel Pump",

        instruction:
          "Turn the electric fuel pump OFF.",

        controlId:
          "fuel_pump",

        expected:
          "OFF",

        expectedLabel:
          "Electric Fuel Pump OFF",
      }),

      // -------------------------------------------------------
      // FLAPS FULL
      // -------------------------------------------------------
      controlStep({
        id: "ci-9",

        title:
          "Flaps Full Check",

        instruction:
          "Set the flaps to FULL and check the right wing and left wing.",

        controlId:
          "flaps",

        expected:
          "FULL",

        expectedLabel:
          "Flaps Full Check",
      }),

      // -------------------------------------------------------
      // FLAPS TAKEOFF
      // -------------------------------------------------------
      controlStep({
        id: "ci-10",

        title:
          "Flaps Takeoff Check",

        instruction:
          "Deploy the flaps to the T/O position and check the right and left wings.",

        controlId:
          "flaps",

        expected:
          "TAKEOFF",

        expectedLabel:
          "Flaps Takeoff Check",
      }),

      // -------------------------------------------------------
      // TRIM
      // -------------------------------------------------------
      controlStep({
        id: "ci-11",

        title: "Trim",

        instruction:
          "Check that the trim is NEUTRAL.",

        controlId: "trim",

        expected:
          "NEUTRAL",

        expectedLabel:
          "Trim Neutral",
      }),

      // -------------------------------------------------------
      // FUEL QUANTITY
      // -------------------------------------------------------
      manualStep({
        id: "ci-12",

        title:
          "Fuel Quantity",

        instruction:
          "Check fuel quantity: 50 liters on the right wing and 50 liters on the left wing.",

        actionLabel:
          "Confirm Fuel Tank Check",
      }),

      // -------------------------------------------------------
      // FUEL SELECTOR
      // -------------------------------------------------------
      controlStep({
        id: "ci-13",

        title:
          "Fuel Selector Valve",

        instruction:
          "Switch the fuel feeding tank to the less tank. The checklist output is LEFT TANK CHECK.",

        controlId:
          "fuel_selector",

        expected:
          "LEFT",

        expectedLabel:
          "Left Tank Check",

        note:
          "The supplied checklist also states to turn off the electric fuel pump after switching to the less tank.",
      }),

      // -------------------------------------------------------
      // SEAT
      // -------------------------------------------------------
      controlStep({
        id: "ci-14",

        title: "Seat",

        instruction:
          "Adjust the seat.",

        controlId: "seat",

        expected:
          "ADJUSTED",

        expectedLabel:
          "Seat Adjusted",
      }),

      // -------------------------------------------------------
      // SEATBELT
      // -------------------------------------------------------
      controlStep({
        id: "ci-15",

        title:
          "Seatbelt & Shoulder Harness",

        instruction:
          "Fasten the seatbelt and shoulder harness.",

        controlId:
          "seatbelt",

        expected:
          "FASTENED",

        expectedLabel:
          "Seatbelt & Harness Fastened",
      }),

      // -------------------------------------------------------
      // AVIONICS
      // -------------------------------------------------------
      controlStep({
        id: "ci-16",

        title:
          "Avionic Master",

        instruction:
          "Turn the Avionic Master ON.",

        controlId:
          "avionics_master",

        expected: "ON",

        expectedLabel:
          "Avionic Master ON",
      }),

      // -------------------------------------------------------
      // INTERCOM
      // -------------------------------------------------------
      controlStep({
        id: "ci-17",

        title: "Intercom",

        instruction:
          "Turn the intercom ON.",

        controlId:
          "intercom",

        expected: "ON",

        expectedLabel:
          "Intercom ON",
      }),

      // -------------------------------------------------------
      // RADIO
      // -------------------------------------------------------
      controlStep({
        id: "ci-18",

        title: "Radio",

        instruction:
          "Turn the radio ON.",

        controlId:
          "radio",

        expected: "ON",

        expectedLabel:
          "Radio ON",
      }),

      // -------------------------------------------------------
      // STARTUP COMMUNICATION
      // -------------------------------------------------------
      commsStep({
        id: "ci-19",

        title:
          "Engine Startup Communication",

        instruction:
          "Complete the Binalonan Radio engine startup communication procedure.",

        scenario:
          "engine-startup",

        note:
          "Text testing is active now. Microphone and offline speech recognition will be connected next.",
      }),

      // -------------------------------------------------------
      // RADIO OFF
      // -------------------------------------------------------
      controlStep({
        id: "ci-20",

        title: "Radio",

        instruction:
          "Turn the radio OFF.",

        controlId:
          "radio",

        expected: "OFF",

        expectedLabel:
          "Radio OFF",
      }),

      // -------------------------------------------------------
      // INTERCOM OFF
      // -------------------------------------------------------
      controlStep({
        id: "ci-21",

        title: "Intercom",

        instruction:
          "Turn the intercom OFF.",

        controlId:
          "intercom",

        expected: "OFF",

        expectedLabel:
          "Intercom OFF",
      }),

      // -------------------------------------------------------
      // AVIONICS OFF
      // -------------------------------------------------------
      controlStep({
        id: "ci-22",

        title:
          "Avionic Master",

        instruction:
          "Turn the Avionic Master OFF.",

        controlId:
          "avionics_master",

        expected: "OFF",

        expectedLabel:
          "Avionic Master OFF",
      }),
    ],
  },

  // ===========================================================
  // 2. ENGINE STARTING
  // ===========================================================
  {
    id: "engine-starting",

    title:
      "Engine Starting",

    phase: "Engine",

    description:
      "Engine starting procedure and checks.",

    duration: "6–10 min",

    difficulty:
      "Intermediate",

    steps: [
      // -------------------------------------------------------
      // CHRONOMETER
      // -------------------------------------------------------
      controlStep({
        id: "es-1",

        title:
          "Chronometer / Clock",

        instruction:
          "Start the chronometer.",

        controlId:
          "chronometer",

        expected:
          "RUNNING",

        expectedLabel:
          "Chronometer Start",
      }),

      // -------------------------------------------------------
      // 12V
      // -------------------------------------------------------
      manualStep({
        id: "es-2",

        title: "Voltmeter",

        instruction:
          "Check that the voltmeter indicates 12 volts.",

        actionLabel:
          "Confirm 12 Volts",
      }),

      // -------------------------------------------------------
      // AMMETER
      // -------------------------------------------------------
      manualStep({
        id: "es-3",

        title: "Ammeter",

        instruction:
          "Check the ammeter. It should be on standby.",

        actionLabel:
          "Confirm Ammeter Standby",
      }),

      // -------------------------------------------------------
      // THROTTLE IDLE
      // -------------------------------------------------------
      controlStep({
        id: "es-4",

        title: "Throttle",

        instruction:
          "Set the throttle to IDLE.",

        controlId:
          "throttle",

        expected: "IDLE",

        expectedLabel:
          "Throttle Idle",
      }),

      // -------------------------------------------------------
      // CHOKE AS NEEDED
      // -------------------------------------------------------
      manualStep({
        id: "es-5",

        title: "Choke",

        instruction:
          "Set the choke as needed.",

        actionLabel:
          "Confirm Choke As Needed",
      }),

      // -------------------------------------------------------
      // LEFT TANK
      // -------------------------------------------------------
      controlStep({
        id: "es-6",

        title:
          "Fuel Selector Valve",

        instruction:
          "Set the fuel selector valve to the LEFT tank.",

        controlId:
          "fuel_selector",

        expected: "LEFT",

        expectedLabel:
          "Left Tank Check",
      }),

      // -------------------------------------------------------
      // FUEL PUMP ON
      // -------------------------------------------------------
      controlStep({
        id: "es-7",

        title:
          "Electric Fuel Pump",

        instruction:
          "Turn the electric fuel pump ON. Fuel pressure should increase.",

        controlId:
          "fuel_pump",

        expected: "ON",

        expectedLabel:
          "Fuel Pressure Increasing",
      }),

      // -------------------------------------------------------
      // PROP CLEAR
      // -------------------------------------------------------
      manualStep({
        id: "es-8",

        title:
          "Propeller Area",

        instruction:
          "Check left, front and right. Confirm that the propeller area is clear.",

        actionLabel:
          "Confirm Prop Clear",
      }),

      // -------------------------------------------------------
      // NAV
      // -------------------------------------------------------
      controlStep({
        id: "es-9",

        title:
          "Navigation Light",

        instruction:
          "Turn the navigation light ON.",

        controlId:
          "nav_light",

        expected: "ON",

        expectedLabel:
          "Navigation Light ON",
      }),

      // -------------------------------------------------------
      // STROBE
      // -------------------------------------------------------
      controlStep({
        id: "es-10",

        title:
          "Strobe Light",

        instruction:
          "Turn the strobe light ON.",

        controlId:
          "strobe_light",

        expected: "ON",

        expectedLabel:
          "Strobe Light ON",
      }),

      // -------------------------------------------------------
      // IGNITION START
      // -------------------------------------------------------
      sequenceStep({
        id: "es-11",

        title:
          "Ignition Switch",

        instruction:
          "Turn the ignition switch through LEFT, RIGHT, BOTH, then START.",

        controlId:
          "ignition",

        sequence: [
          "LEFT",
          "RIGHT",
          "BOTH",
          "START",
        ],

        expectedLabel:
          "LEFT → RIGHT → BOTH → START",

        note:
          "The checklist indicates engine startup sound after this step.",
      }),

      // -------------------------------------------------------
      // OIL PRESSURE
      // -------------------------------------------------------
      manualStep({
        id: "es-12",

        title:
          "Oil Pressure",

        instruction:
          "Check that oil pressure indicates 4 bars and is on green.",

        actionLabel:
          "Confirm 4 Bars / Green",
      }),

      // -------------------------------------------------------
      // SOURCE CHOKE/CHOCK WORDING
      // -------------------------------------------------------
      manualStep({
        id: "es-13",

        title:
          "Choke Off / Tire Procedure",

        instruction:
          "Signal the AMT according to the checklist procedure to take off the 'chokes' from the tire.",

        actionLabel:
          "Confirm Procedure Complete",

        note:
          "The supplied checklist labels this row 'Choke Off' but its procedure refers to the tire. This wording is preserved instead of assigning it to the engine choke switch.",
      }),

      // -------------------------------------------------------
      // GENERATOR
      // -------------------------------------------------------
      controlStep({
        id: "es-14",

        title: "Generator",

        instruction:
          "Switch the generator ON.",

        controlId:
          "generator",

        expected: "ON",

        expectedLabel:
          "Generator ON",
      }),

      // -------------------------------------------------------
      // AMMETER CHARGING
      // -------------------------------------------------------
      manualStep({
        id: "es-15",

        title: "Ammeter",

        instruction:
          "Check that the ammeter is charging and on green.",

        actionLabel:
          "Confirm Ammeter Charging",
      }),

      // -------------------------------------------------------
      // 14V
      // -------------------------------------------------------
      manualStep({
        id: "es-16",

        title: "Voltmeter",

        instruction:
          "Check that the voltmeter indicates 14 volts and is on green.",

        actionLabel:
          "Confirm 14V / Green",
      }),

      // -------------------------------------------------------
      // ENGINE INSTRUMENTS
      // -------------------------------------------------------
      manualStep({
        id: "es-17",

        title:
          "Engine Instruments",

        instruction:
          "Check engine instruments and suction gauge. Confirm that they are on green.",

        actionLabel:
          "Confirm Instruments Green",
      }),

      // -------------------------------------------------------
      // 1000-1200 RPM
      // -------------------------------------------------------
      controlStep({
        id: "es-18",

        title: "Throttle",

        instruction:
          "Set the throttle between 1,000 and 1,200 RPM.",

        controlId:
          "throttle",

        expected:
          "1000_1200",

        expectedLabel:
          "1000–1200 RPM",
      }),

      // -------------------------------------------------------
      // FUEL PUMP OFF
      // -------------------------------------------------------
      controlStep({
        id: "es-19",

        title:
          "Electric Fuel Pump",

        instruction:
          "Turn the electric fuel pump OFF.",

        controlId:
          "fuel_pump",

        expected: "OFF",

        expectedLabel:
          "Electric Fuel Pump OFF",
      }),

      // -------------------------------------------------------
      // FUEL PRESSURE
      // -------------------------------------------------------
      manualStep({
        id: "es-20",

        title:
          "Fuel Pressure",

        instruction:
          "Check that fuel pressure is on green.",

        actionLabel:
          "Confirm Fuel Pressure Green",
      }),
    ],
  },

  // ===========================================================
  // 3. BEFORE TAXI
  // ===========================================================
  {
    id: "before-taxi",

    title:
      "Before Taxi",

    phase: "Taxi",

    description:
      "Before taxi equipment and instrument checks.",

    duration: "5–8 min",

    difficulty:
      "Intermediate",

    steps: [
      // -------------------------------------------------------
      // AVIONICS ON
      // -------------------------------------------------------
      controlStep({
        id: "bt-1",

        title:
          "Avionic Master",

        instruction:
          "Turn the Avionic Master ON.",

        controlId:
          "avionics_master",

        expected: "ON",

        expectedLabel:
          "Avionic Master ON",
      }),

      // -------------------------------------------------------
      // INTERCOM ON
      // -------------------------------------------------------
      controlStep({
        id: "bt-2",

        title: "Intercom",

        instruction:
          "Turn the intercom ON.",

        controlId:
          "intercom",

        expected: "ON",

        expectedLabel:
          "Intercom ON",
      }),

      // -------------------------------------------------------
      // RADIO / VOR
      // -------------------------------------------------------
      controlStep({
        id: "bt-3",

        title:
          "All Radios and VOR",

        instruction:
          "Turn the radio ON. The checklist also requires the radio and VOR to be set.",

        controlId: "radio",

        expected: "ON",

        expectedLabel:
          "Radios ON",

        note:
          "The current prototype validates radio power only. Radio/VOR tuning will be added separately.",
      }),

      // -------------------------------------------------------
      // TRANSPONDER STBY
      // -------------------------------------------------------
      controlStep({
        id: "bt-4",

        title:
          "Transponder",

        instruction:
          "Set the transponder to STANDBY.",

        controlId:
          "transponder",

        expected: "STBY",

        expectedLabel:
          "Transponder Standby",
      }),

      // -------------------------------------------------------
      // GPS
      // -------------------------------------------------------
      controlStep({
        id: "bt-5",

        title: "GPS",

        instruction:
          "Turn the GPS ON and set the GPS.",

        controlId: "gps",

        expected: "ON",

        expectedLabel:
          "GPS ON and Set",
      }),

      // -------------------------------------------------------
      // AIRCRAFT INSTRUMENTS
      // -------------------------------------------------------
      manualStep({
        id: "bt-6",

        title:
          "Aircraft Instruments",

        instruction:
          "Check: airspeed indicator at 0, attitude indicator aligned with the artificial horizon, altimeter at 0, vertical speed indicator at 0, heading indicator aligned with the magnetic compass, and turn coordinator wings level with ball centered.",

        actionLabel:
          "Confirm Instruments Check",
      }),

      // -------------------------------------------------------
      // LANDING LIGHT
      // -------------------------------------------------------
      controlStep({
        id: "bt-7",

        title:
          "Landing Light",

        instruction:
          "Set the landing light ON if visibility is poor; otherwise STANDBY.",

        controlId:
          "landing_light",

        expected: [
          "ON",
          "STBY",
        ],

        expectedLabel:
          "ON or STANDBY",
      }),

      // -------------------------------------------------------
      // TAXI COMMUNICATION
      // -------------------------------------------------------
      commsStep({
        id: "bt-8",

        title:
          "Taxi Communication",

        instruction:
          "Complete the Binalonan Radio taxi-to-run-up-area communication procedure.",

        scenario:
          "taxi-runup",
      }),

      // -------------------------------------------------------
      // RELEASE BRAKES
      // -------------------------------------------------------
      controlStep({
        id: "bt-9",

        title:
          "Parking Brakes",

        instruction:
          "Release the parking brakes.",

        controlId:
          "parking_brake",

        expected:
          "RELEASED",

        expectedLabel:
          "Parking Brakes Released",
      }),

      // -------------------------------------------------------
      // BRAKE CHECK
      // -------------------------------------------------------
      manualStep({
        id: "bt-10",

        title:
          "Brake Check",

        instruction:
          "Perform the checklist brake check procedure.",

        actionLabel:
          "Confirm Brakes Good",
      }),
    ],
  },

  // ===========================================================
  // 4. RUN-UP
  // ===========================================================
  {
    id: "run-up",

    title: "Run-Up",

    phase: "Run-Up",

    description:
      "Engine parameter and run-up checks.",

    duration: "8–12 min",

    difficulty: "Advanced",

    steps: [
      // -------------------------------------------------------
      // PARK BRAKES
      // -------------------------------------------------------
      controlStep({
        id: "ru-1",

        title:
          "Parking Brakes",

        instruction:
          "Engage the parking brakes.",

        controlId:
          "parking_brake",

        expected:
          "ENGAGED",

        expectedLabel:
          "Parking Brakes Engaged",
      }),

      // -------------------------------------------------------
      // OIL TEMP
      // -------------------------------------------------------
      manualStep({
        id: "ru-2",

        title:
          "Oil Temperature",

        instruction:
          "Check oil temperature: 50–110 °C, on green.",

        actionLabel:
          "Confirm Oil Temperature",
      }),

      // -------------------------------------------------------
      // CHT
      // -------------------------------------------------------
      manualStep({
        id: "ru-3",

        title:
          "Cylinder Heat Temperature",

        instruction:
          "Check cylinder heat temperature. Maximum: 135 °C.",

        actionLabel:
          "Confirm CHT",
      }),

      // -------------------------------------------------------
      // OIL PRESSURE
      // -------------------------------------------------------
      manualStep({
        id: "ru-4",

        title:
          "Oil Pressure",

        instruction:
          "Check oil pressure: 2 to 5 bars on green.",

        actionLabel:
          "Confirm Oil Pressure",
      }),

      // -------------------------------------------------------
      // FUEL PRESSURE
      // -------------------------------------------------------
      manualStep({
        id: "ru-5",

        title:
          "Fuel Pressure",

        instruction:
          "Check fuel pressure: 2.2 to 5.8 PSI on green.",

        actionLabel:
          "Confirm Fuel Pressure",
      }),

      // -------------------------------------------------------
      // GENERATOR TEST
      // -------------------------------------------------------
      sequenceStep({
        id: "ru-6",

        title:
          "Generator Light Check",

        instruction:
          "Turn the generator OFF: alternator light should be ON and the ammeter should be discharging. Then turn the generator ON: alternator light should be OFF and the ammeter should be charging.",

        controlId:
          "generator",

        sequence: [
          "OFF",
          "ON",
        ],

        expectedLabel:
          "Generator OFF → ON",
      }),

      // -------------------------------------------------------
      // FUEL PUMP BEFORE FULLEST TANK
      // -------------------------------------------------------
      controlStep({
        id: "ru-7",

        title:
          "Electric Fuel Pump",

        instruction:
          "Turn the electric fuel pump ON before selecting the fullest tank.",

        controlId:
          "fuel_pump",

        expected: "ON",

        expectedLabel:
          "Electric Fuel Pump ON",
      }),

      // -------------------------------------------------------
      // FULLEST TANK
      // -------------------------------------------------------
      manualStep({
        id: "ru-8",

        title:
          "Fuel Selector Valve",

        instruction:
          "Choose the fullest fuel tank.",

        actionLabel:
          "Confirm Fullest Tank",

        note:
          "The supplied checklist does not identify the fullest tank as permanently LEFT or RIGHT, so this is not hard-coded.",
      }),

      // -------------------------------------------------------
      // 1640 RPM
      // -------------------------------------------------------
      controlStep({
        id: "ru-9",

        title: "Throttle",

        instruction:
          "Set the throttle to 1,640 RPM.",

        controlId:
          "throttle",

        expected:
          "1640",

        expectedLabel:
          "Power 1,640 RPM",
      }),

      // -------------------------------------------------------
      // MAGNETO TEST
      // -------------------------------------------------------
      sequenceStep({
        id: "ru-10",

        title:
          "Ignition Switch Check",

        instruction:
          "check the left magnetos, read rpm drop, then return to both. Check the right magneto, read rpm drop then return to both. Read the total rpm of both and the difference.",

        controlId:
          "ignition",

        sequence: [
          "RIGHT",
          "BOTH",
          "LEFT",
          "BOTH",
        ],

        expectedLabel:
          "RIGHT → BOTH → LEFT → BOTH",

        note:
          "The current control prototype checks the ignition-switch sequence only. RPM-drop validation can be added when RPM simulation is implemented.",
      }),

      // -------------------------------------------------------
      // CARB HEAT CHECK
      // -------------------------------------------------------
      manualStep({
        id: "ru-11",

        title:
          "Carburetor Heat",

        instruction:
          "Perform the carburetor heat check.",

        actionLabel:
          "Confirm Carb Heat Check",
      }),

      // -------------------------------------------------------
      // FULL POWER
      // -------------------------------------------------------
      controlStep({
        id: "ru-12",

        title:
          "Throttle Full",

        instruction:
          "Apply full power.",

        controlId:
          "throttle",

        expected: "FULL",

        expectedLabel:
          "Full Power",
      }),

      // -------------------------------------------------------
      // ENGINE INSTRUMENTS
      // -------------------------------------------------------
      manualStep({
        id: "ru-13",

        title:
          "Engine Instruments",

        instruction:
          "Check engine instruments and suction gauge. Confirm that they are on green.",

        actionLabel:
          "Confirm Instruments Green",

        note:
          "The supplied checklist leaves the static RPM value blank.",
      }),

      // -------------------------------------------------------
      // IDLE
      // -------------------------------------------------------
      controlStep({
        id: "ru-14",

        title:
          "Throttle Idle",

        instruction:
          "Return the throttle to IDLE.",

        controlId:
          "throttle",

        expected: "IDLE",

        expectedLabel:
          "Power Idle",
      }),

      // -------------------------------------------------------
      // VIBRATION
      // -------------------------------------------------------
      manualStep({
        id: "ru-15",

        title:
          "Unusual Engine Vibration",

        instruction:
          "Check for unusual engine vibration. Confirm negative unusual vibration.",

        actionLabel:
          "Confirm No Unusual Vibration",
      }),

      // -------------------------------------------------------
      // EXACT 1000 RPM
      // -------------------------------------------------------
      controlStep({
        id: "ru-16",

        title: "Throttle",

        instruction:
          "Set power back to 1,000 RPM.",

        controlId:
          "throttle",

        expected: "1000",

        expectedLabel:
          "Power Back to 1,000 RPM",
      }),

      // -------------------------------------------------------
      // FRICTION LOCK
      // -------------------------------------------------------
      controlStep({
        id: "ru-17",

        title:
          "Friction Lock",

        instruction:
          "Set the friction lock.",

        controlId:
          "friction_lock",

        expected: "SET",

        expectedLabel:
          "Friction Lock Set",
      }),

      // -------------------------------------------------------
      // BRAKES RELEASE
      // -------------------------------------------------------
      controlStep({
        id: "ru-18",

        title:
          "Parking Brakes",

        instruction:
          "Release the parking brakes.",

        controlId:
          "parking_brake",

        expected:
          "RELEASED",

        expectedLabel:
          "Parking Brakes Released",
      }),

      // -------------------------------------------------------
      // HOLDING POINT COMMS
      // -------------------------------------------------------
      commsStep({
        id: "ru-19",

        title:
          "Holding Point Communication",

        instruction:
          "Complete the Binalonan Radio taxi-to-holding-point-17 communication procedure.",

        scenario:
          "taxi-holding-point",
      }),
    ],
  },

  // ===========================================================
  // 5. BEFORE TAKEOFF
  // ===========================================================
  {
    id: "before-takeoff",

    title:
      "Before Takeoff",

    phase: "Takeoff",

    description:
      "Final checks before takeoff.",

    duration: "5–8 min",

    difficulty:
      "Advanced",

    steps: [
      // -------------------------------------------------------
      // BRAKES ENGAGED
      // -------------------------------------------------------
      controlStep({
        id: "bto-1",

        title:
          "Parking Brakes",

        instruction:
          "Engage the parking brakes.",

        controlId:
          "parking_brake",

        expected:
          "ENGAGED",

        expectedLabel:
          "Parking Brakes Engaged",
      }),

      // -------------------------------------------------------
      // TRANSPONDER ALT
      // -------------------------------------------------------
      controlStep({
        id: "bto-2",

        title:
          "Transponder",

        instruction:
          "Set the transponder to ALT.",

        controlId:
          "transponder",

        expected: "ALT",

        expectedLabel:
          "Transponder ALT",
      }),

      // -------------------------------------------------------
      // LANDING LIGHT
      // -------------------------------------------------------
      controlStep({
        id: "bto-3",

        title:
          "Landing Lights",

        instruction:
          "Turn the landing light ON.",

        controlId:
          "landing_light",

        expected: "ON",

        expectedLabel:
          "Landing Light ON",
      }),

      // -------------------------------------------------------
      // FLAPS T/O
      // -------------------------------------------------------
      controlStep({
        id: "bto-4",

        title: "Flaps",

        instruction:
          "Check that the flaps are in the TAKEOFF position. Check the right and left wings.",

        controlId: "flaps",

        expected:
          "TAKEOFF",

        expectedLabel:
          "T/O Flaps Check",
      }),

      // -------------------------------------------------------
      // FUEL PUMP
      // -------------------------------------------------------
      controlStep({
        id: "bto-5",

        title:
          "Electric Fuel Pump",

        instruction:
          "Turn the electric fuel pump ON.",

        controlId:
          "fuel_pump",

        expected: "ON",

        expectedLabel:
          "Electric Fuel Pump ON",
      }),

      // -------------------------------------------------------
      // CARB HEAT OFF
      // -------------------------------------------------------
      controlStep({
        id: "bto-6",

        title:
          "Carburetor Heat",

        instruction:
          "Set carburetor heat OFF.",

        controlId:
          "carb_heat",

        expected: "OFF",

        expectedLabel:
          "Carb Heat OFF",
      }),

      // -------------------------------------------------------
      // FLIGHT CONTROLS
      // -------------------------------------------------------
      manualStep({
        id: "bto-7",

        title:
          "Flight Controls",

        instruction:
          "Check the stick and rudders and confirm that the flight controls are free and correct.",

        actionLabel:
          "Confirm Free & Correct",
      }),

      // -------------------------------------------------------
      // TRIM
      // -------------------------------------------------------
      controlStep({
        id: "bto-8",

        title: "Trim",

        instruction:
          "Set trim to NEUTRAL.",

        controlId: "trim",

        expected:
          "NEUTRAL",

        expectedLabel:
          "Trim Neutral",
      }),

      // -------------------------------------------------------
      // SEATBELT
      // -------------------------------------------------------
      controlStep({
        id: "bto-9",

        title:
          "Seatbelt & Harness",

        instruction:
          "Adjust and fasten the seatbelt and harness.",

        controlId:
          "seatbelt",

        expected:
          "FASTENED",

        expectedLabel:
          "Adjusted and Fastened",
      }),

      // -------------------------------------------------------
      // CANOPY
      // -------------------------------------------------------
      controlStep({
        id: "bto-10",

        title: "Canopy",

        instruction:
          "Make sure the canopy is CLOSED.",

        controlId:
          "canopy",

        expected:
          "CLOSED",

        expectedLabel:
          "Canopy Closed",
      }),

      // -------------------------------------------------------
      // REPORT / LINE-UP COMMUNICATION
      // The checklist says brakes are released after reporting.
      // -------------------------------------------------------
      commsStep({
        id: "bto-11",

        title:
          "Line-Up Communication",

        instruction:
          "Complete the Binalonan Radio holding-point-17 line-up communication procedure.",

        scenario:
          "line-up",
      }),

      // -------------------------------------------------------
      // RELEASE BRAKES AFTER REPORTING
      // -------------------------------------------------------
      controlStep({
        id: "bto-12",

        title:
          "Parking Brakes",

        instruction:
          "Release the parking brakes after reporting.",

        controlId:
          "parking_brake",

        expected:
          "RELEASED",

        expectedLabel:
          "Parking Brakes Released",
      }),
    ],
  },

  // ===========================================================
  // 6. AFTER LANDING
  // ===========================================================
  {
    id: "after-landing",

    title:
      "After Landing",

    phase: "Landing",

    description:
      "After landing configuration.",

    duration: "3–5 min",

    difficulty:
      "Beginner",

    steps: [
      // -------------------------------------------------------
      // TRANSPONDER
      // -------------------------------------------------------
      controlStep({
        id: "al-1",

        title:
          "Transponder",

        instruction:
          "Set the transponder to STANDBY.",

        controlId:
          "transponder",

        expected:
          "STBY",

        expectedLabel:
          "Transponder Standby",
      }),

      // -------------------------------------------------------
      // LANDING LIGHT
      // -------------------------------------------------------
      controlStep({
        id: "al-2",

        title:
          "Landing Light",

        instruction:
          "Set the landing light ON.",

        controlId:
          "landing_light",

        expected: "ON",

        expectedLabel:
          "Landing Light ON",
      }),

      // -------------------------------------------------------
      // FLAPS
      // -------------------------------------------------------
      controlStep({
        id: "al-3",

        title: "Flaps",

        instruction:
          "Retract the flaps UP.",

        controlId: "flaps",

        expected: "UP",

        expectedLabel:
          "Flaps UP",
      }),

      // -------------------------------------------------------
      // FUEL PUMP
      // -------------------------------------------------------
      controlStep({
        id: "al-4",

        title:
          "Electric Fuel Pump",

        instruction:
          "Turn the electric fuel pump OFF.",

        controlId:
          "fuel_pump",

        expected: "OFF",

        expectedLabel:
          "Electric Fuel Pump OFF",
      }),
    ],
  },

  // ===========================================================
  // 7. ENGINE SHUTDOWN
  // ===========================================================
  {
    id: "engine-shutdown",

    title:
      "Engine Shutdown",

    phase: "Shutdown",

    description:
      "Engine shutdown procedure.",

    duration: "5–8 min",

    difficulty:
      "Intermediate",

    steps: [
      // -------------------------------------------------------
      // PARK BRAKES
      // -------------------------------------------------------
      controlStep({
        id: "sd-1",

        title:
          "Parking Brakes",

        instruction:
          "Engage the parking brakes.",

        controlId:
          "parking_brake",

        expected:
          "ENGAGED",

        expectedLabel:
          "Parking Brakes Engaged",
      }),

      // -------------------------------------------------------
      // 1000 - 1200 RPM
      // -------------------------------------------------------
      controlStep({
        id: "sd-2",

        title:
          "Engine RPM",

        instruction:
          "Keep the engine running at 1,000 to 1,200 RPM.",

        controlId:
          "throttle",

        expected:
          "1000_1200",

        expectedLabel:
          "1000–1200 RPM",
      }),

      // -------------------------------------------------------
      // ONE MINUTE
      // -------------------------------------------------------
      manualStep({
        id: "sd-3",

        title:
          "One Minute Cool Down",

        instruction:
          "Keep the engine running at 1,000 to 1,200 RPM for 1 minute in order to reduce latent heat.",

        actionLabel:
          "Confirm 1 Minute Complete",

        note:
          "A real one-minute timer can be implemented later.",
      }),

      // -------------------------------------------------------
      // THROTTLE IDLE
      // -------------------------------------------------------
      controlStep({
        id: "sd-4",

        title: "Throttle",

        instruction:
          "Set power to IDLE.",

        controlId:
          "throttle",

        expected: "IDLE",

        expectedLabel:
          "Throttle Idle",
      }),

      // -------------------------------------------------------
      // RADIO OFF
      // -------------------------------------------------------
      controlStep({
        id: "sd-5",

        title:
          "All Radio",

        instruction:
          "Turn the radio OFF.",

        controlId:
          "radio",

        expected: "OFF",

        expectedLabel:
          "Radio OFF",
      }),

      // -------------------------------------------------------
      // INTERCOM
      // -------------------------------------------------------
      controlStep({
        id: "sd-6",

        title: "Intercom",

        instruction:
          "Turn the intercom OFF.",

        controlId:
          "intercom",

        expected: "OFF",

        expectedLabel:
          "Intercom OFF",
      }),

      // -------------------------------------------------------
      // AVIONICS
      // -------------------------------------------------------
      controlStep({
        id: "sd-7",

        title:
          "Avionic Master",

        instruction:
          "Turn the Avionic Master OFF.",

        controlId:
          "avionics_master",

        expected: "OFF",

        expectedLabel:
          "Avionic Master OFF",
      }),

      // -------------------------------------------------------
      // TRANSPONDER
      // -------------------------------------------------------
      controlStep({
        id: "sd-8",

        title:
          "Transponder",

        instruction:
          "Set the transponder to OFF.",

        controlId:
          "transponder",

        expected: "OFF",

        expectedLabel:
          "Transponder OFF",
      }),

      // -------------------------------------------------------
      // GPS
      // -------------------------------------------------------
      controlStep({
        id: "sd-9",

        title: "GPS",

        instruction:
          "Turn the GPS OFF.",

        controlId: "gps",

        expected: "OFF",

        expectedLabel:
          "GPS OFF",
      }),

      // -------------------------------------------------------
      // IGNITION SHUTDOWN
      // -------------------------------------------------------
      sequenceStep({
        id: "sd-10",

        title:
          "Ignition Switch",

        instruction:
          "Set ignition to BOTH, wait 3 seconds, set LEFT, wait 3 seconds, set RIGHT, wait 3 seconds, then turn the ignition completely OFF.",

        controlId:
          "ignition",

        sequence: [
          "BOTH",
          "LEFT",
          "RIGHT",
          "OFF",
        ],

        expectedLabel:
          "BOTH → LEFT → RIGHT → OFF",

        note:
          "The checklist requires a 3-second wait between ignition positions. Current sequence logic checks the switch order only; automatic timing validation can be added later.",
      }),

      // -------------------------------------------------------
      // NAV LIGHT
      // -------------------------------------------------------
      controlStep({
        id: "sd-11",

        title:
          "Navigation Light",

        instruction:
          "Turn the navigation light OFF.",

        controlId:
          "nav_light",

        expected: "OFF",

        expectedLabel:
          "Navigation Light OFF",
      }),

      // -------------------------------------------------------
      // STROBE
      // -------------------------------------------------------
      controlStep({
        id: "sd-12",

        title:
          "Strobe Light",

        instruction:
          "Turn the strobe light OFF.",

        controlId:
          "strobe_light",

        expected: "OFF",

        expectedLabel:
          "Strobe Light OFF",
      }),

      // -------------------------------------------------------
      // GENERATOR
      // -------------------------------------------------------
      controlStep({
        id: "sd-13",

        title: "Generator",

        instruction:
          "Turn the generator OFF.",

        controlId:
          "generator",

        expected: "OFF",

        expectedLabel:
          "Generator OFF",
      }),

      // -------------------------------------------------------
      // MASTER
      // -------------------------------------------------------
      controlStep({
        id: "sd-14",

        title:
          "Master Switch",

        instruction:
          "Turn the Master Switch OFF.",

        controlId:
          "master_switch",

        expected: "OFF",

        expectedLabel:
          "Master Switch OFF",
      }),

      // -------------------------------------------------------
      // FUEL SELECTOR
      // -------------------------------------------------------
      controlStep({
        id: "sd-15",

        title:
          "Fuel Selector Valve",

        instruction:
          "Set the fuel selector valve to OFF.",

        controlId:
          "fuel_selector",

        expected: "OFF",

        expectedLabel:
          "Fuel Selector Valve OFF",
      }),

      // -------------------------------------------------------
      // CHRONOMETER
      // -------------------------------------------------------
      controlStep({
        id: "sd-16",

        title:
          "Chronometer / Clock",

        instruction:
          "Stop the chronometer.",

        controlId:
          "chronometer",

        expected:
          "STOPPED",

        expectedLabel:
          "Chronometer Stop",
      }),

      // -------------------------------------------------------
      // RELEASE BRAKES
      // -------------------------------------------------------
      controlStep({
        id: "sd-17",

        title:
          "Parking Brakes",

        instruction:
          "Release the parking brakes.",

        controlId:
          "parking_brake",

        expected:
          "RELEASED",

        expectedLabel:
          "Parking Brakes Released",
      }),
    ],
  },
];

// =============================================================
// GET CHECKLIST BY ID
// =============================================================

export function getChecklistById(
  id
) {
  return checklists.find(
    (checklist) =>
      checklist.id === id
  );
}