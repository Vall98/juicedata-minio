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

import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import Header from "../Header"
import store from "../../store/store"
import web from "../../web"

jest.mock("../../web", () => ({
  LoggedIn: jest
    .fn(() => true),
  ServerInfo: jest
    .fn(() => Promise.resolve({})),
  StorageInfo: jest
    .fn(() => Promise.resolve({used: 60})),
}))

describe("Header", () => {
  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    )
  })

  it("should render Login button when the user has not LoggedIn", () => {
    web.LoggedIn.mockReturnValue(false)
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    )
    const link = screen.getByRole('link', { name: /login/i })
    expect(link).toBeInTheDocument()
  })

  it("should render StorageInfo and BrowserDropdown when the user has LoggedIn", () => {
    web.LoggedIn.mockReturnValue(true)
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    )
    expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument()
    expect(screen.getByRole("button")).toBeInTheDocument()
    expect(screen.getByText(/60 bytes/i)).toBeInTheDocument()
  })
})
