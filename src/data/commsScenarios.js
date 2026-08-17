/* ============================================================
   COMMUNICATION SCENARIOS
   TECNAM P2002JF COCKPIT TRAINER

   This file contains:
   - communication scripts
   - required communication elements
   - validation functions

   NOW:
   Text input -> validator

   LATER:
   Microphone -> speech-to-text -> SAME validator
   ============================================================ */


/* ============================================================
   TEXT NORMALIZATION
   ============================================================ */

export function normalizeText(text = "") {
  return text
    .toLowerCase()

    // Make hyphenated phrases easier to compare
    .replace(/-/g, " ")

    // Remove punctuation
    .replace(/[.,/#!$%^&*;:{}=\_`~()?]/g, " ")

    // Remove extra spaces
    .replace(/\s+/g, " ")

    .trim();
}


/* ============================================================
   COMPACT TEXT

   Example:

   RP-C1234
   RP C1234
   RP C 1234

   all become:

   rpc1234
   ============================================================ */

function compactText(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}


/* ============================================================
   CALLSIGN
   ============================================================ */

function hasCallsign(text) {
  const normalized =
    normalizeText(text);

  const compact =
    compactText(text);

  return (
    compact.includes("rpc1234") ||

    normalized.includes(
      "rp c 1234"
    ) ||

    normalized.includes(
      "rp c one two three four"
    ) ||

    normalized.includes(
      "romeo papa charlie one two three four"
    )
  );
}


/* ============================================================
   STATION
   ============================================================ */

function hasBinalonanRadio(text) {
  const normalized =
    normalizeText(text);

  return normalized.includes(
    "binalonan radio"
  );
}


/* ============================================================
   GOOD MORNING
   ============================================================ */

function hasGoodMorning(text) {
  return normalizeText(
    text
  ).includes(
    "good morning"
  );
}


/* ============================================================
   RUNWAY 17
   ============================================================ */

function hasRunway17(text) {
  const normalized =
    normalizeText(text);

  return (
    normalized.includes(
      "runway 17"
    ) ||
    normalized.includes(
      "runway one seven"
    )
  );
}


/* ============================================================
   HOLDING POINT 17
   ============================================================ */

function hasHoldingPoint17(text) {
  const normalized =
    normalizeText(text);

  return (
    normalized.includes(
      "holding point 17"
    ) ||
    normalized.includes(
      "holding point one seven"
    )
  );
}


/* ============================================================
   ALTIMETER 29.95
   ============================================================ */

function hasAltimeter2995(text) {
  const original =
    text.toLowerCase();

  const normalized =
    normalizeText(text);

  const compact =
    compactText(text);

  return (
    original.includes(
      "29.95"
    ) ||

    normalized.includes(
      "29 95"
    ) ||

    compact.includes(
      "2995"
    ) ||

    normalized.includes(
      "two niner niner five"
    ) ||

    normalized.includes(
      "two nine nine five"
    ) ||

    normalized.includes(
      "two niner nine five"
    )
  );
}


/* ============================================================
   ENGINE START REQUEST
   ============================================================ */

function hasEngineStartRequest(text) {
  const normalized =
    normalizeText(text);

  const hasRequest =
    normalized.includes(
      "request"
    );

  const hasEngine =
    normalized.includes(
      "engine"
    );

  const hasStart =
    normalized.includes(
      "start"
    ) ||
    normalized.includes(
      "startup"
    );

  return (
    hasRequest &&
    hasEngine &&
    hasStart
  );
}


/* ============================================================
   STUDENT STARTUP READBACK

   IMPORTANT:

   The STUDENT checklist says:

   "may start up"

   We intentionally do NOT accept
   "startup approved" here because
   that is the TOWER phrase.
   ============================================================ */

function hasMayStartUp(text) {
  const normalized =
    normalizeText(text);

  return (
    normalized.includes(
      "may start up"
    ) ||
    normalized.includes(
      "may startup"
    )
  );
}


/* ============================================================
   TAXI REQUEST
   ============================================================ */

function hasTaxiRequest(text) {
  const normalized =
    normalizeText(text);

  return (
    normalized.includes(
      "request"
    ) &&
    normalized.includes(
      "taxi"
    )
  );
}


/* ============================================================
   MAY TAXI READBACK
   ============================================================ */

function hasMayTaxi(text) {
  const normalized =
    normalizeText(text);

  return normalized.includes(
    "may taxi"
  );
}


/* ============================================================
   RUN-UP AREA
   ============================================================ */

function hasRunUpArea(text) {
  const normalized =
    normalizeText(text);

  // normalizeText turns "run-up"
  // into "run up"

  return normalized.includes(
    "run up area"
  );
}


/* ============================================================
   AT RAMP
   ============================================================ */

function hasAtRamp(text) {
  return normalizeText(
    text
  ).includes(
    "at ramp"
  );
}


/* ============================================================
   AT RUN-UP AREA
   ============================================================ */

function hasAtRunUpArea(text) {
  const normalized =
    normalizeText(text);

  return normalized.includes(
    "at run up area"
  );
}


/* ============================================================
   LINE-UP REQUEST
   ============================================================ */

function hasLineUpRequest(text) {
  const normalized =
    normalizeText(text);

  const hasRequest =
    normalized.includes(
      "request"
    );

  const hasLineUp =
    normalized.includes(
      "line up"
    ) ||
    normalized.includes(
      "lineup"
    );

  return (
    hasRequest &&
    hasLineUp
  );
}


/* ============================================================
   MAY LINE UP
   ============================================================ */

function hasMayLineUp(text) {
  const normalized =
    normalizeText(text);

  return (
    normalized.includes(
      "may line up"
    ) ||
    normalized.includes(
      "may lineup"
    )
  );
}


/* ============================================================
   COMMUNICATION SCENARIOS
   ============================================================ */

export const commsScenarios = {


  /* ==========================================================
     1. ENGINE STARTUP COMMUNICATION
     ========================================================== */

  "engine-startup": {
    id: "engine-startup",

    title:
      "Engine Startup Communication",

    station:
      "Binalonan Radio",

    stages: [

      /* ------------------------------------------------------
         INITIAL GREETING
         ------------------------------------------------------ */

      {
        id:
          "startup-greeting",

        title:
          "Initial Call",

        prompt:
          "Contact Binalonan Radio.",

        atcResponse:
          "RP-C1234, Good morning, go ahead.",

        evaluate(text) {
          return [
            {
              label:
                "Binalonan Radio",

              correct:
                hasBinalonanRadio(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },

            {
              label:
                "Good Morning",

              correct:
                hasGoodMorning(
                  text
                ),
            },
          ];
        },
      },


      /* ------------------------------------------------------
         ENGINE START REQUEST
         ------------------------------------------------------ */

      {
        id:
          "startup-request",

        title:
          "Engine Start Request",

        prompt:
          "Request engine startup from Binalonan Radio.",

        atcResponse:
          "RP-C1234, Runway 17 in use, altimeter setting 29.95, startup approved.",

        evaluate(text) {
          return [
            {
              label:
                "Binalonan Radio",

              correct:
                hasBinalonanRadio(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },

            {
              label:
                "Engine Start Request",

              correct:
                hasEngineStartRequest(
                  text
                ),
            },
          ];
        },
      },


      /* ------------------------------------------------------
         STARTUP READBACK
         ------------------------------------------------------ */

      {
        id:
          "startup-readback",

        title:
          "Startup Readback",

        prompt:
          "Read back the runway, altimeter setting, startup clearance, and callsign.",

        atcResponse:
          null,

        evaluate(text) {
          return [
            {
              label:
                "Runway 17",

              correct:
                hasRunway17(
                  text
                ),
            },

            {
              label:
                "Altimeter 29.95",

              correct:
                hasAltimeter2995(
                  text
                ),
            },

            {
              label:
                "May Start Up",

              correct:
                hasMayStartUp(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },
          ];
        },
      },
    ],
  },


  /* ==========================================================
     2. TAXI TO RUN-UP AREA
     ========================================================== */

  "taxi-runup": {
    id: "taxi-runup",

    title:
      "Taxi to Run-Up Area",

    station:
      "Binalonan Radio",

    stages: [

      /* ------------------------------------------------------
         TAXI REQUEST
         ------------------------------------------------------ */

      {
        id:
          "taxi-runup-request",

        title:
          "Taxi Request",

        prompt:
          "Contact Binalonan Radio from the ramp and request taxi to the run-up area.",

        atcResponse:
          "RP-C1234, may taxi to run-up area.",

        evaluate(text) {
          return [
            {
              label:
                "Binalonan Radio",

              correct:
                hasBinalonanRadio(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },

            {
              label:
                "At Ramp",

              correct:
                hasAtRamp(
                  text
                ),
            },

            {
              label:
                "Taxi Request",

              correct:
                hasTaxiRequest(
                  text
                ),
            },

            {
              label:
                "Run-Up Area",

              correct:
                hasRunUpArea(
                  text
                ),
            },
          ];
        },
      },


      /* ------------------------------------------------------
         TAXI READBACK
         ------------------------------------------------------ */

      {
        id:
          "taxi-runup-readback",

        title:
          "Taxi Readback",

        prompt:
          "Read back the taxi instruction.",

        atcResponse:
          null,

        evaluate(text) {
          return [
            {
              label:
                "May Taxi",

              correct:
                hasMayTaxi(
                  text
                ),
            },

            {
              label:
                "Run-Up Area",

              correct:
                hasRunUpArea(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },
          ];
        },
      },
    ],
  },


  /* ==========================================================
     3. TAXI TO HOLDING POINT 17
     ========================================================== */

  "taxi-holding-point": {
    id:
      "taxi-holding-point",

    title:
      "Taxi to Holding Point 17",

    station:
      "Binalonan Radio",

    stages: [

      /* ------------------------------------------------------
         HOLDING POINT REQUEST
         ------------------------------------------------------ */

      {
        id:
          "holding-request",

        title:
          "Holding Point Taxi Request",

        prompt:
          "Contact Binalonan Radio from the run-up area and request taxi to holding point 17.",

        atcResponse:
          "RP-C1234, may taxi to holding point 17.",

        evaluate(text) {
          return [
            {
              label:
                "Binalonan Radio",

              correct:
                hasBinalonanRadio(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },

            {
              label:
                "At Run-Up Area",

              correct:
                hasAtRunUpArea(
                  text
                ),
            },

            {
              label:
                "Taxi Request",

              correct:
                hasTaxiRequest(
                  text
                ),
            },

            {
              label:
                "Holding Point 17",

              correct:
                hasHoldingPoint17(
                  text
                ),
            },
          ];
        },
      },


      /* ------------------------------------------------------
         HOLDING POINT READBACK
         ------------------------------------------------------ */

      {
        id:
          "holding-readback",

        title:
          "Holding Point Readback",

        prompt:
          "Read back the taxi instruction to holding point 17.",

        atcResponse:
          null,

        evaluate(text) {
          return [
            {
              label:
                "May Taxi",

              correct:
                hasMayTaxi(
                  text
                ),
            },

            {
              label:
                "Holding Point 17",

              correct:
                hasHoldingPoint17(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },
          ];
        },
      },
    ],
  },


  /* ==========================================================
     4. LINE UP RUNWAY 17
     ========================================================== */

  "line-up": {
    id: "line-up",

    title:
      "Line Up Runway 17",

    station:
      "Binalonan Radio",

    stages: [

      /* ------------------------------------------------------
         LINE-UP REQUEST
         ------------------------------------------------------ */

      {
        id:
          "lineup-request",

        title:
          "Line-Up Request",

        prompt:
          "Report at holding point 17 and request to line up.",

        atcResponse:
          "RP-C1234, may line up runway 17.",

        evaluate(text) {
          return [
            {
              label:
                "Binalonan Radio",

              correct:
                hasBinalonanRadio(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },

            {
              label:
                "Holding Point 17",

              correct:
                hasHoldingPoint17(
                  text
                ),
            },

            {
              label:
                "Line-Up Request",

              correct:
                hasLineUpRequest(
                  text
                ),
            },
          ];
        },
      },


      /* ------------------------------------------------------
         LINE-UP READBACK
         ------------------------------------------------------ */

      {
        id:
          "lineup-readback",

        title:
          "Line-Up Readback",

        prompt:
          "Read back the runway line-up instruction.",

        atcResponse:
          null,

        evaluate(text) {
          return [
            {
              label:
                "May Line Up",

              correct:
                hasMayLineUp(
                  text
                ),
            },

            {
              label:
                "Runway 17",

              correct:
                hasRunway17(
                  text
                ),
            },

            {
              label:
                "Callsign RP-C1234",

              correct:
                hasCallsign(
                  text
                ),
            },
          ];
        },
      },
    ],
  },
};


/* ============================================================
   GET SCENARIO
   ============================================================ */

export function getCommsScenario(
  scenarioId
) {
  return (
    commsScenarios[
      scenarioId
    ] || null
  );
}