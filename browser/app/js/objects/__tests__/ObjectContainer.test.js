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
import { ObjectContainer } from "../ObjectContainer"
import store from "../../store/store"

describe("ObjectContainer", () => {
  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <ObjectContainer object={{ name: "test1.jpg" }} />
      </Provider>
    )
  })

  it("should render ObjectItem with props", () => {
    render(
      <Provider store={store}>
        <ObjectContainer object={{ name: "test1.jpg" }} />
      </Provider>
    )
    expect(screen.getByText(/test1.jpg/i)).toBeInTheDocument()
  })

  it("should pass actions to ObjectItem", () => {
    render(
      <Provider store={store}>
        <ObjectContainer object={{ name: "test1.jpg" }} checkedObjectsCount={0} />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const links = screen.getAllByRole("link")
    expect(links.length).toBeGreaterThan(1)
  })

  it("should pass empty actions to ObjectItem when checkedObjectCount is more than 0", () => {
    render(
      <Provider store={store}>
        <ObjectContainer object={{ name: "test1.jpg" }} checkedObjectsCount={1} />
      </Provider>
    )
    const links = screen.getAllByRole("link")
    // only the name link should be present
    expect(links.length).toBe(1)
  })
})
