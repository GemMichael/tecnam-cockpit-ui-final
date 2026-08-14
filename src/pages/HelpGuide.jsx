import {
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Search,
  Send,
} from "lucide-react";

import { useMemo, useState } from "react";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";

const faqs = [
  {
    question:
      "How do I start a checklist?",
    answer:
      "Open Choose Checklist, select the required procedure, then press Start Checklist.",
  },
  {
    question:
      "How will physical switches work?",
    answer:
      "The Raspberry Pi will detect each switch state through GPIO or an I/O expansion board. Python will send that state to this React interface.",
  },
  {
    question:
      "How will the AI communication feature work?",
    answer:
      "The microphone audio will later be processed by the Python AI service. The transcription and communication score will then be sent back to the React interface.",
  },
  {
    question:
      "Can the trainer work offline?",
    answer:
      "The frontend is designed to run locally. The final offline capability will depend on the speech-recognition and AI model selected later.",
  },
  {
    question:
      "Where can I see my scores?",
    answer:
      "Open Performance for detailed scores or History to review completed training sessions.",
  },
  {
    question:
      "Can I repeat a checklist?",
    answer:
      "Yes. Any checklist can be started again from the Choose Checklist page.",
  },
];

function HelpGuide() {
  const [search, setSearch] =
    useState("");

  const [openIndex, setOpenIndex] =
    useState(0);

  const [sent, setSent] =
    useState(false);

  const filtered = useMemo(() => {
    return faqs.filter((faq) =>
      `${faq.question} ${faq.answer}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const submitInquiry = (event) => {
    event.preventDefault();

    /*
    LATER:
    Send this form to Python/FastAPI
    or an online email service/database.
    */

    setSent(true);
  };

  return (
    <>
      <PageHeader
        title="Help & Guide"
        subtitle="Find answers about the cockpit trainer, controls, checklist system and future AI integration."
      />

      <GlassCard className="mb-6 p-4">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search help topics..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none focus:border-blue-500"
          />
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <CircleHelp className="text-blue-600" />

            <h2 className="text-xl font-bold">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-6 space-y-3">
            {filtered.map(
              (faq, index) => {
                const open =
                  openIndex === index;

                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white/60"
                  >
                    <button
                      onClick={() =>
                        setOpenIndex(
                          open ? -1 : index
                        )
                      }
                      className="flex w-full items-center justify-between p-5 text-left"
                    >
                      <span className="font-semibold">
                        {faq.question}
                      </span>

                      {open ? (
                        <ChevronUp
                          size={18}
                        />
                      ) : (
                        <ChevronDown
                          size={18}
                        />
                      )}
                    </button>

                    {open && (
                      <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-500">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Send an Inquiry
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Need more help?
          </h2>

          <form
            onSubmit={submitInquiry}
            className="mt-6 space-y-4"
          >
            <input
              required
              placeholder="Your name"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              required
              type="email"
              placeholder="Email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
            />

            <textarea
              required
              rows={6}
              placeholder="How can we help?"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-semibold text-white"
            >
              <Send size={17} />
              Send Inquiry
            </button>

            {sent && (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                ✓ Demo inquiry submitted.
              </div>
            )}
          </form>
        </GlassCard>
      </div>
    </>
  );
}

export default HelpGuide;