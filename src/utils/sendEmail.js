import nodemailer from 'nodemailer';

// Load environment variables from a .env file
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async (userEmail, subject, message) => {
    try {
        // Create a transporter using SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        // Define email options
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: subject,
            text: message,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export { sendEmail };
