function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  get GITHUB_CLIENT_ID() { return env("GITHUB_CLIENT_ID"); },
  get GITHUB_CLIENT_SECRET() { return env("GITHUB_CLIENT_SECRET"); },
  get COOKIE_SECRET() { return env("COOKIE_SECRET"); },
};
