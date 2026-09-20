import {
  Activity,
  CheckCircle2,
  Clock3,
  Gauge,
  Play,
  Radio,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";

import {
  fetchTrainingSessionsFromApi,
} from "../services/trainingStorage";

import {
  getSelectedStudent,
} from "../services/studentStorage";


/* ============================================================
   HELPERS
   ============================================================ */

function round(
  value
) {
  return Math.round(
    Number(value) || 0
  );
}


function clamp(
  value,
  minimum = 0,
  maximum = 100
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}


function percentage(
  value,
  maximum
) {
  if (
    !maximum
  ) {
    return 0;
  }


  return clamp(
    round(
      (
        Number(value || 0) /
        maximum
      ) *
        100
    )
  );
}


/* ============================================================
   AVERAGE
   ============================================================ */

function average(
  values
) {
  const validValues =
    values.filter(
      (
        value
      ) =>
        Number.isFinite(
          value
        )
    );


  if (
    validValues.length ===
    0
  ) {
    return 0;
  }


  return round(
    validValues.reduce(
      (
        total,
        value
      ) =>
        total +
        value,
      0
    ) /
      validValues.length
  );
}


/* ============================================================
   TRAINING DURATION
   ============================================================ */

function getSessionDurationMs(
  session
) {
  if (
    !session?.startedAt
  ) {
    return 0;
  }


  const start =
    new Date(
      session.startedAt
    ).getTime();


  const end =
    new Date(
      session.endedAt ||
        session.updatedAt ||
        session.startedAt
    ).getTime();


  if (
    Number.isNaN(start) ||
    Number.isNaN(end)
  ) {
    return 0;
  }


  return Math.max(
    0,
    end -
      start
  );
}


function formatTrainingTime(
  milliseconds
) {
  const hours =
    milliseconds /
    1000 /
    60 /
    60;


  if (
    hours >= 1
  ) {
    return `${hours.toFixed(1)}h`;
  }


  const minutes =
    Math.round(
      milliseconds /
        1000 /
        60
    );


  return `${minutes}m`;
}


/* ============================================================
   DATE
   ============================================================ */

function formatDate(
  dateValue
) {
  if (
    !dateValue
  ) {
    return "—";
  }


  const date =
    new Date(
      dateValue
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }


  return date.toLocaleDateString(
    undefined,
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  );
}


/* ============================================================
   DASHBOARD
   ============================================================ */

function Dashboard() {
  /* ==========================================================
     CURRENT STUDENT
     ========================================================== */

  const selectedStudent =
    useMemo(
      () =>
        getSelectedStudent(),
      []
    );


  const [
    sessions,
    setSessions,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState(null);


  /* ==========================================================
     LOAD ONLY CURRENT STUDENT'S TRAINING
     ========================================================== */

  const loadDashboard =
    useCallback(
      async () => {
        setLoading(
          true
        );


        setError(
          null
        );


        try {
          if (
            !selectedStudent
              ?.studentId
          ) {
            setSessions(
              []
            );


            setError(
              "No active student account was found."
            );


            return;
          }


          const data =
            await fetchTrainingSessionsFromApi();


          const allSessions =
            Array.isArray(
              data
            )
              ? data
              : [];


          /*
            STRICT STUDENT FILTER

            Do not include training records
            belonging to another student.
          */

          const studentSessions =
            allSessions.filter(
              (
                session
              ) =>
                session
                  ?.metadata
                  ?.studentId ===
                selectedStudent
                  .studentId
            );


          setSessions(
            studentSessions
          );
        } catch (
          loadError
        ) {
          console.error(
            "Could not load dashboard data:",
            loadError
          );


          setError(
            "Your training information could not be loaded."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        selectedStudent,
      ]
    );


  useEffect(
    () => {
      loadDashboard();
    },
    [
      loadDashboard,
    ]
  );


  /* ==========================================================
     COMPLETED SESSIONS

     Only completed sessions count toward averages.
     ========================================================== */

  const completedSessions =
    useMemo(
      () => {
        return sessions
          .filter(
            (
              session
            ) =>
              session.status ===
              "completed"
          )
          .sort(
            (
              a,
              b
            ) =>
              new Date(
                b.endedAt ||
                  b.updatedAt ||
                  b.startedAt ||
                  0
              ).getTime() -
              new Date(
                a.endedAt ||
                  a.updatedAt ||
                  a.startedAt ||
                  0
              ).getTime()
          );
      },
      [
        sessions,
      ]
    );


  /* ==========================================================
     IN-PROGRESS SESSION
     ========================================================== */

  const inProgressSessions =
    useMemo(
      () => {
        return sessions.filter(
          (
            session
          ) =>
            session.status ===
            "in_progress"
        );
      },
      [
        sessions,
      ]
    );


  /* ==========================================================
     OVERALL SCORE
     ========================================================== */

  const overallScore =
    useMemo(
      () => {
        return average(
          completedSessions.map(
            (
              session
            ) =>
              Number(
                session
                  ?.summary
                  ?.overall
              )
          )
        );
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     COMMUNICATION SCORE

     Communications total:
     maximum = 40

     Convert average to percentage.
     ========================================================== */

  const communicationsScore =
    useMemo(
      () => {
        return average(
          completedSessions.map(
            (
              session
            ) =>
              percentage(
                session
                  ?.summary
                  ?.communications
                  ?.total,
                40
              )
          )
        );
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     TRAINING TIME
     ========================================================== */

  const totalTrainingTime =
    useMemo(
      () => {
        const totalMilliseconds =
          completedSessions.reduce(
            (
              total,
              session
            ) =>
              total +
              getSessionDurationMs(
                session
              ),
            0
          );


        return formatTrainingTime(
          totalMilliseconds
        );
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     CATEGORY PERFORMANCE
     ========================================================== */

  const categoryScores =
    useMemo(
      () => {
        if (
          completedSessions.length ===
          0
        ) {
          return [];
        }


        return [
          {
            name:
              "Checklist Accuracy",

            score:
              average(
                completedSessions.map(
                  (
                    session
                  ) =>
                    percentage(
                      session
                        ?.summary
                        ?.checklist
                        ?.accuracy
                        ?.score,
                      30
                    )
                )
              ),
          },

          {
            name:
              "Checklist Sequence",

            score:
              average(
                completedSessions.map(
                  (
                    session
                  ) =>
                    percentage(
                      session
                        ?.summary
                        ?.checklist
                        ?.sequence
                        ?.score,
                      15
                    )
                )
              ),
          },

          {
            name:
              "Checklist Completion",

            score:
              average(
                completedSessions.map(
                  (
                    session
                  ) =>
                    percentage(
                      session
                        ?.summary
                        ?.checklist
                        ?.completion
                        ?.score,
                      10
                    )
                )
              ),
          },

          {
            name:
              "Critical Communication",

            score:
              average(
                completedSessions.map(
                  (
                    session
                  ) =>
                    percentage(
                      session
                        ?.summary
                        ?.communications
                        ?.criticalAccuracy
                        ?.score,
                      20
                    )
                )
              ),
          },

          {
            name:
              "Communication Elements",

            score:
              average(
                completedSessions.map(
                  (
                    session
                  ) =>
                    percentage(
                      session
                        ?.summary
                        ?.communications
                        ?.requiredElements
                        ?.score,
                      12
                    )
                )
              ),
          },

          {
            name:
              "Communication Recovery",

            score:
              average(
                completedSessions.map(
                  (
                    session
                  ) =>
                    percentage(
                      session
                        ?.summary
                        ?.communications
                        ?.recovery
                        ?.score,
                      8
                    )
                )
              ),
          },
        ];
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     LATEST COMPLETED SESSION
     ========================================================== */

  const latestSession =
    completedSessions[
      0
    ] ||
    null;


  /* ==========================================================
     BEST SCORE
     ========================================================== */

  const bestScore =
    useMemo(
      () => {
        if (
          completedSessions.length ===
          0
        ) {
          return null;
        }


        return Math.max(
          ...completedSessions.map(
            (
              session
            ) =>
              Number(
                session
                  ?.summary
                  ?.overall ||
                  0
              )
          )
        );
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     SAFETY REVIEWS
     ========================================================== */

  const safetyReviewCount =
    useMemo(
      () => {
        return completedSessions.filter(
          (
            session
          ) =>
            session
              ?.summary
              ?.safetyStatus ===
            "REVIEW_REQUIRED"
        ).length;
      },
      [
        completedSessions,
      ]
    );


  return (
    <>
      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <PageHeader
        title={`Welcome, ${
          selectedStudent
            ?.name ||
          "Student"
        }`}

        subtitle="Continue your Tecnam P2002JF cockpit familiarization and procedure training."

        rightContent={
          <Link
            to="/controls"

            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Play
              size={17}
            />

            Start Training
          </Link>
        }
      />


      {/* ======================================================
          STUDENT INFORMATION
          ====================================================== */}

      {selectedStudent && (
        <GlassCard className="mb-6">

          <div className="flex flex-wrap items-center justify-between gap-4 p-5">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                Active Student
              </p>


              <p className="mt-1 font-bold text-slate-900">
                {
                  selectedStudent.name
                }
              </p>


              <p className="mt-1 text-xs text-slate-400">
                {
                  selectedStudent.studentNumber
                }

                {" • "}

                {
                  selectedStudent.course
                }

                {" • "}

                {
                  selectedStudent.yearLevel
                }
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                Flight Progress:{" "}
                {
                  selectedStudent.flightProgress
                }
              </span>


              {inProgressSessions.length >
                0 && (
                <span className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  {
                    inProgressSessions.length
                  }{" "}
                  Active Training{" "}
                  {inProgressSessions.length ===
                  1
                    ? "Session"
                    : "Sessions"}
                </span>
              )}

            </div>

          </div>

        </GlassCard>
      )}


      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <GlassCard className="mb-6 border border-red-100 bg-red-50 p-5">

          <p className="text-sm text-red-600">
            {
              error
            }
          </p>

        </GlassCard>
      )}


      {/* ======================================================
          STATISTICS
          ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={
            Gauge
          }

          label="Overall Score"

          value={
            loading
              ? "..."
              : completedSessions.length >
                  0
                ? `${overallScore}%`
                : "—"
          }

          description="Average completed training score"
        />


        <StatCard
          icon={
            CheckCircle2
          }

          label="Completed"

          value={
            loading
              ? "..."
              : String(
                  completedSessions.length
                )
          }

          description="Completed training sessions"

          accent="green"
        />


        <StatCard
          icon={
            Clock3
          }

          label="Training Time"

          value={
            loading
              ? "..."
              : completedSessions.length >
                  0
                ? totalTrainingTime
                : "—"
          }

          description="Total completed training time"

          accent="purple"
        />


        <StatCard
          icon={
            Radio
          }

          label="Comms Score"

          value={
            loading
              ? "..."
              : completedSessions.length >
                  0
                ? `${communicationsScore}%`
                : "—"
          }

          description="Average communication performance"

          accent="orange"
        />

      </div>


      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">

        {/* ====================================================
            TRAINING PERFORMANCE
            ==================================================== */}

        <GlassCard className="p-6 md:p-7">

          <div className="flex items-center justify-between gap-4">

            <div>

              <h2 className="text-xl font-bold">
                Training Performance
              </h2>


              <p className="mt-1 text-sm text-slate-500">
                Your average score by training category.
              </p>

            </div>


            <button
              type="button"

              onClick={
                loadDashboard
              }

              disabled={
                loading
              }

              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
            >

              <RefreshCw
                size={14}

                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>


          {/* NO DATA */}

          {!loading &&
            categoryScores.length ===
              0 && (
              <div className="mt-7 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

                <Activity
                  size={30}
                  className="mx-auto text-slate-300"
                />


                <p className="mt-3 font-semibold text-slate-600">
                  No completed training yet
                </p>


                <p className="mt-1 text-sm text-slate-400">
                  Complete your first graded session to generate performance data.
                </p>

              </div>
            )}


          {/* CATEGORY SCORES */}

          {categoryScores.length >
            0 && (
            <div className="mt-7 space-y-5">

              {categoryScores.map(
                (
                  category
                ) => (

                  <div
                    key={
                      category.name
                    }
                  >

                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">

                      <span className="font-medium text-slate-700">
                        {
                          category.name
                        }
                      </span>


                      <span className="font-bold text-blue-600">
                        {
                          category.score
                        }
                        %
                      </span>

                    </div>


                    <div className="h-2.5 overflow-hidden rounded-full bg-blue-100">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500"

                        style={{
                          width:
                            `${category.score}%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>
          )}

        </GlassCard>


        {/* ====================================================
            QUICK START / LATEST TRAINING
            ==================================================== */}

        <GlassCard className="overflow-hidden">

          <div
            className="min-h-56 bg-cover bg-center p-7 text-white"

            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(8,35,63,.92), rgba(37,99,235,.55)), url('/images/tecnam-cockpit.jpg')",
            }}
          >

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
              Quick Start
            </p>


            {latestSession ? (
              <>
                <h2 className="mt-3 max-w-sm text-2xl font-bold">
                  Ready for Your Next Training
                </h2>


                <p className="mt-3 max-w-sm text-sm leading-6 text-blue-100">
                  Your latest completed session scored{" "}
                  <strong>
                    {
                      latestSession
                        ?.summary
                        ?.overall ??
                      0
                    }
                    /100
                  </strong>
                  {" "}
                  on{" "}
                  {
                    formatDate(
                      latestSession.endedAt ||
                        latestSession.updatedAt
                    )
                  }.
                </p>


                <div className="mt-5 flex flex-wrap gap-2">

                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs">
                    Best:{" "}
                    {
                      bestScore
                    }
                    /100
                  </span>


                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs">
                    Average:{" "}
                    {
                      overallScore
                    }
                    /100
                  </span>

                </div>
              </>
            ) : (
              <>
                <h2 className="mt-3 max-w-sm text-2xl font-bold">
                  Begin Your First Training
                </h2>


                <p className="mt-3 max-w-sm text-sm leading-6 text-blue-100">
                  Start a Tecnam P2002JF checklist walkthrough to create your first training record.
                </p>
              </>
            )}


            <Link
              to="/checklists"

              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700"
            >
              <Play
                size={17}
              />

              {inProgressSessions.length >
              0
                ? "Continue Training"
                : "Start Training"}
            </Link>

          </div>

        </GlassCard>

      </div>


      {/* ======================================================
          STUDENT SUMMARY
          ====================================================== */}

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        <GlassCard className="p-5">

          <div className="flex items-center gap-2">

            <TrendingUp
              size={17}
              className="text-blue-600"
            />


            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Best Score
            </p>

          </div>


          <p className="mt-3 text-2xl font-black text-blue-600">
            {bestScore !==
            null
              ? `${bestScore}/100`
              : "—"}
          </p>

        </GlassCard>


        <GlassCard className="p-5">

          <div className="flex items-center gap-2">

            <ShieldAlert
              size={17}

              className={
                safetyReviewCount >
                0
                  ? "text-amber-600"
                  : "text-emerald-600"
              }
            />


            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Safety Reviews
            </p>

          </div>


          <p
            className={`
              mt-3
              text-2xl
              font-black

              ${
                safetyReviewCount >
                0
                  ? "text-amber-600"
                  : "text-emerald-600"
              }
            `}
          >
            {
              safetyReviewCount
            }
          </p>


          <p className="mt-1 text-xs text-slate-400">
            Completed sessions marked for instructor review
          </p>

        </GlassCard>


        <GlassCard className="p-5">

          <div className="flex items-center gap-2">

            <Activity
              size={17}
              className="text-blue-600"
            />


            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Flight Progress
            </p>

          </div>


          <p className="mt-3 text-lg font-black text-slate-900">
            {selectedStudent
              ?.flightProgress ||
              "—"}
          </p>

        </GlassCard>

      </div>


      {/* ======================================================
          SIMULATOR READINESS
          ====================================================== */}

      <GlassCard className="mt-6 p-6">

        <h2 className="text-xl font-bold">
          Simulator Readiness
        </h2>


        <p className="mt-1 text-sm text-slate-500">
          Current system modules used by the cockpit trainer.
        </p>


        <div className="mt-5 grid gap-3 md:grid-cols-4">

          {[
            [
              "Touchscreen",
              "Ready",
            ],

            [
              "Cockpit Controls",
              "UI / GPIO Ready",
            ],

            [
              "Headset / Mic",
              "Speech Input Ready",
            ],

            [
              "Training Records",
              "SQLite Connected",
            ],
          ].map(
            (
              [
                name,
                status,
              ]
            ) => (

              <div
                key={
                  name
                }

                className="rounded-2xl border border-slate-100 bg-white/70 p-4"
              >

                <div className="mb-2 h-2 w-2 rounded-full bg-emerald-500" />


                <p className="text-sm font-semibold">
                  {
                    name
                  }
                </p>


                <p className="mt-1 text-xs text-slate-400">
                  {
                    status
                  }
                </p>

              </div>

            )
          )}

        </div>

      </GlassCard>
    </>
  );
}


export default Dashboard;