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
import { Provider } from "react-redux"
import { SideBar } from "../SideBar"
import store from "../../store/store"

jest.mock("../../web", () => ({
  LoggedIn: jest.fn(() => false).mockReturnValueOnce(true),
  ListObjects: jest.fn(() => Promise.resolve({ objects: [], istruncated: false, prefixes: [] }))
}))

describe("SideBar", () => {
  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <SideBar />
      </Provider>
    )
  })

  it("should not render BucketSearch for non LoggedIn users", () => {
    render(
      <Provider store={store}>
        <SideBar />
      </Provider>
    )
    const bucketSearchElements = screen.queryByRole("textbox")
    expect(bucketSearchElements).toBeNull()
  })

  it("should call clickOutside when the user clicks outside the sidebar", () => {
    const clickOutside = jest.fn()
    store.dispatch({ type: 'SET_SIDEBAR_OPEN', payload: true })

    render(
      <Provider store={store}>
        <SideBar clickOutside={clickOutside} />
      </Provider>
    )
    // Wait for next tick to allow event handlers to attach
    return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
      // simulate clicking an element outside sidebar
      const outside = document.createElement('div')
      outside.className = 'outside'
      document.body.appendChild(outside)
      fireEvent.mouseDown(outside)
      expect(clickOutside).toHaveBeenCalled()
    })
  })

  it("should not call clickOutside when user clicks on sidebar toggle", () => {
    const clickOutside = jest.fn()
    render(
      <Provider store={store}>
        <SideBar clickOutside={clickOutside} />
      </Provider>
    )
    const toggle = screen.getByRole('heading')
    fireEvent.click(toggle)
    expect(clickOutside).not.toHaveBeenCalled()
  })
})
