export const environment = {
  production: false,
  APP_API_ROOT: 'http://localhost:8080/api',
  CG_API_KEY: process.env.NG_APP_CG_API_KEY,
  firebaseConfig: {
    apiKey: process.env.NG_APP_FB_API_KEY,
    authDomain: process.env.NG_APP_FB_AUTH_DOMAIN,
    databaseURL: process.env.NG_APP_FB_DATABASE_URL,
    projectId: process.env.NG_APP_FB_PROJECT_ID,
    storageBucket: process.env.NG_APP_FB_STORAGE_BUCKET,
    messagingSenderId: process.env.NG_APP_FB_MESSAGING_SENDER_ID,
    appId: process.env.NG_APP_FB_APP_ID,
    measurementId: process.env.NG_APP_FB_MEASUREMENT_ID
  }
}