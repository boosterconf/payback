function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  get GITHUB_CLIENT_ID() { return env("GITHUB_CLIENT_ID"); },
  get GITHUB_CLIENT_SECRET() { return env("GITHUB_CLIENT_SECRET"); },
  get COOKIE_SECRET() { return env("COOKIE_SECRET"); },
  get DATABASE_URL() { return env("DATABASE_URL"); },
  get NEON_PROJECT_ID() { return env("NEON_PROJECT_ID"); },
  get VERCEL_TEAM_SLUG() { return env("VERCEL_TEAM_SLUG"); },
  get VERCEL_PROJECT_NAME() { return env("VERCEL_PROJECT_NAME"); },
  get FIKEN_TOKEN() { return env("FIKEN_TOKEN"); },
};
