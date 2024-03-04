import React from 'react'
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import cred from "../JSON/client.json"


const Oauth = () => {

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
        console.log(codeResponse);
        const tokens = await axios.post(
            'https://oauth2.googleapis.com/token', {
                code: codeResponse.code,
                client_id: cred.web.client_id,
                client_secret: cred.web.client_secret,
                redirect_uri: cred.web.redirect_uris[0],
                grant_type: "authorization_code",
            });

        console.log(tokens);
    },
    onError: () => console.log('Login Failed'),
    flow: 'auth-code',
    scope: "https://www.googleapis.com/auth/calendar",
  });

  return (
    <>
    <button onClick={() => login()}>Sign in with Google 🚀</button>;
    </>
  )
}

export default Oauth
