const express = require('express');
const dotenv = require('dotenv');
const { sendWithMailtrapSDK } = require('./email-clients/mailtrap.io/mail.service');
const path = require('path');

const app = express();
app.set('env', process.env.NODE_ENV);
dotenv.config();

// view engine setup
app.set('view engine', 'ejs');
app.set('templateRoot', path.join(process.cwd(), '/templates'));
app.set('x-powered-by', false);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/mailtrap', async (req, res) => {
    try {
        const mailtrapRes = await sendWithMailtrapSDK(
            app.get('templateRoot'),
            req.body.content, // { name: 'Bhushan' } would print in the email template
            req.body.recipients,
            req.body.template || 'hello',
            req.body.category || undefined,
            req.body.variables || undefined,
            req.body.attachments || undefined
        );
        console.log('mailtrapRes', mailtrapRes);
        res.status(200).json({ message: 'Mail sent successfully.', data: mailtrapRes });
    } catch (sendError) {
        console.error('sendError', sendError);
        res.status(sendError?.response?.status || 500).json({ message: `Failed to send emails, Reason -> ${sendError?.response?.status || sendError?.message}`, });
    }
});

// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(422).json({
            errors: Object.keys(err.errors).reduce((errors, key) => {
                // @ts-ignore
                errors[key] = err.errors[key].message;
                return errors;
            }, {}),
        });
    }
    return next(err);
});


const server = app.listen(process.env.PORT, () => {
    console.log(`Listening on ${server.address().port}`);
});

module.exports = server;
