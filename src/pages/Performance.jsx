import {
  Activity,
  Award,
  CheckCircle2,
  Gauge,
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

function clamp(
  value,
  min = 0,
  max = 100
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}


function round(
  value
) {
  return Math.round(
    Number(value) || 0
  );
}


function percentage(
  score,
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
        Number(score || 0) /
        maximum
      ) *
        100
    )
  );
}


/* ============================================================
   RATING

   Same interpretation used by the grading system.
   ============================================================ */

function getRating(
  score
) {
  if (
    score >= 90
  ) {
    return "Excellent";
  }


  if (
    score >= 80
  ) {
    return "Proficient";
  }


  if (
    score >= 70
  ) {
    return "Developing";
  }


  return "Needs Improvement";
}


/* ============================================================
   CATEGORY AVERAGE
   ============================================================ */

function averageCategory(
  sessions,
  getter
) {
  if (
    sessions.length ===
    0
  ) {
    return 0;
  }


  const values =
    sessions
      .map(
        getter
      )
      .filter(
        (
          value
        ) =>
          Number.isFinite(
            value
          )
      );


  if (
    values.length ===
    0
  ) {
    return 0;
  }


  return round(
    values.reduce(
      (
        total,
        value
      ) =>
        total +
        value,
      0
    ) /
      values.length
  );
}


/* ============================================================
   PERFORMANCE PAGE
   ============================================================ */

