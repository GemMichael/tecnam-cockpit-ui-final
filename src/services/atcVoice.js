/* ============================================================
   ATC VOICE SERVICE
   TECNAM P2002JF COCKPIT TRAINER

   Raspberry Pi version:

   React
      ↓
   FastAPI
      ↓
   espeak-ng
      ↓
   WAV audio
      ↓
   Web Audio radio processing
      ↓
   Headset
   ============================================================ */


/* ============================================================
   API
   ============================================================ */

function getApiBaseUrl() {
  if (
    typeof window ===
    "undefined"
  ) {
    return "http://127.0.0.1:8000";
  }

  const hostname =
    window.location.hostname ||
    "127.0.0.1";

  return `http://${hostname}:8000`;
}


/* ============================================================
   AUDIO CONTEXT
   ============================================================ */

let audioContext = null;

let activeSpeechSource =
  null;

let activeRequestController =
  null;

let speechGeneration =
  0;


function getAudioContext() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }


  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioContextClass) {
    return null;
  }


  if (!audioContext) {
    audioContext =
      new AudioContextClass();
  }


  return audioContext;
}


/* ============================================================
   RESUME AUDIO CONTEXT
   ============================================================ */

async function resumeAudioContext() {
  const context =
    getAudioContext();


  if (!context) {
    return;
  }


  if (
    context.state ===
    "suspended"
  ) {
    try {
      await context.resume();
    } catch (error) {
      console.warn(
        "Could not resume audio context:",
        error
      );
    }
  }
}


/* ============================================================
   RADIO SQUELCH
   ============================================================ */

async function playRadioSquelch(
  duration = 0.09,
  volume = 0.055
) {
  const context =
    getAudioContext();


  if (!context) {
    return;
  }


  await resumeAudioContext();


  const sampleRate =
    context.sampleRate;


  const frameCount =
    Math.floor(
      sampleRate *
      duration
    );


  const buffer =
    context.createBuffer(
      1,
      frameCount,
      sampleRate
    );


  const data =
    buffer.getChannelData(
      0
    );


  for (
    let index = 0;
    index < frameCount;
    index += 1
  ) {
    const progress =
      index /
      frameCount;


    const envelope =
      1 -
      progress;


    data[index] =
      (
        Math.random() *
        2 -
        1
      ) *
      envelope;
  }


  const source =
    context.createBufferSource();


  source.buffer =
    buffer;


  const filter =
    context.createBiquadFilter();


  filter.type =
    "bandpass";


  filter.frequency.value =
    1800;


  filter.Q.value =
    0.8;


  const gain =
    context.createGain();


  gain.gain.value =
    volume;


  source.connect(
    filter
  );


  filter.connect(
    gain
  );


  gain.connect(
    context.destination
  );


  source.start();
}


/* ============================================================
   AVIATION PRONUNCIATION

   Only changes what is spoken.

   The visible ATC text is NOT modified.
   ============================================================ */

function prepareAtcSpeechText(
  text
) {
  if (!text) {
    return "";
  }


  let prepared =
    text;


  /* ==========================================================
     CALLSIGN

     RP-C1234
        ↓
     Romeo Papa Charlie one two three four
     ========================================================== */

  prepared =
    prepared.replace(
      /RP[\s-]?C[\s-]?1234/gi,

      (
        "Romeo Papa Charlie " +
        "one two three four"
      )
    );


  /* ==========================================================
     RUNWAY 17
     ========================================================== */

  prepared =
    prepared.replace(
      /runway\s+17/gi,

      "runway one seven"
    );


  /* ==========================================================
     HOLDING POINT 17
     ========================================================== */

  prepared =
    prepared.replace(
      /holding\s+point\s+17/gi,

      "holding point one seven"
    );


  /* ==========================================================
     ALTIMETER 29.95
     ========================================================== */

  prepared =
    prepared.replace(
      /29\.95/g,

      "two niner niner five"
    );


  /* ==========================================================
     STARTUP
     ========================================================== */

  prepared =
    prepared.replace(
      /startup approved/gi,

      "start up approved"
    );


  /* ==========================================================
     NORMALIZE COMMAS
     ========================================================== */

  prepared =
    prepared.replace(
      /,\s*/g,

      ", "
    );


  return prepared;
}


/* ============================================================
   AVAILABLE VOICES

   Browser speechSynthesis is no longer used.

   Keep this export so existing UI code does not break.
   ============================================================ */

export function getAvailableAtcVoices() {
  return [
    {
      name:
        "Raspberry Pi ATC Voice",

      lang:
        "en-US",

      default:
        true,
    },
  ];
}


/* ============================================================
   STOP ATC SPEECH
   ============================================================ */

export function stopAtcSpeech() {
  speechGeneration += 1;


  if (
    activeRequestController
  ) {
    try {
      activeRequestController.abort();
    } catch {
      // Ignore.
    }


    activeRequestController =
      null;
  }


  if (
    activeSpeechSource
  ) {
    try {
      /*
       * Remove onended before stopping
       * so intentional cancellation does
       * not trigger the normal closing flow.
       */

      activeSpeechSource.onended =
        null;


      activeSpeechSource.stop();
    } catch {
      // Ignore.
    }


    activeSpeechSource =
      null;
  }
}


