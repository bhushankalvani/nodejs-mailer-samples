/**
 * @note Mailtrap client by Railsware.
 * @website https://mailtrap.io/
 * @api_docs https://api-docs.mailtrap.io/
 */
const { MailtrapClient } = require('mailtrap');
const EmailTemplate = require('email-templates');
const fs = require('fs');
const path = require('path');

// For this example to work, you need to set up a sending domain,
// and obtain a token that is authorized to send from the domain

const client = new MailtrapClient({ token: process.env.MAILTRAP_API_TOKEN });

const sendWithMailtrapSDK = async (
    templateRoot,
    contentObj,
    recipients,
    template,
    category = undefined,
    custom_variables = undefined,
    attachments = undefined,
) => {
    /** @note I use this to create dynamic templates and pass my custom content to the templates. */
    const email = new EmailTemplate({
        views: {
            root: templateRoot, /** @debug for diff OS, especially windows */
            options: {
                extension: 'ejs',
            },
        },
    });

    const html = await email.render(`${template}/html`, contentObj);
    const subject = await email.render(`${template}/subject`, contentObj);

    return client.send({
        to: recipients,
        from: { name: 'Mailtrap Sender', email: process.env.SENDER_EMAIL },
        category,
        custom_variables,
        subject,
        html,
        /** @note in case you need to send attachments, use the following syntax. */
        attachments,
    });
};

module.exports = { sendWithMailtrapSDK };

// const welcomeImage = fs.readFileSync(path.join(__dirname, "welcome.png"));

// const recipients = [{ email: 'send@mail.com' }];

// custom_variables = {
//     hello: "world",
//     year: 2022,
//     anticipated: true,
// },
// attachments = [
//     {
//         filename: "welcome.png",
//         content_id: "welcome.png",
//         disposition: "inline",
//         content: welcomeImage,
//     },
// ]