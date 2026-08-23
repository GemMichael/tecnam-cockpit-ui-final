/* ============================================================
   ATC RETRY / CLARIFICATION RESPONSES

   Used when the student's transmission is incomplete
   or contains an incorrect required element.

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
   GET ATC RETRY RESPONSE
   ============================================================ */

export function getAtcRetryResponse(
  stageId,
  checks = []
) {
  /*
    Callsign gets priority.

    If ATC cannot identify the aircraft,
    request the callsign again.
  */

  if (
    failed(
      checks,
      "Callsign RP-C1234"
    )
  ) {
    return "Aircraft calling Binalonan Radio, say again callsign.";
  }


  /* ==========================================================
     ENGINE STARTUP — INITIAL CALL
     ========================================================== */

  if (
    stageId ===
    "startup-greeting"
  ) {
    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return "Station calling, say again.";
    }


    if (
      failed(
        checks,
        "Good Morning"
      )
    ) {
      return "RP-C1234, say again.";
    }


    return "RP-C1234, say again.";
  }


  /* ==========================================================
     ENGINE STARTUP — REQUEST
     ========================================================== */

  if (
    stageId ===
    "startup-request"
  ) {
    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return "RP-C1234, say again station.";
    }


    if (
      failed(
        checks,
        "Engine Start Request"
      )
    ) {
      return "RP-C1234, say again request.";
    }


    return "RP-C1234, say again.";
  }


  /* ==========================================================
     ENGINE STARTUP — READBACK
     ========================================================== */

  if (
    stageId ===
    "startup-readback"
  ) {
    /*
      Critical values first.
    */

    if (
      failed(
        checks,
        "Runway 17"
      )
    ) {
      return "RP-C1234, negative, runway one seven. Say again readback.";
    }


    if (
      failed(
        checks,
        "Altimeter 29.95"
      )
    ) {
      return "RP-C1234, negative, altimeter setting two niner niner five. Say again readback.";
    }


    if (
      failed(
        checks,
        "May Start Up"
      )
    ) {
      return "RP-C1234, say again startup readback.";
    }


    return "RP-C1234, say again readback.";
  }


  /* ==========================================================
     TAXI TO RUN-UP AREA — REQUEST
     ========================================================== */

  if (
    stageId ===
    "taxi-runup-request"
  ) {
    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return "RP-C1234, say again station.";
    }


    if (
      failed(
        checks,
        "At Ramp"
      )
    ) {
      return "RP-C1234, say again position.";
    }


    if (
      failed(
        checks,
        "Taxi Request"
      )
    ) {
      return "RP-C1234, say again request.";
    }


    if (
      failed(
        checks,
        "Run-Up Area"
      )
    ) {
      return "RP-C1234, say again destination.";
    }


    return "RP-C1234, say again.";
  }


  /* ==========================================================
     TAXI TO RUN-UP AREA — READBACK
     ========================================================== */

  if (
    stageId ===
    "taxi-runup-readback"
  ) {
    if (
      failed(
        checks,
        "May Taxi"
      )
    ) {
      return "RP-C1234, say again taxi readback.";
    }


    if (
      failed(
        checks,
        "Run-Up Area"
      )
    ) {
      return "RP-C1234, say again destination.";
    }


    return "RP-C1234, say again readback.";
  }


  /* ==========================================================
     TAXI TO HOLDING POINT 17 — REQUEST
     ========================================================== */

  if (
    stageId ===
    "holding-request"
  ) {
    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return "RP-C1234, say again station.";
    }


    if (
      failed(
        checks,
        "At Run-Up Area"
      )
    ) {
      return "RP-C1234, say again position.";
    }


    if (
      failed(
        checks,
        "Taxi Request"
      )
    ) {
      return "RP-C1234, say again request.";
    }


    if (
      failed(
        checks,
        "Holding Point 17"
      )
    ) {
      return "RP-C1234, say again destination.";
    }


    return "RP-C1234, say again.";
  }


  /* ==========================================================
     TAXI TO HOLDING POINT 17 — READBACK
     ========================================================== */

  if (
    stageId ===
    "holding-readback"
  ) {
    if (
      failed(
        checks,
        "May Taxi"
      )
    ) {
      return "RP-C1234, say again taxi readback.";
    }


    if (
      failed(
        checks,
        "Holding Point 17"
      )
    ) {
      return "RP-C1234, negative, holding point one seven. Say again readback.";
    }


    return "RP-C1234, say again readback.";
  }


  /* ==========================================================
     LINE-UP — REQUEST
     ========================================================== */

  if (
    stageId ===
    "lineup-request"
  ) {
    if (
      failed(
        checks,
        "Binalonan Radio"
      )
    ) {
      return "RP-C1234, say again station.";
    }


    if (
      failed(
        checks,
        "Holding Point 17"
      )
    ) {
      return "RP-C1234, say again position.";
    }


    if (
      failed(
        checks,
        "Line-Up Request"
      )
    ) {
      return "RP-C1234, say again request.";
    }


    return "RP-C1234, say again.";
  }


  /* ==========================================================
     LINE-UP — READBACK
     ========================================================== */

  if (
    stageId ===
    "lineup-readback"
  ) {
    if (
      failed(
        checks,
        "May Line Up"
      )
    ) {
      return "RP-C1234, say again line-up readback.";
    }


    /*
      Runway is a critical value.
    */

    if (
      failed(
        checks,
        "Runway 17"
      )
    ) {
      return "RP-C1234, negative, runway one seven. Say again readback.";
    }


    return "RP-C1234, say again readback.";
  }


  /* ==========================================================
     FALLBACK
     ========================================================== */

  return "RP-C1234, say again.";
}