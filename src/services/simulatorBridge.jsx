/*
|--------------------------------------------------------------------------
| SIMULATOR BRIDGE
|--------------------------------------------------------------------------
|
| Handles communication between the React frontend and the Raspberry Pi
| hardware bridge.
|
| Physical control flow:
|
| Physical Switch / Button
|          ↓
| Raspberry Pi GPIO / PCA9555
|          ↓
| backend/hardware_bridge.py
|          ↓
| WebSocket :8001/ws/hardware
|          ↓
| simulatorBridge
|          ↓
| SimulatorContext
|          ↓
| setControl(controlId, value, "gpio")
|          ↓
| Checklist / Grading / UI
|
| Guidance LED flow:
|
| Current Checklist Step
|          ↓
| ChecklistExecution
|          ↓
| simulatorBridge
|          ↓
| WebSocket :8001/ws/hardware
|          ↓
| backend/hardware_bridge.py
|          ↓
| PCA9555 #2
|          ↓
| Guidance LED
|
|--------------------------------------------------------------------------
*/


export const simulatorBridge = {

  /* ========================================================================
     HARDWARE WEBSOCKET
     ======================================================================== */

  connectHardwareEvents(
    onEvent,
    guidanceControlId = undefined
  ) {
    let socket = null;

    let reconnectTimer = null;

    let manuallyClosed = false;


    /* ----------------------------------------------------------------------
       CREATE CONNECTION
       ---------------------------------------------------------------------- */

    const connect = () => {

      /*
       * Use the hostname from the browser automatically.
       *
       * Examples:
       *
       * If the frontend is opened using:
       *
       * http://tecnam-cockpit.local
       *
       * WebSocket becomes:
       *
       * ws://tecnam-cockpit.local:8001/ws/hardware
       *
       *
       * If Chromium is running directly on the Raspberry Pi using:
       *
       * http://127.0.0.1
       *
       * WebSocket becomes:
       *
       * ws://127.0.0.1:8001/ws/hardware
       */

      const protocol =
        window.location.protocol === "https:"
          ? "wss"
          : "ws";


      const hostname =
        window.location.hostname ||
        "127.0.0.1";


      const socketUrl =
        `${protocol}://${hostname}:8001/ws/hardware`;


      console.log(
        "Connecting to physical cockpit:",
        socketUrl
      );


      /* --------------------------------------------------------------------
         OPEN WEBSOCKET
         -------------------------------------------------------------------- */

      socket =
        new WebSocket(
          socketUrl
        );


      /* --------------------------------------------------------------------
         CONNECTED
         -------------------------------------------------------------------- */

      socket.onopen = () => {
        console.log(
          "✅ Physical cockpit connected"
        );


        /*
         * GUIDANCE LED
         *
         * undefined:
         * This WebSocket connection does not control
         * the guidance LEDs.
         *
         * null:
         * Turn all guidance LEDs OFF.
         *
         * string:
         * Turn the requested guidance LED ON.
         *
         * Examples:
         *
         * "master_switch"
         * "fuel_pump"
         * "ignition"
         * "choke"
         * "carb_heat"
         */

        if (
          guidanceControlId !==
          undefined
        ) {

          socket.send(
            JSON.stringify({
              type: "guidance",

              controlId:
                guidanceControlId,
            })
          );


          console.log(
            "Guidance LED request:",
            guidanceControlId
          );
        }
      };


      /* --------------------------------------------------------------------
         RECEIVE HARDWARE EVENT
         -------------------------------------------------------------------- */

      socket.onmessage = (event) => {
        try {
          const data =
            JSON.parse(
              event.data
            );


          console.log(
            "Hardware event:",
            data
          );


          /*
           * hardware_bridge.py sends:
           *
           *
           * INITIAL SNAPSHOT
           *
           * {
           *   type: "snapshot",
           *   states: {
           *     master_switch: "ON",
           *     generator: "ON",
           *     ...
           *   }
           * }
           *
           *
           * LIVE CONTROL EVENT
           *
           * {
           *   type: "control",
           *   controlId: "master_switch",
           *   value: "ON",
           *   source: "gpio"
           * }
           *
           *
           * GUIDANCE ACKNOWLEDGEMENT
           *
           * {
           *   type: "guidance_ack",
           *   controlId: "master_switch"
           * }
           *
           *
           * We do NOT perform checklist grading here.
           *
           * SimulatorContext / ChecklistExecution
           * decides what to do with received events.
           */

          if (
            typeof onEvent ===
            "function"
          ) {

            onEvent(
              data
            );
          }

        } catch (error) {

          console.error(
            "Invalid hardware WebSocket message:",
            error
          );

        }
      };


      /* --------------------------------------------------------------------
         ERROR
         -------------------------------------------------------------------- */

      socket.onerror = (error) => {

        console.error(
          "Hardware WebSocket error:",
          error
        );

      };


      /* --------------------------------------------------------------------
         DISCONNECTED
         -------------------------------------------------------------------- */

      socket.onclose = () => {

        console.log(
          "⚠️ Physical cockpit disconnected"
        );


        socket = null;


        /*
         * Automatically reconnect every 2 seconds.
         *
         * This allows the frontend to recover if:
         *
         * - hardware_bridge.py restarts
         * - Raspberry Pi service restarts
         * - WebSocket temporarily disconnects
         */

        if (
          !manuallyClosed
        ) {

          console.log(
            "Attempting hardware reconnection..."
          );


          reconnectTimer =
            window.setTimeout(
              () => {

                connect();

              },
              2000
            );
        }
      };
    };


    /* ----------------------------------------------------------------------
       START CONNECTION
       ---------------------------------------------------------------------- */

    connect();


    /* ----------------------------------------------------------------------
       CLEANUP FUNCTION
       ----------------------------------------------------------------------
       React calls this when the component/provider unmounts.

       If this connection controls checklist guidance,
       turn all guidance LEDs OFF before closing.
       ---------------------------------------------------------------------- */

    return () => {

      manuallyClosed = true;


      if (
        reconnectTimer
      ) {

        window.clearTimeout(
          reconnectTimer
        );


        reconnectTimer =
          null;
      }


      if (
        socket
      ) {

        /*
         * Turn guidance OFF before closing this
         * checklist guidance connection.
         *
         * Connections where guidanceControlId is
         * undefined do NOT affect the LEDs.
         */

        if (
          guidanceControlId !==
            undefined &&
          socket.readyState ===
            WebSocket.OPEN
        ) {

          try {

            socket.send(
              JSON.stringify({
                type: "guidance",
                controlId: null,
              })
            );

          } catch (error) {

            console.error(
              "Unable to turn guidance LEDs off:",
              error
            );

          }
        }


        /*
         * Only close if the socket is not
         * already closed.
         */

        if (
          socket.readyState ===
            WebSocket.OPEN ||
          socket.readyState ===
            WebSocket.CONNECTING
        ) {

          socket.close();

        }


        socket = null;
      }
    };
  },


  /* ========================================================================
     FRONTEND CONTROL COMMAND
     ========================================================================
     This is currently retained for older frontend/demo code.

     Physical cockpit controls do NOT need to call this function.

     Their events travel:

     hardware_bridge.py
            ↓
     WebSocket
            ↓
     connectHardwareEvents()
     ======================================================================== */

  async sendControlCommand(
    payload
  ) {

    console.log(
      "SIMULATED CONTROL:",
      payload
    );


    return {
      success: true,
      payload,
    };
  },


  /* ========================================================================
     AI GUIDANCE
     ========================================================================
     Placeholder for a future local AI guidance endpoint.
     ======================================================================== */

  async getAiGuidance(
    step
  ) {

    return {
      message:
        `Complete the "${step.title}" step according to the checklist.`,
    };
  },


  /* ========================================================================
     COMMUNICATION EVALUATION
     ========================================================================
     Placeholder for communication evaluation.

     Your actual communication system can later connect this to the
     local FastAPI / speech recognition / deterministic communication
     validator.
     ======================================================================== */

  async evaluateCommunication(
    transcript
  ) {

    console.log(
      "AI communication placeholder:",
      transcript
    );


    return {
      correct: true,
      score: 100,
    };
  },
};