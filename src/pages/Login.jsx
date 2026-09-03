import {
  AlertCircle,
  Eye,
  EyeOff,
  LockKeyhole,
  Plane,
  User,
  UserPlus,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  getSelectedStudent,
  loginStudent,
  setSelectedStudent,
} from "../services/studentStorage";

import {
  startNewTrainingSession,
} from "../services/trainingAssessment";


function Login() {
  const navigate =
    useNavigate();


  const [
    identifier,
    setIdentifier,
  ] = useState("");


  const [
    pin,
    setPin,
  ] = useState("");


  const [
    showPin,
    setShowPin,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* ==========================================================
     EXISTING LOGIN
     ========================================================== */

  useEffect(
    () => {
      try {
        const storedUser =
          localStorage.getItem(
            "tecnamUser"
          );


        const selectedStudent =
          getSelectedStudent();


        if (
          storedUser &&
          selectedStudent?.studentId
        ) {
          navigate(
            "/dashboard",
            {
              replace:
                true,
            }
          );


          return;
        }


        if (
          storedUser &&
          !selectedStudent
        ) {
          localStorage.removeItem(
            "tecnamUser"
          );
        }
      } catch (
        loginError
      ) {
        console.warn(
          loginError
        );


        localStorage.removeItem(
          "tecnamUser"
        );
      }
    },
    [
      navigate,
    ]
  );


  /* ==========================================================
     LOGIN
     ========================================================== */

  async function login(
    event
  ) {
    event.preventDefault();


    setError("");


    const cleanIdentifier =
      identifier.trim();


    if (
      !cleanIdentifier
    ) {
      setError(
        "Please enter your username or Student ID."
      );

      return;
    }


    if (
      pin.length !==
      6
    ) {
      setError(
        "Please enter your 6-digit PIN."
      );

      return;
    }


    setLoading(
      true
    );


    try {
      const result =
        await loginStudent({
          identifier:
            cleanIdentifier,

          pin,
        });


      const student =
        result.student;


      const user =
        result.user;


      /* ======================================================
         ACTIVE STUDENT
         ====================================================== */

      setSelectedStudent(
        student
      );


      /* ======================================================
         LOGIN SESSION

         PIN is NEVER saved here.
         ====================================================== */

      localStorage.setItem(
        "tecnamUser",

        JSON.stringify({
          userId:
            user.userId,

          username:
            user.username,

          role:
            user.role,

          studentId:
            student.studentId,

          studentNumber:
            student.studentNumber,

          name:
            student.name,
        })
      );


      /* ======================================================
         NEW TRAINING SESSION
         ====================================================== */

      startNewTrainingSession({
        studentId:
          student.studentId,

        studentNumber:
          student.studentNumber,

        studentName:
          student.name,

        username:
          user.username,

        course:
          student.course,

        yearLevel:
          student.yearLevel,

        flightProgress:
          student.flightProgress,
      });


      navigate(
        "/dashboard",
        {
          replace:
            true,
        }
      );
    } catch (
      loginError
    ) {
      setError(
        loginError.message ||
          "Login failed."
      );
    } finally {
      setLoading(
        false
      );
    }
  }


  function handlePinChange(
    event
  ) {
    const value =
      event.target.value
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          6
        );


    setPin(
      value
    );


    setError("");
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eaf4ff]">

      <div className="aviation-grid absolute inset-0" />


      <div className="relative grid min-h-screen lg:grid-cols-[1.15fr_.85fr]">

        {/* LEFT */}

        <section
          className="relative hidden overflow-hidden bg-[#08233f] lg:flex"

          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(8,35,63,.92), rgba(22,97,190,.45)), url('/images/tecnam-hero.jpg')",

            backgroundPosition:
              "center",

            backgroundSize:
              "cover",
          }}
        >

          <div className="flex w-full flex-col justify-between p-14 text-white">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl">
                <Plane
                  size={30}
                />
              </div>


              <div>

                <p className="text-sm font-semibold tracking-[0.28em]">
                  TECNAM
                </p>


                <p className="text-3xl font-black italic">
                  P2002 JF
                </p>

              </div>

            </div>


            <div className="max-w-xl">

              <p className="mb-4 text-sm uppercase tracking-[0.35em] text-blue-200">
                Interactive Cockpit Trainer
              </p>


              <h1 className="text-5xl font-bold leading-tight">
                Learn the cockpit.
                <br />

                Practice the procedure.
                <br />

                Build confidence.
              </h1>


              <p className="mt-6 max-w-lg text-base leading-7 text-blue-100/80">
                A modern touchscreen walkthrough
                environment for Tecnam P2002JF cockpit
                familiarization and checklist training.
              </p>

            </div>


            <div>

              <p className="font-semibold">
                WCC Aeronautical & Technological College
              </p>


              <p className="text-sm text-slate-300">
                Binalonan, Pangasinan
              </p>

            </div>

          </div>

        </section>


        {/* RIGHT */}

        <section className="flex items-center justify-center p-6 md:p-12">

          <div className="w-full max-w-lg">

            <div className="mb-9 lg:hidden">

              <div className="flex items-center gap-3">

                <div className="rounded-2xl bg-blue-600 p-3 text-white">
                  <Plane />
                </div>


                <div>

                  <p className="font-black italic">
                    TECNAM P2002 JF
                  </p>


                  <p className="text-xs text-slate-500">
                    Interactive Cockpit Trainer
                  </p>

                </div>

              </div>

            </div>


            <div className="glass-card rounded-[32px] p-7 md:p-10">

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Welcome aboard
              </p>


              <h2 className="mt-3 text-4xl font-bold tracking-tight">
                Student Login
              </h2>


              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in using your username or Student ID and your 6-digit PIN.
              </p>


              {/* ERROR */}

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />


                  <p className="text-sm leading-5 text-red-700">
                    {error}
                  </p>

                </div>
              )}


              <form
                onSubmit={
                  login
                }

                className="mt-8 space-y-5"
              >

                {/* USERNAME / STUDENT ID */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Username / Student ID
                  </label>


                  <div className="relative">

                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />


                    <input
                      value={
                        identifier
                      }

                      onChange={(
                        event
                      ) => {
                        setIdentifier(
                          event.target.value
                        );

                        setError("");
                      }}

                      placeholder="Username or WCC-0001"

                      autoComplete="username"

                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-4 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>


                {/* PIN */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    6-Digit PIN
                  </label>


                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />


                    <input
                      type={
                        showPin
                          ? "text"
                          : "password"
                      }

                      inputMode="numeric"

                      value={
                        pin
                      }

                      onChange={
                        handlePinChange
                      }

                      placeholder="••••••"

                      autoComplete="current-password"

                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-4 pl-12 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                          size={19}
                        />
                      ) : (
                        <Eye
                          size={19}
                        />
                      )}
                    </button>

                  </div>

                </div>


                <button
                  type="submit"

                  disabled={
                    loading
                  }

                  className="w-full rounded-2xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing In..."
                    : "Login"}
                </button>

              </form>


              <div className="my-6 flex items-center gap-4">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  NEW STUDENT?
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>


              <button
                type="button"

                onClick={() =>
                  navigate(
                    "/register"
                  )
                }

                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                <UserPlus
                  size={18}
                />

                Register New Student
              </button>


              <p className="mt-6 text-center text-xs text-slate-400">
                Only registered students with a valid PIN can access the cockpit training system.
              </p>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}


export default Login;