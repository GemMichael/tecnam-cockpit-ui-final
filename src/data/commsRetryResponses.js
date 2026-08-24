/* ============================================================
   ATC RETRY / CLARIFICATION RESPONSES

   FOUNDATION:
   This keeps the same retry wording and priority order from the
   working version.

   ADDED REALISM:

   1. Non-critical misunderstood information can be repeated
      individually.

      Examples:
      - callsign
      - station
      - position
      - request
      - destination

   2. Readback errors require the relevant FULL READBACK again.

      Examples:
      - wrong runway
      - wrong holding point
      - wrong altimeter
      - incomplete taxi readback
      - incomplete startup readback
      - incomplete line-up readback

   IMPORTANT:
   These responses are simulator training behavior.
   They do not replace the normal checklist ATC responses.
   ============================================================ */


/* ============================================================
   CHECK IF A VALIDATION ITEM FAILED
   ============================================================ */

function failed(
  checks,
  label
) {
  return checks.some(
    (check) =>
      check.label === label &&
      !check.correct
  );
}


/* ============================================================
   CREATE CLARIFICATION RESULT

   targetLabel:
   - specific label = repeat only that item
   - null = repeat the complete relevant transmission/readback

   type:
   - "say-again"
   - "correction"
   - "full-retry"
   ============================================================ */

function clarification(
  targetLabel,
  message,
  type = "say-again"
) {
  return {
    targetLabel,
    message,
    type,
  };
}


/* ============================================================
   GET ATC CLARIFICATION
   ============================================================ */

