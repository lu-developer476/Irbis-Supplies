export async function handler(event) {
  if (event?.httpMethod && event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET", "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Método no permitido" }),
    };
  }

  const monthlyRate = 0.08;
  const baseDate = new Date("2024-01-01T00:00:00");
  const now = new Date();
  const months = Math.max(0,
    (now.getFullYear() - baseDate.getFullYear()) * 12 +
    (now.getMonth() - baseDate.getMonth())
  );
  const factor = Math.pow(1 + monthlyRate, months);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
    body: JSON.stringify({ factor }),
  };
}
