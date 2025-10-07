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

import React from "react"
import { connect } from "react-redux"
import logo from "../../img/logo.svg"
import Alert from "../alert/Alert"
import * as actionsAlert from "../alert/actions"
import InputGroup from "./InputGroup"
import web from "../web"
import { Navigate } from "react-router-dom"
import qs from "query-string"
import storage from "local-storage-fallback"
import { redirectToOpenIDAuthURL, OPEN_ID_NONCE_KEY, OPEN_ID_STATE_KEY, OPEN_ID_REDIRECT_URI } from './utils'

export class OpenIDLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      clientID: "",
      discoveryDoc: {}
    }
    this.clientIDChange = this.clientIDChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  clientIDChange(e) {
    this.setState({
      clientID: e.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    const { showAlert } = this.props
    let message = ""
    if (this.state.clientID === "") {
      message = "Client ID cannot be empty"
    }
    if (message) {
      showAlert("danger", message)
      return
    }

    if (this.state.discoveryDoc && this.state.discoveryDoc.authorization_endpoint) {
      redirectToOpenIDAuthURL(
        this.state.discoveryDoc.authorization_endpoint,
        this.state.discoveryDoc.scopes_supported,
        this.state.clientID
      )
    }
  }

  componentWillMount() {
    const { clearAlert } = this.props
    // Clear out any stale message in the alert of previous page
    clearAlert()
    document.body.classList.add("is-guest")

    web.GetDiscoveryDoc().then(({ DiscoveryDoc }) => {
      this.setState({
        discoveryDoc: DiscoveryDoc
      })
    })
  }

  componentDidMount() {
    // Parse query params for code (Authorization Code flow)
    const values = qs.parse(this.props.location.search)
    if (values.error) {
      this.props.showAlert("danger", values.error_description)
      return
    }

    if (values.code) {
      const state = storage.getItem(OPEN_ID_STATE_KEY)
      if (!state || state !== values.state) {
        this.props.showAlert("danger", "Invalid auth token")
        return
      }

      // Retrieve code_verifier
      let code_verifier = storage.getItem(`oidc_code_verifier_${values.state}`)

      if (!code_verifier) {
        this.props.showAlert("danger", "Missing PKCE code_verifier")
        return
      }

      const nonce = storage.getItem(OPEN_ID_NONCE_KEY)

      // Exchange code + verifier with backend which will perform token exchange and session creation
      web.ExchangeCode({ code: values.code, code_verifier, redirect_uri: OPEN_ID_REDIRECT_URI(), state: values.state, nonce })
        .then(() => {
          storage.removeItem(OPEN_ID_NONCE_KEY)
          storage.removeItem(OPEN_ID_STATE_KEY)
          try {
            sessionStorage.removeItem(`oidc_code_verifier_${values.state}`)
          } catch (e) {
            storage.removeItem(`oidc_code_verifier_${values.state}`)
          }
          this.forceUpdate()
        })
        .catch(err => {
          this.props.showAlert('danger', err.message || 'Failed to exchange authorization code')
        })
    }
  }

  componentWillUnmount() {
    document.body.classList.remove("is-guest")
  }

  render() {
    const { clearAlert, alert } = this.props
    if (web.LoggedIn()) {
      return <Navigate to={"/"} />
    }
    let alertBox = <Alert {...alert} onDismiss={clearAlert} />
    // Make sure you don't show a fading out alert box on the initial web-page load.
    if (!alert.message) alertBox = ""
    return (
      <div className="login">
        {alertBox}
        <div className="l-wrap">
          <form onSubmit={this.handleSubmit}>
            <InputGroup
              value={this.state.clientID}
              onChange={this.clientIDChange}
              className="ig-dark"
              label="Client ID"
              id="clientID"
              name="clientID"
              type="text"
              spellCheck="false"
              required="required"
            />
            <button className="lw-btn" type="submit">
              <i className="fas fa-sign-in-alt" />
            </button>
          </form>
        </div>
        <div className="l-footer">
          <a className="lf-logo" href="">
            <img src={logo} alt="" />
          </a>
          <div className="lf-server">{window.location.host}</div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showAlert: (type, message) =>
      dispatch(actionsAlert.set({ type: type, message: message })),
    clearAlert: () => dispatch(actionsAlert.clear())
  }
}

export default connect(
  state => state,
  mapDispatchToProps
)(OpenIDLogin)
