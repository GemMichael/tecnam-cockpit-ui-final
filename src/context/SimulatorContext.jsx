import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import {
    checklists,
    getChecklistById,
} from "../data/checklists";

import {
    getOptionLabel,
    initialControls,
} from "../data/controlDefinitions";


/* ============================================================
   GRADING SYSTEM
   ============================================================ */

import {
    recordChecklistControlInput,
    recordChecklistStepCompletion,
} from "../services/trainingAssessment";


const SimulatorContext =
    createContext(null);


/* ============================================================
   CHECK EXPECTED VALUE
   ============================================================ */

function matchesExpected(
    expected,
    value
) {
    if (
        Array.isArray(
            expected
        )
    ) {
        return expected.includes(
            value
        );
    }


    return (
        expected ===
        value
    );
}


/* ============================================================
   SIMULATOR PROVIDER
   ============================================================ */

export function SimulatorProvider({
    children,
}) {
    /* ========================================================
       COCKPIT CONTROL STATES
       ======================================================== */

    const [
        controls,
        setControls,
    ] = useState(
        initialControls
    );


    /* ========================================================
       ACTIVE CHECKLIST
       ======================================================== */

    const [
        activeChecklistId,
        setActiveChecklistId,
    ] = useState(
        "cockpit-inspection"
    );


    /* ========================================================
       CURRENT CHECKLIST STEP
       ======================================================== */

    const [
        currentStepIndex,
        setCurrentStepIndex,
    ] = useState(0);


    /* ========================================================
       COMPLETED CHECKLIST STEPS
       ======================================================== */

    const [
        completedStepIds,
        setCompletedStepIds,
    ] = useState([]);


    /* ========================================================
       SEQUENCE STEP PROGRESS

       Example:

       Magnetos:

       LEFT
       RIGHT
       BOTH

       sequenceProgress keeps track of which position
       should be performed next.
       ======================================================== */

    const [
        sequenceProgress,
        setSequenceProgress,
    ] = useState(0);


    /* ========================================================
       CHECKLIST FEEDBACK
       ======================================================== */

    const [
        feedback,
        setFeedback,
    ] = useState(
        "Operate the required cockpit control for the current checklist step."
    );


    /* ========================================================
       EXISTING SIMULATOR MISTAKES

       This is your original local mistakes array.

       The new grading system maintains its own detailed
       assessment history separately.
       ======================================================== */

    const [
        mistakes,
        setMistakes,
    ] = useState([]);


    /* ========================================================
       SIMPLE ENGINE STATE
       ======================================================== */

    const [
        engineRunning,
        setEngineRunning,
    ] = useState(false);


    /* ========================================================
       LAST COCKPIT INPUT
       ======================================================== */

    const [
        lastEvent,
        setLastEvent,
    ] = useState(null);


    /* ========================================================
       CURRENT CHECKLIST
       ======================================================== */

    const currentChecklist =
        useMemo(
            () => {
                return (
                    getChecklistById(
                        activeChecklistId
                    ) ||
                    checklists[0]
                );
            },
            [
                activeChecklistId,
            ]
        );


    /* ========================================================
       CURRENT STEP
       ======================================================== */

    const currentStep =
        currentChecklist.steps[
            currentStepIndex
        ] || null;


    /* ========================================================
       CHECKLIST COMPLETE
       ======================================================== */

    const isChecklistComplete =
        currentStepIndex >=
        currentChecklist.steps.length;


    /* ========================================================
       CHECKLIST PROGRESS %
       ======================================================== */

    const progressPercentage =
        currentChecklist.steps
            .length === 0
            ? 0
            : Math.round(
                  (
                      completedStepIds.length /
                      currentChecklist.steps.length
                  ) *
                      100
              );


    /* ========================================================
       RESET CURRENT CHECKLIST PROGRESS

       IMPORTANT:

       This resets the visible checklist progress.

       It does NOT erase the grading history.

       This is intentional because a student should not be
       able to erase mistakes simply by restarting a checklist.

       To completely reset the grade, use "New Session" from
       the TrainingScoreCard.
       ======================================================== */

    const resetChecklistProgress =
        useCallback(
            () => {
                setCurrentStepIndex(
                    0
                );

                setCompletedStepIds(
                    []
                );

                setSequenceProgress(
                    0
                );

                setFeedback(
                    "Checklist progress reset."
                );
            },
            []
        );


    /* ========================================================
       RESET ALL COCKPIT CONTROLS

       Does NOT erase training grade/history.
       ======================================================== */

    const resetAllControls =
        useCallback(
            () => {
                setControls(
                    initialControls
                );

                setEngineRunning(
                    false
                );

                setLastEvent(
                    null
                );

                setFeedback(
                    "All controls reset to their default state."
                );
            },
            []
        );


    /* ========================================================
       HARD RESET SIMULATOR

       IMPORTANT:

       This resets simulator state.

       It intentionally does NOT erase the grading session.

       Use:
       TrainingScoreCard -> New

       when you want an entirely fresh graded session.
       ======================================================== */

    const hardResetAll =
        useCallback(
            () => {
                setControls(
                    initialControls
                );

                setEngineRunning(
                    false
                );

                setLastEvent(
                    null
                );

                setCurrentStepIndex(
                    0
                );

                setCompletedStepIds(
                    []
                );

                setSequenceProgress(
                    0
                );

                setMistakes(
                    []
                );

                setFeedback(
                    "Simulator reset. Ready for checklist execution."
                );
            },
            []
        );


    /* ========================================================
       SELECT CHECKLIST
       ======================================================== */

    const selectChecklist =
        useCallback(
            (
                checklistId
            ) => {
                setActiveChecklistId(
                    checklistId
                );

                setCurrentStepIndex(
                    0
                );

                setCompletedStepIds(
                    []
                );

                setSequenceProgress(
                    0
                );

                setFeedback(
                    "Checklist changed. Start with the first step."
                );
            },
            []
        );


    /* ========================================================
       COMPLETE CHECKLIST STEP

       NEW:
       Every completed checklist step is also sent to the
       grading system.

       Communications are automatically ignored here by
       trainingAssessment.js because comms receive their own
       separate communication grade.

       source examples:

       ui
       gpio
       manual
       comms
       system
       ======================================================== */

    const completeStep =
        useCallback(
            (
                step,
                source = "system"
            ) => {
                if (
                    !step
                ) {
                    return;
                }


                /* =============================================
                   GRADING SYSTEM

                   Record completion BEFORE moving to the next
                   checklist step.
                   ============================================= */

                recordChecklistStepCompletion({
                    step,
                    source,
                });


                /* =============================================
                   EXISTING COMPLETION LOGIC
                   ============================================= */

                setCompletedStepIds(
                    (
                        previous
                    ) => {
                        if (
                            previous.includes(
                                step.id
                            )
                        ) {
                            return previous;
                        }


                        return [
                            ...previous,
                            step.id,
                        ];
                    }
                );


                /*
                  Reset sequence tracker when step changes.
                */

                setSequenceProgress(
                    0
                );


                const nextIndex =
                    currentStepIndex +
                    1;


                /*
                  End of current checklist.
                */

                if (
                    nextIndex >=
                    currentChecklist
                        .steps
                        .length
                ) {
                    setFeedback(
                        `${currentChecklist.title} checklist complete.`
                    );
                }

                /*
                  Continue to next checklist item.
                */

                else {
                    setFeedback(
                        "Correct. Proceed to the next step."
                    );
                }


                setCurrentStepIndex(
                    nextIndex
                );
            },
            [
                currentChecklist,
                currentStepIndex,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | MAIN INPUT FUNCTION
    |--------------------------------------------------------------------------
    |
    | FOR NOW:
    |
    | React buttons call:
    |
    | setControl(
    |     "master_switch",
    |     "ON",
    |     "ui"
    | )
    |
    |
    | LATER:
    |
    | Python / GPIO / WebSocket can call:
    |
    | setControl(
    |     "master_switch",
    |     "ON",
    |     "gpio"
    | )
    |
    |
    | BOTH paths go through:
    |
    |                setControl()
    |                    |
    |          -----------------------
    |          |                     |
    |     Simulator Logic        Grading
    |
    |
    | This makes the grading system Raspberry Pi ready.
    |--------------------------------------------------------------------------
    */


    const setControl =
        useCallback(
            (
                controlId,
                value,
                source = "ui"
            ) => {
                /* =============================================
                   UPDATE ACTUAL COCKPIT STATE
                   ============================================= */

                setControls(
                    (
                        previous
                    ) => ({
                        ...previous,

                        [
                            controlId
                        ]:
                            value,
                    })
                );


                /* =============================================
                   SAVE LAST INPUT
                   ============================================= */

                setLastEvent({
                    controlId,
                    value,
                    source,
                    timestamp:
                        Date.now(),
                });


                /* =============================================
                   GRADING SYSTEM

                   THIS IS THE MAIN CHECKLIST GRADING HOOK.

                   It receives the SAME input regardless of:

                   React UI
                   Raspberry Pi
                   GPIO
                   WebSocket
                   Python

                   The grading service determines:

                   correct input
                   incorrect setting
                   out of sequence
                   sequence error
                   attempt number
                   recovery attempt
                   ============================================= */

                recordChecklistControlInput({
                    step:
                        currentStep,

                    controlId,

                    value,

                    source,
                });


                /* =============================================
                   SIMPLE ENGINE SIMULATION

                   Frontend demonstration only.
                   ============================================= */

                if (
                    controlId ===
                        "ignition" &&
                    value ===
                        "START"
                ) {
                    setEngineRunning(
                        true
                    );
                }


                if (
                    controlId ===
                        "ignition" &&
                    value ===
                        "OFF"
                ) {
                    setEngineRunning(
                        false
                    );
                }


                /* =============================================
                   NO ACTIVE CHECKLIST STEP
                   ============================================= */

                if (
                    !currentStep ||
                    isChecklistComplete
                ) {
                    setFeedback(
                        `${controlId} set to ${value}.`
                    );


                    return;
                }


                /* =============================================
                   MANUAL / FUTURE STEP

                   Operating physical controls while a manual
                   confirmation is expected does not complete
                   the current step.
                   ============================================= */

                if (
                    currentStep.type ===
                        "manual" ||
                    currentStep.type ===
                        "future"
                ) {
                    setFeedback(
                        `${getOptionLabel(
                            controlId,
                            value
                        )} selected. Current checklist step requires manual confirmation.`
                    );


                    return;
                }


                /* =================================================
                   NORMAL CONTROL STEP
                   ================================================= */

                if (
                    currentStep.type ===
                    "control"
                ) {
                    /* ---------------------------------------------
                       WRONG CONTROL OPERATED

                       Example:

                       Expected:
                       Fuel Pump

                       Student operates:
                       Landing Light

                       Grading already records this as:
                       OUT_OF_SEQUENCE
                       --------------------------------------------- */

                    if (
                        currentStep
                            .controlId !==
                        controlId
                    ) {
                        setFeedback(
                            `${getOptionLabel(
                                controlId,
                                value
                            )} selected. Current step is "${currentStep.title}".`
                        );


                        return;
                    }


                    /* ---------------------------------------------
                       CHECK VALUE
                       --------------------------------------------- */

                    const correct =
                        matchesExpected(
                            currentStep
                                .expected,

                            value
                        );


                    /* ---------------------------------------------
                       CORRECT
                       --------------------------------------------- */

                    if (
                        correct
                    ) {
                        completeStep(
                            currentStep,
                            source
                        );


                        return;
                    }


                    /* ---------------------------------------------
                       WRONG SETTING

                       Existing mistakes array remains intact.
                       --------------------------------------------- */

                    setMistakes(
                        (
                            previous
                        ) => [
                            ...previous,

                            {
                                id:
                                    Date.now(),

                                stepId:
                                    currentStep.id,

                                controlId,

                                value,
                            },
                        ]
                    );


                    setFeedback(
                        `Incorrect setting for ${currentStep.title}. Expected: ${currentStep.expectedLabel}.`
                    );


                    return;
                }


                /* =================================================
                   SEQUENCE STEP
                   ================================================= */

                if (
                    currentStep.type ===
                    "sequence"
                ) {
                    /* ---------------------------------------------
                       WRONG CONTROL

                       Grading has already recorded this as an
                       out-of-sequence action.
                       --------------------------------------------- */

                    if (
                        currentStep
                            .controlId !==
                        controlId
                    ) {
                        setFeedback(
                            `${getOptionLabel(
                                controlId,
                                value
                            )} selected. Current step is "${currentStep.title}".`
                        );


                        return;
                    }


                    /* ---------------------------------------------
                       EXPECTED SEQUENCE VALUE
                       --------------------------------------------- */

                    const expectedValue =
                        currentStep
                            .sequence[
                            sequenceProgress
                        ];


                    /* ---------------------------------------------
                       CORRECT SEQUENCE POSITION
                       --------------------------------------------- */

                    if (
                        value ===
                        expectedValue
                    ) {
                        const nextProgress =
                            sequenceProgress +
                            1;


                        /* -----------------------------------------
                           ENTIRE SEQUENCE COMPLETE
                           ----------------------------------------- */

                        if (
                            nextProgress >=
                            currentStep
                                .sequence
                                .length
                        ) {
                            completeStep(
                                currentStep,
                                source
                            );


                            return;
                        }


                        /* -----------------------------------------
                           CONTINUE SEQUENCE
                           ----------------------------------------- */

                        setSequenceProgress(
                            nextProgress
                        );


                        const nextExpected =
                            currentStep
                                .sequence[
                                nextProgress
                            ];


                        setFeedback(
                            `Correct. Next required position: ${getOptionLabel(
                                controlId,
                                nextExpected
                            )}.`
                        );


                        return;
                    }


                    /* ---------------------------------------------
                       INCORRECT SEQUENCE

                       Existing simulator mistakes array.
                       --------------------------------------------- */

                    setMistakes(
                        (
                            previous
                        ) => [
                            ...previous,

                            {
                                id:
                                    Date.now(),

                                stepId:
                                    currentStep.id,

                                controlId,

                                value,
                            },
                        ]
                    );


                    /* ---------------------------------------------
                       RESTART / RECOVER SEQUENCE

                       Your existing behavior is preserved.
                       --------------------------------------------- */

                    if (
                        value ===
                        currentStep
                            .sequence[
                            0
                        ]
                    ) {
                        setSequenceProgress(
                            1
                        );
                    } else {
                        setSequenceProgress(
                            0
                        );
                    }


                    setFeedback(
                        `Incorrect sequence. Expected: ${getOptionLabel(
                            controlId,
                            expectedValue
                        )}.`
                    );
                }
            },
            [
                completeStep,
                currentStep,
                isChecklistComplete,
                sequenceProgress,
            ]
        );


    /* ========================================================
       MANUAL CHECKLIST STEP COMPLETE

       Manual checks currently receive COMPLETION credit.

       They are NOT given objective accuracy points because
       software cannot verify that the student actually
       inspected something just because Confirm was pressed.
       ======================================================== */

    const markManualStepComplete =
        useCallback(
            () => {
                if (
                    !currentStep
                ) {
                    return;
                }


                if (
                    currentStep.type ===
                        "manual" ||
                    currentStep.type ===
                        "future"
                ) {
                    completeStep(
                        currentStep,
                        "manual"
                    );
                }
            },
            [
                currentStep,
                completeStep,
            ]
        );


    /* ========================================================
       COMMUNICATION CHECKLIST STEP COMPLETE

       The communication itself is graded separately inside
       CommsTrainingPanel.

       trainingAssessment.js automatically prevents this from
       being counted again as checklist points.

       This function ONLY moves the checklist to the next item.
       ======================================================== */

    const markCommsStepComplete =
        useCallback(
            () => {
                if (
                    !currentStep
                ) {
                    return;
                }


                if (
                    currentStep.type ===
                    "comms"
                ) {
                    completeStep(
                        currentStep,
                        "comms"
                    );
                }
            },
            [
                currentStep,
                completeStep,
            ]
        );


    /* ========================================================
       SIMULATED INSTRUMENT VALUES

       Existing frontend/demo logic remains unchanged.
       ======================================================== */

    const instruments =
        useMemo(
            () => {
                const voltmeter =
                    controls
                        .master_switch ===
                    "ON"
                        ? controls
                              .generator ===
                              "ON" &&
                          engineRunning
                            ? "14V"
                            : "12V"
                        : "0V";


                const ammeter =
                    controls
                        .master_switch ===
                    "ON"
                        ? controls
                              .generator ===
                              "ON" &&
                          engineRunning
                            ? "CHARGING"
                            : "STANDBY"
                        : "OFF";


                const fuelPressure =
                    controls
                        .fuel_pump ===
                    "ON"
                        ? engineRunning
                            ? "4.2 PSI"
                            : "3.1 PSI"
                        : engineRunning
                          ? "2.6 PSI"
                          : "0 PSI";


                const oilPressure =
                    engineRunning
                        ? "4 BARS / GREEN"
                        : "0 BARS";


                return {
                    voltmeter,

                    ammeter,

                    fuelPressure,

                    oilPressure,

                    engineRunning,

                    transponder:
                        controls
                            .transponder,

                    landingLight:
                        controls
                            .landing_light,

                    flaps:
                        controls.flaps,

                    trim:
                        controls.trim,
                };
            },
            [
                controls,
                engineRunning,
            ]
        );


    /* ========================================================
       CONTEXT VALUE
       ======================================================== */

    const value = {
        controls,

        setControl,


        activeChecklistId,

        currentChecklist,

        selectChecklist,


        currentStepIndex,

        currentStep,

        completedStepIds,

        progressPercentage,

        isChecklistComplete,


        sequenceProgress,

        markManualStepComplete,

        markCommsStepComplete,


        feedback,

        mistakes,

        lastEvent,


        instruments,

        engineRunning,


        resetChecklistProgress,

        resetAllControls,

        hardResetAll,
    };


    /* ========================================================
       PROVIDER
       ======================================================== */

    return (
        <SimulatorContext.Provider
            value={
                value
            }
        >
            {
                children
            }
        </SimulatorContext.Provider>
    );
}


/* ============================================================
   USE SIMULATOR HOOK
   ============================================================ */

export function useSimulator() {
    const context =
        useContext(
            SimulatorContext
        );


    if (
        !context
    ) {
        throw new Error(
            "useSimulator must be used inside SimulatorProvider"
        );
    }


    return context;
}