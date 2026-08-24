import {
  checklists,
} from "../data/checklists";

import {
  commsScenarios,
} from "../data/commsScenarios";

import {
  GRADING_CONFIG,
  getRating,
  isCriticalChecklistStep,
  isCriticalCommsLabel,
  isOptionalCommsLabel,
} from "../data/gradingConfig";


/* ============================================================
   HELPERS
   ============================================================ */

function round(
  value,
  decimals = 2
) {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      (Number(value) || 0) *
        multiplier
    ) / multiplier
  );
}


function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}


/* ============================================================
   FIND CHECKLIST CONTAINING A STEP
   ============================================================ */

export function findChecklistForStep(
  stepId
) {
  if (!stepId) {
    return null;
  }

  return (
    checklists.find(
      (checklist) =>
        checklist.steps?.some(
          (step) =>
            step.id === stepId
        )
    ) || null
  );
}


/* ============================================================
   GET ALL CHECKLIST STEPS THAT CAN BE SCORED

   Excludes:
   - communications
   - future placeholders
   ============================================================ */

export function getScorableChecklistSteps() {
  const ignored =
    new Set(
      GRADING_CONFIG.checklist
        .ignoredStepTypes
    );

  return checklists.flatMap(
    (checklist) =>
      (
        checklist.steps || []
      )
        .filter(
          (step) =>
            !ignored.has(
              step.type
            )
        )
        .map(
          (step) => ({
            ...step,

            checklistId:
              checklist.id,

            checklistTitle:
              checklist.title,
          })
        )
  );
}


/* ============================================================
   GET EXPECTED COMMUNICATION STAGES

   We call stage.evaluate("") ONLY to discover which validation
   labels are required by each communication stage.

   We are NOT grading the student here.
   ============================================================ */

export function getExpectedCommsStages() {
  return Object.values(
    commsScenarios
  ).flatMap(
    (scenario) =>
      (
        scenario.stages || []
      ).map(
        (stage) => {
          const checks =
            stage.evaluate("");

          return {
            scenarioId:
              scenario.id,

            scenarioTitle:
              scenario.title,

            stageId:
              stage.id,

            stageTitle:
              stage.title,

            expectedLabels:
              checks.map(
                (check) =>
                  check.label
              ),
          };
        }
      )
  );
}


/* ============================================================
   CHECKLIST ATTEMPT RECOVERY FACTOR
   ============================================================ */

function checklistAttemptFactor(
  attemptIndex
) {
  /*
    -1 = never completed correctly
  */

  if (
    attemptIndex < 0
  ) {
    return 0;
  }


  /*
    First attempt
  */

  if (
    attemptIndex === 0
  ) {
    return (
      GRADING_CONFIG
        .checklistRecoveryFactors
        .firstAttempt
    );
  }


  /*
    Second attempt
  */

  if (
    attemptIndex === 1
  ) {
    return (
      GRADING_CONFIG
        .checklistRecoveryFactors
        .secondAttempt
    );
  }


  /*
    Third attempt or more
  */

  return (
    GRADING_CONFIG
      .checklistRecoveryFactors
      .thirdOrMore
  );
}


/* ============================================================
   COMMUNICATION RECOVERY FACTOR
   ============================================================ */

function commsRecoveryFactor(
  retryCount
) {
  if (
    retryCount <= 0
  ) {
    return (
      GRADING_CONFIG
        .communicationsRecoveryFactors
        .noRetry
    );
  }


  if (
    retryCount === 1
  ) {
    return (
      GRADING_CONFIG
        .communicationsRecoveryFactors
        .oneRetry
    );
  }


  if (
    retryCount === 2
  ) {
    return (
      GRADING_CONFIG
        .communicationsRecoveryFactors
        .twoRetries
    );
  }


  return (
    GRADING_CONFIG
      .communicationsRecoveryFactors
      .threeOrMore
  );
}


/* ============================================================
   CALCULATE CHECKLIST SCORE

   TOTAL = 60

   Accuracy    = 30
   Sequence    = 15
   Completion  = 10
   Recovery    = 5
   ============================================================ */

