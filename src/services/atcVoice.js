/* ============================================================
   ATC VOICE SERVICE
   TECNAM P2002JF COCKPIT TRAINER

   CURRENT DEVELOPMENT VERSION:
   Browser Speech Synthesis + radio effects

   FINAL RASPBERRY PI VERSION:
   Offline TTS + proper radio audio processing

   The rest of the comms system does not need to change.
   ============================================================ */


/* ============================================================
   SPEECH ENGINE
   ============================================================ */

function getSpeechEngine() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
}


/* ============================================================
   AUDIO CONTEXT

   Used only for the radio click / squelch sound.
   ============================================================ */

let audioContext = null;

function getAudioContext() {
  if (typeof window === "undefined") {
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

   Chrome sometimes suspends Web Audio until the user
   interacts with the page.
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
   RADIO SQUELCH / CLICK

   Creates a very short burst of filtered noise.

   This gives the effect of:
   radio opens
       ↓
   ATC speaks
       ↓
   radio closes
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
      sampleRate * duration
    );

  const buffer =
    context.createBuffer(
      1,
      frameCount,
      sampleRate
    );

  const data =
    buffer.getChannelData(0);

  /*
    Generate noise.

    The strength fades out quickly.
  */

  for (
    let i = 0;
    i < frameCount;
    i += 1
  ) {
    const progress =
      i / frameCount;

    const envelope =
      1 - progress;

    data[i] =
      (Math.random() * 2 - 1) *
      envelope;
  }


  const source =
    context.createBufferSource();

  source.buffer =
    buffer;


  /*
    Band-pass filter gives the click a radio-like
    frequency range.
  */

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
   CHOOSE ATC VOICE

   Voice availability depends on the operating system.

   On Windows, Chrome may expose voices such as:

   Microsoft Guy
   Microsoft Mark
   Microsoft David
   Microsoft George
   Microsoft Ryan
   Microsoft Daniel

   We prefer deeper English voices when possible.
   ============================================================ */

function chooseAtcVoice() {
  const engine =
    getSpeechEngine();

  if (!engine) {
    return null;
  }

  const voices =
    engine.getVoices();

  if (!voices.length) {
    return null;
  }


  /* ==========================================================
     ENGLISH ONLY
     ========================================================== */

  const englishVoices =
    voices.filter(
      (voice) =>
        voice.lang
          ?.toLowerCase()
          .startsWith("en")
    );


  const candidates =
    englishVoices.length
      ? englishVoices
      : voices;


  /* ==========================================================
     PREFERRED VOICE NAMES

     We check keywords instead of requiring exact names
     because Windows may call them things like:

     Microsoft Guy Online (Natural)
     Microsoft David Desktop
     etc.
     ========================================================== */

  const preferredKeywords = [
    "guy",
    "mark",
    "david",
    "george",
    "ryan",
    "daniel",
    "james",
    "male",
    "google uk english male",
  ];


  for (
    const keyword
    of preferredKeywords
  ) {
    const found =
      candidates.find(
        (voice) =>
          voice.name
            .toLowerCase()
            .includes(keyword)
      );

    if (found) {
      return found;
    }
  }


  /*
    Prefer US English next.
  */

  const usEnglish =
    candidates.find(
      (voice) =>
        voice.lang
          ?.toLowerCase() ===
        "en-us"
    );

  if (usEnglish) {
    return usEnglish;
  }


  /*
    Then UK English.
  */

  const ukEnglish =
    candidates.find(
      (voice) =>
        voice.lang
          ?.toLowerCase() ===
        "en-gb"
    );

  if (ukEnglish) {
    return ukEnglish;
  }


  return candidates[0];
}


/* ============================================================
   AVIATION PRONUNCIATION

   IMPORTANT:

   This changes ONLY what the TTS engine says.

   It does NOT change the visible ATC text.
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

     Screen:
     RP-C1234

     Voice:
     Romeo Papa Charlie one two three four

     If your instructor prefers "R P C..."
     we can change this later.
     ========================================================== */

  prepared =
    prepared.replace(
      /RP[\s-]?C[\s-]?1234/gi,
      "Romeo Papa Charlie one two three four"
    );


  /* ==========================================================
     RUNWAY
     ========================================================== */

  prepared =
    prepared.replace(
      /runway\s+17/gi,
      "runway one seven"
    );


  /* ==========================================================
     HOLDING POINT
     ========================================================== */

  prepared =
    prepared.replace(
      /holding\s+point\s+17/gi,
      "holding point one seven"
    );


  /* ==========================================================
     ALTIMETER

     29.95 → two niner niner five
     ========================================================== */

  prepared =
    prepared.replace(
      /29\.95/g,
      "two niner niner five"
    );


  /* ==========================================================
     STARTUP

     Give the synthesizer slightly better phrasing.
     ========================================================== */

  prepared =
    prepared.replace(
      /startup approved/gi,
      "start up approved"
    );


  /* ==========================================================
     ADD SMALL PAUSES WITH COMMAS

     Browser TTS usually pauses slightly at commas.
     ========================================================== */

  prepared =
    prepared.replace(
      /,\s*/g,
      ", "
    );


  return prepared;
}


