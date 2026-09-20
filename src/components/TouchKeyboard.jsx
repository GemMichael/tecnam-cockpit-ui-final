import {
  useEffect,
  useState,
} from "react";

const NUMBER_ROW = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
];

const LETTER_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

function TouchKey({
  children,
  onPress,
  className = "",
  ariaLabel,
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onPointerDown={(event) => {
        event.preventDefault();

        onPress?.();
      }}
      className={`
        min-h-12
        min-w-12
        select-none
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        text-base
        font-semibold
        text-slate-700
        shadow-sm
        transition
        active:scale-[0.98]
        active:bg-blue-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function TouchKeyboard({
  open,
  mode = "text",
  value = "",
  onChange,
  onDone,
  title = "Touch Keyboard",
  maxLength,
  masked = false,
}) {
  const [
    shift,
    setShift,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      setShift(false);
    }
  }, [
    open,
    mode,
  ]);

  if (!open) {
    return null;
  }

  function applyValue(
    nextValue
  ) {
    const limitedValue =
      Number.isFinite(
        maxLength
      )
        ? nextValue.slice(
            0,
            maxLength
          )
        : nextValue;

    onChange?.(
      limitedValue
    );
  }

  function append(
    character
  ) {
    if (
      Number.isFinite(
        maxLength
      ) &&
      value.length >=
        maxLength
    ) {
      return;
    }

    const output =
      shift &&
      /^[a-z]$/i.test(
        character
      )
        ? character.toUpperCase()
        : character;

    applyValue(
      `${value}${output}`
    );

    if (
      shift &&
      /^[a-z]$/i.test(
        character
      )
    ) {
      setShift(false);
    }
  }

  function backspace() {
    applyValue(
      value.slice(
        0,
        -1
      )
    );
  }

  function clear() {
    applyValue("");
  }

  const preview =
    masked
      ? "•".repeat(
          value.length
        )
      : value;

  return (
    <div
      className="
        fixed
        inset-x-0
        bottom-0
        z-[100]
        border-t
        border-slate-200
        bg-white/95
        shadow-[0_-18px_60px_rgba(15,60,110,0.18)]
        backdrop-blur-xl
      "
      role="dialog"
      aria-label={title}
    >
      <div className="mx-auto max-w-[1280px] px-4 pb-4 pt-3">
        <div className="mb-3 flex items-center justify-between gap-4">

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              {title}
            </p>

            <p className="mt-1 truncate text-sm text-slate-500">
              {preview ||
                "Tap the keys below"}
            </p>
          </div>

          <TouchKey
            onPress={
              onDone
            }
            className="border-blue-600 bg-blue-600 px-6 text-white active:bg-blue-700"
          >
            Done
          </TouchKey>
        </div>

        {mode ===
        "numeric" ? (
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2">

            {[
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
            ].map(
              (
                digit
              ) => (
                <TouchKey
                  key={
                    digit
                  }
                  onPress={() =>
                    append(
                      digit
                    )
                  }
                >
                  {digit}
                </TouchKey>
              )
            )}

            <TouchKey
              onPress={
                clear
              }
              className="text-sm text-slate-500"
            >
              Clear
            </TouchKey>

            <TouchKey
              onPress={() =>
                append(
                  "0"
                )
              }
            >
              0
            </TouchKey>

            <TouchKey
              onPress={
                backspace
              }
              ariaLabel="Backspace"
            >
              ⌫
            </TouchKey>
          </div>
        ) : (
          <div className="space-y-2">

            <div className="flex justify-center gap-2">
              {NUMBER_ROW.map(
                (
                  character
                ) => (
                  <TouchKey
                    key={
                      character
                    }
                    onPress={() =>
                      append(
                        character
                      )
                    }
                    className="flex-1"
                  >
                    {
                      character
                    }
                  </TouchKey>
                )
              )}
            </div>

            {LETTER_ROWS.map(
              (
                row,
                rowIndex
              ) => (
                <div
                  key={
                    rowIndex
                  }
                  className="flex justify-center gap-2"
                >
                  {row.map(
                    (
                      character
                    ) => (
                      <TouchKey
                        key={
                          character
                        }
                        onPress={() =>
                          append(
                            character
                          )
                        }
                        className="flex-1"
                      >
                        {shift
                          ? character.toUpperCase()
                          : character}
                      </TouchKey>
                    )
                  )}
                </div>
              )
            )}

            <div className="flex justify-center gap-2">

              <TouchKey
                onPress={() =>
                  setShift(
                    (
                      previous
                    ) =>
                      !previous
                  )
                }
                className={
                  shift
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : ""
                }
              >
                Shift
              </TouchKey>

              <TouchKey
                onPress={() =>
                  append(
                    "_"
                  )
                }
              >
                _
              </TouchKey>

              <TouchKey
                onPress={() =>
                  append(
                    "-"
                  )
                }
              >
                -
              </TouchKey>

              <TouchKey
                onPress={() =>
                  append(
                    " "
                  )
                }
                className="flex-[4]"
              >
                Space
              </TouchKey>

              <TouchKey
                onPress={
                  backspace
                }
                ariaLabel="Backspace"
                className="px-5"
              >
                ⌫
              </TouchKey>

              <TouchKey
                onPress={
                  clear
                }
                className="px-5 text-sm text-slate-500"
              >
                Clear
              </TouchKey>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TouchKeyboard;