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

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"
import BucketContainer from "../BucketContainer"

const mockStore = configureStore()

describe("BucketContainer", () => {
  let store
  beforeEach(() => {
    store = mockStore({
      buckets: {
        currentBucket: "Test"
      }
    })
    store.dispatch = jest.fn()
  })

  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <BucketContainer />
      </Provider>
    )
  })

  it('maps state and dispatch to props', () => {
    render(
      <Provider store={store}>
        <BucketContainer />
      </Provider>
    )
    const dropdown = screen.getByRole("button")
    fireEvent.click(dropdown)
    expect(screen.getByText("Edit policy")).toBeTruthy()
    expect(screen.getByText("Delete")).toBeTruthy()
  })

  it('maps selectBucket to dispatch action', () => {
    render(
      <Provider store={store}>
        <BucketContainer />
      </Provider>
    )
    const dropdown = screen.getByRole("button")
    fireEvent.click(dropdown)
    const editPolicy = screen.getByText("Edit policy")
    fireEvent.click(editPolicy)
    expect(store.dispatch).toHaveBeenCalled()
  })
})
