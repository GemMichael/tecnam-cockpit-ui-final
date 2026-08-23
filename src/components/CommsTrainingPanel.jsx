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
  getAtcRetryResponse,
} from "../data/commsRetryResponses";

import {
  speakAtc,
  stopAtcSpeech,
} from "../services/atcVoice";

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
     EVALUATE STUDENT TRANSMISSION

     textOverride allows this same function to validate:

     1. existing text
     2. Whisper speech-to-text output

     For PTT we pass Whisper's transcript directly.
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


    /* --------------------------------------------------------
       Stop any old ATC transmission.
       -------------------------------------------------------- */

    stopAtcSpeech();


    setIsAtcSpeaking(
      false
    );


    setAtcVoiceError(
      null
    );


    /* --------------------------------------------------------
       RUN EXISTING COMMUNICATION VALIDATOR

       This continues to use commsScenarios.js.
       -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       INCORRECT TRANSMISSION

       ATC does not respond.
       Student must try again.
       -------------------------------------------------------- */

    /* ========================================================
       INCORRECT / INCOMPLETE TRANSMISSION
    
       Instead of staying silent:
    
       validator
           ↓
       determine missing item
           ↓
       ATC asks student to repeat
       ======================================================== */

    if (!correct) {
      const retryResponse =
        getAtcRetryResponse(
          currentStage.id,
          checks
        );


      setLastAtcResponse(
        retryResponse
      );


      if (retryResponse) {
        playAtcVoice(
          retryResponse
        );
      }


      return;
    }


    /* --------------------------------------------------------
       FINAL STUDENT READBACK

       There is no additional ATC response after the last
       correct student transmission.
       -------------------------------------------------------- */

    if (
      stageIndex ===
      stages.length - 1
    ) {
      setComplete(true);

      return;
    }


    /* --------------------------------------------------------
       CORRECT TRANSMISSION

       Display and speak the ATC response.
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

            <div className="mt-4">

              <PushToTalkButton
                onTranscript={
                  handleSpeechTranscript
                }

                prompt={
                  speechRecognitionPrompt
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

                      Review the missing items above,
                      then hold PTT and repeat your
                      transmission.

                    </p>

                  </div>

                )}

              </div>

            )}


            {/* =================================================
                ATC RESPONSE
                ================================================= */}

            {result?.correct &&
              lastAtcResponse && (

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