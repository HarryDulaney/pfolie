const envConfig = (req, res) => {
    var config = {
        firebaseConfig: {
            apiKey: process.env.FB_API_KEY,
            authDomain: process.env.FB_AUTH_DOMAIN,
            databaseURL: process.env.FB_DATABASE_URL,
            projectId: process.env.FB_PROJECT_ID,
            storageBucket: process.env.FB_STORAGE_BUCKET,
            messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
            appId: process.env.FB_APP_ID,
            measurementId: process.env.FB_MEASUREMENT_ID
        },
        DB_URL: process.env.DATABASE_URL,
        CMC_API_KEY: process.env.CMC_API_KEY
    }
    res.status(200).send(JSON.stringify(config));
}

exports.envConfig = envConfig;
