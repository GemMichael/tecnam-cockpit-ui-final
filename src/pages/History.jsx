import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  History as HistoryIcon,
  ListChecks,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  Fragment,
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
  getSelectedStudent,
} from "../services/studentStorage";


/* ============================================================
   DATE
   ============================================================ */

function formatDate(
  dateValue
) {
  if (!dateValue) {
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
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}


/* ============================================================
   TIME
   ============================================================ */

function formatTime(
  dateValue
) {
  if (!dateValue) {
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


  return date.toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


/* ============================================================
   DURATION
   ============================================================ */

function formatDuration(
  startedAt,
  endedAt,
  updatedAt
) {
  if (!startedAt) {
    return "—";
  }


  const start =
    new Date(
      startedAt
    ).getTime();


  const end =
    new Date(
      endedAt ||
        updatedAt ||
        startedAt
    ).getTime();


  if (
    Number.isNaN(start) ||
    Number.isNaN(end)
  ) {
    return "—";
  }


  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        (
          end -
          start
        ) /
          1000
      )
    );


  const hours =
    Math.floor(
      totalSeconds /
        3600
    );


  const minutes =
    Math.floor(
      (
        totalSeconds %
        3600
      ) /
        60
    );


  const seconds =
    totalSeconds %
    60;


  if (
    hours > 0
  ) {
    return `${hours}h ${minutes}m`;
  }


  if (
    minutes > 0
  ) {
    return `${minutes}m ${seconds}s`;
  }


  return `${seconds}s`;
}


/* ============================================================
   SESSION / CHECKLIST LABEL
   ============================================================ */

function getSessionChecklistLabel(
  session
) {
  const titles =
    [
      ...new Set(
        (
          session
            ?.checklistEvents ||
          []
        )
          .map(
            (event) =>
              event
                .checklistTitle
          )
          .filter(
            Boolean
          )
      ),
    ];


  if (
    titles.length ===
    0
  ) {
    return (
      session
        ?.metadata
        ?.trainingName ||
      "Tecnam P2002JF Training"
    );
  }


  if (
    titles.length ===
    1
  ) {
    return titles[0];
  }


  return `${titles[0]} +${titles.length - 1}`;
}


/* ============================================================
   STATUS
   ============================================================ */

function getStatusLabel(
  session
) {
  if (
    session?.status ===
    "completed"
  ) {
    return "Completed";
  }


  if (
    session?.status ===
    "in_progress"
  ) {
    return "In Progress";
  }


  return (
    session?.status ||
    "Unknown"
  );
}


/* ============================================================
   CHECKLIST EVENT
   ============================================================ */

function ChecklistEvent({
  event,
}) {
  const isCorrect =
    event.correct !==
    false;


  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>

          <p className="text-xs font-bold text-slate-800">
            {event.stepTitle ||
              event.stepId ||
              "Checklist Event"}
          </p>


          {event.checklistTitle && (
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {
                event.checklistTitle
              }
            </p>
          )}

        </div>


        <span
          className={`
            rounded-full
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-wider

            ${
              isCorrect
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }
          `}
        >
          {event.outcome ||
            event.kind ||
            "Event"}
        </span>

      </div>


      <div className="mt-3 grid gap-2 text-[11px] text-slate-500 sm:grid-cols-2 lg:grid-cols-4">

        {event.controlId && (
          <div>

            <span className="font-semibold text-slate-700">
              Control:
            </span>{" "}

            {event.controlId}

          </div>
        )}


        {event.value !==
          undefined && (
          <div>

            <span className="font-semibold text-slate-700">
              Selected:
            </span>{" "}

            {String(
              event.value
            )}

          </div>
        )}


        {event.expected !==
          undefined && (
          <div>

            <span className="font-semibold text-slate-700">
              Expected:
            </span>{" "}

            {String(
              event.expected
            )}

          </div>
        )}


        {event.attemptNumber && (
          <div>

            <span className="font-semibold text-slate-700">
              Attempt:
            </span>{" "}

            {
              event.attemptNumber
            }

          </div>
        )}


        {event.source && (
          <div>

            <span className="font-semibold text-slate-700">
              Source:
            </span>{" "}

            {event.source}

          </div>
        )}


        {event.timestamp && (
          <div>

            <span className="font-semibold text-slate-700">
              Time:
            </span>{" "}

            {formatTime(
              event.timestamp
            )}

          </div>
        )}

      </div>

    </div>
  );
}


