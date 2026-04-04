function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  get SLACK_CLIENT_ID() { return env("SLACK_CLIENT_ID"); },
  get SLACK_CLIENT_SECRET() { return env("SLACK_CLIENT_SECRET"); },
  get SLACK_TEAM_ID() { return env("SLACK_TEAM_ID"); },
  get COOKIE_SECRET() { return env("COOKIE_SECRET"); },
  get VERCEL_TEAM_SLUG() { return env("VERCEL_TEAM_SLUG"); },
  get VERCEL_PROJECT_NAME() { return env("VERCEL_PROJECT_NAME"); },
  get FIKEN_TOKEN() { return env("FIKEN_TOKEN"); },
  get CRON_SECRET() { return env("CRON_SECRET"); },
};
