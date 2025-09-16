/**
 * Sends an email using nodemailer and a handlebars template.
 * @param {string} from - The email address to send the email from.
 * @param {string} pass - The password for the email address.
 * @param {string[]} emails - An array of email addresses to send the email to.
 * @param {string} subject - The subject of the email.
 * @param {object} payload - An object containing data to be used in the handlebars template.
 * @param {string} template - The path to the handlebars template file.
 * @returns {Promise<Error|undefined>} - A promise that resolves with undefined if the email was sent successfully, or rejects with an error if there was an issue sending the email.
 */
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import * as fs from "fs";
import path from "path";
import url from "url";

const sendEmail = async (
  from,
  pass,
  emails,
  subject,
  payload,
  template,
  files = null
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: from,
      pass: pass, // naturally, replace both with your real credentials or an application-specific password
    },
  });
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const source = fs.readFileSync(path.join(__dirname, template), "utf8");
  const compiledTemplate = handlebars.compile(source);
  const options = () => {
    let options = {
      from: `REPFORA <${from}>`,
      to: emails.join(","),
      subject: subject,
      html: compiledTemplate(payload),
    };

    if (files) {
      options.attachments = files;
    }

    return options;
  };

  // Send email
  await transporter.sendMail(options()); 
};

export default sendEmail;
