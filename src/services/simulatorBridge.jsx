/*
|--------------------------------------------------------------------------
| SIMULATOR BRIDGE
|--------------------------------------------------------------------------
|
| FRONTEND-ONLY VERSION
|
| Right now these functions only simulate communication.
|
| LATER:
|
| React
|    ↓ WebSocket / HTTP
| Python FastAPI Backend
|    ↓
| Raspberry Pi GPIO / MCP23017 / ADS1115
|    ↓
| Physical cockpit controls
|
| AI:
|
| Headset Microphone
|    ↓
| Python
|    ↓
| Whisper / Speech-to-Text
|    ↓
| Communication Checker
|    ↓
| React receives result here
|
*/

export const simulatorBridge = {
  /**
   * Later:
   * const socket = new WebSocket("ws://localhost:8000/ws/hardware")
   */
  connectHardwareEvents(onEvent) {
    console.log(
      "Simulator bridge ready. Hardware connection not enabled yet."
    );

    // LATER:
    //
    // const socket = new WebSocket(
    //   "ws://localhost:8000/ws/hardware"
    // );
    //
    // socket.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   onEvent(data);
    // };
    //
    // return () => socket.close();

    return () => {};
  },

  /**
   * Frontend simulator button.
   *
   * Later this could send a command to Python,
   * or simply be removed when physical controls are used.
   */
  async sendControlCommand(payload) {
    console.log("SIMULATED CONTROL:", payload);

    return {
      success: true,
      payload,
    };
  },

  /**
   * LATER:
   * Replace with AI guidance endpoint.
   *
   * Example:
   *
   * POST http://localhost:8000/api/ai/guidance
   */
  async getAiGuidance(step) {
    return {
      message: `Complete the "${step.title}" step according to the checklist.`,
    };
  },

  /**
   * LATER:
   * Audio/ATC transcription result will be passed here.
   *
   * Example response from Python:
   *
   * {
   *   transcript: "Binalonan Radio RP-C1234...",
   *   correct: true,
   *   score: 95
   * }
   */
  async evaluateCommunication(transcript) {
    console.log("AI communication placeholder:", transcript);

    return {
      correct: true,
      score: 100,
    };
  },
};