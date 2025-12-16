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

import { fireEvent, render, screen, within } from "@testing-library/react"
import { Provider } from "react-redux"
import { PrefixContainer } from "../PrefixContainer"
import store from "../../store/store"

describe("PrefixContainer", () => {
  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <PrefixContainer object={{ name: "abc/" }} />
      </Provider>
    )
  })

  it("should render ObjectItem with props", () => {
    render(
      <Provider store={store}>
        <PrefixContainer object={{ name: "abc/" }} />
      </Provider>
    )
    expect(screen.getByText("abc/")).toBeInTheDocument()
  })

  it("should call selectPrefix when the prefix is clicked", () => {
    const selectPrefix = jest.fn()
    render(
      <Provider store={store}>
        <PrefixContainer
          object={{ name: "abc/" }}
          currentPrefix={"xyz/"}
          selectPrefix={selectPrefix}
        />
      </Provider>
    )
    const link = screen.getByRole("link")
    fireEvent.click(link)
    expect(selectPrefix).toHaveBeenCalledWith("xyz/abc/")
  })

  it("should pass actions to ObjectItem", () => {
    render(
      <Provider store={store}>
        <PrefixContainer object={{ name: "abc/" }} checkedObjectsCount={0} />
      </Provider>
    )
    const nameEl = screen.getByText("abc/")
    const row = nameEl.closest('.fesl-row')
    const actionsCell = row ? row.querySelector('.fesl-item-actions') : null
    expect(actionsCell).toBeTruthy()
    const toggle = actionsCell ? within(actionsCell).getByRole('button', { name: /object actions for abc\//i }) : null
    expect(toggle).toBeTruthy()
  })

  it("should pass empty actions to ObjectItem when checkedObjectCount is more than 0", () => {
    render(
      <Provider store={store}>
        <PrefixContainer object={{ name: "abc/" }} checkedObjectsCount={1} />
      </Provider>
    )
    const nameEl = screen.getByText("abc/")
    const row = nameEl.closest('.fesl-row')
    const actionsCell = row ? row.querySelector('.fesl-item-actions') : null
    const actions = actionsCell ? within(actionsCell).queryAllByRole('link') : []
    expect(actions.length).toBe(0)
  })
})
