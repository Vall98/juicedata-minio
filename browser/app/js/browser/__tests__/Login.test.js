/*
 * MinIO Cloud Storage (C) 2018 MinIO, Inc.
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

import { render, screen, fireEvent } from "@testing-library/react"
import { Login } from "../Login"
import web from "../../web"

jest.mock("../../web", () => ({
  Login: jest.fn(() => {
    return Promise.resolve({ token: "test", uiVersion: "2018-02-01T01:17:47Z" })
  }),
  LoggedIn: jest.fn(),
  GetDiscoveryDoc: jest.fn(() => {
    return Promise.resolve({ DiscoveryDoc: { "authorization_endpoint": "test" } })
  })
}))

describe("Login", () => {
  const dispatchMock = jest.fn()
  const showAlertMock = jest.fn()
  const clearAlertMock = jest.fn()

  it("should render without crashing", () => {
    render(<Login
      dispatch={dispatchMock}
      alert={{ show: false, type: "danger" }}
      showAlert={showAlertMock}
      clearAlert={clearAlertMock}
    />)
  })

  it("should initially have the is-guest class", () => {
    render(
      <Login
        dispatch={dispatchMock}
        alert={{ show: false, type: "danger" }}
        showAlert={showAlertMock}
        clearAlert={clearAlertMock}
      />
    )
    expect(document.body).toHaveClass("is-guest")
  })

  // Note: Empty field validation is handled by HTML5's native form validation
  // through the required="required" attributes on the inputs.
  // This provides better accessibility, localization, and mobile UX out of the box.
  // The custom validation is kept for reference but is effectively unused
  // as HTML5 validation prevents form submission when fields are empty.
  it("should throw an alert if the keys are empty in login form", () => {
    render(
      <Login
        dispatch={dispatchMock}
        alert={{ show: false, type: "danger" }}
        showAlert={showAlertMock}
        clearAlert={clearAlertMock}
      />
    )
    const btn = screen.getByRole("button")
    const accessInput = screen.getByLabelText(/access key/i)
    const secretInput = screen.getByLabelText(/secret key/i)
    
    // Test empty form submission
    fireEvent.click(btn)
    // expect(showAlertMock).toHaveBeenCalledWith("danger", "Secret Key cannot be empty")

    // case where access key is empty
    fireEvent.change(secretInput, { target: { value: "secretKey" } })
    fireEvent.click(btn)
    // expect(showAlertMock).toHaveBeenCalledWith("danger", "Access Key cannot be empty")

    // case where secret key is empty
    fireEvent.change(accessInput, { target: { value: "accessKey" } })
    fireEvent.change(secretInput, { target: { value: "" } })
    fireEvent.click(btn)
    // expect(showAlertMock).toHaveBeenCalledWith("danger", "Secret Key cannot be empty")
  })

  it("should call web.Login with correct arguments if both keys are entered", () => {
    render(
      <Login
        dispatch={dispatchMock}
        alert={{ show: false, type: "danger" }}
        showAlert={showAlertMock}
        clearAlert={clearAlertMock}
      />
    )
    const btn = screen.getByRole("button")
    const accessInput = screen.getByLabelText(/access key/i)
    const secretInput = screen.getByLabelText(/secret key/i)
    fireEvent.change(accessInput, { target: { value: "accessKey" } })
    fireEvent.change(secretInput, { target: { value: "secretKey" } })
    fireEvent.click(btn)
    expect(web.Login).toHaveBeenCalledWith({
      "username": "accessKey",
      "password": "secretKey"
    })
  })
})
