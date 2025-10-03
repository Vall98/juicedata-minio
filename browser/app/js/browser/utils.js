/*
 * MinIO Cloud Storage (C) 2019 MinIO, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import storage from "local-storage-fallback"

export const OPEN_ID_NONCE_KEY = 'openIDKey'
export const OPEN_ID_STATE_KEY = 'openIDStateKey'

// PKCE helpers
function base64urlencode(a) {
  // btoa from byte array
  let str = ''
  const bytes = new Uint8Array(a)
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function codeChallengeFromVerifier(verifier) {
  const enc = new TextEncoder()
  const data = enc.encode(verifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return base64urlencode(digest)
}

export function generateCodeVerifier(len = 64) {
  const arr = new Uint8Array(len)
  window.crypto.getRandomValues(arr)
  // base64url encode
  return base64urlencode(arr)
}

export const buildOpenIDAuthURL = (authEp, authScopes, redirectURI, clientID, nonce, state, opts = {}) => {
  const params = new URLSearchParams()
  
  // response_type is 'code' for Authorization Code flow
  params.set("response_type", "code")
  params.set("scope", authScopes.join(" "))
  params.set("client_id", clientID)
  params.set("redirect_uri", redirectURI)
  params.set("nonce", nonce)
  params.set("state", state)

  // optional PKCE params
  if (opts.code_challenge) {
    params.set('code_challenge', opts.code_challenge)
    params.set('code_challenge_method', opts.code_challenge_method || 'S256')
  }

  return `${authEp}?${params.toString()}`
}

export function redirectToOpenIDAuthURL(authorization_endpoint, scopes_supported, redirectURI, clientID) {
  // Store nonce and state in localstorage to check again after the redirect
  const nonce = getRandomString(32)
  storage.setItem(OPEN_ID_NONCE_KEY, nonce)

  const state = getRandomString(32)
  storage.setItem(OPEN_ID_STATE_KEY, state)

  // Generate PKCE verifier and challenge
  const code_verifier = generateCodeVerifier()
  storage.setItem(`oidc_code_verifier_${state}`, code_verifier)

  codeChallengeFromVerifier(code_verifier).then(code_challenge => {
    const authURL = buildOpenIDAuthURL(
      authorization_endpoint,
      scopes_supported,
      redirectURI,
      clientID,
      nonce,
      state,
      { code_challenge }
    )
    window.location = authURL
  })
}