/**
 * Google OAuth — lấy Web client ID từ Google Cloud Console (Credentials → OAuth 2.0 Client IDs → Web application).
 * Cần cho Google Sign-In và refresh token. iOS/Android còn cần thêm OAuth client riêng theo hướng dẫn RN Google Sign-In.
 *
 * Nếu gặp lỗi native `RNGoogleSignin could not be found`: trong thư mục `ios` chạy `pod install`,
 * rồi build lại app (Xcode / `npx react-native run-ios`), không chỉ refresh Metro.
 */
/** Điền Web Client ID (OAuth 2.0) từ Google Cloud Console. */
export const GOOGLE_WEB_CLIENT_ID = '239753527675-ocqmq4g63uvsa7ai3daoahi1okmm5qvk.apps.googleusercontent.com';

export const GOOGLE_DRIVE_BACKUP_FILENAME = 'personal-finance-manager-backup.json';
