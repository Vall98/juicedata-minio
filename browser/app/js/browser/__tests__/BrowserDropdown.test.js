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

import { fireEvent, render, screen } from "@testing-library/react"
import { BrowserDropdown } from "../BrowserDropdown"

describe("BrowserDropdown", () => {
  const serverInfo = {
    version: "test",
    platform: "test",
    runtime: "test"
  }

  it("should render without crashing", () => {
    render(
      <BrowserDropdown serverInfo={serverInfo} fetchServerInfo={jest.fn()} />
    )
  })

  it("should call fetchServerInfo after its mounted", () => {
    const fetchServerInfo = jest.fn()
    render(
      <BrowserDropdown
        serverInfo={serverInfo}
        fetchServerInfo={fetchServerInfo}
      />
    )
    expect(fetchServerInfo).toHaveBeenCalled()
  })

  it("should show AboutModal when About link is clicked", () => {
    render(
      <BrowserDropdown serverInfo={serverInfo} fetchServerInfo={jest.fn()} />
    )
    const dropdownButton = screen.getByRole("button")
    fireEvent.click(dropdownButton)
    const about = screen.getByText(/about/i);
    fireEvent.click(about)
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent(/×VersiontestPlatformtestRuntimetest/i);
  })

  it("should logout and redirect to /login when logout is clicked", () => {
    render(
      <BrowserDropdown serverInfo={serverInfo} fetchServerInfo={jest.fn()} />
    )
    const dropdownButton = screen.getByRole("button")
    fireEvent.click(dropdownButton)
    const logout = screen.getByText(/logout/i);
    fireEvent.click(logout)
    expect(window.location.pathname.endsWith("/login")).toBeTruthy()
  })
})
