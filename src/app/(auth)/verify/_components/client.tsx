"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export function Client() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email...");
  const [input, setInput] = useState("");

  const resend = async () => {
    try {
      const res = await fetch("/api/mobile/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmcXZpYzB2NnN3ejFkbWV6cjFwb3lwYjAiLCJ2ZXJpZmllZCI6ZmFsc2UsImlhdCI6MTc1MDkyMDUxMX0.RADnvE5GJYasI8gB-jEtBrHlbzchJ6lQk6rkY4xKY74",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.message || "Verification failed.");
        return;
      }

      setStatus("success");
      setMessage("Email verified successfully! Redirecting to login...");
    } catch (err) {
      setStatus("error");
      setMessage("Something went wrong.");
    }
  };

  const sendOtp = async () => {
    try {
      const res = await fetch("/api/mobile/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmcXZpYzB2NnN3ejFkbWV6cjFwb3lwYjAiLCJ2ZXJpZmllZCI6ZmFsc2UsImlhdCI6MTc1MDkyMDUxMX0.RADnvE5GJYasI8gB-jEtBrHlbzchJ6lQk6rkY4xKY74",
        },
        body: JSON.stringify({ otp: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.message || "Verification failed.");
        return;
      }

      setStatus("success");
      setMessage("Email verified successfully! Redirecting to login...");
    } catch (err) {
      setStatus("error");
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-6 rounded-md shadow-md bg-white dark:bg-gray-800 w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {status === "loading" && "Verifying..."}
          {status === "success" && "Success ✅"}
          {status === "error" && "Verification Failed ❌"}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        <Button onClick={resend}>resend</Button>

        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={input}
          onChange={(e) => setInput(e)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button onClick={sendOtp}>Send</Button>
      </div>
    </div>
  );
}
