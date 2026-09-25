import { contactFormEndpoint, talkMailto } from "./siteContact";

export async function sendEnquiry(
  fields: Record<string, string>,
  subject: string,
  mailtoBody: string,
) {
  try {
    const res = await fetch(contactFormEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...fields,
        _replyto: fields.email,
        _subject: subject,
        _template: "table",
        _captcha: "false",
      }),
    });
    if (!res.ok) throw new Error("send failed");
  } catch {
    window.location.href = `${talkMailto}&body=${encodeURIComponent(mailtoBody)}`;
    throw new Error("fallback");
  }
}
