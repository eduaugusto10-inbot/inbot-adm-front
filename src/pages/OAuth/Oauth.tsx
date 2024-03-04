import React from 'react'
import cred from "../JSON/client.json"

const Oauth = () => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar&include_granted_scopes=true&response_type=code&redirect_uri=${cred.web.redirect_uris[0]}&client_id=${cred.web.client_id}&prompt=consent&access_type=offline`
  return (
  <>
    <button onClick={() => window.location.href = url}>Sign in with Google 🚀</button>
  </>
  )
}

export default Oauth
