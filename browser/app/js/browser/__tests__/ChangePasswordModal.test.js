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

import { render, fireEvent, screen } from "@testing-library/react"
import { ChangePasswordModal } from "../ChangePasswordModal"

jest.mock("jwt-decode", () => ({
  __esModule: true,
  default: jest.fn(() => ({ sub: "minio" })),
}));

jest.mock("../../web", () => ({
  SetAuth: jest.fn(
    ({ currentAccessKey, currentSecretKey, newAccessKey, newSecretKey }) => {
      if (
        currentAccessKey == "minio" &&
        currentSecretKey == "minio123" &&
        newAccessKey == "test" &&
        newSecretKey == "test1234"
      ) {
        return Promise.resolve({})
      } else {
        return Promise.reject({
          message: "Error"
        })
      }
    }
  ),
  GetToken: jest.fn(() => "")
}))

jest.mock("../../utils", () => ({
  getRandomAccessKey: () => "raccesskey",
  getRandomSecretKey: () => "rsecretkey"
}))

describe("ChangePasswordModal", () => {
  const serverInfo = {
    version: "test",
    platform: "test",
    runtime: "test",
    info: {},
    userInfo: { isIAMUser: true }
  }

  it("should render without crashing", () => {
    render(<ChangePasswordModal serverInfo={serverInfo} />)
  })

  it("should not allow changing password when not IAM user", () => {
    const newServerInfo = {
      ...serverInfo,
      userInfo: { isIAMUser: false }
    }
    render(<ChangePasswordModal serverInfo={newServerInfo} />)
    const text = screen.getByText("Credentials of this user cannot be updated through MinIO Browser.")
    expect(text).toBeInTheDocument()
  })

  it("should not allow changing password for STS user", () => {
    const newServerInfo = {
      ...serverInfo,
      userInfo: { isTempUser: true }
    }
    render(<ChangePasswordModal serverInfo={newServerInfo} />)
    const text = screen.getByText("Credentials of this user cannot be updated through MinIO Browser.")
    expect(text).toBeInTheDocument()
  })

  it("should not generate accessKey for IAM User", () => {
    render(<ChangePasswordModal serverInfo={serverInfo} />)
    const button = screen.getByRole("button", { name: "Generate" })
    fireEvent.click(button)
    expect(screen.getByDisplayValue("minio")).toBeInTheDocument()
    expect(screen.getByDisplayValue("rsecretkey")).toBeInTheDocument()
  })

  // Note: It does not seem like the new accessKey field is ever present in the DOM.
  // This test is kept for reference.
  it("should not show new accessKey field for IAM User", () => {
    render(<ChangePasswordModal serverInfo={serverInfo} />)
    const modal = screen.queryByTestId("newAccesskey")
    expect(modal).not.toBeInTheDocument()
  })

  it("should disable Update button for secretKey", () => {
    const showAlert = jest.fn()
    render(
      <ChangePasswordModal serverInfo={serverInfo} showAlert={showAlert} />
    )
    const currentSecret = screen.getByLabelText('Current Secret Key')
    const newSecret = screen.getByLabelText('New Secret Key')
    fireEvent.change(currentSecret, { target: { value: 'minio123' } })
    fireEvent.change(newSecret, { target: { value: 't1' } })
    const updateBtn = screen.getByRole('button', { name: 'Update' })
    expect(updateBtn).toBeDisabled()
  })

  it("should call hideChangePassword when Cancel button is clicked", () => {
    const hideChangePassword = jest.fn()
    render(
      <ChangePasswordModal
        serverInfo={serverInfo}
        hideChangePassword={hideChangePassword}
      />
    )
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelBtn)
    expect(hideChangePassword).toHaveBeenCalled()
  })
})