/* ============================================================
   SHOW AVAILABLE VOICES

   Useful for debugging.

   In Chrome Console you can later run this if exported.
   ============================================================ */

export function getAvailableAtcVoices() {
  const engine =
    getSpeechEngine();

  if (!engine) {
    return [];
  }

  return engine
    .getVoices()
    .filter(
      (voice) =>
        voice.lang
          ?.toLowerCase()
          .startsWith("en")
    )
    .map(
      (voice) => ({
        name:
          voice.name,

        lang:
          voice.lang,

        default:
          voice.default,
      })
    );
}


/* ============================================================
   STOP ATC SPEECH
   ============================================================ */

export function stopAtcSpeech() {
  const engine =
    getSpeechEngine();

  if (!engine) {
    return;
  }

  engine.cancel();
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
  const engine =
    getSpeechEngine();


  if (!engine) {
    console.warn(
      "Browser text-to-speech is not supported."
    );

    if (onError) {
      onError(
        new Error(
          "Speech synthesis unavailable."
        )
      );
    }

    return false;
  }


  if (!text) {
    return false;
  }


  /* ==========================================================
     STOP PREVIOUS TRANSMISSION
     ========================================================== */

  engine.cancel();


  /* ==========================================================
     RADIO OPENING SQUELCH
     ========================================================== */

  await playRadioSquelch(
    0.08,
    0.055
  );


  /*
    Tiny delay between squelch and voice.
  */

  await new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        100
      )
  );


  /* ==========================================================
     PREPARE SPEECH
     ========================================================== */

  const speechText =
    prepareAtcSpeechText(
      text
    );


  const utterance =
    new window.SpeechSynthesisUtterance(
      speechText
    );


  /* ==========================================================
     SELECT VOICE
     ========================================================== */

  const voice =
    chooseAtcVoice();


  if (voice) {
    utterance.voice =
      voice;

    utterance.lang =
      voice.lang;
  } else {
    utterance.lang =
      "en-US";
  }


  /* ==========================================================
     ATC-LIKE VOICE SETTINGS

     rate:
     Controllers normally speak clearly but not slowly.

     pitch:
     Lower for a firmer radio voice.

     volume:
     Full volume.
     ========================================================== */

  utterance.rate =
    0.98;

  utterance.pitch =
    0.72;

  utterance.volume =
    1;


  /* ==========================================================
     EVENTS
     ========================================================== */

  utterance.onstart =
    () => {
      if (onStart) {
        onStart();
      }
    };


  utterance.onend =
    async () => {

      /*
        Radio closing squelch.
      */

      await playRadioSquelch(
        0.065,
        0.04
      );


      if (onEnd) {
        onEnd();
      }
    };


  utterance.onerror =
    (event) => {

      /*
        Chrome may report "interrupted" if we intentionally
        cancel a previous transmission.

        Don't display that as a real simulator error.
      */

      if (
        event.error ===
          "interrupted" ||
        event.error ===
          "canceled"
      ) {
        return;
      }


      console.error(
        "ATC speech error:",
        event
      );


      if (onError) {
        onError(event);
      }
    };


  /* ==========================================================
     TRANSMIT
     ========================================================== */

  engine.speak(
    utterance
  );


  return true;
}