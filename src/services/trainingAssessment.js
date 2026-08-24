import {
  calculateTrainingSummary,
  findChecklistForStep,
} from "./gradingEngine";

import {
  loadLatestLocalSession,
  persistTrainingSession,
} from "./trainingStorage";

import {
  isCriticalChecklistStep,
} from "../data/gradingConfig";


/* ============================================================
   INTERNAL STORE

   We use a tiny external store instead of adding another
   React Context provider.

   Components can subscribe through useSyncExternalStore.
   ============================================================ */

const listeners =
  new Set();

let persistTimer =
  null;


/* ============================================================
   CREATE UNIQUE ID
   ============================================================ */

function createId(
  prefix = "session"
) {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }


  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}


/* ============================================================
   CREATE EMPTY TRAINING SESSION
   ============================================================ */

function createEmptySession(
  metadata = {}
) {
  const now =
    new Date().toISOString();


  return {
    id:
      createId(
        "training"
      ),

    startedAt:
      now,

    updatedAt:
      now,

    endedAt:
      null,

    status:
      "in_progress",

    metadata,

    checklistEvents:
      [],

    commsAttempts:
      [],
  };
}


/* ============================================================
   RESTORE EXISTING LOCAL SESSION

   If the browser was closed while a session was still active,
   continue it.

   If the previous session was finalized, wait for new activity.
   ============================================================ */

const restored =
  loadLatestLocalSession();


let session =
  restored?.status ===
  "in_progress"
    ? {
        ...restored,

        // Summary is always recalculated from raw events.
        summary:
          undefined,
      }
    : null;


/* ============================================================
   CURRENT SNAPSHOT
   ============================================================ */

let snapshot = {
  session,

  summary:
    calculateTrainingSummary(
      session
    ),
};


/* ============================================================
   PUBLISH STORE UPDATE
   ============================================================ */

function publish() {
  snapshot = {
    session,

    summary:
      calculateTrainingSummary(
        session
      ),
  };


  /*
    Tell React subscribers that the store changed.
  */

  listeners.forEach(
    (listener) =>
      listener()
  );


  /*
    Save automatically.

    Small delay prevents excessive API/database writes when
    controls move quickly.
  */

  if (
    session
  ) {
    if (
      persistTimer
    ) {
      clearTimeout(
        persistTimer
      );
    }


    persistTimer =
      setTimeout(
        () => {
          persistTrainingSession(
            session,
            snapshot.summary
          );
        },
        250
      );
  }
}


/* ============================================================
   ENSURE ACTIVE SESSION
   ============================================================ */

function ensureSession() {
  if (
    !session ||
    session.status ===
      "completed"
  ) {
    session =
      createEmptySession();

    publish();
  }


  return session;
}


/* ============================================================
   UPDATE ACTIVE SESSION
   ============================================================ */

function updateSession(
  updater
) {
  const current =
    ensureSession();


  const next =
    updater(
      current
    );


  session = {
    ...next,

    updatedAt:
      new Date().toISOString(),
  };


  publish();


  return session;
}


/* ============================================================
   REACT STORE SUBSCRIPTION
   ============================================================ */

export function subscribeTrainingAssessment(
  listener
) {
  listeners.add(
    listener
  );


  return () =>
    listeners.delete(
      listener
    );
}


export function getTrainingAssessmentSnapshot() {
  return snapshot;
}


/* ============================================================
   START NEW TRAINING SESSION
   ============================================================ */

export function startNewTrainingSession(
  metadata = {}
) {
  session =
    createEmptySession(
      metadata
    );


  publish();


  return session;
}


/* ============================================================
   SESSION METADATA

   Later you can store things such as:

   studentId
   studentName
   instructor
   aircraft
   classSection
   ============================================================ */

export function setTrainingSessionMetadata(
  metadata = {}
) {
  updateSession(
    (current) => ({
      ...current,

      metadata: {
        ...(
          current.metadata ||
          {}
        ),

        ...metadata,
      },
    })
  );
}


/* ============================================================
   RECORD CHECKLIST CONTROL INPUT

   IMPORTANT:

   Call this INSIDE SimulatorContext.setControl().

   That gives this architecture:

   React virtual control
          │
          ▼
       setControl()
          │
          ▼
       grading


   Later:

   Raspberry Pi GPIO
          │
          ▼
    Python/WebSocket
          │
          ▼
       setControl()
          │
          ▼
       grading


   So we do NOT need different grading code for the Pi.
   ============================================================ */