/* ============================================================
   GET TTS AUDIO
   ============================================================ */

async function requestAtcAudio(
  speechText,
  signal
) {
  const apiBaseUrl =
    getApiBaseUrl();


  const response =
    await fetch(
      `${apiBaseUrl}/api/tts/atc`,

      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            text:
              speechText,
          }),

        signal,
      }
    );


  if (!response.ok) {
    let message =
      `ATC voice failed (${response.status}).`;


    try {
      const data =
        await response.json();


      if (data?.detail) {
        message =
          data.detail;
      }
    } catch {
      const text =
        await response.text();


      if (text) {
        message =
          text;
      }
    }


    throw new Error(
      message
    );
  }


  return response.arrayBuffer();
}


/* ============================================================
   PLAY ATC AUDIO

   Radio processing:

   high-pass:
   removes deep bass

   low-pass:
   removes excessive high frequencies

   compressor:
   gives a more radio-like controlled level
   ============================================================ */

async function playAtcAudio(
  wavArrayBuffer,
  {
    onStart,
    onEnd,
  } = {}
) {
  const context =
    getAudioContext();


  if (!context) {
    throw new Error(
      "Web Audio is unavailable."
    );
  }


  await resumeAudioContext();


  const audioBuffer =
    await context.decodeAudioData(
      wavArrayBuffer.slice(0)
    );


  const source =
    context.createBufferSource();


  source.buffer =
    audioBuffer;


  /* ==========================================================
     RADIO HIGH-PASS
     ========================================================== */

  const highPass =
    context.createBiquadFilter();


  highPass.type =
    "highpass";


  highPass.frequency.value =
    300;


  highPass.Q.value =
    0.7;


  /* ==========================================================
     RADIO LOW-PASS
     ========================================================== */

  const lowPass =
    context.createBiquadFilter();


  lowPass.type =
    "lowpass";


  lowPass.frequency.value =
    3400;


  lowPass.Q.value =
    0.7;


  /* ==========================================================
     COMPRESSION
     ========================================================== */

  const compressor =
    context.createDynamicsCompressor();


  compressor.threshold.value =
    -24;


  compressor.knee.value =
    14;


  compressor.ratio.value =
    4;


  compressor.attack.value =
    0.004;


  compressor.release.value =
    0.16;


  /* ==========================================================
     FINAL GAIN
     ========================================================== */

  const gain =
    context.createGain();


  gain.gain.value =
    0.95;


  source.connect(
    highPass
  );


  highPass.connect(
    lowPass
  );


  lowPass.connect(
    compressor
  );


  compressor.connect(
    gain
  );


  gain.connect(
    context.destination
  );


  activeSpeechSource =
    source;


  return new Promise(
    (resolve) => {

      source.onended =
        async () => {

          if (
            activeSpeechSource ===
            source
          ) {
            activeSpeechSource =
              null;
          }


          await playRadioSquelch(
            0.065,
            0.04
          );


          if (onEnd) {
            onEnd();
          }


          resolve();
        };


      if (onStart) {
        onStart();
      }


      source.start();
    }
  );
}


/* ============================================================
   SPEAK ATC
   ============================================================ */

export async function speakAtc(
  text,
  {
    onStart,
    onEnd,
    onError,
  } = {}
) {
  if (!text) {
    return false;
  }


  /* ==========================================================
     STOP OLD TRANSMISSION
     ========================================================== */

  stopAtcSpeech();


  const currentGeneration =
    ++speechGeneration;


  const controller =
    new AbortController();


  activeRequestController =
    controller;


  try {

    /* ========================================================
       WAKE AUDIO
       ======================================================== */

    await resumeAudioContext();


    /* ========================================================
       OPEN RADIO
       ======================================================== */

    await playRadioSquelch(
      0.08,
      0.055
    );


    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          100
        )
    );


    /* ========================================================
       PREPARE AVIATION SPEECH
       ======================================================== */

    const speechText =
      prepareAtcSpeechText(
        text
      );


    /* ========================================================
       REQUEST WAV FROM FASTAPI
       ======================================================== */

    const wavArrayBuffer =
      await requestAtcAudio(
        speechText,
        controller.signal
      );


    if (
      currentGeneration !==
      speechGeneration
    ) {
      return false;
    }


    /* ========================================================
       PLAY
       ======================================================== */

    await playAtcAudio(
      wavArrayBuffer,
      {
        onStart,
        onEnd,
      }
    );


    return true;

  } catch (error) {

    if (
      error?.name ===
      "AbortError"
    ) {
      return false;
    }


    console.error(
      "ATC speech error:",
      error
    );


    if (onError) {
      onError(
        error
      );
    }


    return false;

  } finally {

    if (
      activeRequestController ===
      controller
    ) {
      activeRequestController =
        null;
    }
  }
}