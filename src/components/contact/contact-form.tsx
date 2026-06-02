"use client";

import { type FormEvent, useState } from "react";
import { AppIcon } from "@/components/home/icons";
import { getApiErrorMessage } from "@/lib/api";
import { submitSupportRequest } from "@/lib/support-api";

const initialForm = {
  email: "",
  message: "",
  name: "",
  subject: "",
};

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      email: form.email.trim(),
      message: form.message.trim(),
      name: form.name.trim(),
      subject: form.subject.trim(),
    };

    if (!payload.email || !payload.subject || !payload.message) {
      setErrorMessage("Please fill in your email, subject, and message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await submitSupportRequest(payload);
      setForm(initialForm);
      setSuccessMessage("Thanks for reaching out. The superadmin team will review your message shortly.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to send your message. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-4">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        placeholder="Name"
        autoComplete="name"
        className="h-14 w-full rounded-none border-0 bg-[#F6F7FA] px-5 text-[15px] text-[#1F2937] outline-none placeholder:text-[#7A8190]"
      />
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
        placeholder="Email"
        autoComplete="email"
        required
        className="h-14 w-full rounded-none border-0 bg-[#F6F7FA] px-5 text-[15px] text-[#1F2937] outline-none placeholder:text-[#7A8190]"
      />
      <input
        type="text"
        name="subject"
        value={form.subject}
        onChange={(event) => updateField("subject", event.target.value)}
        placeholder="Subject"
        required
        className="h-14 w-full rounded-none border-0 bg-[#F6F7FA] px-5 text-[15px] text-[#1F2937] outline-none placeholder:text-[#7A8190]"
      />
      <textarea
        name="message"
        value={form.message}
        onChange={(event) => updateField("message", event.target.value)}
        placeholder="Message"
        rows={8}
        required
        className="w-full resize-none rounded-none border-0 bg-[#F6F7FA] px-5 py-4 text-[15px] text-[#1F2937] outline-none placeholder:text-[#7A8190]"
      />

      {errorMessage ? (
        <p className="rounded-[8px] bg-[#FFF5F5] px-4 py-3 text-sm font-medium text-[#D92D20]">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="rounded-[8px] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#159953]">{successMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-14 items-center justify-center gap-3 rounded-[10px] bg-[#314B6B] px-7 text-[15px] font-semibold text-white transition hover:bg-[#243B5A] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : "Send"}
        <AppIcon name="mailSend" className="h-5 w-5" />
      </button>
    </form>
  );
}
