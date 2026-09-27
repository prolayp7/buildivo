"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductQuestion } from "@/lib/api";
import { askProductQuestion } from "@/lib/storefront-client";

const date = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Customer questions and the shop's answers. New questions are held for moderation before they appear. */
export function ProductQuestions({ productSlug, questions, className }: { productSlug: string; questions: ProductQuestion[]; className?: string }) {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await askProductQuestion(productSlug, { name: name.trim(), question: question.trim() });
      setSent(true);
      setQuestion("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Your question could not be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="questions" aria-labelledby="questions-title" className={className}>
      <h2 id="questions-title" className="mb-4 text-headline-sm font-headline-sm font-bold text-graphite-900">Customer Questions &amp; Answers</h2>

      {questions.length === 0 ? (
        <p className="mb-6 text-body-sm font-body-sm text-text-secondary">No questions yet - ask the first one below.</p>
      ) : (
        <ul className="mb-6 flex flex-col gap-4">
          {questions.map((item) => (
            <li key={item.id} className="rounded-xl border border-border-default bg-surface-white p-4">
              <p className="text-body-sm font-body-sm font-bold text-text-primary">Q: {item.question}</p>
              <p className="mt-0.5 text-label-sm font-label-sm text-text-secondary">Asked by {item.name} · {date(item.createdAt)}</p>
              {item.answers.length === 0 ? (
                <p className="mt-3 text-label-sm font-label-sm text-text-secondary">Not answered yet.</p>
              ) : (
                item.answers.map((answer) => (
                  <div key={answer.id} className="mt-3 border-l-2 border-orange-300 pl-3">
                    <p className="text-body-sm font-body-sm text-text-primary">{answer.answer}</p>
                    <p className="mt-0.5 text-label-sm font-label-sm text-text-secondary">Answered by the Buildivo team · {date(answer.createdAt)}</p>
                  </div>
                ))
              )}
            </li>
          ))}
        </ul>
      )}

      {sent ? (
        <p role="status" className="rounded-lg bg-success-100 px-4 py-3 text-body-sm font-body-sm text-success-500">Thanks - your question has been sent. It will appear here once our team has reviewed it.</p>
      ) : (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-border-default bg-surface-white p-4 sm:grid-cols-[220px_1fr]">
          <div>
            <Label htmlFor="qna-name" className="mb-1">Your name</Label>
            <input id="qna-name" required value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoComplete="name" className="h-10 w-full rounded-md border border-border-default px-3 text-body-sm" />
          </div>
          <div>
            <Label htmlFor="qna-question" className="mb-1">Ask a question about this product</Label>
            <Textarea id="qna-question" required minLength={3} maxLength={1000} rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600">{busy ? "Sending…" : "Ask question"}</Button>
            {error && <p role="alert" className="text-body-sm font-body-sm text-error-500">{error}</p>}
          </div>
        </form>
      )}
    </section>
  );
}
