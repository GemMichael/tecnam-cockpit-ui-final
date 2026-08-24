/* ============================================================
   TRAINING GRADING CONFIGURATION
   TECNAM P2002JF COCKPIT TRAINER

   IMPORTANT:
   These are simulator grading rules, not official CAAP/ICAO
   grading standards. Keep them configurable so a flight
   instructor can approve or revise the rubric later.
   ============================================================ */

export const GRADING_CONFIG = {
  checklist: {
    total: 60,
    accuracy: 30,
    sequence: 15,
    completion: 10,
    recovery: 5,

    // Deduction from the sequence category for each recorded
    // out-of-sequence / wrong sequence action.
    sequenceErrorPenalty: 2,

    // Communication steps are scored in the communications
    // category and must not be counted twice here.
    ignoredStepTypes: [
      "comms",
      "future",
    ],

    // Only these step types have an objectively machine-checkable
    // expected state/sequence in the current implementation.
    objectiveStepTypes: [
      "control",
      "sequence",
    ],

    /*
      Instructor-approved safety classification goes here later.

      Example only (DO NOT copy blindly as an official rule):
      criticalStepIds: ["some-step-id"]

      Leave empty until the instructor validates the exact items.
    */
    criticalStepIds: [],
  },

  communications: {
    total: 40,
    criticalAccuracy: 20,
    requiredElements: 12,
    recovery: 8,

    // These values stay strict in your semantic validator.
    criticalLabels: [
      "Callsign RP-C1234",
      "Runway 17",
      "Holding Point 17",
      "Altimeter 29.95",
    ],

    // Present in the source checklist phrase, but not graded.
    optionalLabels: [
      "Good Morning",
    ],
  },

  checklistRecoveryFactors: {
    firstAttempt: 1.0,
    secondAttempt: 0.75,
    thirdOrMore: 0.5,
  },

  communicationsRecoveryFactors: {
    noRetry: 1.0,
    oneRetry: 0.85,
    twoRetries: 0.70,
    threeOrMore: 0.50,
  },

  ratings: [
    {
      min: 90,
      label: "Excellent",
    },
    {
      min: 80,
      label: "Proficient",
    },
    {
      min: 70,
      label: "Developing",
    },
    {
      min: 0,
      label: "Needs Improvement",
    },
  ],
};


/* ============================================================
   CRITICAL COMMUNICATION LABEL
   ============================================================ */

export function isCriticalCommsLabel(
  label
) {
  return (
    GRADING_CONFIG.communications.criticalLabels.includes(
      label
    )
  );
}


/* ============================================================
   OPTIONAL COMMUNICATION LABEL
   ============================================================ */

export function isOptionalCommsLabel(
  label
) {
  return (
    GRADING_CONFIG.communications.optionalLabels.includes(
      label
    )
  );
}


/* ============================================================
   CRITICAL CHECKLIST STEP
   ============================================================ */

export function isCriticalChecklistStep(
  stepId
) {
  return (
    GRADING_CONFIG.checklist.criticalStepIds.includes(
      stepId
    )
  );
}


/* ============================================================
   GET RATING
   ============================================================ */

export function getRating(
  score = 0
) {
  const numericScore =
    Number(score) || 0;

  return (
    GRADING_CONFIG.ratings.find(
      (rating) =>
        numericScore >=
        rating.min
    )?.label ||
    "Needs Improvement"
  );
}