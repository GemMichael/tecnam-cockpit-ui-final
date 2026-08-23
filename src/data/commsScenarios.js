/* ============================================================
   COMMUNICATION SCENARIOS
   TECNAM P2002JF COCKPIT TRAINER

   PURPOSE

   Speech-to-text will never be perfectly consistent.

   Therefore:

   NON-CRITICAL WORDS:
   - tolerate common Whisper mistakes
   - tolerate small spelling differences
   - tolerate truncated words

   CRITICAL VALUES:
   - callsign RP-C1234
   - runway 17
   - holding point 17
   - altimeter 29.95

   remain intentionally strict.
   ============================================================ */


/* ============================================================
   TEXT NORMALIZATION
   ============================================================ */

export function normalizeText(
  text = ""
) {
  return text
    .toLowerCase()

    // Remove apostrophes
    .replace(
      /['’]/g,
      ""
    )

    // Turn hyphens into spaces
    .replace(
      /[-–—]/g,
      " "
    )

    // Remove punctuation
    .replace(
      /[.,/#!$%^&*;:{}=_`~()?]/g,
      " "
    )

    // Remove repeated spaces
    .replace(
      /\s+/g,
      " "
    )

    .trim();
}


/* ============================================================
   COMPACT TEXT

   Examples:

   RP-C1234
   RP C1234
   R P C 1234
   RPC-1234

   all become:

   rpc1234
   ============================================================ */

function compactText(
  text = ""
) {
  return text
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    );
}


/* ============================================================
   WORDS
   ============================================================ */

function getWords(
  text = ""
) {
  return normalizeText(
    text
  )
    .split(" ")
    .filter(Boolean);
}


/* ============================================================
   EDIT DISTANCE
   ============================================================ */

function getEditDistance(
  first,
  second
) {
  const a =
    first.toLowerCase();

  const b =
    second.toLowerCase();


  const matrix =
    Array.from(
      {
        length:
          b.length + 1,
      },
      () =>
        new Array(
          a.length + 1
        ).fill(0)
    );


  for (
    let i = 0;
    i <= a.length;
    i += 1
  ) {
    matrix[0][i] = i;
  }


  for (
    let j = 0;
    j <= b.length;
    j += 1
  ) {
    matrix[j][0] = j;
  }


  for (
    let j = 1;
    j <= b.length;
    j += 1
  ) {
    for (
      let i = 1;
      i <= a.length;
      i += 1
    ) {
      const cost =
        a[i - 1] ===
        b[j - 1]
          ? 0
          : 1;


      matrix[j][i] =
        Math.min(
          matrix[j][i - 1] + 1,

          matrix[j - 1][i] + 1,

          matrix[j - 1][i - 1] +
            cost
        );
    }
  }


  return matrix[
    b.length
  ][
    a.length
  ];
}


/* ============================================================
   APPROXIMATE WORD MATCHING

   Intended for NORMAL vocabulary only.

   Examples:

   request
   reques
   requesting
   requested

   engine
   engin

   taxi
   taxy
   taxiing

   DO NOT use this for critical numbers.
   ============================================================ */

function wordMatches(
  word,
  target,
  maxDistance = 1
) {
  if (
    !word ||
    !target
  ) {
    return false;
  }


  const cleanedWord =
    word
      .toLowerCase()
      .replace(
        /[^a-z]/g,
        ""
      );


  const cleanedTarget =
    target
      .toLowerCase()
      .replace(
        /[^a-z]/g,
        ""
      );


  if (
    !cleanedWord ||
    !cleanedTarget
  ) {
    return false;
  }


  /* Exact */

  if (
    cleanedWord ===
    cleanedTarget
  ) {
    return true;
  }


  /*

    request
    requesting
    requested

    taxi
    taxiing

  */

  if (
    cleanedWord.startsWith(
      cleanedTarget
    )
  ) {
    return true;
  }


  /*

    request
    reques

    engine
    engin

    Only allow truncation when most
    of the original word remains.

  */

  if (
    cleanedWord.length >=
      cleanedTarget.length - 2 &&
    cleanedTarget.startsWith(
      cleanedWord
    )
  ) {
    return true;
  }


  /*
    Small STT spelling difference.
  */

  return (
    getEditDistance(
      cleanedWord,
      cleanedTarget
    ) <= maxDistance
  );
}


/* ============================================================
   HAS APPROXIMATE WORD
   ============================================================ */

function hasApproxWord(
  text,
  target,
  maxDistance = 1
) {
  return getWords(
    text
  ).some(
    (word) =>
      wordMatches(
        word,
        target,
        maxDistance
      )
  );
}


/* ============================================================
   HAS ANY EXACT PHRASE
   ============================================================ */

function hasAnyPhrase(
  text,
  phrases
) {
  const normalized =
    normalizeText(text);


  return phrases.some(
    (phrase) =>
      normalized.includes(
        normalizeText(
          phrase
        )
      )
  );
}


/* ============================================================
   REQUEST WORD

   Accepts:

   request
   reques
   requests
   requested
   requesting

   plus a small spelling error.
   ============================================================ */

function hasRequestWord(
  text
) {
  return hasApproxWord(
    text,
    "request",
    1
  );
}


/* ============================================================
   MAY / PERMISSION WORD

   Whisper commonly hears:

   May
   Main
   Mai
   Mei
   Mey
   Mayweather

   This is used only together with another required
   action such as taxi / line up / start up.
   ============================================================ */

function hasPermissionWord(
  text
) {
  const words =
    getWords(text);


  const knownVariants = [
    "may",
    "main",
    "mai",
    "mei",
    "mey",
    "mayweather",
  ];


  return words.some(
    (word) =>
      knownVariants.includes(
        word
      )
  );
}


/* ============================================================
   CALLSIGN
   CRITICAL VALUE

   MUST remain strict.

   Acceptable transcription forms:

   RP-C1234
   RPC-1234
   RP C 1234
   R P C 1234
   R.P.C. 1234

   RP C one two three four
   Romeo Papa Charlie one two three four

   Incorrect digits must NOT pass.
   ============================================================ */

function hasCallsign(
  text
) {
  const normalized =
    normalizeText(text);

  const compact =
    compactText(text);


  /* Numeric form */

  if (
    compact.includes(
      "rpc1234"
    )
  ) {
    return true;
  }


  /* Spoken number */

  return (
    normalized.includes(
      "rp c one two three four"
    ) ||

    normalized.includes(
      "r p c one two three four"
    ) ||

    normalized.includes(
      "rpc one two three four"
    ) ||

    normalized.includes(
      "romeo papa charlie one two three four"
    ) ||

    normalized.includes(
      "romeo papa charlie 1234"
    )
  );
}


/* ============================================================
   BINALONAN
   ============================================================ */

function isBinalonanVariant(
  candidate
) {
  if (!candidate) {
    return false;
  }


  const cleaned =
    candidate
      .toLowerCase()
      .replace(
        /[^a-z]/g,
        ""
      );


  if (
    cleaned.length < 7 ||
    cleaned.length > 12
  ) {
    return false;
  }


  if (
    cleaned ===
    "binalonan"
  ) {
    return true;
  }


  const knownVariants = [
    "binalonan",
    "binaloanan",
    "binalonen",
    "binalonon",
    "binalunan",
    "binalunan",
  ];


  if (
    knownVariants.includes(
      cleaned
    )
  ) {
    return true;
  }


  /*
    Binalonan is a proper place name,
    therefore limited fuzzy matching
    is acceptable here.
  */

  return (
    getEditDistance(
      cleaned,
      "binalonan"
    ) <= 2
  );
}


/* ============================================================
   BINALONAN RADIO
   ============================================================ */

function hasBinalonanRadio(
  text
) {
  const normalized =
    normalizeText(text);

  const words =
    getWords(text);


  /* Radio must still exist */

  const radioIndexes = [];


  words.forEach(
    (word, index) => {

      if (
        wordMatches(
          word,
          "radio",
          1
        )
      ) {
        radioIndexes.push(
          index
        );
      }

    }
  );


  if (
    radioIndexes.length === 0
  ) {
    return false;
  }


  /* Exact */

  if (
    normalized.includes(
      "binalonan radio"
    )
  ) {
    return true;
  }


  /*
    Check one, two or three words
    before "radio".

    This handles:

    Binaloanan Radio

    Bina Loanan Radio
  */

  for (
    const radioIndex
    of radioIndexes
  ) {

    for (
      let count = 1;
      count <= 3;
      count += 1
    ) {

      if (
        radioIndex -
          count <
        0
      ) {
        continue;
      }


      const candidate =
        words
          .slice(
            radioIndex -
              count,
            radioIndex
          )
          .join("");


      if (
        isBinalonanVariant(
          candidate
        )
      ) {
        return true;
      }

    }
  }


  return false;
}


/* ============================================================
   GOOD MORNING
   ============================================================ */

function hasGoodMorning(
  text
) {
  const normalized =
    normalizeText(text);


  if (
    normalized.includes(
      "good morning"
    ) ||
    normalized.includes(
      "good mourning"
    ) ||
    normalized.includes(
      "good mornin"
    )
  ) {
    return true;
  }


  return (
    hasApproxWord(
      text,
      "good",
      1
    ) &&

    (
      hasApproxWord(
        text,
        "morning",
        1
      ) ||

      normalized.includes(
        "mourning"
      )
    )
  );
}


/* ============================================================
   RUNWAY WORD
   ============================================================ */

function hasRunwayWord(
  text
) {
  const normalized =
    normalizeText(text);


  return (
    normalized.includes(
      "runway"
    ) ||

    normalized.includes(
      "run way"
    ) ||

    hasApproxWord(
      text,
      "runway",
      1
    )
  );
}


/* ============================================================
   NUMBER 17

   Critical value stays strict.

   Accept:

   17
   one seven
   seventeen

   but NOT another runway number.
   ============================================================ */

function hasNumber17(
  text
) {
  const normalized =
    normalizeText(text);


  return (
    /(^|\s)17($|\s)/.test(
      normalized
    ) ||

    normalized.includes(
      "one seven"
    ) ||

    normalized.includes(
      "seventeen"
    )
  );
}


/* ============================================================
   RUNWAY 17
   ============================================================ */

function hasRunway17(
  text
) {
  return (
    hasRunwayWord(
      text
    ) &&

    hasNumber17(
      text
    )
  );
}


/* ============================================================
   HOLDING POINT 17

   "holding" and "point" may tolerate slight
   STT errors.

   17 remains strict.
   ============================================================ */

function hasHoldingPoint17(
  text
) {
  const normalized =
    normalizeText(text);


  const hasHoldingPoint =
    (
      normalized.includes(
        "holding point"
      ) ||

      normalized.includes(
        "hold point"
      ) ||

      (
        hasApproxWord(
          text,
          "holding",
          1
        ) &&

        hasApproxWord(
          text,
          "point",
          1
        )
      )
    );


  return (
    hasHoldingPoint &&
    hasNumber17(
      text
    )
  );
}


/* ============================================================
   ALTIMETER VALUE 29.95
   CRITICAL VALUE
   ============================================================ */

function hasAltimeterValue2995(
  text
) {
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
    ) ||

    normalized.includes(
      "two nine ninety five"
    ) ||

    normalized.includes(
      "twenty nine ninety five"
    )
  );
}