/* ============================================================
   COMMUNICATION ATTEMPT
   ============================================================ */

function CommunicationAttempt({
  attempt,
}) {
  const allCorrect =
    (
      attempt.checks ||
      []
    ).length >
      0 &&
    (
      attempt.checks ||
      []
    ).every(
      (check) =>
        check.correct
    );


  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>

          <p className="text-xs font-bold text-slate-800">
            {attempt.stageTitle ||
              attempt.stageId ||
              "Communication"}
          </p>


          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-blue-500">
            Attempt{" "}
            {attempt.attemptNumber ||
              "—"}
            {" • "}
            {attempt.mode ||
              "normal"}
          </p>

        </div>


        <span
          className={`
            rounded-full
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-wider

            ${
              attempt.stageComplete
                ? "bg-emerald-50 text-emerald-600"
                : allCorrect
                  ? "bg-blue-50 text-blue-600"
                  : "bg-red-50 text-red-600"
            }
          `}
        >
          {attempt.stageComplete
            ? "Stage Complete"
            : "Retry Required"}
        </span>

      </div>


      {/* TRANSCRIPT */}

      <div className="mt-4 rounded-xl bg-slate-900 p-3">

        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Speech Recognition Transcript
        </p>


        <p className="mt-2 text-xs leading-5 text-slate-200">
          {attempt.transcript ||
            "No transcript recorded."}
        </p>

      </div>


      {/* CHECKS */}

      {(
        attempt.checks ||
        []
      ).length > 0 && (

        <div className="mt-3 space-y-2">

          {attempt.checks.map(
            (
              check,
              index
            ) => (

              <div
                key={`${check.label}-${index}`}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >

                <span className="text-[11px] font-medium text-slate-600">
                  {
                    check.label
                  }
                </span>


                <span
                  className={`
                    text-[10px]
                    font-black

                    ${
                      check.correct
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  `}
                >
                  {check.correct
                    ? "PASS"
                    : "FAIL"}
                </span>

              </div>

            )
          )}

        </div>

      )}


      {/* ATC CLARIFICATION */}

      {attempt.clarification && (

        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3">

          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-amber-600">
            ATC Clarification
          </p>


          <p className="mt-1 text-xs leading-5 text-amber-900">
            {attempt
              .clarification
              .message ||
              "Clarification requested."}
          </p>


          {attempt
            .clarification
            .targetLabel && (

            <p className="mt-2 text-[10px] font-semibold text-amber-600">
              Target:{" "}
              {
                attempt
                  .clarification
                  .targetLabel
              }
            </p>

          )}

        </div>

      )}

    </div>
  );
}


/* ============================================================
   SESSION DETAILS
   ============================================================ */

