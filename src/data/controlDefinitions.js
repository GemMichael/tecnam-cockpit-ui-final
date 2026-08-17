const option = (value, label = value) => ({
  value,
  label,
});

export const controlSections = [
  // =========================================================
  // ELECTRICAL
  // =========================================================
  {
    id: "electrical",
    title: "Electrical",
    description: "Primary aircraft electrical controls.",

    controls: [
      {
        id: "master_switch",
        label: "Master Switch",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "circuit_breakers",
        label: "Circuit Breakers",
        defaultValue: null,

        options: [
          option(
            "ALL_IN",
            "ALL IN"
          ),
        ],
      },

      {
        id: "generator",
        label: "Generator",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "avionics_master",
        label: "Avionic Master",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },
    ],
  },

  // =========================================================
  // ENGINE & FUEL
  // =========================================================
  {
    id: "fuel-engine",
    title: "Fuel & Engine",
    description:
      "Engine, fuel and ignition controls.",

    controls: [
      {
        id: "fuel_pump",
        label: "Electric Fuel Pump",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "fuel_selector",
        label: "Fuel Selector",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("LEFT"),
          option("RIGHT"),
        ],
      },

      {
        id: "throttle",
        label: "Throttle",
        defaultValue: "IDLE",

        options: [
          option("IDLE"),

          // Exact 1000 RPM is required
          // by the Run-Up checklist.
          option(
            "1000",
            "1000 RPM"
          ),

          // Used during engine starting
          // and shutdown.
          option(
            "1000_1200",
            "1000–1200 RPM"
          ),

          option(
            "1640",
            "1640 RPM"
          ),

          option(
            "FULL",
            "FULL POWER"
          ),
        ],
      },

      {
        id: "choke",
        label: "Choke",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "ignition",
        label: "Ignition Switch",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("LEFT"),
          option("RIGHT"),
          option("BOTH"),
          option("START"),
        ],
      },

      {
        id: "carb_heat",
        label: "Carburetor Heat",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "chronometer",
        label: "Chronometer / Clock",
        defaultValue: "STOPPED",

        options: [
          option(
            "STOPPED",
            "STOP"
          ),

          option(
            "RUNNING",
            "START"
          ),
        ],
      },
    ],
  },

  // =========================================================
  // LIGHTS
  // =========================================================
  {
    id: "lights",
    title: "Lights",
    description:
      "Aircraft lighting controls.",

    controls: [
      {
        id: "nav_light",
        label: "Navigation Light",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "strobe_light",
        label: "Strobe Light",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "landing_light",
        label: "Landing Light",
        defaultValue: "STBY",

        options: [
          option("OFF"),
          option("STBY"),
          option("ON"),
        ],
      },
    ],
  },

  // =========================================================
  // COMMUNICATION & NAVIGATION
  // =========================================================
  {
    id: "avionics",
    title:
      "Communication & Navigation",
    description:
      "Radio, intercom and navigation equipment.",

    controls: [
      {
        id: "intercom",
        label: "Intercom",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "radio",
        label: "Radio",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },

      {
        id: "transponder",
        label: "Transponder",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("STBY"),
          option("ALT"),
        ],
      },

      {
        id: "gps",
        label: "GPS",
        defaultValue: "OFF",

        options: [
          option("OFF"),
          option("ON"),
        ],
      },
    ],
  },

  // =========================================================
  // FLIGHT & CABIN
  // =========================================================
  {
    id: "flight-cabin",
    title: "Flight & Cabin",
    description:
      "Flight configuration and cabin controls.",

    controls: [
      {
        id: "parking_brake",
        label: "Parking Brake",
        defaultValue: "RELEASED",

        options: [
          option("RELEASED"),
          option("ENGAGED"),
        ],
      },

      {
        id: "flaps",
        label: "Flaps",
        defaultValue: "UP",

        options: [
          option("UP"),

          option(
            "TAKEOFF",
            "T/O"
          ),

          option("FULL"),
        ],
      },

      {
        id: "trim",
        label: "Trim",
        defaultValue: "NEUTRAL",

        options: [
          option("LEFT"),
          option("NEUTRAL"),
          option("RIGHT"),
        ],
      },

      {
        id: "seat",
        label: "Seat",
        defaultValue: "UNADJUSTED",

        options: [
          option("UNADJUSTED"),
          option("ADJUSTED"),
        ],
      },

      {
        id: "seatbelt",
        label:
          "Seatbelt & Harness",
        defaultValue:
          "UNFASTENED",

        options: [
          option("UNFASTENED"),
          option("FASTENED"),
        ],
      },

      {
        id: "canopy",
        label: "Canopy",
        defaultValue: "OPEN",

        options: [
          option("OPEN"),
          option("CLOSED"),
        ],
      },

      {
        id: "friction_lock",
        label:
          "Throttle Friction",
        defaultValue:
          "RELEASED",

        options: [
          option("RELEASED"),

          option(
            "ADJUSTED",
            "ADJUST"
          ),

          option("SET"),
        ],
      },
    ],
  },
];

// =============================================================
// FLATTEN ALL CONTROLS
// =============================================================

export const allControls =
  controlSections.flatMap(
    (section) =>
      section.controls
  );

// =============================================================
// INITIAL CONTROL STATES
// =============================================================

export const initialControls =
  Object.fromEntries(
    allControls.map(
      (control) => [
        control.id,
        control.defaultValue,
      ]
    )
  );

// =============================================================
// FIND A CONTROL
// =============================================================

export function getControlDefinition(
  controlId
) {
  return allControls.find(
    (control) =>
      control.id === controlId
  );
}

// =============================================================
// GET DISPLAY LABEL
// =============================================================

export function getOptionLabel(
  controlId,
  value
) {
  const control =
    getControlDefinition(
      controlId
    );

  if (!control) {
    return value;
  }

  const option =
    control.options.find(
      (item) =>
        item.value === value
    );

  return (
    option?.label || value
  );
}