/* ============================================================
   ALTIMETER 29.95

   Require BOTH:

   altimeter
   +
   correct value
   ============================================================ */

function hasAltimeter2995(
  text
) {
  const hasAltimeter =
    hasApproxWord(
      text,
      "altimeter",
      1
    );


  return (
    hasAltimeter &&
    hasAltimeterValue2995(
      text
    )
  );
}


/* ============================================================
   ENGINE WORD
   ============================================================ */

function hasEngineWord(
  text
) {
  return hasApproxWord(
    text,
    "engine",
    1
  );
}


/* ============================================================
   START / START-UP
   ============================================================ */

function hasStartConcept(
  text
) {
  const normalized =
    normalizeText(text);


  return (
    normalized.includes(
      "start up"
    ) ||

    normalized.includes(
      "startup"
    ) ||

    hasApproxWord(
      text,
      "start",
      1
    )
  );
}


/* ============================================================
   ENGINE START REQUEST

   Require all three:

   REQUEST
   ENGINE
   START
   ============================================================ */

function hasEngineStartRequest(
  text
) {
  return (
    hasRequestWord(
      text
    ) &&

    hasEngineWord(
      text
    ) &&

    hasStartConcept(
      text
    )
  );
}


/* ============================================================
   MAY START UP
   ============================================================ */