export function calculateChecklistScore(
  session
) {
  const events =
    session?.checklistEvents ||
    [];

  const allSteps =
    getScorableChecklistSteps();

  const objectiveTypes =
    new Set(
      GRADING_CONFIG
        .checklist
        .objectiveStepTypes
    );


  /*
    Only objectively machine-checkable steps
    are used for first-attempt accuracy.
  */

  const objectiveSteps =
    allSteps.filter(
      (step) =>
        objectiveTypes.has(
          step.type
        )
    );


  /*
    COMPLETED STEP IDS
  */

  const completedStepIds =
    new Set(
      events
        .filter(
          (event) =>
            event.kind ===
            "completion"
        )
        .map(
          (event) =>
            event.stepId
        )
    );


  const completedCount =
    allSteps.filter(
      (step) =>
        completedStepIds.has(
          step.id
        )
    ).length;


  const completionRatio =
    allSteps.length > 0
      ? completedCount /
        allSteps.length
      : 0;


  /* ==========================================================
     ACCURACY

     First objectively checkable attempt.

     If the student selects the wrong value first and later
     corrects it, the initial error remains recorded.
     ========================================================== */

  let firstAttemptCorrectCount =
    0;


  /*
    RECOVERY

    Gives partial credit depending on which attempt first
    produced the correct action.
  */

  let recoveryFactorTotal =
    0;


  const perStep =
    objectiveSteps.map(
      (step) => {
        const attempts =
          events.filter(
            (event) =>
              event.stepId ===
                step.id &&
              [
                "control_input",
                "sequence_input",
                "out_of_sequence",
              ].includes(
                event.kind
              )
          );


        const firstCorrect =
          attempts[0]
            ?.correct === true;


        if (
          firstCorrect
        ) {
          firstAttemptCorrectCount +=
            1;
        }


        const firstCorrectIndex =
          attempts.findIndex(
            (attempt) =>
              attempt.correct ===
              true
          );


        const recoveryFactor =
          checklistAttemptFactor(
            firstCorrectIndex
          );


        recoveryFactorTotal +=
          recoveryFactor;


        return {
          stepId:
            step.id,

          title:
            step.title,

          checklistId:
            step.checklistId,

          checklistTitle:
            step.checklistTitle,

          firstAttemptCorrect:
            firstCorrect,

          attempts:
            attempts.length,

          completed:
            completedStepIds.has(
              step.id
            ),

          recoveryFactor,
        };
      }
    );


  const accuracyRatio =
    objectiveSteps.length > 0
      ? firstAttemptCorrectCount /
        objectiveSteps.length
      : 0;


  const recoveryRatio =
    objectiveSteps.length > 0
      ? recoveryFactorTotal /
        objectiveSteps.length
      : 0;


  /* ==========================================================
     SEQUENCE ERRORS
     ========================================================== */

  const sequenceErrors =
    events.filter(
      (event) =>
        event.outcome ===
          "out_of_sequence" ||
        event.outcome ===
          "sequence_error"
    );


  /*
    Sequence points rise together with completed checklist
    progress.

    Then deduct the configured amount for every recorded
    sequence error.
  */

  const rawSequence =
    GRADING_CONFIG
      .checklist
      .sequence *
    completionRatio;


  const sequenceScore =
    clamp(
      rawSequence -
        sequenceErrors.length *
          GRADING_CONFIG
            .checklist
            .sequenceErrorPenalty,

      0,

      GRADING_CONFIG
        .checklist
        .sequence
    );


  /* ==========================================================
     CRITICAL CHECKLIST ERRORS

     Currently this will remain empty until the instructor
     approves which exact checklist step IDs are critical.
     ========================================================== */

  const criticalErrors =
    events.filter(
      (event) =>
        event.correct === false &&
        isCriticalChecklistStep(
          event.stepId
        )
    );


  /* ==========================================================
     CATEGORY SCORES
     ========================================================== */

  const accuracyScore =
    GRADING_CONFIG
      .checklist
      .accuracy *
    accuracyRatio;


  const completionScore =
    GRADING_CONFIG
      .checklist
      .completion *
    completionRatio;


  const recoveryScore =
    GRADING_CONFIG
      .checklist
      .recovery *
    recoveryRatio;


  const total =
    clamp(
      accuracyScore +
        sequenceScore +
        completionScore +
        recoveryScore,

      0,

      GRADING_CONFIG
        .checklist
        .total
    );


  return {
    total:
      round(total),

    max:
      GRADING_CONFIG
        .checklist
        .total,


    accuracy: {
      score:
        round(
          accuracyScore
        ),

      max:
        GRADING_CONFIG
          .checklist
          .accuracy,

      firstAttemptCorrect:
        firstAttemptCorrectCount,

      objectiveSteps:
        objectiveSteps.length,
    },


    sequence: {
      score:
        round(
          sequenceScore
        ),

      max:
        GRADING_CONFIG
          .checklist
          .sequence,

      errors:
        sequenceErrors.length,
    },


    completion: {
      score:
        round(
          completionScore
        ),

      max:
        GRADING_CONFIG
          .checklist
          .completion,

      completed:
        completedCount,

      totalSteps:
        allSteps.length,

      percent:
        round(
          completionRatio *
            100,
          1
        ),
    },


    recovery: {
      score:
        round(
          recoveryScore
        ),

      max:
        GRADING_CONFIG
          .checklist
          .recovery,
    },


    criticalErrors:
      criticalErrors.length,

    criticalErrorDetails:
      criticalErrors,

    perStep,
  };
}


