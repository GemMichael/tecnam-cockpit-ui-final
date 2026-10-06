import {
  Bell,
  Monitor,
  Power,
  Save,
} from "lucide-react";

import { useState } from "react";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";

const defaultSettings = {
  aiGuidance: true,
  audioInstructions: true,
  notifications: true,
  autoAdvance: false,
  microphone: true,
};

function Toggle({
  enabled,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`h-7 w-12 rounded-full p-1 transition ${enabled
          ? "bg-blue-600"
          : "bg-slate-300"
        }`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-white shadow transition ${enabled
            ? "translate-x-5"
            : ""
          }`}
      />
    </button>
  );
}

function Settings() {
  const [settings, setSettings] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "tecnamSettings"
        );

      return saved
        ? JSON.parse(saved)
        : defaultSettings;
    });

  const [saved, setSaved] =
    useState(false);

  const [
    shuttingDown,
    setShuttingDown,
  ] = useState(false);

  const [
    shutdownError,
    setShutdownError,
  ] = useState("");

  const updateSetting = (
    key,
    value
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const save = () => {
    localStorage.setItem(
      "tecnamSettings",
      JSON.stringify(settings)
    );

    setSaved(true);
  };

  const shutdownSystem = async () => {
    const confirmed = window.confirm(
      "Shut down the cockpit system?\n\nThe Raspberry Pi will safely power off."
    );

    if (!confirmed) {
      return;
    }

    setShuttingDown(true);
    setShutdownError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/system/poweroff",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Shutdown request failed."
        );
      }
    } catch (error) {
      console.error(
        "System shutdown failed:",
        error
      );

      setShutdownError(
        "Unable to shut down the system."
      );

      setShuttingDown(false);
    }
  };

  const items = [
    {
      key: "notifications",
      title: "Notifications",
      description:
        "Display alerts and training notifications.",
      icon: Bell,
    },
    {
      key: "autoAdvance",
      title: "Automatic Step Advance",
      description:
        "Automatically proceed after a correct physical control is detected.",
      icon: Monitor,
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure the walkthrough interface, audio and future simulator integrations."
      />

      <GlassCard className="p-6 md:p-8">
        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="flex items-center gap-4 py-5 first:pt-0 last:pb-0"
              >
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Icon size={20} />
                </div>

                <div className="flex-1">
                  <p className="font-bold">
                    {item.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>
                </div>

                <Toggle
                  enabled={
                    settings[item.key]
                  }
                  onChange={(value) =>
                    updateSetting(
                      item.key,
                      value
                    )
                  }
                />
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="mt-6 p-6">
        <h2 className="font-bold">
          Hardware Configuration
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Raspberry Pi cockpit services used by
          the training system.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Python API
            </label>

            <input
              value="http://localhost:8000"
              readOnly
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Hardware WebSocket
            </label>

            <input
              value="ws://localhost:8000/ws/hardware"
              readOnly
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-6 border border-red-100 p-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Power
                size={20}
                className="text-red-600"
              />

              <h2 className="font-bold text-slate-900">
                System Power
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Safely shut down the Raspberry Pi
              before disconnecting cockpit power.
            </p>

            {shutdownError && (
              <p className="mt-2 text-sm font-semibold text-red-600">
                {shutdownError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={shutdownSystem}
            disabled={shuttingDown}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Power size={18} />

            {shuttingDown
              ? "Shutting Down..."
              : "Shut Down System"}
          </button>
        </div>
      </GlassCard>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white"
        >
          <Save size={18} />
          Save Settings
        </button>

        {saved && (
          <span className="text-sm font-semibold text-emerald-600">
            ✓ Settings saved
          </span>
        )}
      </div>
    </>
  );
}

export default Settings;