function hasMayStartUp(
  text
) {
  return (
    hasPermissionWord(
      text
    ) &&

    hasStartConcept(
      text
    )
  );
}


/* ============================================================
   TAXI WORD
   ============================================================ */

function hasTaxiWord(
  text
) {
  return (
    hasApproxWord(
      text,
      "taxi",
      1
    ) ||

    hasAnyPhrase(
      text,
      [
        "taxy",
        "taxiing",
      ]
    )
  );
}


/* ============================================================
   TAXI REQUEST

   Require both:

   REQUEST
   TAXI
   ============================================================ */

function hasTaxiRequest(
  text
) {
  return (
    hasRequestWord(
      text
    ) &&

    hasTaxiWord(
      text
    )
  );
}


/* ============================================================
   MAY TAXI

   Examples that can pass:

   may taxi
   main taxi
   mai taxi
   mei taxi
   Mayweather may taxi

   Taxi itself must still be detected.
   ============================================================ */

function hasMayTaxi(
  text
) {
  return (
    hasPermissionWord(
      text
    ) &&

    hasTaxiWord(
      text
    )
  );
}


/* ============================================================
   RUN-UP AREA

   Intended phrase:
   "run-up area"

   This is a NON-NUMERIC location name, so we tolerate
   known Whisper acoustic mistakes.

   Still do NOT accept just any "area".
   ============================================================ */

