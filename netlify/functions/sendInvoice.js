import nodemailer from "nodemailer";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" }),
    };
  }

  const { email, name, items } = JSON.parse(event.body);

  // Validaciones básicas
  if (!email || !name || !Array.isArray(items) || items.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Datos incompletos o inválidos" }),
    };
  }

  const orderId = `IRB-${Date.now()}`;
  const orderDate = new Date().toLocaleString("es-AR");

  // Recalcular total en backend (no confiar en frontend)
  const total = items.reduce((acc, item) => {
    if (
      !item.name ||
      typeof item.quantity !== "number" ||
      typeof item.price !== "number"
    ) {
      throw new Error("Formato de producto inválido");
    }
    return acc + item.quantity * item.price;
  }, 0);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${item.price}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">
            $${item.quantity * item.price}
          </td>
        </tr>
      `
      )
      .join("");

    const mailOptions = {
      from: `"Irbis Supplies" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Factura ${orderId} - Irbis Supplies`,
      text: `
Orden: ${orderId}
Fecha: ${orderDate}

Hola ${name},

Éste es el detalle de tu compra.

Total: $${total}

Irbis Supplies
      `,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#111;">Irbis Supplies</h2>
          <p><strong>Orden:</strong> ${orderId}</p>
          <p><strong>Fecha:</strong> ${orderDate}</p>
          <p>Hola ${name},</p>
          <p>Gracias por tu compra. Este es el detalle de tu factura:</p>

          <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <thead>
              <tr>
                <th style="padding:8px;border:1px solid #ddd;">Producto</th>
                <th style="padding:8px;border:1px solid #ddd;">Cantidad</th>
                <th style="padding:8px;border:1px solid #ddd;">Precio</th>
                <th style="padding:8px;border:1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <h3 style="text-align:right;margin-top:20px;">
            Total: $${total}
          </h3>

          <p style="margin-top:30px;">
            ¡Gracias por confiar en nosotros, que lo disfrutes! ☺️
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Factura enviada correctamente",
        orderId,
      }),
    };
  } catch (error) {
    console.error("Error enviando factura:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno al enviar la factura",
      }),
    };
  }
}
