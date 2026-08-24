/* ============================================================
   TRAINING SESSION STORAGE

   STORAGE STRATEGY:

   1. Browser localStorage
      - always available during normal localhost development
      - works even if FastAPI is stopped

   2. FastAPI + SQLite
      - permanent local database
      - same setup can later run directly on Raspberry Pi

   ============================================================ */

const STORAGE_KEY =
  "tecnam_training_sessions_v1";


/* ============================================================
   TRAINING API URL

   Windows localhost:

   http://127.0.0.1:8000

   Raspberry Pi later:

   Same URL can be used when React and FastAPI both run on Pi.
   ============================================================ */

const configuredApiUrl =
  import.meta.env
    .VITE_TRAINING_API_URL;


export const TRAINING_API_URL =
  configuredApiUrl ===
  "off"
    ? ""
    : configuredApiUrl ||
      "http://127.0.0.1:8000";


/* ============================================================
   CHECK LOCAL STORAGE AVAILABILITY
   ============================================================ */

function canUseLocalStorage() {
  return (
    typeof window !==
      "undefined" &&
    Boolean(
      window.localStorage
    )
  );
}


/* ============================================================
   LOAD ALL LOCAL SESSIONS
   ============================================================ */

export function loadLocalSessions() {
  if (
    !canUseLocalStorage()
  ) {
    return [];
  }


  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );


    const parsed =
      raw
        ? JSON.parse(
            raw
          )
        : [];


    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch (
    error
  ) {
    console.warn(
      "Could not read training sessions from localStorage.",
      error
    );


    return [];
  }
}


/* ============================================================
   LOAD LATEST LOCAL SESSION
   ============================================================ */

export function loadLatestLocalSession() {
  return (
    [
      ...loadLocalSessions(),
    ].sort(
      (
        a,
        b
      ) =>
        new Date(
          b.updatedAt ||
            0
        ).getTime() -
        new Date(
          a.updatedAt ||
            0
        ).getTime()
    )[0] ||
    null
  );
}


/* ============================================================
   SAVE TO LOCAL STORAGE
   ============================================================ */

function saveToLocalStorage(
  sessionWithSummary
) {
  if (
    !canUseLocalStorage()
  ) {
    return;
  }


  try {
    const sessions =
      loadLocalSessions();


    const index =
      sessions.findIndex(
        (session) =>
          session.id ===
          sessionWithSummary.id
      );


    /*
      Update existing session
    */

    if (
      index >= 0
    ) {
      sessions[index] =
        sessionWithSummary;
    }

    /*
      Add new session
    */

    else {
      sessions.push(
        sessionWithSummary
      );
    }


    /*
      Keep latest 100 sessions in browser storage.

      SQLite will be the long-term history database.
    */

    const trimmed =
      sessions
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              b.updatedAt ||
                0
            ).getTime() -
            new Date(
              a.updatedAt ||
                0
            ).getTime()
        )
        .slice(
          0,
          100
        );


    window.localStorage.setItem(
      STORAGE_KEY,

      JSON.stringify(
        trimmed
      )
    );
  } catch (
    error
  ) {
    console.warn(
      "Could not save training session to localStorage.",
      error
    );
  }
}


/* ============================================================
   SAVE TO FASTAPI / SQLITE

   Failure here must NOT stop the simulator.

   For example:

   FastAPI isn't running
        ↓

   localStorage still works
        ↓

   training can continue
   ============================================================ */

async function saveToApi(
  sessionWithSummary
) {
  if (
    !TRAINING_API_URL
  ) {
    return false;
  }


  try {
    const response =
      await fetch(
        `${TRAINING_API_URL}/api/training/sessions`,

        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              sessionWithSummary
            ),
        }
      );


    if (
      !response.ok
    ) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }


    return true;
  } catch (
    error
  ) {
    /*
      Do not show a scary browser error to the student.

      The data is already stored in localStorage.
    */

    console.debug(
      "Training API unavailable; session kept locally.",

      error?.message ||
        error
    );


    return false;
  }
}


/* ============================================================
   PERSIST SESSION

   Used by the training assessment service.
   ============================================================ */

export async function persistTrainingSession(
  session,
  summary
) {
  if (
    !session
  ) {
    return;
  }


  const payload = {
    ...session,

    summary,
  };


  /*
    Always save locally first.
  */

  saveToLocalStorage(
    payload
  );


  /*
    Then attempt database persistence.
  */

  await saveToApi(
    payload
  );
}


/* ============================================================
   LOAD SESSIONS FROM API

   Useful later for:
   - history page
   - performance page
   - instructor reports

   Falls back to localStorage if API is unavailable.
   ============================================================ */

export async function fetchTrainingSessionsFromApi() {
  if (
    !TRAINING_API_URL
  ) {
    return loadLocalSessions();
  }


  try {
    const response =
      await fetch(
        `${TRAINING_API_URL}/api/training/sessions`
      );


    if (
      !response.ok
    ) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }


    return await response.json();
  } catch {
    return loadLocalSessions();
  }
}