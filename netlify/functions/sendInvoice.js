import nodemailer from "nodemailer";

const json = (statusCode, message, extra = {}) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ message, ...extra }),
});

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { ...json(405, "Método no permitido"), headers: { Allow: "POST", "Content-Type": "application/json; charset=utf-8" } };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, "El cuerpo de la solicitud no contiene JSON válido");
  }

  const { email, name, items } = payload ?? {};
  const emailValue = typeof email === "string" ? email.trim() : "";
  const nameValue = typeof name === "string" ? name.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) ||
      !nameValue || nameValue.length > 120 ||
      !Array.isArray(items) || items.length === 0 || items.length > 50) {
    return json(400, "Datos incompletos o inválidos");
  }

  const normalizedItems = [];
  for (const item of items) {
    const itemName = typeof item?.name === "string" ? item.name.trim() : "";
    const quantity = item?.quantity;
    const price = item?.price;
    if (!itemName || itemName.length > 160 ||
        !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99 ||
        typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 1_000_000_000) {
      return json(400, "Uno o más artículos tienen datos inválidos");
    }
    normalizedItems.push({ name: itemName, quantity, price });
  }

  const total = normalizedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  if (!Number.isFinite(total) || total > Number.MAX_SAFE_INTEGER) {
    return json(400, "El total de la orden no es válido");
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Faltan las variables de entorno de correo");
    return json(503, "El envío de comprobantes no está configurado");
  }

  const orderId = `IRB-${Date.now()}`;
  const orderDate = new Date().toLocaleString("es-AR");
  const safeName = escapeHtml(nameValue);
  const itemsHtml = normalizedItems.map((item) => `
    <tr>
      <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(item.name)}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${item.price.toLocaleString("es-AR")}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${(item.quantity * item.price).toLocaleString("es-AR")}</td>
    </tr>
  `).join("");

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Irbis Supplies" <${process.env.GMAIL_USER}>`,
      to: emailValue,
      subject: `Comprobante de demostración ${orderId} - Irbis Supplies`,
      text: `Orden demo: ${orderId}\nFecha: ${orderDate}\nHola ${nameValue},\nTotal simulado: $${total.toLocaleString("es-AR")}\nIrbis Supplies`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2>Irbis Supplies</h2>
          <p><strong>Comprobante de demostración</strong></p>
          <p><strong>Orden:</strong> ${orderId}</p>
          <p><strong>Fecha:</strong> ${escapeHtml(orderDate)}</p>
          <p>Hola ${safeName},</p>
          <p>Este comprobante corresponde a una simulación; no representa una transacción real.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <h3 style="text-align:right;">Total simulado: $${total.toLocaleString("es-AR")}</h3>
        </div>
      `,
    });

    return json(200, "Comprobante de demostración enviado", { orderId });
  } catch (error) {
    console.error("Error enviando comprobante:", error);
    return json(500, "No se pudo enviar el comprobante");
  }
}
