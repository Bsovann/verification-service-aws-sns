const express = require('express');
const { SNSClient, PublishCommand, SNSException } = require('@aws-sdk/client-sns');
const randomstring = require('randomstring');
require('dotenv').config();

const app = express();
app.use(express.json());
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

const snsClient = new SNSClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Store one-time codes and their expiration times in a JavaScript object
const verificationCodes = {};

const generateCode = () => {
    return randomstring.generate({ length: 6, charset: 'numeric' });
};

const cleanupExpiredCodes = () => {
    setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        for (const code in verificationCodes) {
            if (verificationCodes[code] < currentTime) {
                delete verificationCodes[code];
            }
        }
    }, 60000); // Run every minute
};

// Start the background process to clean up expired codes
cleanupExpiredCodes();

app.post('/send_verification_code', async (req, res) => {
    const { phone_number } = req.body;
    console.log(phone_number);

    if (!phone_number) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const code = generateCode();
    const expirationTime = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now

    const message = `Your verification code is: ${code}`;
    const params = {
        PhoneNumber: phone_number,
        Message: message,
    };

    try {
        await snsClient.send(new PublishCommand(params));

        verificationCodes[code] = expirationTime;

        return res.status(200).json({ message: 'Verification code sent successfully' });
    } catch (err) {
        if (err instanceof SNSException) {
            console.error('SNSException:', err.message);
        } else {
            console.error('Error sending verification code:', err);
        }
        return res.status(500).json({ error: 'Failed to send verification code' });
    }
});

app.post('/verify_code', (req, res) => {
    const { phone_number, code } = req.body;
    if (!phone_number || !code) {
        return res.status(400).json({ error: 'Phone number and code are required' });
    }

    if (verificationCodes[code] && verificationCodes[code] >= Math.floor(Date.now() / 1000)) {
        delete verificationCodes[code];
        return res.status(200).json({ message: 'Verification successful' });
    } else {
        delete verificationCodes[code];
        return res.status(400).json({ error: 'Invalid verification code or code has expired' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