function Performance() {
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
     LOAD STUDENT PERFORMANCE

     Only sessions with the logged-in student's studentId
     are accepted.
     ========================================================== */

  const loadPerformance =
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


          /* ================================================
             STRICT STUDENT FILTER
             ================================================ */

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
            "Could not load performance:",
            loadError
          );


          setError(
            "Your training performance could not be loaded."
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
      loadPerformance();
    },
    [
      loadPerformance,
    ]
  );


  /* ==========================================================
     COMPLETED SESSIONS

     In-progress sessions are not used for averages because
     their scores are still changing.
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
     OVERALL AVERAGE
     ========================================================== */

  const overallScore =
    useMemo(
      () => {
        return averageCategory(
          completedSessions,
          (
            session
          ) =>
            Number(
              session
                ?.summary
                ?.overall
            )
        );
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     PROCEDURE ACCURACY

     Checklist Accuracy has a maximum of 30 points.

     Convert it to percentage.
     ========================================================== */

  const procedureAccuracy =
    useMemo(
      () => {
        return averageCategory(
          completedSessions,
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
        );
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     CATEGORY PERFORMANCE

     Each score is normalized to 0–100%.
     ========================================================== */

  const categoryScores =
    useMemo(
      () => {
        return [
          {
            id:
              "checklist-accuracy",

            name:
              "Checklist Accuracy",

            score:
              averageCategory(
                completedSessions,
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
              ),
          },

          {
            id:
              "checklist-sequence",

            name:
              "Checklist Sequence",

            score:
              averageCategory(
                completedSessions,
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
              ),
          },

          {
            id:
              "checklist-completion",

            name:
              "Checklist Completion",

            score:
              averageCategory(
                completedSessions,
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
              ),
          },

          {
            id:
              "checklist-recovery",

            name:
              "Checklist Recovery",

            score:
              averageCategory(
                completedSessions,
                (
                  session
                ) =>
                  percentage(
                    session
                      ?.summary
                      ?.checklist
                      ?.recovery
                      ?.score,
                    5
                  )
              ),
          },

          {
            id:
              "critical-communication",

            name:
              "Critical Communication Accuracy",

            score:
              averageCategory(
                completedSessions,
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
              ),
          },

          {
            id:
              "required-elements",

            name:
              "Communication Required Elements",

            score:
              averageCategory(
                completedSessions,
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
              ),
          },

          {
            id:
              "communication-recovery",

            name:
              "Communication Recovery",

            score:
              averageCategory(
                completedSessions,
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
              ),
          },
        ];
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     RECENT SEVEN SCORES

     completedSessions is newest first.

     Reverse the selected seven so the chart displays:

     older → newer
     ========================================================== */

  const recentScores =
    useMemo(
      () => {
        return completedSessions
          .slice(
            0,
            7
          )
          .reverse()
          .map(
            (
              session,
              index
            ) => ({
              id:
                session.id,

              score:
                round(
                  session
                    ?.summary
                    ?.overall
                ),

              label:
                `S${index + 1}`,
            })
          );
      },
      [
        completedSessions,
      ]
    );


  /* ==========================================================
     CRITICAL REVIEW COUNT
     ========================================================== */

  const reviewRequiredCount =
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


  /* ==========================================================
     AREAS FOR IMPROVEMENT

     Take three lowest scoring categories.

     This replaces the old hardcoded:
     - Run-Up Procedure
     - Radio Readback
     - Shutdown Sequence

     with the student's ACTUAL performance.
     ========================================================== */

  const areasForImprovement =
    useMemo(
      () => {
        if (
          completedSessions.length ===
          0
        ) {
          return [];
        }


        const messages = {
          "checklist-accuracy":
            "Review incorrect cockpit control selections and focus on completing objective checklist actions correctly on the first attempt.",

          "checklist-sequence":
            "Review the correct order of checklist actions and practice completing sequence-based procedures without out-of-sequence inputs.",

          "checklist-completion":
            "Focus on completing all required checklist items before ending the training session.",

          "checklist-recovery":
            "Practice identifying and correcting checklist mistakes with fewer repeated attempts.",

          "critical-communication":
            "Review safety-critical radio information such as callsign, runway, holding point and altimeter values.",

          "required-elements":
            "Practice including all required radio transmission elements such as station name, position, request and readback phrases.",

          "communication-recovery":
            "Practice responding accurately to ATC clarification and say-again requests with fewer retries.",
        };


        return [
          ...categoryScores,
        ]
          .sort(
            (
              a,
              b
            ) =>
              a.score -
              b.score
          )
          .slice(
            0,
            3
          )
          .map(
            (
              category
            ) => ({
              ...category,

              text:
                messages[
                  category.id
                ],
            })
          );
      },
      [
        categoryScores,
        completedSessions.length,
      ]
    );


  /* ==========================================================
     PAGE
     ========================================================== */

  return (
    <>
      <PageHeader
        title="My Performance"
        subtitle="Review your training accuracy, progress and communication performance."
      />


      {/* ======================================================
          STUDENT INFORMATION
          ====================================================== */}

      {selectedStudent && (
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                Student Performance
              </p>


              <p className="mt-1 font-bold text-slate-900">
                {
                  selectedStudent.name
                }
              </p>


              <p className="mt-1 text-xs text-slate-500">
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


            <button
              type="button"

              onClick={
                loadPerformance
              }

              disabled={
                loading
              }

              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
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

        </div>
      )}


      {/* ======================================================
          LOADING
          ====================================================== */}

      {loading && (
        <GlassCard className="p-10 text-center">

          <RefreshCw
            size={26}
            className="mx-auto animate-spin text-blue-500"
          />


          <p className="mt-3 text-sm text-slate-400">
            Loading your performance...
          </p>

        </GlassCard>
      )}


      {/* ======================================================
          ERROR
          ====================================================== */}

      {!loading &&
        error && (
          <GlassCard className="border border-red-100 bg-red-50 p-6">

            <p className="text-sm text-red-600">
              {
                error
              }
            </p>

          </GlassCard>
        )}


      {/* ======================================================
          NO COMPLETED SESSIONS
          ====================================================== */}

      {!loading &&
        !error &&
        completedSessions.length ===
          0 && (
          <GlassCard className="p-10 text-center">

            <Activity
              size={38}
              className="mx-auto text-slate-300"
            />


            <h2 className="mt-4 font-bold text-slate-700">
              No Completed Training Yet
            </h2>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Complete a graded checklist and communication training session to generate your performance report.
            </p>

          </GlassCard>
        )}


      {/* ======================================================
          REAL PERFORMANCE
          ====================================================== */}

      {!loading &&
        !error &&
        completedSessions.length >
          0 && (
          <>

            {/* ==================================================
                MAIN STATS
                ================================================== */}

            <div className="grid gap-4 md:grid-cols-3">

              <StatCard
                icon={
                  Gauge
                }

                label="Overall Average"

                value={`${overallScore}%`}
              />


              <StatCard
                icon={
                  CheckCircle2
                }

                label="Procedure Accuracy"

                value={`${procedureAccuracy}%`}

                accent="green"
              />


              <StatCard
                icon={
                  Award
                }

                label="Current Rating"

                value={
                  getRating(
                    overallScore
                  )
                }

                accent="purple"
              />

            </div>


            {/* ==================================================
                CATEGORY + TREND
                ================================================== */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* CATEGORY PERFORMANCE */}

              <GlassCard className="p-6">

                <div className="flex items-center gap-3">

                  <Activity className="text-blue-600" />


                  <div>

                    <h2 className="font-bold">
                      Category Performance
                    </h2>


                    <p className="text-sm text-slate-400">
                      Average from your completed sessions
                    </p>

                  </div>

                </div>


                <div className="mt-6 space-y-5">

                  {categoryScores.map(
                    (
                      item
                    ) => (

                      <div
                        key={
                          item.id
                        }
                      >

                        <div className="mb-2 flex justify-between gap-3 text-sm">

                          <span className="text-slate-600">
                            {
                              item.name
                            }
                          </span>


                          <strong>
                            {
                              item.score
                            }
                            %
                          </strong>

                        </div>


                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-500"

                            style={{
                              width:
                                `${item.score}%`,
                            }}
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </GlassCard>


              {/* RECENT TREND */}

              <GlassCard className="p-6">

                <div className="flex items-center gap-3">

                  <TrendingUp className="text-blue-600" />


                  <div>

                    <h2 className="font-bold">
                      Recent Training Trend
                    </h2>


                    <p className="text-sm text-slate-400">
                      Last{" "}
                      {
                        recentScores.length
                      }{" "}
                      completed{" "}
                      {recentScores.length ===
                      1
                        ? "session"
                        : "sessions"}
                    </p>

                  </div>

                </div>


                <div className="mt-8 flex h-64 items-end gap-3">

                  {recentScores.map(
                    (
                      item
                    ) => (

                      <div
                        key={
                          item.id
                        }

                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >

                        <span className="text-xs font-bold text-blue-600">
                          {
                            item.score
                          }
                        </span>


                        <div className="flex h-[200px] w-full items-end">

                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-sky-300 transition-all"

                            style={{
                              height:
                                `${Math.max(
                                  4,
                                  item.score
                                )}%`,
                            }}
                          />

                        </div>


                        <span className="text-[10px] text-slate-400">
                          {
                            item.label
                          }
                        </span>

                      </div>

                    )
                  )}

                </div>

              </GlassCard>

            </div>


            {/* ==================================================
                ADDITIONAL PERFORMANCE INFORMATION
                ================================================== */}

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <GlassCard className="p-5">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Completed Sessions
                </p>


                <p className="mt-2 text-2xl font-black text-slate-900">
                  {
                    completedSessions.length
                  }
                </p>

              </GlassCard>


              <GlassCard className="p-5">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Flight Progress
                </p>


                <p className="mt-2 text-lg font-bold text-blue-600">
                  {selectedStudent
                    ?.flightProgress ||
                    "—"}
                </p>

              </GlassCard>


              <GlassCard className="p-5">

                <div className="flex items-center gap-2">

                  <ShieldAlert
                    size={16}
                    className={
                      reviewRequiredCount >
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
                    mt-2
                    text-2xl
                    font-black

                    ${
                      reviewRequiredCount >
                      0
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }
                  `}
                >
                  {
                    reviewRequiredCount
                  }
                </p>

              </GlassCard>

            </div>


            {/* ==================================================
                AREAS FOR IMPROVEMENT
                ================================================== */}

            <GlassCard className="mt-6 p-6">

              <h2 className="text-lg font-bold">
                Areas for Improvement
              </h2>


              <p className="mt-1 text-sm text-slate-400">
                Based on your three lowest-scoring performance categories.
              </p>


              <div className="mt-5 grid gap-4 md:grid-cols-3">

                {areasForImprovement.map(
                  (
                    item
                  ) => (

                    <div
                      key={
                        item.id
                      }

                      className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <h3 className="font-bold">
                          {
                            item.name
                          }
                        </h3>


                        <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-blue-600">
                          {
                            item.score
                          }
                          %
                        </span>

                      </div>


                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {
                          item.text
                        }
                      </p>

                    </div>

                  )
                )}

              </div>

            </GlassCard>

          </>
        )}
    </>
  );
}


export default Performance;