import {
  STT_API_URL,
} from "../config";

/* ============================================================
   GET FILE EXTENSION FROM BROWSER AUDIO FORMAT
   ============================================================ */

function getAudioExtension(
  mimeType = ""
) {
  if (
    mimeType.includes("ogg")
  ) {
    return "ogg";
  }

  if (
    mimeType.includes("mp4")
  ) {
    return "m4a";
  }

  if (
    mimeType.includes("webm")
  ) {
    return "webm";
  }

  return "webm";
}


/* ============================================================
   TRANSCRIBE AUDIO

   Browser recording
          ↓
   whisper.cpp /inference
          ↓
   text
   ============================================================ */

export async function transcribeAudio(
  audioBlob,
  {
    prompt = "",
  } = {}
) {
  if (!audioBlob) {
    throw new Error(
      "No audio was recorded."
    );
  }

  const extension =
    getAudioExtension(
      audioBlob.type
    );


  const formData =
    new FormData();


  formData.append(
    "file",
    audioBlob,
    `student-transmission.${extension}`
  );


  /*
    English-only aviation
    communication.
  */

  formData.append(
    "language",
    "en"
  );


  /*
    Returning plain text makes
    the frontend simpler.
  */

  formData.append(
    "response_format",
    "text"
  );


  /*
    Stable decoding.
  */

  formData.append(
    "temperature",
    "0.0"
  );


  /*
    Bias recognition toward our
    aviation vocabulary.

    This does not force the answer.
    It only supplies context.
  */

  if (prompt) {
    formData.append(
      "prompt",
      prompt
    );
  }


  const response =
    await fetch(
      `${STT_API_URL}/inference`,
      {
        method: "POST",
        body: formData,
      }
    );


  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      errorText ||
        `Speech recognition failed (${response.status}).`
    );
  }


  const transcript =
    (
      await response.text()
    ).trim();


  if (!transcript) {
    throw new Error(
      "No speech was detected."
    );
  }


  return transcript;
}
