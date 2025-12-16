// Your web app's Firebase & Cloudinary configuration

const firebaseConfig = {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
};

export const appConfig = {
    cloudName: import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET,
    apiKey: import.meta.env.VITE_APP_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_APP_CLOUDINARY_API_SECRET
}

export default firebaseConfig