/* ============================================================
   CALCULATE COMMUNICATION SCORE

   TOTAL = 40

   Critical Accuracy  = 20
   Required Elements  = 12
   Recovery           = 8
   ============================================================ */

export function calculateCommsScore(
  session
) {
  const attempts =
    session?.commsAttempts ||
    [];


  const expectedStages =
    getExpectedCommsStages();


  let totalCriticalExpected =
    0;

  let correctCriticalFirstAttempt =
    0;


  let totalRequiredExpected =
    0;

  let correctRequiredFirstAttempt =
    0;


  const criticalErrors =
    [];

  const perStage =
    [];


  let recoveryTotal =
    0;


  /*
    Go through every expected communication stage.
  */

  for (
    const expectedStage of
    expectedStages
  ) {
    const stageAttempts =
      attempts.filter(
        (attempt) =>
          attempt.stageId ===
          expectedStage.stageId
      );


    /*
      The FIRST NORMAL transmission determines first-attempt
      communication accuracy.

      Clarification retries do not rewrite history.
    */

    const firstNormalAttempt =
      stageAttempts.find(
        (attempt) =>
          attempt.mode ===
          "normal"
      );


    const firstChecks =
      firstNormalAttempt
        ?.checks || [];


    /*
      Grade every expected semantic element.
    */

    for (
      const label of
      expectedStage.expectedLabels
    ) {
      /*
        Optional phrase.

        Example:
        Good Morning

        It remains visible in the procedure but receives
        no grade penalty.
      */

      if (
        isOptionalCommsLabel(
          label
        )
      ) {
        continue;
      }


      const result =
        firstChecks.find(
          (check) =>
            check.label ===
            label
        );


      /*
        Critical communication value
      */

      if (
        isCriticalCommsLabel(
          label
        )
      ) {
        totalCriticalExpected +=
          1;


        if (
          result?.correct ===
          true
        ) {
          correctCriticalFirstAttempt +=
            1;
        } else if (
          firstNormalAttempt
        ) {
          criticalErrors.push(
            {
              scenarioId:
                expectedStage
                  .scenarioId,

              stageId:
                expectedStage
                  .stageId,

              stageTitle:
                expectedStage
                  .stageTitle,

              label,

              transcript:
                firstNormalAttempt
                  .transcript,

              timestamp:
                firstNormalAttempt
                  .timestamp,
            }
          );
        }
      }

      /*
        Normal required phrase element
      */

      else {
        totalRequiredExpected +=
          1;


        if (
          result?.correct ===
          true
        ) {
          correctRequiredFirstAttempt +=
            1;
        }
      }
    }


    /* ========================================================
       RECOVERY

       Find which communication attempt completed the stage.
       ======================================================== */

    const completedAttemptIndex =
      stageAttempts.findIndex(
        (attempt) =>
          attempt.stageComplete ===
          true
      );


    let recoveryFactor =
      0;

    let retryCount =
      null;


    if (
      completedAttemptIndex >=
      0
    ) {
      /*
        Index 0 = correct on first attempt
        Index 1 = one retry
        Index 2 = two retries
      */

      retryCount =
        completedAttemptIndex;

      recoveryFactor =
        commsRecoveryFactor(
          retryCount
        );
    }


    recoveryTotal +=
      recoveryFactor;


    perStage.push({
      ...expectedStage,

      attempts:
        stageAttempts.length,

      completed:
        completedAttemptIndex >=
        0,

      retryCount,

      recoveryFactor,

      firstAttemptCorrect:
        firstNormalAttempt
          ?.stageComplete ===
        true,
    });
  }


  /* ==========================================================
     RATIOS
     ========================================================== */

  const criticalRatio =
    totalCriticalExpected > 0
      ? correctCriticalFirstAttempt /
        totalCriticalExpected
      : 0;


  const requiredRatio =
    totalRequiredExpected > 0
      ? correctRequiredFirstAttempt /
        totalRequiredExpected
      : 0;


  const recoveryRatio =
    expectedStages.length > 0
      ? recoveryTotal /
        expectedStages.length
      : 0;


  /* ==========================================================
     SCORE CATEGORIES
     ========================================================== */

  const criticalAccuracyScore =
    GRADING_CONFIG
      .communications
      .criticalAccuracy *
    criticalRatio;


  const requiredElementsScore =
    GRADING_CONFIG
      .communications
      .requiredElements *
    requiredRatio;


  const recoveryScore =
    GRADING_CONFIG
      .communications
      .recovery *
    recoveryRatio;


  const total =
    clamp(
      criticalAccuracyScore +
        requiredElementsScore +
        recoveryScore,

      0,

      GRADING_CONFIG
        .communications
        .total
    );


  /* ==========================================================
     EXTRA STATS
     ========================================================== */

  const completedStages =
    perStage.filter(
      (stage) =>
        stage.completed
    ).length;


  const clarificationCount =
    attempts.filter(
      (attempt) =>
        attempt.stageComplete ===
          false &&
        Boolean(
          attempt.clarification
        )
    ).length;


  const fullReadbackRepeats =
    attempts.filter(
      (attempt) =>
        attempt.mode ===
        "full-retry"
    ).length;


  return {
    total:
      round(total),

    max:
      GRADING_CONFIG
        .communications
        .total,


    criticalAccuracy: {
      score:
        round(
          criticalAccuracyScore
        ),

      max:
        GRADING_CONFIG
          .communications
          .criticalAccuracy,

      correct:
        correctCriticalFirstAttempt,

      expected:
        totalCriticalExpected,
    },


    requiredElements: {
      score:
        round(
          requiredElementsScore
        ),

      max:
        GRADING_CONFIG
          .communications
          .requiredElements,

      correct:
        correctRequiredFirstAttempt,

      expected:
        totalRequiredExpected,
    },


    recovery: {
      score:
        round(
          recoveryScore
        ),

      max:
        GRADING_CONFIG
          .communications
          .recovery,
    },


    completedStages,

    totalStages:
      expectedStages.length,

    clarificationCount,

    fullReadbackRepeats,

    criticalErrors:
      criticalErrors.length,

    criticalErrorDetails:
      criticalErrors,

    perStage,
  };
}


/* ============================================================
   COMPLETE TRAINING SUMMARY

   CHECKLIST       60
   COMMUNICATIONS  40
   -----------------
   TOTAL          100
   ============================================================ */

export function calculateTrainingSummary(
  session
) {
  const checklist =
    calculateChecklistScore(
      session
    );


  const communications =
    calculateCommsScore(
      session
    );


  const overall =
    clamp(
      checklist.total +
        communications.total,

      0,
      100
    );


  const criticalErrors =
    checklist.criticalErrors +
    communications.criticalErrors;


  return {
    overall:
      round(overall),

    max:
      100,

    rating:
      getRating(
        overall
      ),


    safetyStatus:
      criticalErrors > 0
        ? "REVIEW_REQUIRED"
        : "CLEAR",


    criticalErrors,

    checklist,

    communications,
  };
}