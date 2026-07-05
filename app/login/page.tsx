import { BrandMark } from "@/components/BrandMark";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const paramValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const hasError = paramValue(params.error) === "1";
  const nextPath = paramValue(params.next) || "/";

  return (
    <main className="auth-page">
      <form className="auth-card" action="/api/login" method="post">
        <BrandMark className="auth-logo" />
        <h1>Student Competency Portfolio</h1>
        <p>Enter the portfolio password to continue.</p>
        <input type="hidden" name="next" value={nextPath} />
        <label>
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" autoFocus required />
        </label>
        {hasError && <div className="auth-error">That password did not match.</div>}
        <button type="submit">Continue</button>
      </form>
    </main>
  );
}
