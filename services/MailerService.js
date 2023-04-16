const nodemailer = require("nodemailer");
const config = require("config");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: config.get("smtp_host"),
      port: config.get("smtp_port"),
      secure: false,
      auth: {
        user: config.get("smtp_user"),
        pass: config.get("smtp_password"),
      },
    });
  }
  async sendActivationMail(toEmail, link) {
    await this.transporter.sendMail({
      from: config.get("smtp_user"),
      to: toEmail,
      subject: "ITINFO akkauntini faollashtirish",
      text: "",
      html: `
                <div> 
                    <h1> 
                        Akkauntni faollashtirish uchun quyidagi linkni bosing 
                    </h1> 
                    <a href="${link}"> ${link}</a> 
                </div>        
            `,
    });
  }
  async sendNewPassword(toEmail, password) {
    await this.transporter.sendMail({
      from: config.get("smtp_user"),
      to: toEmail,
      subject: "Yangi passwordni olish uchun",
      text: `Eski passwordingiz yangisiga almashtirildi`,
      html: `
      <div> <h1><strong>${password}</strong></h1></div>`,
    });
  }
  async sendMessage(toEmail, message) {
    await this.transporter.sendMail({
      from: config.get("smtp_user"),
      to: toEmail,
      subject: "Ro'yhatdan muvaffaqiyatli o'tdingiz",
      text: ``,
      html: `
      <div> <h1><strong>${message}</strong></h1></div>`,
    });
  }
  async newOrderMessage(toEmail, message) {
    await this.transporter.sendMail({
      from: config.get("smtp_user"),
      to: toEmail,
      subject: "Buyurtma",
      text: ``,
      html: `
      <div> <h1><strong>${message}</strong></h1></div>`,
    });
  }
}

module.exports = new MailService();