export function recordChecklistControlInput({
  step,
  controlId,
  value,
  source = "ui",
}) {
  if (
    !step
  ) {
    return;
  }


  /*
    Only control and sequence steps are objectively evaluated
    here.

    Manual steps are handled when they are confirmed.
  */

  if (
    ![
      "control",
      "sequence",
    ].includes(
      step.type
    )
  ) {
    return;
  }


  const current =
    ensureSession();


  const checklist =
    findChecklistForStep(
      step.id
    );


  /*
    Find previous attempts for this same checklist step.
  */

  const previousStepInputs =
    current.checklistEvents.filter(
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


  const attemptNumber =
    previousStepInputs.length +
    1;


  let kind =
    "control_input";

  let expected =
    step.expected;

  let correct =
    false;

  let outcome =
    "incorrect_setting";


  /* ==========================================================
     WRONG CONTROL OPERATED

     Example:

     Current expected step:
     Fuel Pump ON

     Student operates:
     Avionics Master

     This is recorded as out-of-sequence.
     ========================================================== */

  if (
    controlId !==
    step.controlId
  ) {
    kind =
      "out_of_sequence";

    outcome =
      "out_of_sequence";

    correct =
      false;
  }


  /* ==========================================================
     SEQUENCE STEP
     ========================================================== */

  else if (
    step.type ===
    "sequence"
  ) {
    kind =
      "sequence_input";


    /*
      Count previously CORRECT sequence items.

      Example sequence:

      LEFT
      RIGHT
      BOTH
      START
    */

    const priorCorrectSequenceInputs =
      current.checklistEvents.filter(
        (event) =>
          event.stepId ===
            step.id &&
          event.kind ===
            "sequence_input" &&
          event.correct ===
            true
      );


    expected =
      step.sequence?.[
        priorCorrectSequenceInputs.length
      ];


    correct =
      String(value) ===
      String(expected);


    outcome =
      correct
        ? "correct_sequence_input"
        : "sequence_error";
  }


  /* ==========================================================
     NORMAL CONTROL STEP
     ========================================================== */

  else {
    correct =
      String(value) ===
      String(
        step.expected
      );


    outcome =
      correct
        ? "correct_input"
        : "incorrect_setting";
  }


  /* ==========================================================
     SAVE EVENT
     ========================================================== */

  updateSession(
    (active) => ({
      ...active,


      checklistEvents: [
        ...active.checklistEvents,


        {
          id:
            createId(
              "check"
            ),

          timestamp:
            new Date().toISOString(),

          checklistId:
            checklist?.id ||
            null,

          checklistTitle:
            checklist?.title ||
            null,

          stepId:
            step.id,

          stepTitle:
            step.title,

          stepType:
            step.type,

          kind,

          outcome,

          attemptNumber,

          controlId,

          value,

          expected,

          correct,

          source,

          critical:
            isCriticalChecklistStep(
              step.id
            ),
        },
      ],
    })
  );
}


/* ============================================================
   RECORD CHECKLIST STEP COMPLETION

   Call this INSIDE your existing:

   completeStep(step)

   Manual checklist items are scored for COMPLETION only.

   Why?

   Pressing "Confirm Aircraft Instruments Checked" does not
   objectively prove that the student actually looked at every
   required instrument.

   So we do not pretend that a button press proves accuracy.
   ============================================================ */

export function recordChecklistStepCompletion({
  step,
  source = "system",
}) {
  if (
    !step
  ) {
    return;
  }


  /*
    Communication has its own 40 point grading category.

    Do not count it twice.
  */

  if (
    [
      "comms",
      "future",
    ].includes(
      step.type
    )
  ) {
    return;
  }


  const current =
    ensureSession();


  /*
    Prevent duplicate completion events if completeStep()
    happens more than once for the same step.
  */

  const alreadyCompleted =
    current.checklistEvents.some(
      (event) =>
        event.kind ===
          "completion" &&
        event.stepId ===
          step.id
    );


  if (
    alreadyCompleted
  ) {
    return;
  }


  const checklist =
    findChecklistForStep(
      step.id
    );


  updateSession(
    (active) => ({
      ...active,


      checklistEvents: [
        ...active.checklistEvents,


        {
          id:
            createId(
              "complete"
            ),

          timestamp:
            new Date().toISOString(),

          checklistId:
            checklist?.id ||
            null,

          checklistTitle:
            checklist?.title ||
            null,

          stepId:
            step.id,

          stepTitle:
            step.title,

          stepType:
            step.type,

          kind:
            "completion",

          outcome:
            "completed",

          correct:
            true,

          source,

          critical:
            isCriticalChecklistStep(
              step.id
            ),
        },
      ],
    })
  );
}


/* ============================================================
   RECORD SKIPPED CHECKLIST ITEM

   You do not have to use this yet.

   Later, if you add a Skip button, call this.
   ============================================================ */

export function recordChecklistSkip({
  step,
  source = "ui",
}) {
  if (
    !step ||
    [
      "comms",
      "future",
    ].includes(
      step.type
    )
  ) {
    return;
  }


  const checklist =
    findChecklistForStep(
      step.id
    );


  updateSession(
    (active) => ({
      ...active,


      checklistEvents: [
        ...active.checklistEvents,


        {
          id:
            createId(
              "skip"
            ),

          timestamp:
            new Date().toISOString(),

          checklistId:
            checklist?.id ||
            null,

          checklistTitle:
            checklist?.title ||
            null,

          stepId:
            step.id,

          stepTitle:
            step.title,

          stepType:
            step.type,

          kind:
            "skip",

          outcome:
            "skipped",

          correct:
            false,

          source,

          critical:
            isCriticalChecklistStep(
              step.id
            ),
        },
      ],
    })
  );
}


/* ============================================================
   RECORD COMMUNICATION ATTEMPT

   VERY IMPORTANT:

   We grade the semantic validator results:

   [
     {
       label: "Runway 17",
       correct: true
     }
   ]

   We do NOT grade Whisper spelling directly.

   This means:

   Whisper:
   "main taxi to run-up area"

   can still be correct if your existing semantic validator
   determines that "May Taxi" was understood correctly.
   ============================================================ */

export function recordCommsAttempt({
  scenarioId,
  stageId,
  stageTitle,
  transcript,
  checks = [],
  mode = "normal",
  targetLabel = null,
  stageComplete = false,
  clarification = null,
}) {
  updateSession(
    (active) => {
      const previous =
        active.commsAttempts.filter(
          (attempt) =>
            attempt.stageId ===
            stageId
        );


      return {
        ...active,


        commsAttempts: [
          ...active.commsAttempts,


          {
            id:
              createId(
                "comms"
              ),

            timestamp:
              new Date().toISOString(),

            scenarioId,

            stageId,

            stageTitle,

            /*
              Keep raw Whisper transcript for later review.
            */

            transcript,


            /*
              But scoring uses these semantic checks.
            */

            checks:
              checks.map(
                (check) => ({
                  label:
                    check.label,

                  correct:
                    Boolean(
                      check.correct
                    ),
                })
              ),


            /*
              Possible modes:

              normal
              targeted-clarification
              full-retry
            */

            mode,

            targetLabel,

            stageComplete:
              Boolean(
                stageComplete
              ),

            attemptNumber:
              previous.length +
              1,


            clarification:
              clarification
                ? {
                    targetLabel:
                      clarification
                        .targetLabel ??
                      null,

                    message:
                      clarification
                        .message ||
                      null,

                    type:
                      clarification
                        .type ||
                      "say-again",
                  }
                : null,
          },
        ],
      };
    }
  );
}


/* ============================================================
   FINALIZE TRAINING SESSION
   ============================================================ */

export function finishTrainingSession() {
  if (
    !session
  ) {
    return null;
  }


  session = {
    ...session,

    status:
      "completed",

    endedAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  };


  publish();


  return snapshot;
}


/* ============================================================
   FORCE SAVE NOW

   Normally everything autosaves.

   This is useful for:
   - Save button
   - finalizing
   - debugging
   ============================================================ */

export async function syncTrainingSessionNow() {
  if (
    !session
  ) {
    return;
  }


  await persistTrainingSession(
    session,

    calculateTrainingSummary(
      session
    )
  );
}