export function getAtcClarification(
  stageId,
  checks = []
) {

  /* ==========================================================
     CALLSIGN — GLOBAL PRIORITY

     If the callsign is unclear, ATC only needs the callsign.

     Example:

     ATC:
     "Aircraft calling Binalonan Radio,
      say again callsign."

     Student:
     "RP-C1234."
     ========================================================== */

  if (
    failed(
      checks,
      "Callsign RP-C1234"
    )
  ) {
    return clarification(
      "Callsign RP-C1234",
      "Aircraft calling Binalonan Radio, say again callsign."
    );
  }


  /* ==========================================================
     ENGINE STARTUP — INITIAL CALL
     ========================================================== */

  if (
    stageId ===
    "startup-greeting"
  ) {

    /* --------------------------------------------------------
       STATION NOT UNDERSTOOD

       Student only repeats:
       "Binalonan Radio."
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return clarification(
        "Binalonan Radio",
        "Station calling, say again."
      );
    }


    /*
      IMPORTANT:

      Good Morning is currently still controlled by
      commsScenarios.js.

      We will make this optional in commsScenarios.js later.

      Until then, preserve the existing behavior here so we do
      not unexpectedly break your working validation.
    */

    if (
      failed(
        checks,
        "Good Morning"
      )
    ) {
      return clarification(
        "Good Morning",
        "RP-C1234, say again."
      );
    }


    return clarification(
      null,
      "RP-C1234, say again.",
      "full-retry"
    );
  }


  /* ==========================================================
     ENGINE STARTUP — REQUEST
     ========================================================== */

  if (
    stageId ===
    "startup-request"
  ) {

    /* --------------------------------------------------------
       STATION
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return clarification(
        "Binalonan Radio",
        "RP-C1234, say again station."
      );
    }


    /* --------------------------------------------------------
       REQUEST

       Student may only repeat the requested operation.

       Example:

       ATC:
       "RP-C1234, say again request."

       Student:
       "Request for engine start up."
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Engine Start Request"
      )
    ) {
      return clarification(
        "Engine Start Request",
        "RP-C1234, say again request."
      );
    }


    return clarification(
      null,
      "RP-C1234, say again.",
      "full-retry"
    );
  }


  /* ==========================================================
     ENGINE STARTUP — READBACK

     Expected complete readback:

     Runway 17 in use,
     altimeter setting 29.95,
     may start up,
     RP-C1234.

     IMPORTANT:

     If any operational part of this readback is incorrect,
     require the COMPLETE startup readback again.
     ========================================================== */

  if (
    stageId ===
    "startup-readback"
  ) {

    /* --------------------------------------------------------
       WRONG RUNWAY

       Critical value.

       Do NOT target only "Runway 17".

       targetLabel = null means CommsTrainingPanel will require
       the complete readback.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Runway 17"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, negative, runway one seven. Say again readback.",
        "correction"
      );
    }


    /* --------------------------------------------------------
       WRONG ALTIMETER

       Critical value.

       Require complete startup readback again.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Altimeter 29.95"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, negative, altimeter setting two niner niner five. Say again readback.",
        "correction"
      );
    }


    /* --------------------------------------------------------
       STARTUP CLEARANCE MISSING / INCORRECT

       Require complete startup readback.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "May Start Up"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, say again startup readback.",
        "full-retry"
      );
    }


    return clarification(
      null,
      "RP-C1234, say again readback.",
      "full-retry"
    );
  }


  /* ==========================================================
     TAXI TO RUN-UP AREA — REQUEST

     Expected:

     Binalonan Radio,
     RP-C1234,
     at ramp,
     request taxi to run-up area.
     ========================================================== */

  if (
    stageId ===
    "taxi-runup-request"
  ) {

    /* --------------------------------------------------------
       STATION
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return clarification(
        "Binalonan Radio",
        "RP-C1234, say again station."
      );
    }


    /* --------------------------------------------------------
       POSITION

       Student only needs to say:
       "At ramp."
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "At Ramp"
      )
    ) {
      return clarification(
        "At Ramp",
        "RP-C1234, say again position."
      );
    }


    /* --------------------------------------------------------
       TAXI REQUEST
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Taxi Request"
      )
    ) {
      return clarification(
        "Taxi Request",
        "RP-C1234, say again request."
      );
    }


    /* --------------------------------------------------------
       DESTINATION

       Student may only say:
       "Run-up area."
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Run-Up Area"
      )
    ) {
      return clarification(
        "Run-Up Area",
        "RP-C1234, say again destination."
      );
    }


    return clarification(
      null,
      "RP-C1234, say again.",
      "full-retry"
    );
  }


  /* ==========================================================
     TAXI TO RUN-UP AREA — READBACK

     Expected complete readback:

     May taxi to run-up area,
     RP-C1234.

     Readback errors should require the complete taxi
     readback again.
     ========================================================== */

  if (
    stageId ===
    "taxi-runup-readback"
  ) {

    /* --------------------------------------------------------
       TAXI CLEARANCE MISSING / INCORRECT

       Do NOT request only "May Taxi".

       Require complete readback.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "May Taxi"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, say again taxi readback.",
        "full-retry"
      );
    }


    /* --------------------------------------------------------
       WRONG / MISSING DESTINATION IN READBACK

       Since this is part of the clearance readback,
       require the complete readback again.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Run-Up Area"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, say again taxi readback.",
        "full-retry"
      );
    }


    return clarification(
      null,
      "RP-C1234, say again readback.",
      "full-retry"
    );
  }


  /* ==========================================================
     TAXI TO HOLDING POINT 17 — REQUEST

     Expected:

     Binalonan Radio,
     RP-C1234,
     at run-up area,
     request taxi to holding point 17.
     ========================================================== */

  if (
    stageId ===
    "holding-request"
  ) {

    /* --------------------------------------------------------
       STATION
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return clarification(
        "Binalonan Radio",
        "RP-C1234, say again station."
      );
    }


    /* --------------------------------------------------------
       POSITION

       Student only needs:
       "At run-up area."
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "At Run-Up Area"
      )
    ) {
      return clarification(
        "At Run-Up Area",
        "RP-C1234, say again position."
      );
    }


    /* --------------------------------------------------------
       TAXI REQUEST
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Taxi Request"
      )
    ) {
      return clarification(
        "Taxi Request",
        "RP-C1234, say again request."
      );
    }


    /* --------------------------------------------------------
       DESTINATION

       This is still the student's REQUEST, not a readback.

       Therefore ATC can request only the destination.

       Student:
       "Holding point one seven."
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Holding Point 17"
      )
    ) {
      return clarification(
        "Holding Point 17",
        "RP-C1234, say again destination."
      );
    }


    return clarification(
      null,
      "RP-C1234, say again.",
      "full-retry"
    );
  }


  /* ==========================================================
     TAXI TO HOLDING POINT 17 — READBACK

     Expected complete readback:

     May taxi to holding point 17,
     RP-C1234.

     Operational readback errors require the full readback.
     ========================================================== */

  if (
    stageId ===
    "holding-readback"
  ) {

    /* --------------------------------------------------------
       TAXI CLEARANCE MISSING

       Require the complete taxi readback.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "May Taxi"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, say again taxi readback.",
        "full-retry"
      );
    }


    /* --------------------------------------------------------
       WRONG HOLDING POINT

       Critical operational value.

       ATC corrects it and requires the complete readback again.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Holding Point 17"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, negative, holding point one seven. Say again readback.",
        "correction"
      );
    }


    return clarification(
      null,
      "RP-C1234, say again readback.",
      "full-retry"
    );
  }


  /* ==========================================================
     LINE-UP — REQUEST

     Expected:

     Binalonan Radio,
     RP-C1234,
     at holding point 17,
     request to line up.
     ========================================================== */

  if (
    stageId ===
    "lineup-request"
  ) {

    /* --------------------------------------------------------
       STATION
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return clarification(
        "Binalonan Radio",
        "RP-C1234, say again station."
      );
    }


    /* --------------------------------------------------------
       POSITION

       Student may repeat only:

       "Holding point one seven."

       because this is still the request, not a clearance
       readback.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Holding Point 17"
      )
    ) {
      return clarification(
        "Holding Point 17",
        "RP-C1234, say again position."
      );
    }


    /* --------------------------------------------------------
       LINE-UP REQUEST
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Line-Up Request"
      )
    ) {
      return clarification(
        "Line-Up Request",
        "RP-C1234, say again request."
      );
    }


    return clarification(
      null,
      "RP-C1234, say again.",
      "full-retry"
    );
  }


  /* ==========================================================
     LINE-UP — READBACK

     Expected complete readback:

     May line up runway 17,
     RP-C1234.

     Operational errors require the complete line-up readback.
     ========================================================== */

  if (
    stageId ===
    "lineup-readback"
  ) {

    /* --------------------------------------------------------
       LINE-UP CLEARANCE MISSING / INCORRECT

       Require complete line-up readback.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "May Line Up"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, say again line-up readback.",
        "full-retry"
      );
    }


    /* --------------------------------------------------------
       WRONG RUNWAY

       Critical operational value.

       Correct runway and require the complete readback again.
       -------------------------------------------------------- */

    if (
      failed(
        checks,
        "Runway 17"
      )
    ) {
      return clarification(
        null,
        "RP-C1234, negative, runway one seven. Say again readback.",
        "correction"
      );
    }


    return clarification(
      null,
      "RP-C1234, say again readback.",
      "full-retry"
    );
  }


  /* ==========================================================
     FALLBACK

     If we cannot identify a specific clarification,
     request the complete transmission.
     ========================================================== */

  return clarification(
    null,
    "RP-C1234, say again.",
    "full-retry"
  );
}


/* ============================================================
   ORIGINAL WORKING API — KEPT FOR COMPATIBILITY

   Existing code using:

   getAtcRetryResponse(stageId, checks)

   will still receive only the string message.
   ============================================================ */

export function getAtcRetryResponse(
  stageId,
  checks = []
) {
  return getAtcClarification(
    stageId,
    checks
  ).message;
}