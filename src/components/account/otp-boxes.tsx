"use client";
import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import styles from "./otp-boxes.module.css";

const OTP_LENGTH = 6;

/** Six single-digit boxes standing in for one code value, auto-advancing on
 * type/backspace and accepting a full pasted code in any box. */
export function OtpBoxes({ value, onChange, disabled, invalid }: { value: string; onChange: (value: string) => void; disabled?: boolean; invalid?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? "");

  function fillFrom(index: number, raw: string) {
    const digitsOnly = raw.replace(/\D/g, "");
    if (!digitsOnly) return;
    const next = digits.slice();
    for (let i = 0; i < digitsOnly.length && index + i < OTP_LENGTH; i++) next[index + i] = digitsOnly[i];
    onChange(next.join(""));
    refs.current[Math.min(index + digitsOnly.length, OTP_LENGTH - 1)]?.focus();
  }

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    if (!raw) { const next = digits.slice(); next[index] = ""; onChange(next.join("")); return; }
    fillFrom(index, raw);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
    else if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const raw = event.clipboardData.getData("text");
    if (!/\d/.test(raw)) return;
    event.preventDefault();
    fillFrom(index, raw);
  }

  return (
    <div className={styles.row}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { refs.current[index] = element; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          aria-invalid={invalid}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
