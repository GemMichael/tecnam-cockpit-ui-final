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

const SimulatorContext = createContext(null);

function matchesExpected(expected, value) {
    if (Array.isArray(expected)) {
        return expected.includes(value);
    }

    return expected === value;
}

export function SimulatorProvider({
    children,
}) {
    const [
        controls,
        setControls,
    ] = useState(initialControls);

    const [
        activeChecklistId,
        setActiveChecklistId,
    ] = useState(
        "cockpit-inspection"
    );

    const [
        currentStepIndex,
        setCurrentStepIndex,
    ] = useState(0);

    const [
        completedStepIds,
        setCompletedStepIds,
    ] = useState([]);

    const [
        sequenceProgress,
        setSequenceProgress,
    ] = useState(0);

    const [
        feedback,
        setFeedback,
    ] = useState(
        "Operate the required cockpit control for the current checklist step."
    );

    const [
        mistakes,
        setMistakes,
    ] = useState([]);

    const [
        engineRunning,
        setEngineRunning,
    ] = useState(false);

    const [
        lastEvent,
        setLastEvent,
    ] = useState(null);

    const currentChecklist =
        useMemo(() => {
            return (
                getChecklistById(
                    activeChecklistId
                ) || checklists[0]
            );
        }, [activeChecklistId]);

    const currentStep =
        currentChecklist.steps[
        currentStepIndex
        ] || null;

    const isChecklistComplete =
        currentStepIndex >=
        currentChecklist.steps.length;

    const progressPercentage =
        currentChecklist.steps.length === 0
            ? 0
            : Math.round(
                (completedStepIds.length /
                    currentChecklist.steps.length) *
                100
            );

    const resetChecklistProgress =
        useCallback(() => {
            setCurrentStepIndex(0);
            setCompletedStepIds([]);
            setSequenceProgress(0);
            setFeedback(
                "Checklist progress reset."
            );
        }, []);

    const resetAllControls =
        useCallback(() => {
            setControls(initialControls);
            setEngineRunning(false);
            setLastEvent(null);
            setFeedback(
                "All controls reset to their default state."
            );
        }, []);

    const hardResetAll =
        useCallback(() => {
            setControls(initialControls);
            setEngineRunning(false);
            setLastEvent(null);
            setCurrentStepIndex(0);
            setCompletedStepIds([]);
            setSequenceProgress(0);
            setMistakes([]);
            setFeedback(
                "Simulator reset. Ready for checklist execution."
            );
        }, []);

    const selectChecklist =
        useCallback((checklistId) => {
            setActiveChecklistId(checklistId);
            setCurrentStepIndex(0);
            setCompletedStepIds([]);
            setSequenceProgress(0);
            setFeedback(
                "Checklist changed. Start with the first step."
            );
        }, []);

    const completeStep =
        useCallback(
            (step) => {
                setCompletedStepIds(
                    (previous) => {
                        if (
                            previous.includes(step.id)
                        ) {
                            return previous;
                        }

                        return [
                            ...previous,
                            step.id,
                        ];
                    }
                );

                setSequenceProgress(0);

                const nextIndex =
                    currentStepIndex + 1;

                if (
                    nextIndex >=
                    currentChecklist.steps.length
                ) {
                    setFeedback(
                        `${currentChecklist.title} checklist complete.`
                    );
                } else {
                    setFeedback(
                        "Correct. Proceed to the next step."
                    );
                }

                setCurrentStepIndex(nextIndex);
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
    | React buttons call this:
    | setControl("master_switch", "ON", "ui")
    |
    | LATER:
    | Python / GPIO / WebSocket can call the SAME function:
    | setControl("master_switch", "ON", "gpio")
    |
    | This is why the checklist logic is kept here and not inside the button.
    |--------------------------------------------------------------------------
    */

    const setControl = useCallback(
        (
            controlId,
            value,
            source = "ui"
        ) => {
            setControls((previous) => ({
                ...previous,
                [controlId]: value,
            }));

            setLastEvent({
                controlId,
                value,
                source,
                timestamp: Date.now(),
            });

            // Very simple engine simulation for frontend demo only
            if (
                controlId === "ignition" &&
                value === "START"
            ) {
                setEngineRunning(true);
            }

            if (
                controlId === "ignition" &&
                value === "OFF"
            ) {
                setEngineRunning(false);
            }

            if (
                !currentStep ||
                isChecklistComplete
            ) {
                setFeedback(
                    `${controlId} set to ${value}.`
                );
                return;
            }

            if (
                currentStep.type === "manual" ||
                currentStep.type === "future"
            ) {
                setFeedback(
                    `${getOptionLabel(
                        controlId,
                        value
                    )} selected. Current checklist step requires manual confirmation.`
                );
                return;
            }

            if (currentStep.type === "control") {
                if (
                    currentStep.controlId !== controlId
                ) {
                    setFeedback(
                        `${getOptionLabel(
                            controlId,
                            value
                        )} selected. Current step is "${currentStep.title}".`
                    );
                    return;
                }

                const correct = matchesExpected(
                    currentStep.expected,
                    value
                );

                if (correct) {
                    completeStep(currentStep);
                    return;
                }

                setMistakes((previous) => [
                    ...previous,
                    {
                        id: Date.now(),
                        stepId: currentStep.id,
                        controlId,
                        value,
                    },
                ]);

                setFeedback(
                    `Incorrect setting for ${currentStep.title}. Expected: ${currentStep.expectedLabel}.`
                );

                return;
            }

            if (currentStep.type === "sequence") {
                if (
                    currentStep.controlId !== controlId
                ) {
                    return;
                }

                const expectedValue =
                    currentStep.sequence[
                    sequenceProgress
                    ];

                if (value === expectedValue) {
                    const nextProgress =
                        sequenceProgress + 1;

                    if (
                        nextProgress >=
                        currentStep.sequence.length
                    ) {
                        completeStep(currentStep);
                        return;
                    }

                    setSequenceProgress(nextProgress);

                    const nextExpected =
                        currentStep.sequence[
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

                setMistakes((previous) => [
                    ...previous,
                    {
                        id: Date.now(),
                        stepId: currentStep.id,
                        controlId,
                        value,
                    },
                ]);

                if (
                    value ===
                    currentStep.sequence[0]
                ) {
                    setSequenceProgress(1);
                } else {
                    setSequenceProgress(0);
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

    const markManualStepComplete =
        useCallback(() => {
            if (!currentStep) return;

            if (
                currentStep.type === "manual" ||
                currentStep.type === "future"
            ) {
                completeStep(currentStep);
            }
        }, [currentStep, completeStep]);

    const markCommsStepComplete =
        useCallback(() => {
            if (!currentStep) {
                return;
            }

            if (
                currentStep.type === "comms"
            ) {
                completeStep(
                    currentStep
                );
            }
        }, [
            currentStep,
            completeStep,
        ]);

    const instruments = useMemo(() => {
        const voltmeter =
            controls.master_switch === "ON"
                ? controls.generator === "ON" &&
                    engineRunning
                    ? "14V"
                    : "12V"
                : "0V";

        const ammeter =
            controls.master_switch === "ON"
                ? controls.generator === "ON" &&
                    engineRunning
                    ? "CHARGING"
                    : "STANDBY"
                : "OFF";

        const fuelPressure =
            controls.fuel_pump === "ON"
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
                controls.transponder,
            landingLight:
                controls.landing_light,
            flaps: controls.flaps,
            trim: controls.trim,
        };
    }, [controls, engineRunning]);

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

    return (
        <SimulatorContext.Provider
            value={value}
        >
            {children}
        </SimulatorContext.Provider>
    );
}

export function useSimulator() {
    const context = useContext(
        SimulatorContext
    );

    if (!context) {
        throw new Error(
            "useSimulator must be used inside SimulatorProvider"
        );
    }

    return context;
}