function hasRunUpArea(
  text
) {
  const normalized =
    normalizeText(text);


  /* Exact */

  if (
    normalized.includes(
      "run up area"
    ) ||

    normalized.includes(
      "runup area"
    )
  ) {
    return true;
  }


  /*
    Known Whisper variants observed
    or commonly plausible.
  */

  const knownVariants = [
    "runoff area",
    "run off area",

    "running area",
    "running up area",

    "runway area",
    "runway up area",

    "ramp up area",

    "round up area",

    "harbaugh area",
    "harbor area",
    "harbour area",

    "fatally up area",
    "finally up area",

    "ready up area",
  ];


  if (
    knownVariants.some(
      (variant) =>
        normalized.includes(
          variant
        )
    )
  ) {
    return true;
  }


  /*
    Handle:
    "fatally-up area"
    "finally-up area"

    but don't accept arbitrary
    "parking area".
  */

  const words =
    getWords(text);


  const areaIndexes =
    words
      .map(
        (word, index) =>
          word === "area"
            ? index
            : -1
      )
      .filter(
        (index) =>
          index >= 0
      );


  const allowedRunUpLikeWords = [
    "run",
    "runup",
    "runoff",
    "running",
    "runway",
    "ramp",
    "round",
    "harbaugh",
    "harbor",
    "harbour",
    "fatally",
    "finally",
    "ready",
  ];


  for (
    const areaIndex
    of areaIndexes
  ) {

    /* word directly before area */

    if (
      areaIndex >= 1
    ) {
      const previous =
        words[
          areaIndex - 1
        ];


      if (
        allowedRunUpLikeWords.some(
          (candidate) =>
            wordMatches(
              previous,
              candidate,
              1
            )
        )
      ) {
        return true;
      }
    }


    /*
      pattern:

      something + up + area
    */

    if (
      areaIndex >= 2 &&
      words[
        areaIndex - 1
      ] === "up"
    ) {
      const beforeUp =
        words[
          areaIndex - 2
        ];


      if (
        allowedRunUpLikeWords.some(
          (candidate) =>
            wordMatches(
              beforeUp,
              candidate,
              1
            )
        )
      ) {
        return true;
      }
    }
  }


  return false;
}


/* ============================================================
   AT RAMP
   ============================================================ */

function hasAtRamp(
  text
) {
  const normalized =
    normalizeText(text);


  if (
    normalized.includes(
      "at ramp"
    ) ||

    normalized.includes(
      "at the ramp"
    )
  ) {
    return true;
  }


  /*
    "ramp" carries the actual location information.

    Allow small STT mistakes.
  */

  return hasApproxWord(
    text,
    "ramp",
    1
  );
}


/* ============================================================
   AT RUN-UP AREA
   ============================================================ */

function hasAtRunUpArea(
  text
) {
  const normalized =
    normalizeText(text);


  const hasAt =
    (
      normalized.includes(
        "at "
      ) ||

      normalized.includes(
        "from the"
      ) ||

      normalized.includes(
        "from run"
      )
    );


  return (
    hasAt &&
    hasRunUpArea(
      text
    )
  );
}


/* ============================================================
   LINE-UP
   ============================================================ */

function hasLineUpConcept(
  text
) {
  const normalized =
    normalizeText(text);


  if (
    normalized.includes(
      "line up"
    ) ||

    normalized.includes(
      "lineup"
    ) ||

    normalized.includes(
      "lining up"
    )
  ) {
    return true;
  }


  /*
    Common STT acoustic substitution:
    line → lying
  */

  if (
    normalized.includes(
      "lying up"
    )
  ) {
    return true;
  }


  return (
    hasApproxWord(
      text,
      "line",
      1
    ) &&

    getWords(
      text
    ).includes(
      "up"
    )
  );
}


/* ============================================================
   LINE-UP REQUEST
   ============================================================ */

function hasLineUpRequest(
  text
) {
  return (
    hasRequestWord(
      text
    ) &&

    hasLineUpConcept(
      text
    )
  );
}


/* ============================================================
   MAY LINE UP
   ============================================================ */

function hasMayLineUp(
  text
) {
  return (
    hasPermissionWord(
      text
    ) &&

    hasLineUpConcept(
      text
    )
  );
}


/* ============================================================
   COMMUNICATION SCENARIOS
   ============================================================ */

export const commsScenarios = {


  /* ==========================================================
     1. ENGINE STARTUP
     ========================================================== */

  "engine-startup": {
    id:
      "engine-startup",

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
    id:
      "taxi-runup",

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
         HOLDING POINT TAXI REQUEST
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
    id:
      "line-up",

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
   GET COMMUNICATION SCENARIO
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