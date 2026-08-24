import {
  Check,
  CheckCircle2,
  Radio,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCommsScenario,
} from "../data/commsScenarios";

import {
  getAtcClarification,
} from "../data/commsRetryResponses";

import {
  speakAtc,
  stopAtcSpeech,
} from "../services/atcVoice";

import {
  recordCommsAttempt,
} from "../services/trainingAssessment";

import PushToTalkButton from "./PushToTalkButton";


function CommsTrainingPanel({
  scenarioId,
  onComplete,
}) {
  /* ==========================================================
     LOAD COMMUNICATION SCENARIO
     ========================================================== */

  const scenario =
    useMemo(
      () =>
        getCommsScenario(
          scenarioId
        ),
      [scenarioId]
    );


  /* ==========================================================
     STATE
     ========================================================== */

  const [
    stageIndex,
    setStageIndex,
  ] = useState(0);


  const [
    transcript,
    setTranscript,
  ] = useState("");


  const [
    result,
    setResult,
  ] = useState(null);


  const [
    lastAtcResponse,
    setLastAtcResponse,
  ] = useState(null);


  const [
    complete,
    setComplete,
  ] = useState(false);


  const [
    isAtcSpeaking,
    setIsAtcSpeaking,
  ] = useState(false);


  const [
    atcVoiceError,
    setAtcVoiceError,
  ] = useState(null);


  /* ==========================================================
     TARGETED ATC CLARIFICATION

     When ATC says something like:

     "Say again callsign."

     the student only needs to repeat that specific item.
     ========================================================== */

  const [
    pendingClarification,
    setPendingClarification,
  ] = useState(null);


  /* ==========================================================
     PREVIOUSLY UNDERSTOOD ITEMS

     ATC remembers the parts of the student's original
     transmission that were already understood correctly.
     ========================================================== */

  const [
    rememberedChecks,
    setRememberedChecks,
  ] = useState(null);


  /* ==========================================================
     RESET WHEN SCENARIO CHANGES
     ========================================================== */

  useEffect(() => {
    stopAtcSpeech();

    setStageIndex(0);

    setTranscript("");

    setResult(null);

    setLastAtcResponse(
      null
    );

    setComplete(false);

    setIsAtcSpeaking(false);

    setAtcVoiceError(null);

    setPendingClarification(null);

    setRememberedChecks(null);


    return () => {
      stopAtcSpeech();
    };
  }, [scenarioId]);


  /* ==========================================================
     INVALID SCENARIO
     ========================================================== */

  if (!scenario) {
    return (
      <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-bold text-red-700">
          Communication scenario not found.
        </p>

        <p className="mt-1 text-xs text-red-500">
          Scenario: {scenarioId}
        </p>
      </div>
    );
  }


  /* ==========================================================
     CURRENT SCENARIO / STAGE
     ========================================================== */

  const stages =
    scenario.stages;


  const currentStage =
    stages[
    stageIndex
    ];


  /* ==========================================================
     SPEECH RECOGNITION CONTEXT

     This helps Whisper recognize the aviation vocabulary that
     appears throughout the checklist.

     It does NOT automatically mark anything correct.
     Your commsScenarios.js validator still decides correctness.
     ========================================================== */

  const speechRecognitionPrompt =
    useMemo(() => {

      switch (
      currentStage?.id
      ) {

        case "startup-greeting":
          return `
This is an aviation radio transmission at Binalonan Airport.

The radio station name is Binalonan Radio.
Binalonan is spelled B I N A L O N A N.
The speaker will say: Binalonan Radio.

Aircraft callsign is RP-C1234.

Expected aviation vocabulary:
Binalonan Radio,
RP-C1234,
good morning.
`;


        case "startup-request":
          return `
This is an aviation radio transmission at Binalonan Airport.

The radio station name is Binalonan Radio.
Binalonan is spelled B I N A L O N A N.
The speaker will say: Binalonan Radio.

Aircraft callsign is RP-C1234.

Expected aviation vocabulary:
Binalonan Radio,
RP-C1234,
request for engine start up.
`;

        case "startup-readback":
          return `
Aviation radio communication.
Aircraft callsign RP-C1234.
Vocabulary:
runway 17,
runway one seven,
altimeter setting 29.95,
two niner niner five,
may start up,
RP-C1234.
`;


        case "taxi-runup-request":
          return `
Aviation radio communication.
Binalonan Radio.
Aircraft callsign RP-C1234.
Vocabulary:
Binalonan Radio,
RP-C1234,
at ramp,
request taxi,
run-up area.
`;


        case "taxi-runup-readback":
          return `
Aviation radio communication.
Aircraft callsign RP-C1234.
Vocabulary:
may taxi,
run-up area,
RP-C1234.
`;


        case "holding-request":
          return `
Aviation radio communication.
Binalonan Radio.
Aircraft callsign RP-C1234.
Vocabulary:
Binalonan Radio,
RP-C1234,
run-up area,
request taxi,
holding point 17,
holding point one seven.
`;


        case "holding-readback":
          return `
Aviation radio communication.
Aircraft callsign RP-C1234.
Vocabulary:
may taxi,
holding point 17,
holding point one seven,
RP-C1234.
`;


        case "lineup-request":
          return `
Aviation radio communication.
Binalonan Radio.
Aircraft callsign RP-C1234.
Vocabulary:
Binalonan Radio,
RP-C1234,
holding point 17,
request to line up.
`;


        case "lineup-readback":
          return `
Aviation radio communication.
Aircraft callsign RP-C1234.
Vocabulary:
may line up,
runway 17,
runway one seven,
RP-C1234.
`;


        default:
          return `
Aviation radio communication.
Binalonan Radio.
Aircraft callsign RP-C1234.
`;
      }

    }, [
      currentStage?.id,
    ]);


  /* ==========================================================
     CLARIFICATION-SPECIFIC WHISPER CONTEXT

     IMPORTANT:
     The normal speechRecognitionPrompt above is left unchanged
     because it is already working well for your full calls.

     We only add extra context while ATC is specifically asking
     for a short clarification such as a callsign or runway.
     ========================================================== */

  const activeSpeechPrompt =
    useMemo(() => {
      const target =
        pendingClarification?.targetLabel;


      if (!target) {
        return speechRecognitionPrompt;
      }


      switch (target) {
        case "Callsign RP-C1234":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the aircraft callsign.
Aviation phonetic vocabulary:
Romeo Papa Charlie, one two three four.
Aircraft identification format: RP-C1234.
The next transmission may contain only the callsign.
`;


        case "Runway 17":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the runway.
Aviation vocabulary:
runway one seven, runway 17, one seven.
The next transmission may contain only the runway information.
`;


        case "Altimeter 29.95":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the altimeter setting.
Aviation vocabulary:
altimeter setting, two niner niner five, 29.95.
The next transmission may contain only the altimeter setting.
`;


        case "Holding Point 17":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the holding point.
Aviation vocabulary:
holding point one seven, holding point 17, one seven.
The next transmission may contain only the holding-point information.
`;


        case "Run-Up Area":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the destination.
Aviation vocabulary:
run-up area, run up area.
The next transmission may contain only the destination.
`;


        case "At Ramp":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the aircraft position.
Aviation vocabulary:
at ramp, ramp.
The next transmission may contain only the position.
`;


        case "At Run-Up Area":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the aircraft position.
Aviation vocabulary:
at run-up area, at run up area, run-up area.
The next transmission may contain only the position.
`;


        case "Taxi Request":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the request.
Aviation vocabulary:
request taxi, taxi request.
The next transmission may contain only the requested action.
`;


        case "Engine Start Request":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the request.
Aviation vocabulary:
request engine start up, engine start request.
The next transmission may contain only the requested action.
`;


        case "Line-Up Request":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the request.
Aviation vocabulary:
request to line up, line-up request.
The next transmission may contain only the requested action.
`;


        case "May Taxi":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the taxi readback.
Aviation vocabulary:
may taxi.
`;


        case "May Start Up":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the startup readback.
Aviation vocabulary:
may start up.
`;


        case "May Line Up":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the line-up readback.
Aviation vocabulary:
may line up.
`;


        case "Binalonan Radio":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the station name.
The station is Binalonan Radio.
Binalonan is spelled B I N A L O N A N.
`;


        case "Good Morning":
          return `
${speechRecognitionPrompt}

Short aviation radio clarification.
The controller requested only the greeting.
Aviation vocabulary: good morning.
`;


        default:
          return `
${speechRecognitionPrompt}

This is a short aviation radio clarification.
The controller requested clarification of: ${target}.
`;
      }
    }, [
      pendingClarification?.targetLabel,
      speechRecognitionPrompt,
    ]);


  /* ==========================================================
     PLAY ATC VOICE
     ========================================================== */

  function playAtcVoice(
    text
  ) {
    if (!text) {
      return;
    }


    setAtcVoiceError(
      null
    );


    speakAtc(
      text,
      {
        onStart: () => {
          setIsAtcSpeaking(
            true
          );
        },


        onEnd: () => {
          setIsAtcSpeaking(
            false
          );
        },


        onError: () => {
          setIsAtcSpeaking(
            false
          );

          setAtcVoiceError(
            "ATC voice could not be played."
          );
        },
      }
    );
  }


  /* ==========================================================
     BUILD TARGETED VALIDATION TEXT

     The transcript shown on screen remains EXACTLY what Whisper
     heard. This helper adds only the minimum semantic context
     needed for a short clarification response.

     Example:

     ATC: "Say again runway."
     Student: "One seven."

     Validation text becomes:
     "runway one seven"

     The number itself is NOT corrected or guessed.
     ========================================================== */

  function buildClarificationValidationText(
    text,
    targetLabel
  ) {
    const cleanText =
      text.trim();


    switch (targetLabel) {
      case "Runway 17":
        return `runway ${cleanText}`;

      case "Altimeter 29.95":
        return `altimeter ${cleanText}`;

      case "Holding Point 17":
        return `holding point ${cleanText}`;

      case "At Ramp":
        return `at ${cleanText}`;

      case "At Run-Up Area":
        return `at ${cleanText}`;

      case "Run-Up Area":
        return cleanText;

      default:
        return cleanText;
    }
  }


  /* ==========================================================
     MERGE ONE CORRECT CLARIFICATION INTO THE ORIGINAL RESULTS
     ========================================================== */

  function mergeClarificationResult(
    previousChecks,
    retryChecks,
    targetLabel
  ) {
    if (
      !previousChecks ||
      !targetLabel
    ) {
      return previousChecks;
    }


    const retryTarget =
      retryChecks.find(
        (check) =>
          check.label ===
          targetLabel
      );


    return previousChecks.map(
      (check) => {
        if (
          check.label !==
          targetLabel
        ) {
          return check;
        }


        return {
          ...check,
          correct:
            Boolean(
              retryTarget?.correct
            ),
        };
      }
    );
  }


  /* ==========================================================
     FINISH A SUCCESSFUL STUDENT TRANSMISSION
     ========================================================== */

  function finishSuccessfulTransmission() {
    setPendingClarification(null);

    setRememberedChecks(null);


    /* --------------------------------------------------------
       FINAL STUDENT READBACK
       -------------------------------------------------------- */

    if (
      stageIndex ===
      stages.length - 1
    ) {
      setComplete(true);

      return;
    }


    /* --------------------------------------------------------
       NORMAL CHECKLIST ATC RESPONSE
       -------------------------------------------------------- */

    const atcResponse =
      currentStage.atcResponse;


    setLastAtcResponse(
      atcResponse
    );


    if (atcResponse) {
      playAtcVoice(
        atcResponse
      );
    }
  }


  /* ==========================================================
     EVALUATE STUDENT TRANSMISSION

     NORMAL MODE:
     validates the complete transmission exactly as before.

     CLARIFICATION MODE:
     validates only the specific item ATC asked to hear again
     and remembers everything already understood.
     ========================================================== */

/* ==========================================================
   EVALUATE STUDENT TRANSMISSION

   NORMAL MODE:
   validates the complete transmission.

   TARGETED CLARIFICATION MODE:
   validates only the item ATC requested.

   GRADING:
   Every actual student transmission is recorded exactly once.

   IMPORTANT:
   The grading system receives SEMANTIC validation results,
   not raw Whisper spelling.

   Example:

   Whisper:
   "main taxi"

   Validator:
   May Taxi = true

   Grade:
   CORRECT

   ========================================================== */

function evaluateTransmission(
  textOverride = null
) {
  const studentText =
    typeof textOverride ===
      "string"
      ? textOverride
      : transcript;


  if (
    !studentText.trim()
  ) {
    return;
  }


  stopAtcSpeech();

  setIsAtcSpeaking(
    false
  );

  setAtcVoiceError(
    null
  );


  /* ========================================================
     TARGETED SAY-AGAIN / RETRY MODE
     ======================================================== */

  if (
    pendingClarification &&
    rememberedChecks
  ) {
    const targetLabel =
      pendingClarification
        .targetLabel;


    /* ======================================================
       FULL TRANSMISSION RETRY

       targetLabel === null means ATC asked for the complete
       transmission/readback again.

       Example:

       ATC:
       "Negative, runway one seven.
        Say again readback."

       Student must repeat the complete readback.
       ====================================================== */

    if (
      !targetLabel
    ) {
      const fullChecks =
        currentStage.evaluate(
          studentText
        );


      const fullCorrect =
        fullChecks.every(
          (check) =>
            check.correct
        );


      setResult({
        checks:
          fullChecks,

        correct:
          fullCorrect,
      });


      /* ------------------------------------------------------
         FULL RETRY SUCCESS
         ------------------------------------------------------ */

      if (
        fullCorrect
      ) {
        recordCommsAttempt({
          scenarioId,

          stageId:
            currentStage.id,

          stageTitle:
            currentStage.title,

          transcript:
            studentText,

          checks:
            fullChecks,

          mode:
            "full-retry",

          targetLabel:
            null,

          stageComplete:
            true,

          clarification:
            null,
        });


        finishSuccessfulTransmission();


        return;
      }


      /* ------------------------------------------------------
         FULL RETRY STILL INCORRECT
         ------------------------------------------------------ */

      const clarification =
        getAtcClarification(
          currentStage.id,
          fullChecks
        );


      /*
        RECORD THIS STUDENT ATTEMPT.

        The clarification stored here is the ATC response that
        resulted from this failed attempt.
      */

      recordCommsAttempt({
        scenarioId,

        stageId:
          currentStage.id,

        stageTitle:
          currentStage.title,

        transcript:
          studentText,

        checks:
          fullChecks,

        mode:
          "full-retry",

        targetLabel:
          null,

        stageComplete:
          false,

        clarification,
      });


      setRememberedChecks(
        fullChecks
      );


      setPendingClarification(
        clarification
      );


      setLastAtcResponse(
        clarification.message
      );


      if (
        clarification.message
      ) {
        playAtcVoice(
          clarification.message
        );
      }


      return;
    }


    /* ======================================================
       TARGETED CLARIFICATION

       Example:

       ATC:
       "Say again callsign."

       Student:
       "Romeo Papa Charlie one two three four."

       Only Callsign RP-C1234 is re-evaluated.
       ====================================================== */

    const validationText =
      buildClarificationValidationText(
        studentText,
        targetLabel
      );


    const retryChecks =
      currentStage.evaluate(
        validationText
      );


    const retryTarget =
      retryChecks.find(
        (check) =>
          check.label ===
          targetLabel
      );


    /* ======================================================
       TARGETED ITEM STILL INCORRECT / NOT UNDERSTOOD
       ====================================================== */

    if (
      !retryTarget?.correct
    ) {
      /*
        IMPORTANT:

        Do NOT save retryChecks as the complete transmission.

        The student was only asked to repeat ONE item.

        Other checks may appear false because they were not
        spoken during this short clarification.

        Therefore grading records ONLY retryTarget.
      */

      recordCommsAttempt({
        scenarioId,

        stageId:
          currentStage.id,

        stageTitle:
          currentStage.title,

        transcript:
          studentText,

        checks:
          retryTarget
            ? [
                retryTarget,
              ]
            : [],

        mode:
          "targeted-clarification",

        targetLabel,

        stageComplete:
          false,

        /*
          Same ATC clarification remains active because the
          requested item still was not understood.
        */
        clarification:
          pendingClarification,
      });


      setResult({
        checks:
          rememberedChecks,

        correct:
          false,
      });


      setLastAtcResponse(
        pendingClarification
          .message
      );


      if (
        pendingClarification
          .message
      ) {
        playAtcVoice(
          pendingClarification
            .message
        );
      }


      return;
    }


    /* ======================================================
       TARGETED ITEM CORRECT

       Merge it into everything ATC remembered from the
       original transmission.
       ====================================================== */

    const mergedChecks =
      mergeClarificationResult(
        rememberedChecks,
        retryChecks,
        targetLabel
      );


    const nowComplete =
      mergedChecks.every(
        (check) =>
          check.correct
      );


    setResult({
      checks:
        mergedChecks,

      correct:
        nowComplete,
    });


    /* ======================================================
       TARGETED CORRECTION COMPLETES THE STAGE
       ====================================================== */

    if (
      nowComplete
    ) {
      recordCommsAttempt({
        scenarioId,

        stageId:
          currentStage.id,

        stageTitle:
          currentStage.title,

        transcript:
          studentText,

        /*
          Only record the item that was actually spoken in
          this transmission.

          rememberedChecks already contains the original
          transmission history.
        */
        checks:
          retryTarget
            ? [
                retryTarget,
              ]
            : [],

        mode:
          "targeted-clarification",

        targetLabel,

        stageComplete:
          true,

        clarification:
          null,
      });


      finishSuccessfulTransmission();


      return;
    }


    /* ======================================================
       TARGET WAS CORRECT BUT ANOTHER ITEM IS STILL MISSING

       Example:

       Original:
       Station       ✓
       Callsign      ✕
       Position      ✕
       Request       ✓

       ATC:
       Say again callsign.

       Student corrects callsign.

       Now:
       Station       ✓
       Callsign      ✓
       Position      ✕
       Request       ✓

       ATC then asks:
       Say again position.
       ====================================================== */

    const nextClarification =
      getAtcClarification(
        currentStage.id,
        mergedChecks
      );


    /*
      Record the successful targeted response.

      This attempt produced another clarification because a
      different item remains incomplete.
    */

    recordCommsAttempt({
      scenarioId,

      stageId:
        currentStage.id,

      stageTitle:
        currentStage.title,

      transcript:
        studentText,

      checks:
        retryTarget
          ? [
              retryTarget,
            ]
          : [],

      mode:
        "targeted-clarification",

      targetLabel,

      stageComplete:
        false,

      clarification:
        nextClarification,
    });


    setRememberedChecks(
      mergedChecks
    );


    setPendingClarification(
      nextClarification
    );


    setLastAtcResponse(
      nextClarification
        .message
    );


    if (
      nextClarification
        .message
    ) {
      playAtcVoice(
        nextClarification
          .message
      );
    }


    return;
  }


  /* ========================================================
     NORMAL FIRST ATTEMPT

     This evaluates the complete expected radio transmission.
     ======================================================== */

  const checks =
    currentStage.evaluate(
      studentText
    );


  const correct =
    checks.every(
      (check) =>
        check.correct
    );


  setResult({
    checks,
    correct,
  });


  /* ========================================================
     NORMAL ATTEMPT INCORRECT / INCOMPLETE
     ======================================================== */

  if (
    !correct
  ) {
    const clarification =
      getAtcClarification(
        currentStage.id,
        checks
      );


    /* ======================================================
       GRADING

       Save ORIGINAL first attempt before any clarification.

       This is important because later corrections must NOT
       erase the first error.

       Example:

       Attempt 1:
       Runway 17 ✕

       Attempt 2:
       Runway 17 ✓

       Final stage:
       COMPLETE

       Grade history:
       Critical error remains recorded from Attempt 1.
       ====================================================== */

    recordCommsAttempt({
      scenarioId,

      stageId:
        currentStage.id,

      stageTitle:
        currentStage.title,

      transcript:
        studentText,

      checks,

      mode:
        "normal",

      targetLabel:
        null,

      stageComplete:
        false,

      clarification,
    });


    setRememberedChecks(
      checks
    );


    setPendingClarification(
      clarification
    );


    setLastAtcResponse(
      clarification.message
    );


    if (
      clarification.message
    ) {
      playAtcVoice(
        clarification.message
      );
    }


    return;
  }


  /* ========================================================
     CORRECT ON FIRST ATTEMPT
     ======================================================== */

  recordCommsAttempt({
    scenarioId,

    stageId:
      currentStage.id,

    stageTitle:
      currentStage.title,

    transcript:
      studentText,

    checks,

    mode:
      "normal",

    targetLabel:
      null,

    stageComplete:
      true,

    clarification:
      null,
  });


  finishSuccessfulTransmission();
}


  /* ==========================================================
     RECEIVE WHISPER TRANSCRIPT

     PushToTalkButton
          ↓
     whisper.cpp
          ↓
     transcript
          ↓
     this function
          ↓
     existing validator
     ========================================================== */

  function handleSpeechTranscript(
    text
  ) {
    if (
      !text ||
      !text.trim()
    ) {
      return;
    }


    /*
      Stop any previous ATC audio.
    */

    stopAtcSpeech();


    setIsAtcSpeaking(
      false
    );


    /*
      Display exactly what Whisper heard.
    */

    setTranscript(
      text.trim()
    );


    /*
      Clear previous validation.
    */

    setResult(
      null
    );


    setLastAtcResponse(
      null
    );


    setAtcVoiceError(
      null
    );


    /*
      Automatically validate.

      The student no longer needs to press Check.
    */

    evaluateTransmission(
      text.trim()
    );
  }


  /* ==========================================================
     CONTINUE COMMUNICATION
     ========================================================== */

  function continueCommunication() {
    stopAtcSpeech();


    setIsAtcSpeaking(
      false
    );


    setStageIndex(
      (previous) =>
        previous + 1
    );


    setTranscript("");


    setResult(null);


    setLastAtcResponse(
      null
    );


    setAtcVoiceError(
      null
    );


    setPendingClarification(
      null
    );


    setRememberedChecks(
      null
    );
  }


  /* ==========================================================
     RESET COMMUNICATION
     ========================================================== */

  function resetCommunication() {
    stopAtcSpeech();


    setIsAtcSpeaking(
      false
    );


    setStageIndex(0);


    setTranscript("");


    setResult(null);


    setLastAtcResponse(
      null
    );


    setComplete(false);


    setAtcVoiceError(
      null
    );


    setPendingClarification(
      null
    );


    setRememberedChecks(
      null
    );
  }


  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="bg-gradient-to-r from-[#08233f] to-[#103d68] px-5 py-4 text-white">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-white/10 p-2.5">
              <Radio
                size={20}
              />
            </div>


            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200">
                Communications
              </p>


              <h3 className="text-base font-bold">
                {scenario.title}
              </h3>

            </div>

          </div>


          <div className="flex items-center gap-2">

            {/* ATC SPEAKING INDICATOR */}

            {isAtcSpeaking && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-2">

                <Volume2
                  size={14}
                  className="animate-pulse text-emerald-300"
                />

                <span className="hidden text-[9px] font-bold uppercase tracking-wider text-emerald-200 sm:inline">
                  ATC Speaking
                </span>

              </div>
            )}


            {/* RESET */}

            <button
              type="button"

              onClick={
                resetCommunication
              }

              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"

              title="Restart communication"
            >
              <RotateCcw
                size={16}
              />
            </button>

          </div>

        </div>

      </div>


      {/* ======================================================
          PROGRESS
          ====================================================== */}

      <div className="border-b border-slate-100 px-5 py-4">

        <div className="flex gap-2">

          {stages.map(
            (stage, index) => {

              const done =
                index <
                stageIndex;


              const active =
                index ===
                stageIndex &&
                !complete;


              return (
                <div
                  key={
                    stage.id
                  }
                  className="flex-1"
                >

                  <div
                    className={`
                      h-1.5
                      rounded-full

                      ${done ||
                        complete
                        ? "bg-emerald-500"
                        : active
                          ? "bg-blue-600"
                          : "bg-slate-200"
                      }
                    `}
                  />


                  <p
                    className={`
                      mt-2
                      hidden
                      text-[9px]
                      font-semibold
                      sm:block

                      ${active
                        ? "text-blue-600"
                        : done ||
                          complete
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }
                    `}
                  >
                    {stage.title}
                  </p>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* ======================================================
          CONTENT
          ====================================================== */}

      <div className="p-5">

        {!complete ? (
          <>

            {/* =================================================
                CURRENT STAGE
                ================================================= */}

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">

                Transmission{" "}
                {stageIndex + 1}
                {" "}
                of{" "}
                {stages.length}

              </p>


              <h4 className="mt-2 text-lg font-bold text-slate-900">

                {
                  currentStage.title
                }

              </h4>


              <p className="mt-2 text-sm leading-6 text-slate-500">

                {
                  currentStage.prompt
                }

              </p>

            </div>


            {/* =================================================
                TRANSCRIPT

                Student cannot type here anymore.

                Whisper automatically fills this box.
                ================================================= */}

            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between gap-3">

                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">

                  Speech Recognition Transcript

                </label>


                {transcript && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">
                    Speech received
                  </span>
                )}

              </div>


              <textarea
                value={
                  transcript
                }

                readOnly

                rows={4}

                placeholder="Hold PTT and speak your radio transmission..."

                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-slate-800
                  outline-none
                "
              />


              <p className="mt-2 text-[10px] leading-4 text-slate-400">

                This field shows exactly what the local
                speech recognition system heard.

              </p>

            </div>


            {/* =================================================
                PUSH TO TALK

                HOLD button
                     ↓
                speak
                     ↓
                release
                     ↓
                whisper.cpp
                     ↓
                transcript
                     ↓
                automatic validation
                ================================================= */}

            {pendingClarification && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
                  ATC Clarification Requested
                </p>

                <p className="mt-1 text-xs font-semibold text-amber-900">
                  {pendingClarification.targetLabel
                    ? `Repeat only: ${pendingClarification.targetLabel}`
                    : "Repeat the complete transmission"}
                </p>
              </div>
            )}


            <div className="mt-4">

              <PushToTalkButton
                onTranscript={
                  handleSpeechTranscript
                }

                prompt={
                  activeSpeechPrompt
                }

                disabled={
                  isAtcSpeaking ||
                  result?.correct
                }
              />

            </div>


            {/* =================================================
                PTT INFORMATION
                ================================================= */}

            {!result && (
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2">

                <p className="text-[10px] leading-5 text-blue-700">

                  Hold the PTT button while speaking.
                  Release the button when your radio
                  transmission is complete.

                </p>

              </div>
            )}


            {/* =================================================
                VALIDATION RESULT
                ================================================= */}

            {result && (

              <div
                className={`
                  mt-5
                  rounded-2xl
                  border
                  p-4

                  ${result.correct
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                  }
                `}
              >

                <div className="flex items-center gap-2">

                  {result.correct ? (

                    <CheckCircle2
                      size={19}
                      className="text-emerald-600"
                    />

                  ) : (

                    <X
                      size={19}
                      className="text-red-500"
                    />

                  )}


                  <p
                    className={`
                      text-sm
                      font-bold

                      ${result.correct
                        ? "text-emerald-700"
                        : "text-red-700"
                      }
                    `}
                  >

                    {
                      result.correct
                        ? "Transmission Correct"
                        : "Say Again Required"
                    }

                  </p>

                </div>


                <div className="mt-4 space-y-2">

                  {result.checks.map(
                    (check) => (

                      <div
                        key={
                          check.label
                        }

                        className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2"
                      >

                        <span className="text-xs font-medium text-slate-600">

                          {
                            check.label
                          }

                        </span>


                        {check.correct ? (

                          <Check
                            size={17}
                            className="text-emerald-600"
                          />

                        ) : (

                          <X
                            size={17}
                            className="text-red-500"
                          />

                        )}

                      </div>

                    )
                  )}

                </div>


                {/* =============================================
                    INCORRECT - TRY AGAIN
                    ============================================= */}

                {!result.correct && (

                  <div className="mt-4 rounded-xl border border-red-100 bg-white/60 p-3">

                    <p className="text-xs leading-5 text-red-700">

                      {pendingClarification?.targetLabel
                        ? `ATC understood the other correct items. Repeat only: ${pendingClarification.targetLabel}.`
                        : "Listen to ATC, then hold PTT and repeat the complete transmission."}

                    </p>

                  </div>

                )}

              </div>

            )}


            {/* =================================================
                ATC RESPONSE
                ================================================= */}

            {lastAtcResponse && (

                <div className="mt-5 overflow-hidden rounded-2xl border border-blue-200 bg-[#07192b]">

                  {/* ===========================================
                      ATC HEADER
                      =========================================== */}

                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">

                    <div className="flex items-center gap-2 text-blue-200">

                      <Radio
                        size={16}
                      />


                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">

                        Binalonan Radio

                      </span>

                    </div>


                    {/* =========================================
                        REPLAY ATC
                        ========================================= */}

                    <button
                      type="button"

                      onClick={() =>
                        playAtcVoice(
                          lastAtcResponse
                        )
                      }

                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-white/10
                        bg-white/5
                        px-2.5
                        py-1.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-blue-200
                        transition

                        hover:bg-white/10
                        hover:text-white
                      "
                    >

                      <Volume2
                        size={13}
                      />

                      Replay

                    </button>

                  </div>


                  {/* ===========================================
                      ATC MESSAGE
                      =========================================== */}

                  <div className="p-4">

                    <p className="text-sm leading-6 text-white">

                      {
                        lastAtcResponse
                      }

                    </p>


                    {/* =========================================
                        ATC SPEAKING
                        ========================================= */}

                    {isAtcSpeaking && (

                      <div className="mt-3 flex items-center gap-2 text-emerald-300">

                        <Volume2
                          size={14}
                          className="animate-pulse"
                        />


                        <span className="text-[10px] font-bold uppercase tracking-wider">

                          ATC transmitting...

                        </span>

                      </div>

                    )}


                    {/* =========================================
                        ATC ERROR
                        ========================================= */}

                    {atcVoiceError && (

                      <div className="mt-3 flex items-center gap-2 text-red-300">

                        <VolumeX
                          size={14}
                        />


                        <span className="text-xs">

                          {
                            atcVoiceError
                          }

                        </span>

                      </div>

                    )}

                  </div>

                </div>

              )}


            {/* =================================================
                CONTINUE
                ================================================= */}

            {result?.correct &&
              stageIndex <
              stages.length -
              1 && (

                <button
                  type="button"

                  onClick={
                    continueCommunication
                  }

                  disabled={
                    isAtcSpeaking
                  }

                  className="
                    mt-4
                    w-full
                    rounded-2xl
                    bg-[#08233f]
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition

                    hover:bg-[#103d68]

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {isAtcSpeaking
                    ? "Wait for ATC..."
                    : "Continue Communication"}

                </button>

              )}

          </>
        ) : (

          /* ===================================================
             COMMUNICATION COMPLETE
             =================================================== */

          <div className="py-5 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

              <CheckCircle2
                size={28}
              />

            </div>


            <h4 className="mt-4 text-xl font-bold text-slate-900">

              Communication Complete

            </h4>


            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">

              The communication procedure and
              required readback have been
              completed correctly.

            </p>


            <button
              type="button"

              onClick={
                onComplete
              }

              className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >

              Complete Checklist Step

            </button>

          </div>

        )}

      </div>

    </div>
  );
}


export default CommsTrainingPanel;