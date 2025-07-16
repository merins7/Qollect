export const GOOGLE_DRIVE_CONFIG = {
  clientId: EXPO_CLIENT_ID,
  clientSecret: EXPO_CLIENT_SECRET,
  redirectUri: "qollect://oauth2redirect",
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ],
};
