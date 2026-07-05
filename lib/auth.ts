export const AUTH_COOKIE = "student_portfolio_auth";

export async function buildAuthToken() {
  const password = process.env.pass;
  if (!password) return "";

  const input = new TextEncoder().encode(`student-portfolio:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", input);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
