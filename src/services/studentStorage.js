import {
  TRAINING_API_URL,
} from "./trainingStorage";


const SELECTED_STUDENT_KEY =
  "tecnam_selected_student_v1";


/* ============================================================
   SELECTED STUDENT
   ============================================================ */

export function getSelectedStudent() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }


  try {
    const raw =
      window.localStorage.getItem(
        SELECTED_STUDENT_KEY
      );


    return raw
      ? JSON.parse(
          raw
        )
      : null;
  } catch (
    error
  ) {
    console.warn(
      "Could not read selected student.",
      error
    );


    return null;
  }
}


/* ============================================================
   SET SELECTED STUDENT
   ============================================================ */

export function setSelectedStudent(
  student
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }


  if (
    !student
  ) {
    window.localStorage.removeItem(
      SELECTED_STUDENT_KEY
    );

    return;
  }


  window.localStorage.setItem(
    SELECTED_STUDENT_KEY,

    JSON.stringify(
      student
    )
  );
}


/* ============================================================
   CLEAR SELECTED STUDENT
   ============================================================ */

export function clearSelectedStudent() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }


  window.localStorage.removeItem(
    SELECTED_STUDENT_KEY
  );
}


/* ============================================================
   REGISTER STUDENT
   ============================================================ */

export async function registerStudent(
  formData
) {
  const response =
    await fetch(
      `${TRAINING_API_URL}/api/students`,

      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            formData
          ),
      }
    );


  let data = null;


  try {
    data =
      await response.json();
  } catch {
    data = null;
  }


  if (
    !response.ok
  ) {
    throw new Error(
      data?.detail ||
        "Student registration failed."
    );
  }


  return data;
}


/* ============================================================
   LOGIN
   ============================================================ */

export async function loginStudent({
  identifier,
  pin,
}) {
  const response =
    await fetch(
      `${TRAINING_API_URL}/api/auth/login`,

      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            identifier,
            pin,
          }),
      }
    );


  let data = null;


  try {
    data =
      await response.json();
  } catch {
    data = null;
  }


  if (
    !response.ok
  ) {
    throw new Error(
      data?.detail ||
        "Login failed."
    );
  }


  return data;
}


/* ============================================================
   GET STUDENTS
   ============================================================ */

export async function fetchStudents() {
  const response =
    await fetch(
      `${TRAINING_API_URL}/api/students`
    );


  if (
    !response.ok
  ) {
    throw new Error(
      "Could not load students."
    );
  }


  return response.json();
}


/* ============================================================
   FLIGHT RECORDS
   ============================================================ */

export async function fetchStudentFlightRecords(
  studentId
) {
  const response =
    await fetch(
      `${TRAINING_API_URL}/api/students/${studentId}/flight-records`
    );


  if (
    !response.ok
  ) {
    throw new Error(
      "Could not load flight records."
    );
  }


  return response.json();
}


/* ============================================================
   ADD FLIGHT PROGRESS
   ============================================================ */

export async function addStudentFlightProgress(
  studentId,
  {
    progress,
    remarks = null,
  }
) {
  const response =
    await fetch(
      `${TRAINING_API_URL}/api/students/${studentId}/flight-records`,

      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            progress,
            remarks,
          }),
      }
    );


  const data =
    await response.json();


  if (
    !response.ok
  ) {
    throw new Error(
      data?.detail ||
        "Could not update flight progress."
    );
  }


  return data;
}