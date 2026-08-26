import {
  Award,
  Medal,
  RefreshCw,
  Trophy,
  User,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";

import {
  fetchTrainingSessionsFromApi,
} from "../services/trainingStorage";

import {
  fetchStudents,
  getSelectedStudent,
} from "../services/studentStorage";


/* ============================================================
   HELPERS
   ============================================================ */

function roundScore(
  value
) {
  return Math.round(
    Number(value) || 0
  );
}


/* ============================================================
   LEADERBOARD PAGE
   ============================================================ */

function Leaderboard() {
  const selectedStudent =
    useMemo(
      () =>
        getSelectedStudent(),
      []
    );


  const [
    students,
    setStudents,
  ] = useState([]);


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
     LOAD REAL DATA

     Students:
     GET /api/students

     Training:
     GET /api/training/sessions
     ========================================================== */

  const loadLeaderboard =
    useCallback(
      async () => {
        setLoading(
          true
        );


        setError(
          null
        );


        try {
          const [
            studentData,
            sessionData,
          ] =
            await Promise.all([
              fetchStudents(),
              fetchTrainingSessionsFromApi(),
            ]);


          setStudents(
            Array.isArray(
              studentData
            )
              ? studentData
              : []
          );


          setSessions(
            Array.isArray(
              sessionData
            )
              ? sessionData
              : []
          );
        } catch (
          loadError
        ) {
          console.error(
            "Could not load leaderboard:",
            loadError
          );


          setError(
            "Leaderboard data could not be loaded."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(
    () => {
      loadLeaderboard();
    },
    [
      loadLeaderboard,
    ]
  );


  /* ==========================================================
     BUILD REAL LEADERBOARD

     Rules:

     1. Only completed sessions count.
     2. Sessions are grouped using studentId.
     3. Average overall score determines ranking.
     4. More completed sessions breaks a tie.
     5. Best score is used as another tie-breaker.
     ========================================================== */

  const leaderboardData =
    useMemo(
      () => {
        const completedSessions =
          sessions.filter(
            (
              session
            ) =>
              session.status ===
                "completed" &&
              session
                ?.metadata
                ?.studentId
          );


        const studentPerformance =
          students
            .map(
              (
                student
              ) => {
                const studentSessions =
                  completedSessions.filter(
                    (
                      session
                    ) =>
                      session
                        ?.metadata
                        ?.studentId ===
                      student.studentId
                  );


                if (
                  studentSessions.length ===
                  0
                ) {
                  return null;
                }


                const scores =
                  studentSessions
                    .map(
                      (
                        session
                      ) =>
                        Number(
                          session
                            ?.summary
                            ?.overall
                        )
                    )
                    .filter(
                      (
                        score
                      ) =>
                        Number.isFinite(
                          score
                        )
                    );


                if (
                  scores.length ===
                  0
                ) {
                  return null;
                }


                const total =
                  scores.reduce(
                    (
                      sum,
                      score
                    ) =>
                      sum +
                      score,
                    0
                  );


                const average =
                  total /
                  scores.length;


                const best =
                  Math.max(
                    ...scores
                  );


                return {
                  studentId:
                    student.studentId,

                  studentNumber:
                    student.studentNumber,

                  name:
                    student.name,

                  course:
                    student.course,

                  yearLevel:
                    student.yearLevel,

                  flightProgress:
                    student.flightProgress,

                  sessions:
                    scores.length,

                  score:
                    roundScore(
                      average
                    ),

                  exactAverage:
                    average,

                  bestScore:
                    roundScore(
                      best
                    ),
                };
              }
            )
            .filter(
              Boolean
            );


        /* ====================================================
           SORT

           Higher average first.

           Tie:
           more completed sessions first.

           Tie again:
           higher best score first.

           Final tie:
           alphabetical.
           ==================================================== */

        studentPerformance.sort(
          (
            a,
            b
          ) => {
            if (
              b.exactAverage !==
              a.exactAverage
            ) {
              return (
                b.exactAverage -
                a.exactAverage
              );
            }


            if (
              b.sessions !==
              a.sessions
            ) {
              return (
                b.sessions -
                a.sessions
              );
            }


            if (
              b.bestScore !==
              a.bestScore
            ) {
              return (
                b.bestScore -
                a.bestScore
              );
            }


            return a.name.localeCompare(
              b.name
            );
          }
        );


        return studentPerformance.map(
          (
            student,
            index
          ) => ({
            ...student,

            rank:
              index +
              1,
          })
        );
      },
      [
        students,
        sessions,
      ]
    );


  /* ==========================================================
     LOGGED-IN STUDENT'S RANK
     ========================================================== */

  const myRanking =
    useMemo(
      () => {
        if (
          !selectedStudent
            ?.studentId
        ) {
          return null;
        }


        return (
          leaderboardData.find(
            (
              student
            ) =>
              student.studentId ===
              selectedStudent.studentId
          ) ||
          null
        );
      },
      [
        leaderboardData,
        selectedStudent,
      ]
    );


  /* ==========================================================
     TOP THREE
     ========================================================== */

  const topThree =
    useMemo(
      () =>
        leaderboardData.slice(
          0,
          3
        ),
      [
        leaderboardData,
      ]
    );


  return (
    <>
      <PageHeader
        title="Leaderboard"
        subtitle="Compare student training performance based on completed Tecnam P2002JF training sessions."
      />


      {/* ======================================================
          CURRENT STUDENT RANK
          ====================================================== */}

      {!loading &&
        !error &&
        myRanking && (
          <GlassCard className="mb-6 overflow-hidden">

            <div className="flex flex-wrap items-center justify-between gap-5 border-l-4 border-blue-500 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Award
                    size={22}
                  />
                </div>


                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                    Your Current Ranking
                  </p>


                  <h2 className="mt-1 font-bold text-slate-900">
                    {
                      myRanking.name
                    }
                  </h2>


                  <p className="mt-1 text-xs text-slate-400">
                    {
                      myRanking.studentNumber
                    }
                    {" • "}
                    {
                      myRanking.sessions
                    }{" "}
                    completed{" "}
                    {myRanking.sessions ===
                    1
                      ? "session"
                      : "sessions"}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-6">

                <div className="text-center">

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Rank
                  </p>


                  <p className="mt-1 text-2xl font-black text-slate-900">
                    #
                    {
                      myRanking.rank
                    }
                  </p>

                </div>


                <div className="text-center">

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Average
                  </p>


                  <p className="mt-1 text-2xl font-black text-blue-600">
                    {
                      myRanking.score
                    }
                    %
                  </p>

                </div>

              </div>

            </div>

          </GlassCard>
        )}


      {/* ======================================================
          HEADER / REFRESH
          ====================================================== */}

      <div className="mb-6 flex justify-end">

        <button
          type="button"

          onClick={
            loadLeaderboard
          }

          disabled={
            loading
          }

          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >

          <RefreshCw
            size={14}

            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh Rankings

        </button>

      </div>


      {/* ======================================================
          LOADING
          ====================================================== */}

      {loading && (
        <GlassCard className="p-12 text-center">

          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-blue-500"
          />


          <p className="mt-3 text-sm text-slate-400">
            Calculating student rankings...
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
          EMPTY
          ====================================================== */}

      {!loading &&
        !error &&
        leaderboardData.length ===
          0 && (
          <GlassCard className="p-12 text-center">

            <Trophy
              size={40}
              className="mx-auto text-slate-300"
            />


            <h2 className="mt-4 font-bold text-slate-700">
              No Rankings Yet
            </h2>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Students will appear on the leaderboard after completing at least one graded training session.
            </p>

          </GlassCard>
        )}


      {/* ======================================================
          LEADERBOARD
          ====================================================== */}

      {!loading &&
        !error &&
        leaderboardData.length >
          0 && (
          <>

            {/* ==================================================
                TOP THREE
                ================================================== */}

            <div className="mb-6 grid gap-4 md:grid-cols-3">

              {topThree.map(
                (
                  student
                ) => {
                  const isCurrentStudent =
                    student.studentId ===
                    selectedStudent
                      ?.studentId;


                  return (
                    <GlassCard
                      key={
                        student.studentId
                      }

                      className={`
                        p-6
                        text-center

                        ${
                          isCurrentStudent
                            ? "ring-2 ring-blue-400 ring-offset-2"
                            : ""
                        }
                      `}
                    >

                      {/* MEDAL */}

                      <div
                        className={`
                          mx-auto
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-full

                          ${
                            student.rank ===
                            1
                              ? "bg-amber-100 text-amber-600"
                              : student.rank ===
                                  2
                                ? "bg-slate-200 text-slate-600"
                                : "bg-orange-100 text-orange-600"
                          }
                        `}
                      >

                        <Medal
                          size={30}
                        />

                      </div>


                      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Rank #
                        {
                          student.rank
                        }
                      </p>


                      <h2 className="mt-2 text-xl font-bold text-slate-900">
                        {
                          student.name
                        }
                      </h2>


                      <p className="mt-1 text-xs font-semibold text-blue-500">
                        {
                          student.studentNumber
                        }
                      </p>


                      {isCurrentStudent && (
                        <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                          You
                        </span>
                      )}


                      <p className="mt-4 text-4xl font-black text-blue-600">
                        {
                          student.score
                        }
                        %
                      </p>


                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Average Score
                      </p>


                      <div className="mt-4 grid grid-cols-2 gap-2">

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-[9px] font-bold uppercase text-slate-400">
                            Sessions
                          </p>


                          <p className="mt-1 font-bold text-slate-700">
                            {
                              student.sessions
                            }
                          </p>

                        </div>


                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-[9px] font-bold uppercase text-slate-400">
                            Best
                          </p>


                          <p className="mt-1 font-bold text-slate-700">
                            {
                              student.bestScore
                            }
                            %
                          </p>

                        </div>

                      </div>

                    </GlassCard>
                  );
                }
              )}

            </div>


            {/* ==================================================
                ALL STUDENT RANKINGS
                ================================================== */}

            <GlassCard className="overflow-hidden">

              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">

                <div className="flex items-center gap-3">

                  <Trophy className="text-blue-600" />


                  <div>

                    <h2 className="font-bold">
                      Student Rankings
                    </h2>


                    <p className="mt-1 text-sm text-slate-400">
                      Ranked by average score from completed sessions
                    </p>

                  </div>

                </div>


                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                  {
                    leaderboardData.length
                  }{" "}
                  Ranked{" "}
                  {leaderboardData.length ===
                  1
                    ? "Student"
                    : "Students"}
                </span>

              </div>


              {leaderboardData.map(
                (
                  student
                ) => {
                  const isCurrentStudent =
                    student.studentId ===
                    selectedStudent
                      ?.studentId;


                  return (
                    <div
                      key={
                        student.studentId
                      }

                      className={`
                        flex
                        flex-wrap
                        items-center
                        gap-4
                        border-b
                        border-slate-100
                        px-6
                        py-5
                        last:border-0

                        ${
                          isCurrentStudent
                            ? "bg-blue-50/50"
                            : ""
                        }
                      `}
                    >

                      {/* RANK */}

                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-sm
                          font-black

                          ${
                            student.rank ===
                            1
                              ? "bg-amber-100 text-amber-600"
                              : student.rank ===
                                  2
                                ? "bg-slate-200 text-slate-600"
                                : student.rank ===
                                    3
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-slate-50 text-slate-500"
                          }
                        `}
                      >
                        #
                        {
                          student.rank
                        }
                      </div>


                      {/* USER */}

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                        <User
                          size={19}
                        />

                      </div>


                      {/* STUDENT */}

                      <div className="min-w-[180px] flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-semibold text-slate-900">
                            {
                              student.name
                            }
                          </p>


                          {isCurrentStudent && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-blue-600">
                              You
                            </span>
                          )}

                        </div>


                        <p className="mt-1 text-xs text-slate-400">
                          {
                            student.studentNumber
                          }
                          {" • "}
                          {
                            student.course
                          }
                        </p>


                        <p className="mt-1 text-[10px] text-slate-400">
                          {
                            student.sessions
                          }{" "}
                          completed{" "}
                          {student.sessions ===
                          1
                            ? "session"
                            : "sessions"}
                        </p>

                      </div>


                      {/* BEST SCORE */}

                      <div className="hidden text-right md:block">

                        <p className="text-[9px] font-bold uppercase text-slate-400">
                          Best Score
                        </p>


                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {
                            student.bestScore
                          }
                          %
                        </p>

                      </div>


                      {/* AVERAGE */}

                      <div className="min-w-[90px] text-right">

                        <p className="text-[9px] font-bold uppercase text-slate-400">
                          Average
                        </p>


                        <strong className="mt-1 block text-xl text-blue-600">
                          {
                            student.score
                          }
                          %
                        </strong>

                      </div>

                    </div>
                  );
                }
              )}

            </GlassCard>

          </>
        )}


      <p className="mt-4 text-xs leading-5 text-slate-400">
        Rankings include only students with at least one completed graded training session. Ranking is based on average overall training score.
      </p>

    </>
  );
}


export default Leaderboard;