function SessionDetails({
  session,
}) {
  const summary =
    session?.summary ||
    {};


  const checklist =
    summary.checklist ||
    {};


  const communications =
    summary.communications ||
    {};


  return (
    <div className="border-t border-slate-100 bg-slate-50/70 p-6">

      {/* SCORE CARDS */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-4">

          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Overall
          </p>


          <p className="mt-2 text-2xl font-black text-blue-600">
            {summary.overall ??
              0}
            /100
          </p>


          <p className="mt-1 text-xs text-slate-500">
            {summary.rating ||
              "—"}
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-4">

          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Checklist
          </p>


          <p className="mt-2 text-2xl font-black text-slate-900">
            {checklist.total ??
              0}
            /60
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-4">

          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Communications
          </p>


          <p className="mt-2 text-2xl font-black text-slate-900">
            {communications.total ??
              0}
            /40
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-4">

          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Critical Errors
          </p>


          <p
            className={`
              mt-2
              text-2xl
              font-black

              ${
                (
                  summary.criticalErrors ||
                  0
                ) >
                0
                  ? "text-red-600"
                  : "text-emerald-600"
              }
            `}
          >
            {summary.criticalErrors ??
              0}
          </p>

        </div>

      </div>


      {/* CHECKLIST ASSESSMENT */}

      <div className="mt-6">

        <div className="flex items-center gap-2">

          <ListChecks
            size={17}
            className="text-blue-600"
          />


          <h3 className="text-sm font-bold text-slate-900">
            Checklist Assessment
          </h3>

        </div>


        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <ScoreMiniCard
            label="Accuracy"
            value={
              checklist
                ?.accuracy
                ?.score ??
              0
            }
            maximum="30"
          />


          <ScoreMiniCard
            label="Sequence"
            value={
              checklist
                ?.sequence
                ?.score ??
              0
            }
            maximum="15"
          />


          <ScoreMiniCard
            label="Completion"
            value={
              checklist
                ?.completion
                ?.score ??
              0
            }
            maximum="10"
          />


          <ScoreMiniCard
            label="Recovery"
            value={
              checklist
                ?.recovery
                ?.score ??
              0
            }
            maximum="5"
          />

        </div>

      </div>


      {/* COMMUNICATION ASSESSMENT */}

      <div className="mt-6">

        <div className="flex items-center gap-2">

          <Radio
            size={17}
            className="text-blue-600"
          />


          <h3 className="text-sm font-bold text-slate-900">
            Communication Assessment
          </h3>

        </div>


        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <ScoreMiniCard
            label="Critical Accuracy"
            value={
              communications
                ?.criticalAccuracy
                ?.score ??
              0
            }
            maximum="20"
          />


          <ScoreMiniCard
            label="Required Elements"
            value={
              communications
                ?.requiredElements
                ?.score ??
              0
            }
            maximum="12"
          />


          <ScoreMiniCard
            label="Recovery"
            value={
              communications
                ?.recovery
                ?.score ??
              0
            }
            maximum="8"
          />


          <ScoreMiniCard
            label="Clarifications"
            value={
              communications
                ?.clarificationCount ??
              0
            }
          />

        </div>

      </div>


      {/* CHECKLIST LOGS */}

      <div className="mt-7">

        <h3 className="text-sm font-bold text-slate-900">
          Checklist Logs
        </h3>


        <p className="mt-1 text-xs text-slate-400">
          Recorded checklist controls, attempts and completions for this training session.
        </p>


        <div className="mt-3 space-y-2">

          {(
            session.checklistEvents ||
            []
          ).length ===
          0 ? (

            <div className="rounded-xl bg-white p-4 text-xs text-slate-400">
              No checklist events recorded.
            </div>

          ) : (

            session.checklistEvents.map(
              (
                event,
                index
              ) => (

                <ChecklistEvent
                  key={
                    event.id ||
                    `${event.stepId}-${index}`
                  }
                  event={
                    event
                  }
                />

              )
            )

          )}

        </div>

      </div>


      {/* COMMS LOGS */}

      <div className="mt-7">

        <h3 className="text-sm font-bold text-slate-900">
          Communication Logs
        </h3>


        <p className="mt-1 text-xs text-slate-400">
          Speech-recognition transcripts, validation results and ATC clarifications.
        </p>


        <div className="mt-3 space-y-3">

          {(
            session.commsAttempts ||
            []
          ).length ===
          0 ? (

            <div className="rounded-xl bg-white p-4 text-xs text-slate-400">
              No communication attempts recorded.
            </div>

          ) : (

            session.commsAttempts.map(
              (
                attempt,
                index
              ) => (

                <CommunicationAttempt
                  key={
                    attempt.id ||
                    `${attempt.stageId}-${index}`
                  }
                  attempt={
                    attempt
                  }
                />

              )
            )

          )}

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   MINI SCORE
   ============================================================ */

function ScoreMiniCard({
  label,
  value,
  maximum = null,
}) {
  return (
    <div className="rounded-xl bg-white p-3 text-xs">

      <span className="text-slate-400">
        {label}
      </span>


      <p className="mt-1 font-bold text-slate-800">

        {value}

        {maximum &&
          `/${maximum}`}

      </p>

    </div>
  );
}


/* ============================================================
   HISTORY PAGE
   ============================================================ */

function HistoryPage() {

  /* ==========================================================
     CURRENT LOGGED-IN STUDENT
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


  const [
    expandedSessionId,
    setExpandedSessionId,
  ] = useState(null);


  /* ==========================================================
     LOAD HISTORY

     IMPORTANT:

     Even though trainingStorage may return sessions belonging
     to several students, this page ONLY accepts records whose:

     session.metadata.studentId

     matches:

     selectedStudent.studentId

     This prevents students from seeing one another's records.
     ========================================================== */

  const loadHistory =
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
            !selectedStudent?.studentId
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
            "Could not load student training history:",
            loadError
          );


          setError(
            "Your training history could not be loaded."
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
      loadHistory();
    },
    [
      loadHistory,
    ]
  );


  /* ==========================================================
     NEWEST FIRST
     ========================================================== */

  const sortedSessions =
    useMemo(
      () => {

        return [
          ...sessions,
        ].sort(
          (
            a,
            b
          ) =>
            new Date(
              b.updatedAt ||
                b.startedAt ||
                0
            ).getTime() -
            new Date(
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
     BASIC STUDENT STATISTICS
     ========================================================== */

  const studentStats =
    useMemo(
      () => {

        const completed =
          sortedSessions.filter(
            (
              session
            ) =>
              session.status ===
              "completed"
          );


        const scores =
          completed
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
                value
              ) =>
                Number.isFinite(
                  value
                )
            );


        const average =
          scores.length >
          0
            ? Math.round(
                scores.reduce(
                  (
                    total,
                    score
                  ) =>
                    total +
                    score,
                  0
                ) /
                  scores.length
              )
            : null;


        const best =
          scores.length >
          0
            ? Math.max(
                ...scores
              )
            : null;


        return {
          total:
            sortedSessions.length,

          completed:
            completed.length,

          average,

          best,
        };

      },
      [
        sortedSessions,
      ]
    );


  return (
    <>

      <PageHeader
        title="My Training History"
        subtitle="Review your recorded Tecnam P2002JF checklist and communication training sessions."
      />


      {/* ======================================================
          STUDENT PROFILE
          ====================================================== */}

      {selectedStudent && (

        <GlassCard className="mb-6">

          <div className="flex flex-wrap items-center justify-between gap-5 p-6">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                <User
                  size={22}
                />

              </div>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                  Student Training Record
                </p>


                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {
                    selectedStudent.name
                  }
                </h2>


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

            </div>


            <div className="flex flex-wrap gap-2">

              <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                Flight Progress:{" "}
                {
                  selectedStudent.flightProgress
                }
              </span>

            </div>

          </div>

        </GlassCard>

      )}


      {/* ======================================================
          STUDENT STATISTICS
          ====================================================== */}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <GlassCard>
          <div className="p-5">

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Training Sessions
            </p>


            <p className="mt-2 text-2xl font-black text-slate-900">
              {
                studentStats.total
              }
            </p>

          </div>
        </GlassCard>


        <GlassCard>
          <div className="p-5">

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Completed
            </p>


            <p className="mt-2 text-2xl font-black text-slate-900">
              {
                studentStats.completed
              }
            </p>

          </div>
        </GlassCard>


        <GlassCard>
          <div className="p-5">

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Average Score
            </p>


            <p className="mt-2 text-2xl font-black text-blue-600">
              {studentStats.average !==
              null
                ? `${studentStats.average}/100`
                : "—"}
            </p>

          </div>
        </GlassCard>


        <GlassCard>
          <div className="p-5">

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Best Score
            </p>


            <p className="mt-2 text-2xl font-black text-emerald-600">
              {studentStats.best !==
              null
                ? `${studentStats.best}/100`
                : "—"}
            </p>

          </div>
        </GlassCard>

      </div>


      {/* ======================================================
          HISTORY TABLE
          ====================================================== */}

      <GlassCard className="overflow-hidden">

        <div className="border-b border-slate-100 p-6">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <HistoryIcon className="text-blue-600" />


              <div>

                <h2 className="font-bold">
                  My Training Sessions
                </h2>


                <p className="text-sm text-slate-400">
                  Only records belonging to your student account are displayed.
                </p>

              </div>

            </div>


            <button
              type="button"

              onClick={
                loadHistory
              }

              disabled={
                loading
              }

              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-xs
                font-bold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
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


        {/* LOADING */}

        {loading && (

          <div className="p-10 text-center">

            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-blue-500"
            />


            <p className="mt-3 text-sm text-slate-400">
              Loading your training history...
            </p>

          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

            <div className="m-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {
                error
              }
            </div>

          )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          sortedSessions.length ===
            0 && (

            <div className="p-12 text-center">

              <HistoryIcon
                size={36}
                className="mx-auto text-slate-300"
              />


              <h3 className="mt-4 font-bold text-slate-700">
                No Training History Yet
              </h3>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                You do not have any recorded simulator sessions yet. Complete a checklist or communication training session and it will appear here.
              </p>

            </div>

          )}


        {/* TABLE */}

        {!loading &&
          !error &&
          sortedSessions.length >
            0 && (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead className="bg-blue-50/70 text-left text-xs uppercase tracking-wider text-slate-500">

                  <tr>

                    <th className="px-6 py-4">
                      Training
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Time
                    </th>

                    <th className="px-6 py-4">
                      Duration
                    </th>

                    <th className="px-6 py-4">
                      Score
                    </th>

                    <th className="px-6 py-4">
                      Rating
                    </th>

                    <th className="px-6 py-4">
                      Safety
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Details
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {sortedSessions.map(
                    (
                      session
                    ) => {

                      const summary =
                        session.summary ||
                        {};


                      const expanded =
                        expandedSessionId ===
                        session.id;


                      const safetyClear =
                        summary.safetyStatus !==
                        "REVIEW_REQUIRED";


                      return (

                        <Fragment
                          key={
                            session.id
                          }
                        >

                          <tr className="border-t border-slate-100 transition hover:bg-blue-50/30">

                            {/* TRAINING */}

                            <td className="px-6 py-5">

                              <p className="font-semibold text-slate-800">

                                {getSessionChecklistLabel(
                                  session
                                )}

                              </p>


                              <p className="mt-1 font-mono text-[9px] text-slate-400">

                                {
                                  session.id
                                }

                              </p>

                            </td>


                            {/* DATE */}

                            <td className="px-6 py-5 text-sm text-slate-500">

                              <span className="flex items-center gap-2">

                                <CalendarDays
                                  size={15}
                                />


                                {formatDate(
                                  session.startedAt
                                )}

                              </span>

                            </td>


                            {/* TIME */}

                            <td className="px-6 py-5 text-sm text-slate-500">

                              {formatTime(
                                session.startedAt
                              )}

                            </td>


                            {/* DURATION */}

                            <td className="px-6 py-5 text-sm text-slate-500">

                              <span className="flex items-center gap-2">

                                <Clock3
                                  size={15}
                                />


                                {formatDuration(
                                  session.startedAt,
                                  session.endedAt,
                                  session.updatedAt
                                )}

                              </span>

                            </td>


                            {/* SCORE */}

                            <td className="px-6 py-5">

                              <strong className="text-blue-600">

                                {summary.overall ??
                                  0}
                                /100

                              </strong>


                              <div className="mt-1 text-[9px] text-slate-400">

                                Checklist{" "}

                                {summary
                                  ?.checklist
                                  ?.total ??
                                  0}

                                /60

                                {" • "}

                                Comms{" "}

                                {summary
                                  ?.communications
                                  ?.total ??
                                  0}

                                /40

                              </div>

                            </td>


                            {/* RATING */}

                            <td className="px-6 py-5">

                              <span className="text-xs font-semibold text-slate-600">

                                {summary.rating ||
                                  "—"}

                              </span>

                            </td>


                            {/* SAFETY */}

                            <td className="px-6 py-5">

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-full
                                  px-3
                                  py-1.5
                                  text-[10px]
                                  font-bold

                                  ${
                                    safetyClear
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-amber-50 text-amber-700"
                                  }
                                `}
                              >

                                {safetyClear ? (

                                  <ShieldCheck
                                    size={13}
                                  />

                                ) : (

                                  <ShieldAlert
                                    size={13}
                                  />

                                )}


                                {safetyClear
                                  ? "Clear"
                                  : "Review Required"}

                              </span>

                            </td>


                            {/* STATUS */}

                            <td className="px-6 py-5">

                              <span
                                className={`
                                  rounded-full
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-bold

                                  ${
                                    session.status ===
                                    "completed"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-blue-50 text-blue-600"
                                  }
                                `}
                              >

                                {getStatusLabel(
                                  session
                                )}

                              </span>

                            </td>


                            {/* DETAILS */}

                            <td className="px-6 py-5">

                              <button
                                type="button"

                                onClick={() =>
                                  setExpandedSessionId(
                                    expanded
                                      ? null
                                      : session.id
                                  )
                                }

                                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                              >

                                {expanded ? (
                                  <>
                                    <ChevronUp
                                      size={14}
                                    />

                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown
                                      size={14}
                                    />

                                    View
                                  </>
                                )}

                              </button>

                            </td>

                          </tr>


                          {/* DETAILS */}

                          {expanded && (

                            <tr>

                              <td
                                colSpan={
                                  9
                                }
                                className="p-0"
                              >

                                <SessionDetails
                                  session={
                                    session
                                  }
                                />

                              </td>

                            </tr>

                          )}

                        </Fragment>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </GlassCard>


      <p className="mt-4 text-xs leading-5 text-slate-400">
        This page displays only training sessions associated with the currently logged-in student account.
      </p>

    </>
  );
}


export default HistoryPage;