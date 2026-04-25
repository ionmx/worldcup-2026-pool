import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import { useAuthRequest, ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../firebase/config';

WebBrowser.maybeCompleteAuthSession();

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential;
};

export const logout = () => signOut(auth);

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const REDIRECT_URI = 'https://auth.expo.io/@toronjarenosa/prode2026';

// Hook genérico — sin validación de androidClientId
export const useGoogleAuthRequest = () =>
  useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      redirectUri: REDIRECT_URI,
      scopes: ['openid', 'profile', 'email'],
      responseType: ResponseType.Token,
      usePKCE: false,
    },
    GOOGLE_DISCOVERY
  );

export const signInWithGoogleToken = async (accessToken: string) => {
  const credential = GoogleAuthProvider.credential(null, accessToken);
  return signInWithCredential(auth, credential);
};
