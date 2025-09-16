/**
 * Sends an email using Microsoft Outlook email service.
 * @param {string} from - The email address of the sender.
 * @param {string} pass - The password of the sender's email account.
 * @param {string[]} emails - An array of email addresses of the recipients.
 * @param {string} subject - The subject of the email.
 * @param {object} payload - An object containing the data to be used in the email template.
 * @param {string} template - The path to the email template file.
 * @returns {Promise} A Promise that resolves to the result of sending the email.
 */
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import * as fs from "fs";
import path from "path";
import url from "url";

const sendEmailMicrosoft = async (
  from,
  pass,
  emails,
  subject,
  payload,
  template
) => {
  try {
    const transporter = nodemailer.createTransport({
      //pruebapersonal182@outlook.com

      host: "outlook.office365.com",
      port: 587,
      tls: {
        ciphers: "SSLv3",
      },
      secureConnection: false,
      requireTLS: true,
      auth: {
        user: from,
        pass: pass, // naturally, replace both with your real credentials or an application-specific password
      },
    });
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: `SENA HORARIOS <${from}>`,
        to: emails.join(","),
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    transporter.sendMail(options(), (error, info) => {
      if (error) {
        console.log(error);
        return error;
      } else {
        return res.status(200).json({
          success: true,
        });
      }
    });
  } catch (error) {
    return error;
  }
};

export default sendEmailMicrosoft;
