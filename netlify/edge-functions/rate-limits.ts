export default function handler(): undefined {
  // Netlify enforces the rate limit from this function's config
  // before executing the handler. No in-memory counter is needed.
  return;
}

export const config = {
  path: "/*",
  preferStatic: true,
  rateLimit: {
    windowLimit: 120,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
