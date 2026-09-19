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

/* ============================================================
   REQUEST WORD / REQUEST CONCEPT

   Whisper may hear the spoken word "request" in many ways.

   We tolerate transcription variations here because "request"
   itself is NOT a critical numerical value.

   IMPORTANT:
   This function does NOT by itself approve an aviation request.

   Other validators still require the correct action:

   Engine Start Request
   = request + engine + start

   Taxi Request
   = request + taxi

   Line-Up Request
   = request + line up

   Therefore accepting a transcription such as "requisite"
   does not automatically make the whole transmission correct.
   ============================================================ */

function hasRequestWord(
  text
) {
  const normalized =
    normalizeText(text);

  const words =
    getWords(text);


  /* ==========================================================
     COMMON / EXPECTED FORMS
     ========================================================== */

  const knownRequestVariants = [

    /* Correct */
    "request",

    /* Missing final letters */
    "reques",
    "reque",
    "requeste",

    /* Small spelling / STT errors */
    "reqest",
    "requst",
    "requess",
    "reqeust",
    "requset",
    "requestt",
    "requestd",

    /* Grammatical forms */
    "requests",
    "requested",
    "requesting",
    "requestin",

    /* Whisper acoustic substitutions */
    "requisite",
    "requisit",
    "requisition",
    "requis",
  ];


  /* ==========================================================
     DIRECT KNOWN VARIANT
     ========================================================== */

  if (
    words.some(
      (word) =>
        knownRequestVariants.includes(
          word
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     NORMAL PHRASES

     These are useful if Whisper separates surrounding words.
     ========================================================== */

  const requestPhrases = [
    "request for",
    "request to",
    "request taxi",
    "request engine",
    "request line",
    "requesting taxi",
    "requesting engine",
    "requesting line",
    "requested taxi",
  ];


  if (
    requestPhrases.some(
      (phrase) =>
        normalized.includes(
          phrase
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     EXISTING APPROXIMATE MATCHING

     This already handles things such as:

     request
     reques
     reqest
     requst
     requested
     requesting
     ========================================================== */

  if (
    hasApproxWord(
      text,
      "request",
      1
    )
  ) {
    return true;
  }


  /* ==========================================================
     SLIGHTLY STRONGER FALLBACK

     Only examine words that still look reasonably similar
     to "request".

     We intentionally do NOT accept every word beginning with
     "requ", because words like:

     require
     required
     requirement

     should not automatically count as "request".
     ========================================================== */

  return words.some(
    (word) => {

      const cleaned =
        word
          .toLowerCase()
          .replace(
            /[^a-z]/g,
            ""
          );


      if (
        cleaned.length < 5 ||
        cleaned.length > 11
      ) {
        return false;
      }


      return (
        getEditDistance(
          cleaned,
          "request"
        ) <= 2
      );
    }
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

/* ============================================================
   MAY / PERMISSION WORD

   Intended aviation phrase:
   "may taxi"

   Whisper can mishear "may" in many ways.

   This function is intentionally tolerant because "may"
   is NOT a safety-critical numerical value.

   The action itself (taxi / line up / start up) is still
   validated separately.
   ============================================================ */

function hasPermissionWord(
  text
) {
  const normalized =
    normalizeText(text);

  const words =
    getWords(text);


  /* ==========================================================
     KNOWN WHISPER VARIANTS OF "MAY"
     ========================================================== */

  const knownVariants = [
    "may",
    "mai",
    "mei",
    "mey",

    "main",
    "mane",

    "me",
    "my",

    "mate",

    "made",

    "make",

    "maybe",

    "mayday",

    "mayweather",

    "mae",
    "mei",
  ];


  if (
    words.some(
      (word) =>
        knownVariants.includes(
          word
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     COMMON FULL-PHRASE WHISPER OUTPUTS
     ========================================================== */

  const knownPhrases = [

    /* Intended */
    "may taxi",

    /* Common May substitutions */
    "main taxi",
    "mai taxi",
    "mei taxi",
    "mey taxi",

    "me taxi",
    "my taxi",

    "mate taxi",

    "made taxi",

    "maybe taxi",

    /* When Whisper joins/splits words strangely */
    "maytaxi",
    "main taxiing",

    /* Observed style */
    "mayweather may taxi",
    "mayweather taxi",
  ];


  if (
    knownPhrases.some(
      (phrase) =>
        normalized.includes(
          phrase
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     SMALL FUZZY MATCH

     Only apply this to words close to "may".
     ========================================================== */

  return words.some(
    (word) => {

      const cleaned =
        word
          .toLowerCase()
          .replace(
            /[^a-z]/g,
            ""
          );


      if (
        cleaned.length < 2 ||
        cleaned.length > 5
      ) {
        return false;
      }


      return (
        getEditDistance(
          cleaned,
          "may"
        ) <= 1
      );
    }
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
      "rpc c one two three four"
    ) ||
    normalized.includes(
      "hbsc one two three four"
    ) ||

    normalized.includes(
      "rpc c one two three four"
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
    "be not"
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

/* ============================================================
   RUNWAY WORD / RUNWAY CONCEPT

   Intended aviation word:
   "runway"

   Whisper may transcribe "runway" in different ways:

   runway
   run way
   run away
   runaway
   railway
   rail way
   right way
   rightway
   one way
   runways
   etc.

   IMPORTANT:
   This function validates ONLY the word/concept "runway".

   The runway NUMBER is checked separately by hasNumber17(),
   so "runway 16" must still NOT pass as Runway 17.
   ============================================================ */

function hasRunwayWord(
  text
) {
  const normalized =
    normalizeText(text);

  const words =
    getWords(text);


  /* ==========================================================
     KNOWN WHISPER PHRASE VARIANTS
     ========================================================== */

  const knownRunwayPhrases = [

    /* Correct */
    "runway",
    "run way",

    /* Very common acoustic split */
    "run away",
    "runaway",

    /* Railway substitution */
    "railway",
    "rail way",

    /* Right-way substitution */
    "right way",
    "rightway",

    /* Similar acoustic outputs */
    "run ways",
    "runways",

    "running way",
    "running away",

    "run a way",

    "ron way",
    "ronway",

    "ran way",
    "ranway",

    "round way",
    "roundway",

    "wrong way",
    "wrongway",

    "one way",
    "oneway",

    "run",
    "way",

    /* Possible Whisper pronunciation variants */
    "run wei",
    "run whey",
    "run wai",

    "rail wei",
    "rail wai",

    "right wei",
    "right wai",
  ];


  if (
    knownRunwayPhrases.some(
      (phrase) =>
        normalized.includes(
          normalizeText(
            phrase
          )
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     SINGLE-WORD VARIANTS
     ========================================================== */

  const knownRunwayWords = [
    "runway",
    "runways",

    "runaway",

    "railway",

    "rightway",

    "ronway",
    "ranway",
    "roundway",

    "wrongway",

    "oneway",
  ];


  if (
    words.some(
      (word) =>
        knownRunwayWords.includes(
          word
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     NORMAL FUZZY MATCH

     Handles small spelling/STT mistakes such as:

     runwa
     runwey
     runwai
     runwy
     ========================================================== */

  if (
    hasApproxWord(
      text,
      "runway",
      2
    )
  ) {
    return true;
  }


  /* ==========================================================
     TWO-WORD "... WAY" PATTERN

     Whisper often recognizes "way" correctly but changes
     the first word.

     Examples:

     right way
     rail way
     ran way
     ron way
     round way

     We only allow known runway-like first words.

     DO NOT accept "way" by itself.
     ========================================================== */

  const runwayLikeFirstWords = [
    "run",
    "ron",
    "ran",

    "rail",

    "right",

    "round",

    "wrong",

    "one",
  ];


  for (
    let index = 0;
    index < words.length - 1;
    index += 1
  ) {
    const first =
      words[index];

    const second =
      words[index + 1];


    const firstMatches =
      runwayLikeFirstWords.some(
        (candidate) =>
          wordMatches(
            first,
            candidate,
            1
          )
      );


    const secondMatches =
      second === "way" ||
      second === "wei" ||
      second === "wai" ||
      second === "whey";


    if (
      firstMatches &&
      secondMatches
    ) {
      return true;
    }
  }


  return false;
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

/* ============================================================
   NUMBER 17
   CRITICAL VALUE

   Intended aviation pronunciation:
   "one seven"

   Accept different TEXT representations of the SAME value:

   17
   one seven
   1 7
   one 7
   1 seven
   seventeen
   seven teen

   Hyphenated / punctuated forms are already normalized by
   normalizeText():

   one-seven  -> one seven
   1-7        -> 1 7
   one, seven -> one seven

   IMPORTANT:
   DO NOT use broad fuzzy matching here.

   Wrong numbers such as:
   one six
   one eight
   sixteen
   eighteen
   seventy

   must NOT pass.
   ============================================================ */

function hasNumber17(
  text
) {
  const normalized =
    normalizeText(text);

  const compact =
    compactText(text);


  /* ==========================================================
     DIRECT NUMERIC FORM

     Examples:

     17
     runway 17
     holding point 17
     ========================================================== */

  if (
    /(^|\s)17($|\s)/.test(
      normalized
    )
  ) {
    return true;
  }


  /* ==========================================================
     COMPACT NUMERIC FORM

     Handles punctuation forms such as:

     "17."
     "(17)"

     normalizeText already handles most punctuation,
     but this gives us another safe check.
     ========================================================== */

  if (
    compact === "17"
  ) {
    return true;
  }


  /* ==========================================================
     STANDARD AVIATION FORM

     "one seven"
     ========================================================== */

  if (
    normalized.includes(
      "one seven"
    )
  ) {
    return true;
  }


  /* ==========================================================
     MIXED NUMBER / WORD FORMS

     Whisper may output:

     1 seven
     one 7
     1 7
     ========================================================== */

  if (
    normalized.includes(
      "1 seven"
    ) ||

    normalized.includes(
      "one 7"
    ) ||

    /(^|\s)1\s+7($|\s)/.test(
      normalized
    )
  ) {
    return true;
  }


  /* ==========================================================
     NATURAL NUMBER FORM

     Whisper sometimes converts "one seven" into:

     seventeen
     ========================================================== */

  if (
    /(^|\s)seventeen($|\s)/.test(
      normalized
    )
  ) {
    return true;
  }


  /* ==========================================================
     SPLIT "SEVENTEEN"

     Occasionally STT may separate the word:

     seven teen
     ========================================================== */

  if (
    normalized.includes(
      "seven teen"
    )
  ) {
    return true;
  }


  return false;
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
  const normalized =
    normalizeText(text);

  const words =
    getWords(text);


  /* ==========================================================
     ALTIMETER WORD

     Known Whisper variants are allowed because the actual
     value 29.95 is checked separately and remains strict.
     ========================================================== */

  const knownAltimeterVariants = [
    "altimeter",
    "altimter",
    "altimeter",
    "altimeter",

    "celtimeter",
    "celtimter",
    "centimter",

    "eltimeter",
    "ultimeter",

    "altimeter",
    "altimater",
  ];


  const hasAltimeterWord =
    words.some(
      (word) =>
        knownAltimeterVariants.includes(
          word
        )
    ) ||

    hasApproxWord(
      text,
      "altimeter",
      2
    );


  return (
    hasAltimeterWord &&
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

/* ============================================================
   TAXI WORD / TAXI CONCEPT

   Intended word:
   taxi

   This is a non-numeric action word, so reasonable Whisper
   transcription errors can be tolerated.
   ============================================================ */

function hasTaxiWord(
  text
) {
  const normalized =
    normalizeText(text);

  const words =
    getWords(text);


  /* ==========================================================
     KNOWN VARIANTS
     ========================================================== */

  const knownVariants = [
    "taxi",
    "taxy",

    "tax",
    "taxie",
    "taxey",

    "taxiing",
    "taxying",

    "taxing",

    "taxied",
  ];


  if (
    words.some(
      (word) =>
        knownVariants.includes(
          word
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     COMMON SPLIT WHISPER OUTPUTS
     ========================================================== */

  const knownPhrases = [
    "tax he",
    "taxi ing",
    "tax e",
    "taxi to",
  ];


  if (
    knownPhrases.some(
      (phrase) =>
        normalized.includes(
          phrase
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     EXISTING FUZZY MATCHING
     ========================================================== */

  return hasApproxWord(
    text,
    "taxi",
    1
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

/* ============================================================
   MAY TAXI / TAXI CLEARANCE READBACK

   Intended phrase:
   "May taxi"

   Examples Whisper may produce:

   may taxi
   main taxi
   mai taxi
   mei taxi
   me taxi
   my taxi
   mate taxi
   may tax
   main tax
   may tax he
   main tax he
   may taxiing
   mayweather may taxi

   IMPORTANT:
   This only validates the permission/action concept.

   Destination and callsign are still checked independently.
   ============================================================ */

function hasMayTaxi(
  text
) {
  const normalized =
    normalizeText(text);


  /* ==========================================================
     HIGH-CONFIDENCE PHRASE VARIANTS
     ========================================================== */

  const knownMayTaxiPhrases = [
    "may taxi",
    "main taxi",

    "mai taxi",
    "mei taxi",
    "mey taxi",

    "me taxi",
    "my taxi",
    "mainly",

    "mate taxi",

    "made taxi",

    "maybe taxi",

    "may tax",
    "main tax",
    "mai tax",
    "mei tax",
    "my tax",

    "may tax he",
    "main tax he",
    "mai tax he",

    "may taxiing",
    "main taxiing",

    "mayweather may taxi",
    "mayweather taxi",
  ];


  if (
    knownMayTaxiPhrases.some(
      (phrase) =>
        normalized.includes(
          phrase
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     NORMAL SEMANTIC CHECK

     Permission-like word
            +
     Taxi-like word
     ========================================================== */

  if (
    hasPermissionWord(
      text
    ) &&
    hasTaxiWord(
      text
    )
  ) {
    return true;
  }


  return false;
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
    "right up area",

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
    "ranway",
    "right",
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

/* ============================================================
   AT RAMP / RAMP POSITION

   Intended phrase:
   "at ramp"

   This is a non-numeric position, therefore limited Whisper
   tolerance is acceptable.

   IMPORTANT:
   Do not use this kind of tolerance for runway or holding
   point numbers.
   ============================================================ */

function hasAtRamp(
  text
) {
  const normalized =
    normalizeText(text);

  const words =
    getWords(text);


  /* ==========================================================
     EXACT / NORMAL FORMS
     ========================================================== */

  const normalPhrases = [
    "at ramp",
    "at the ramp",
    "on ramp",
    "on the ramp",
    "from ramp",
    "from the ramp",
    "the ramp",
    "a ramp",
  ];


  if (
    normalPhrases.some(
      (phrase) =>
        normalized.includes(
          phrase
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     KNOWN / PLAUSIBLE WHISPER VARIANTS
     ========================================================== */

  const rampVariants = [
    "ramp",
    "ram",
    "ramps",

    "remp",

    "ran",

    "cramp",

    "ramped",

    "ramping",
  ];


  if (
    words.some(
      (word) =>
        rampVariants.includes(
          word
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     FUZZY RAMP MATCH

     Keep this limited to short words.

     This catches small acoustic/spelling errors without
     accepting arbitrary sentences.
     ========================================================== */

  return words.some(
    (word) => {

      const cleaned =
        word
          .toLowerCase()
          .replace(
            /[^a-z]/g,
            ""
          );


      if (
        cleaned.length < 3 ||
        cleaned.length > 6
      ) {
        return false;
      }


      return (
        getEditDistance(
          cleaned,
          "ramp"
        ) <= 1
      );
    }
  );
}


/* ============================================================
   AT RUN-UP AREA
   ============================================================ */

/* ============================================================
   AT RUN-UP AREA / RUN-UP POSITION

   Intended phrase:
   "at run-up area"

   Whisper may hear or omit the position word "at".

   Examples that should be accepted:

   at run-up area
   at the run-up area
   at run up area
   at the run up area

   run-up area
   run up area
   runup area

   from run-up area
   from the run-up area
   from run up area

   plus the known run-up-area acoustic variants already
   handled by hasRunUpArea().

   IMPORTANT:
   This is a non-critical position name.

   Holding Point 17 is still validated separately and remains
   strict.
   ============================================================ */

function hasAtRunUpArea(
  text
) {
  const normalized =
    normalizeText(text);


  /* ==========================================================
     NORMAL POSITION PHRASES
     ========================================================== */

  const normalPhrases = [
    "at run up area",
    "at the run up area",

    "at runup area",
    "at the runup area",

    "from run up area",
    "from the run up area",

    "from runup area",
    "from the runup area",

    "on run up area",
    "on the run up area",
  ];


  if (
    normalPhrases.some(
      (phrase) =>
        normalized.includes(
          phrase
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     MOST IMPORTANT FALLBACK

     During this communication stage, detecting the actual
     position "run-up area" is enough.

     Whisper commonly drops short words such as:

     at
     the
     from

     Example spoken:
     "at run-up area"

     Whisper:
     "run-up area"

     This should still pass.
     ========================================================== */

  if (
    hasRunUpArea(
      text
    )
  ) {
    return true;
  }


  return false;
}


/* ============================================================
   LINE-UP
   ============================================================ */

/* ============================================================
   LINE-UP CONCEPT

   Intended phrase:
   "line up"

   Whisper may transcribe this in several ways.

   This is NON-CRITICAL wording.

   Runway 17 is still checked separately and remains strict.
   ============================================================ */

function hasLineUpConcept(
  text
) {
  const normalized =
    normalizeText(text);

  const words =
    getWords(text);


  /* ==========================================================
     NORMAL / COMMON FORMS
     ========================================================== */

  const knownPhrases = [

    /* Correct */
    "line up",
    "lineup",

    /* Grammatical */
    "lining up",
    "lined up",

    /* Common acoustic substitutions */
    "lying up",
    "lie up",

    /* Whisper split/substitution possibilities */
    "line app",
    "line-up",

    /* May occasionally hear "align" */
    "align up",
  ];


  if (
    knownPhrases.some(
      (phrase) =>
        normalized.includes(
          normalizeText(
            phrase
          )
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     WORD PAIR CHECK

     Look for something close to:

     line + up

     or

     lie + up
     ========================================================== */

  for (
    let index = 0;
    index < words.length - 1;
    index += 1
  ) {

    const first =
      words[index];

    const second =
      words[index + 1];


    const lineLike =
      wordMatches(
        first,
        "line",
        1
      ) ||
      wordMatches(
        first,
        "lie",
        1
      ) ||
      wordMatches(
        first,
        "align",
        1
      );


    const upLike =
      second === "up" ||
      wordMatches(
        second,
        "up",
        1
      );


    if (
      lineLike &&
      upLike
    ) {
      return true;
    }
  }


  /* ==========================================================
     SINGLE WORD "LINEUP"
     ========================================================== */

  return words.some(
    (word) => {

      const cleaned =
        word
          .toLowerCase()
          .replace(
            /[^a-z]/g,
            ""
          );


      return (
        cleaned === "lineup" ||
        cleaned === "liningup"
      );
    }
  );
}


/* ============================================================
   LINE-UP REQUEST
   ============================================================ */

/* ============================================================
   LINE-UP REQUEST

   Intended:
   "request to line up"

   Request transcription tolerance is handled by
   hasRequestWord().

   Line-up transcription tolerance is handled by
   hasLineUpConcept().
   ============================================================ */

function hasLineUpRequest(
  text
) {
  const normalized =
    normalizeText(text);


  /* ==========================================================
     NORMAL / COMMON PHRASES
     ========================================================== */

  const knownPhrases = [
    "request to line up",
    "request line up",
    "request lineup",

    "requesting line up",
    "requesting lineup",

    "reques to line up",
    "reques line up",

    "requisite to line up",
    "requisite line up",

    "request to lying up",
    "reques to lying up",
  ];


  if (
    knownPhrases.some(
      (phrase) =>
        normalized.includes(
          phrase
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     SEMANTIC VALIDATION

     request-like concept
             +
     line-up concept
     ========================================================== */

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

/* ============================================================
   MAY LINE UP / LINE-UP CLEARANCE READBACK

   Intended phrase:
   "may line up"

   Whisper may produce:

   may line up
   main line up
   mai line up
   mei line up
   my line up
   me line up
   may lineup
   main lineup
   may lying up
   main lying up
   etc.

   IMPORTANT:

   This validates ONLY the permission + line-up concept.

   Runway 17 and RP-C1234 are checked separately.
   ============================================================ */

function hasMayLineUp(
  text
) {
  const normalized =
    normalizeText(text);


  /* ==========================================================
     KNOWN PHRASE VARIANTS
     ========================================================== */

  const knownMayLineUpPhrases = [

    /* Correct */
    "may line up",
    "may lineup",

    /* May → Main */
    "main line up",
    "main lineup",
    "main line",
    "mainline",

    /* Phonetic May variants */
    "mai line up",
    "mai lineup",

    "mei line up",
    "mei lineup",

    "mey line up",
    "mey lineup",

    "mae line up",

    /* Short-word substitutions */
    "me line up",
    "my line up",

    /* Other acoustic substitutions */
    "mate line up",
    "made line up",
    "maybe line up",

    /* line → lying */
    "may lying up",
    "main lying up",
    "mai lying up",
    "my lying up",

    /* line → lie */
    "may lie up",
    "main lie up",

    /* line → line app */
    "may line app",
    "main line app",

    /* Previously observed style */
    "main line up",
  ];


  if (
    knownMayLineUpPhrases.some(
      (phrase) =>
        normalized.includes(
          phrase
        )
    )
  ) {
    return true;
  }


  /* ==========================================================
     NORMAL SEMANTIC FALLBACK

     Permission-like word
              +
     line-up concept
     ========================================================== */

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