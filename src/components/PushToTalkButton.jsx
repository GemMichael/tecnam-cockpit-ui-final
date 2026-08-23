import {
  LoaderCircle,
  Mic,
  Radio,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import {
  transcribeAudio,
} from "../services/speechToText";


function PushToTalkButton({
  onTranscript,
  prompt = "",
  disabled = false,
}) {

  const recorderRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  const releaseRequestedRef =
    useRef(false);


  const [
    status,
    setStatus,
  ] = useState("idle");


  const [
    error,
    setError,
  ] = useState(null);


  /* ==========================================================
     CLEAN MICROPHONE
     ========================================================== */

  function stopMicrophoneStream() {

    if (
      streamRef.current
    ) {

      streamRef.current
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

      streamRef.current =
        null;
    }
  }


  /* ==========================================================
     CHOOSE RECORDING FORMAT
     ========================================================== */

  function getSupportedMimeType() {

    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];


    for (
      const type
      of types
    ) {

      if (
        MediaRecorder
          .isTypeSupported(
            type
          )
      ) {

        return type;
      }
    }


    return "";
  }


  /* ==========================================================
     START PTT
     ========================================================== */

  async function startRecording(
    event
  ) {

    if (
      disabled ||
      status ===
        "transcribing" ||
      status ===
        "recording"
    ) {
      return;
    }


    event.preventDefault();


    try {

      event.currentTarget
        .setPointerCapture(
          event.pointerId
        );

    } catch {
      // Pointer capture is optional.
    }


    releaseRequestedRef.current =
      false;


    setError(null);


    try {

      /* ======================================================
         ASK FOR MICROPHONE ACCESS
         ====================================================== */

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            audio: {
              echoCancellation:
                true,

              noiseSuppression:
                true,

              autoGainControl:
                true,
            },
          });


      streamRef.current =
        stream;


      const mimeType =
        getSupportedMimeType();


      const recorder =
        mimeType
          ? new MediaRecorder(
              stream,
              {
                mimeType,
              }
            )
          : new MediaRecorder(
              stream
            );


      recorderRef.current =
        recorder;


      chunksRef.current =
        [];


      /* ======================================================
         AUDIO CHUNKS
         ====================================================== */

      recorder.ondataavailable =
        (recordingEvent) => {

          if (
            recordingEvent
              .data &&
            recordingEvent
              .data.size >
              0
          ) {

            chunksRef.current.push(
              recordingEvent
                .data
            );
          }
        };


      /* ======================================================
         RECORDING FINISHED
         ====================================================== */

      recorder.onstop =
        async () => {

          stopMicrophoneStream();


          const audioType =
            recorder.mimeType ||
            mimeType ||
            "audio/webm";


          const audioBlob =
            new Blob(
              chunksRef.current,
              {
                type:
                  audioType,
              }
            );


          chunksRef.current =
            [];


          if (
            audioBlob.size <
            500
          ) {

            setStatus(
              "idle"
            );

            setError(
              "Recording was too short. Hold PTT while speaking."
            );

            return;
          }


          /* ==================================================
             SEND TO WHISPER
             ================================================== */

          setStatus(
            "transcribing"
          );


          try {

            const text =
              await transcribeAudio(
                audioBlob,
                {
                  prompt,
                }
              );


            if (
              onTranscript
            ) {

              onTranscript(
                text
              );
            }


            setStatus(
              "idle"
            );

          } catch (
            transcriptionError
          ) {

            console.error(
              transcriptionError
            );


            setError(
              transcriptionError
                .message ||
                "Speech recognition failed."
            );


            setStatus(
              "idle"
            );
          }
        };


      /* ======================================================
         START RECORDING
         ====================================================== */

      recorder.start();


      setStatus(
        "recording"
      );


      /*
        This handles the first microphone-permission request.

        If the user released PTT while Chrome was showing the
        microphone permission dialog, immediately stop once
        permission has been granted.
      */

      if (
        releaseRequestedRef
          .current
      ) {

        setTimeout(
          () =>
            stopRecording(),
          0
        );
      }

    } catch (
      microphoneError
    ) {

      console.error(
        microphoneError
      );


      stopMicrophoneStream();


      setStatus(
        "idle"
      );


      if (
        microphoneError
          .name ===
        "NotAllowedError"
      ) {

        setError(
          "Microphone permission was denied."
        );

      } else {

        setError(
          "Unable to access the microphone."
        );
      }
    }
  }


  /* ==========================================================
     STOP PTT
     ========================================================== */

function stopRecording() {

  releaseRequestedRef.current =
    true;


  const recorder =
    recorderRef.current;


  if (
    recorder &&
    recorder.state ===
      "recording"
  ) {

    /*
      Keep recording for a very short
      moment after PTT release.

      This prevents the final word or
      callsign from being clipped.
    */

    setTimeout(() => {

      if (
        recorder.state ===
        "recording"
      ) {

        recorder.stop();

      }

    }, 250);

  }
}


  /* ==========================================================
     BUTTON TEXT
     ========================================================== */

  let buttonText =
    "Hold to Talk";


  if (
    status === "recording"
  ) {
    buttonText =
      "Release to Send";
  }


  if (
    status ===
    "transcribing"
  ) {
    buttonText =
      "Transcribing...";
  }


  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div className="space-y-2">

      <button
        type="button"

        disabled={
          disabled ||
          status ===
            "transcribing"
        }

        onPointerDown={
          startRecording
        }

        onPointerUp={
          stopRecording
        }

        onPointerCancel={
          stopRecording
        }

        onContextMenu={(
          event
        ) =>
          event.preventDefault()
        }

        className={`
          flex
          min-h-[58px]
          w-full
          touch-none
          select-none
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          px-5
          py-4
          text-sm
          font-black
          uppercase
          tracking-[0.12em]
          transition

          ${
            status ===
            "recording"
              ? `
                border-red-400
                bg-red-600
                text-white
                shadow-[0_0_20px_rgba(220,38,38,.35)]
              `
              : status ===
                "transcribing"
              ? `
                cursor-wait
                border-blue-200
                bg-blue-50
                text-blue-600
              `
              : `
                border-[#0d3558]
                bg-gradient-to-b
                from-[#124b78]
                to-[#08233f]
                text-white
                shadow-lg
                hover:from-[#175b90]
                hover:to-[#0b3155]
              `
          }

          disabled:cursor-not-allowed
          disabled:opacity-50
        `}
      >

        {status ===
        "recording" ? (

          <Radio
            size={20}
            className="animate-pulse"
          />

        ) : status ===
          "transcribing" ? (

          <LoaderCircle
            size={20}
            className="animate-spin"
          />

        ) : (

          <Mic
            size={20}
          />

        )}


        {buttonText}

      </button>


      {status ===
        "recording" && (

        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-red-600">

          ● PTT ACTIVE —
          SPEAK NOW

        </p>

      )}


      {status ===
        "transcribing" && (

        <p className="text-center text-[10px] font-semibold text-blue-600">

          Processing local
          speech recognition...

        </p>

      )}


      {error && (

        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">

          <p className="text-xs text-red-600">

            {error}

          </p>

        </div>

      )}

    </div>
  );
}


export default PushToTalkButton;