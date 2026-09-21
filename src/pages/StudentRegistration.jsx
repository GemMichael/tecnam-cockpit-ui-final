import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Plane,
  User,
  UserPlus,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  registerStudent,
} from "../services/studentStorage";

import TouchKeyboard from "../components/TouchKeyboard";


const EMPTY_FORM = {
  name: "",
  course: "",
  yearLevel: "",
  flightProgress: "",
  username: "",
  pin: "",
  confirmPin: "",
};


function StudentRegistration() {
  const navigate =
    useNavigate();


  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    registered,
    setRegistered,
  ] = useState(null);


  const [
    showPin,
    setShowPin,
  ] = useState(false);


  const [
    showConfirmPin,
    setShowConfirmPin,
  ] = useState(false);


  /* ==========================================================
     TOUCHSCREEN KEYBOARD
     ========================================================== */

  const [
    activeKeyboardField,
    setActiveKeyboardField,
  ] = useState(null);


  function openTouchKeyboard(
    fieldName,
    event
  ) {
    const target =
      event?.currentTarget;

    setActiveKeyboardField(
      fieldName
    );

    window.setTimeout(
      () => {
        target
          ?.scrollIntoView?.({
            behavior:
              "smooth",

            block:
              "center",
          });
      },
      80
    );
  }

  function closeTouchKeyboard() {
    setActiveKeyboardField(
      null
    );


    if (
      document.activeElement instanceof
      HTMLElement
    ) {
      document.activeElement.blur();
    }
  }


  /* ==========================================================
     FORM VALUE NORMALIZATION
     ========================================================== */

  function normalizeFieldValue(
    name,
    value
  ) {
    let nextValue =
      value;


    /*
      PIN must only contain digits
      and is limited to 6 characters.
    */

    if (
      name === "pin" ||
      name === "confirmPin"
    ) {
      nextValue =
        value
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            6
          );
    }


    /*
      Username:
      spaces automatically removed.
    */

    if (
      name === "username"
    ) {
      nextValue =
        value
          .replace(
            /\s/g,
            ""
          );
    }


    return nextValue;
  }


  function updateFieldValue(
    name,
    value
  ) {
    const nextValue =
      normalizeFieldValue(
        name,
        value
      );


    setForm(
      (
        previous
      ) => ({
        ...previous,

        [name]:
          nextValue,
      })
    );


    setError("");
  }


  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;


    updateFieldValue(
      name,
      value
    );
  }


  /* ==========================================================
     REGISTRATION
     ========================================================== */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    setError("");


    if (
      !form.name.trim() ||
      !form.course.trim() ||
      !form.yearLevel.trim() ||
      !form.flightProgress.trim() ||
      !form.username.trim() ||
      !form.pin ||
      !form.confirmPin
    ) {
      setError(
        "Please complete all registration fields."
      );


      return;
    }


    if (
      form.username.length <
      3
    ) {
      setError(
        "Username must contain at least 3 characters."
      );


      return;
    }


    if (
      !/^[A-Za-z0-9_]+$/.test(
        form.username
      )
    ) {
      setError(
        "Username may only contain letters, numbers, and underscores."
      );


      return;
    }


    if (
      form.pin.length !==
      6
    ) {
      setError(
        "PIN must contain exactly 6 digits."
      );


      return;
    }


    if (
      form.pin !==
      form.confirmPin
    ) {
      setError(
        "PIN and Confirm PIN do not match."
      );


      return;
    }


    setLoading(
      true
    );


    try {
      const result =
        await registerStudent({
          name:
            form.name.trim(),

          course:
            form.course.trim(),

          yearLevel:
            form.yearLevel.trim(),

          flightProgress:
            form.flightProgress.trim(),

          username:
            form.username.trim(),

          pin:
            form.pin,
        });


      setRegistered({
        username:
          result.username,

        ...result.student,
      });


      setForm(
        EMPTY_FORM
      );
    } catch (
      registrationError
    ) {
      setError(
        registrationError.message ||
          "Registration failed."
      );
    } finally {
      setLoading(
        false
      );
    }
  }


  /* ==========================================================
     SUCCESS SCREEN
     ========================================================== */

  if (
    registered
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eaf4ff] p-6">

        <div className="w-full max-w-lg rounded-[32px] border border-white/60 bg-white p-8 shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

            <CheckCircle2
              size={30}
            />

          </div>


          <div className="mt-5 text-center">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              Registration Complete
            </p>


            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Welcome,{" "}
              {
                registered.name
              }
            </h1>


            <p className="mt-2 text-sm text-slate-500">
              Your student account has been created successfully.
            </p>

          </div>


          <div className="mt-7 space-y-3 rounded-2xl bg-slate-50 p-5">

            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-400">
                Student ID
              </span>

              <strong className="text-sm text-blue-600">
                {
                  registered.studentNumber
                }
              </strong>

            </div>


            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-400">
                Username
              </span>

              <strong className="text-sm text-slate-700">
                {
                  registered.username
                }
              </strong>

            </div>


            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-400">
                Course
              </span>

              <strong className="text-right text-sm text-slate-700">
                {
                  registered.course
                }
              </strong>

            </div>


            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-400">
                Year Level
              </span>

              <strong className="text-sm text-slate-700">
                {
                  registered.yearLevel
                }
              </strong>

            </div>


            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-400">
                Flight Progress
              </span>

              <strong className="text-sm text-slate-700">
                {
                  registered.flightProgress
                }
              </strong>

            </div>

          </div>


          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">

            <p className="text-xs leading-5 text-amber-700">
              Remember your username, Student ID, and 6-digit PIN. Your PIN is not displayed or stored in plain text.
            </p>

          </div>


          <button
            type="button"

            onClick={() =>
              navigate(
                "/"
              )
            }

            className="mt-6 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            Proceed to Login
          </button>

        </div>

      </div>
    );
  }


  /* ==========================================================
     REGISTRATION FORM
     ========================================================== */

  return (
    <div
      className="min-h-screen bg-[#eaf4ff] px-6 py-10"

      style={
        activeKeyboardField
          ? {
              paddingBottom:
                "380px",
            }
          : undefined
      }
    >

      <div className="mx-auto max-w-3xl">

        <button
          type="button"

          onClick={() =>
            navigate(
              "/"
            )
          }

          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft
            size={17}
          />

          Back to Login
        </button>


        <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-xl">

          {/* HEADER */}

          <div className="bg-[#08233f] p-7 text-white">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-white/10 p-3">

                <UserPlus
                  size={25}
                />

              </div>


              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                  Tecnam P2002JF Trainer
                </p>


                <h1 className="mt-1 text-2xl font-bold">
                  Student Registration
                </h1>

              </div>

            </div>


            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100/80">
              Create your student profile and login credentials before beginning cockpit training.
            </p>

          </div>


          <form
            onSubmit={
              handleSubmit
            }

            className="space-y-6 p-7 md:p-9"
          >

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* ==================================================
                STUDENT INFORMATION
                ================================================== */}

            <div>

              <div className="mb-5 flex items-center gap-2">

                <GraduationCap
                  size={18}
                  className="text-blue-600"
                />


                <h2 className="font-bold text-slate-900">
                  Student Information
                </h2>

              </div>


              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Name of the Student
                  </label>


                  <input
                    type="text"
                    name="name"

                    value={
                      form.name
                    }

                    onFocus={(event) =>
                      openTouchKeyboard(
                        "name",
                        event
                      )
                    }

                    onClick={(event) =>
                      openTouchKeyboard(
                        "name",
                        event
                      )
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Enter complete name"

                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>


                {/* COURSE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Course
                  </label>


                  <input
                    type="text"
                    name="course"

                    value={
                      form.course
                    }

                    onFocus={(event) =>
                      openTouchKeyboard(
                        "course",
                        event
                      )
                    }

                    onClick={(event) =>
                      openTouchKeyboard(
                        "course",
                        event
                      )
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Enter course"

                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>


                {/* YEAR LEVEL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Year Level
                  </label>


                  <input
                    type="text"
                    name="yearLevel"

                    value={
                      form.yearLevel
                    }

                    onFocus={(event) =>
                      openTouchKeyboard(
                        "yearLevel",
                        event
                      )
                    }

                    onClick={(event) =>
                      openTouchKeyboard(
                        "yearLevel",
                        event
                      )
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Example: 3rd Year"

                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>


                {/* FLIGHT PROGRESS */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Flight Progress
                  </label>


                  <div className="relative">

                    <Plane
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />


                    <input
                      type="text"
                      name="flightProgress"

                      value={
                        form.flightProgress
                      }

                      onFocus={(event) =>
                        openTouchKeyboard(
                          "flightProgress",
                          event
                        )
                      }

                      onClick={(event) =>
                        openTouchKeyboard(
                          "flightProgress",
                          event
                        )
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="Enter current flight progress"

                      className="w-full rounded-2xl border border-slate-200 py-3.5 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

              </div>

            </div>


            <div className="h-px bg-slate-100" />


            {/* ==================================================
                ACCOUNT INFORMATION
                ================================================== */}

            <div>

              <div className="mb-5 flex items-center gap-2">

                <User
                  size={18}
                  className="text-blue-600"
                />


                <h2 className="font-bold text-slate-900">
                  Login Information
                </h2>

              </div>


              {/* USERNAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </label>


                <input
                  type="text"
                  name="username"

                  value={
                    form.username
                  }

                  onFocus={(event) =>
                    openTouchKeyboard(
                      "username",
                      event
                    )
                  }

                  onClick={(event) =>
                    openTouchKeyboard(
                      "username",
                      event
                    )
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Example: juan_delacruz"

                  autoComplete="username"

                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />


                <p className="mt-2 text-xs text-slate-400">
                  3–30 characters. Letters, numbers, and underscores only.
                </p>

              </div>


              {/* PIN */}

              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    6-Digit PIN
                  </label>


                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />


                    <input
                      type={
                        showPin
                          ? "text"
                          : "password"
                      }

                      inputMode="numeric"

                      name="pin"

                      value={
                        form.pin
                      }

                      onFocus={(event) =>
                        openTouchKeyboard(
                          "pin",
                          event
                        )
                      }

                      onClick={(event) =>
                        openTouchKeyboard(
                          "pin",
                          event
                        )
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="••••••"

                      autoComplete="new-password"

                      className="w-full rounded-2xl border border-slate-200 py-3.5 pl-12 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />


                    <button
                      type="button"

                      onClick={() =>
                        setShowPin(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }

                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPin ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </div>


                {/* CONFIRM PIN */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm PIN
                  </label>


                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />


                    <input
                      type={
                        showConfirmPin
                          ? "text"
                          : "password"
                      }

                      inputMode="numeric"

                      name="confirmPin"

                      value={
                        form.confirmPin
                      }

                      onFocus={(event) =>
                        openTouchKeyboard(
                          "confirmPin",
                          event
                        )
                      }

                      onClick={(event) =>
                        openTouchKeyboard(
                          "confirmPin",
                          event
                        )
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="••••••"

                      autoComplete="new-password"

                      className="w-full rounded-2xl border border-slate-200 py-3.5 pl-12 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />


                    <button
                      type="button"

                      onClick={() =>
                        setShowConfirmPin(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }

                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showConfirmPin ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </div>

              </div>

            </div>


            {/* REGISTER */}

            <button
              type="submit"

              disabled={
                loading
              }

              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus
                size={18}
              />

              {loading
                ? "Creating Account..."
                : "Register Student"}
            </button>

          </form>

        </div>

      </div>


      {/* ========================================================
          TOUCHSCREEN KEYBOARD
          ======================================================== */}

      <TouchKeyboard
        open={
          Boolean(
            activeKeyboardField
          )
        }

        mode={
          activeKeyboardField ===
            "pin" ||
          activeKeyboardField ===
            "confirmPin"
            ? "numeric"
            : "text"
        }

        value={
          activeKeyboardField
            ? form[
                activeKeyboardField
              ] || ""
            : ""
        }

        maxLength={
          activeKeyboardField ===
            "pin" ||
          activeKeyboardField ===
            "confirmPin"
            ? 6
            : undefined
        }

        masked={
          (
            activeKeyboardField ===
              "pin" &&
            !showPin
          ) ||
          (
            activeKeyboardField ===
              "confirmPin" &&
            !showConfirmPin
          )
        }

        title={
          activeKeyboardField ===
          "confirmPin"
            ? "Confirm PIN"

            : activeKeyboardField ===
                "pin"
              ? "6-Digit PIN"

              : activeKeyboardField ===
                  "flightProgress"
                ? "Flight Progress"

                : activeKeyboardField ===
                    "yearLevel"
                  ? "Year Level"

                  : activeKeyboardField ===
                      "course"
                    ? "Course"

                    : activeKeyboardField ===
                        "username"
                      ? "Username"

                      : "Student Name"
        }

        onChange={(
          value
        ) => {
          if (
            activeKeyboardField
          ) {
            updateFieldValue(
              activeKeyboardField,
              value
            );
          }
        }}

        onDone={
          closeTouchKeyboard
        }
      />

    </div>
  );
}


export default StudentRegistration;