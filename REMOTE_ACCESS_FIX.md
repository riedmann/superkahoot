# Fixing Remote Connection Issues

## The Problem
Your SuperKahoot app only works when joining from the same browser but fails when users try to join from remote devices or different browsers. This is caused by two main issues:

## Issue 1: Vite Development Server Configuration
The Vite dev server by default only binds to `localhost` (127.0.0.1), which means it can only accept connections from the same machine.

**✅ Fixed**: Updated `vite.config.ts` to include:
```typescript
server: {
  host: true, // Allow connections from external devices
  port: 5173, // Specify port
}
```

## Issue 2: Firebase Firestore Security Rules
Your Firestore database likely has restrictive security rules that prevent unauthenticated users from reading/writing game data.

**✅ Solution**: Created `firestore.rules` file with proper permissions for the game functionality.

## How to Apply the Fixes

### 1. Update Firestore Security Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your "demoteachers" project
3. Go to **Firestore Database** > **Rules**
4. Replace the existing rules with the content from `firestore.rules`
5. Click **Publish**

### 2. Start Development Server with External Access
```bash
npm run dev
```

Your app will now be accessible at:
- Local: `http://localhost:5173`
- Network: `http://[your-ip]:5173` (check terminal output for your exact IP)

### 3. Test Remote Connections
1. Start a game on your main browser
2. On another device/browser, go to `http://[your-ip]:5173`
3. Try joining the game with the PIN

## Production Deployment
For production on Vercel, the network access issue is automatically resolved, but you still need to apply the Firestore security rules.

## Security Notes
The rules allow public access to games for the multiplayer functionality to work. In a production app, you might want to:
- Add time-based restrictions (games expire after X hours)
- Implement rate limiting
- Add user authentication for hosts
- Validate game PIN format and existence

## Troubleshooting
If remote connections still don't work:
1. Check your firewall settings
2. Ensure devices are on the same network (for local testing)
3. Try accessing the IP address directly in the browser first
4. Check browser console for Firebase errors