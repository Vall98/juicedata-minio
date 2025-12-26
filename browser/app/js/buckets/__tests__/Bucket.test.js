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
import { fireEvent, render, screen } from "@testing-library/react"
import { Bucket } from "../Bucket"
import { Provider } from "react-redux"
import configureStore from "../../store/configure-store"

describe("Bucket", () => {
  let store
  beforeEach(() => {
    store = configureStore()
  })

  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <Bucket />
      </Provider>
    )
  })

  it("should call selectBucket when clicked", () => {
    const selectBucket = jest.fn()
    render(
      <Provider store={store}>
        <Bucket bucket={"test"} selectBucket={selectBucket} />
      </Provider>
    )
    const bucketLink = screen.getByRole("link", { name: "test" })
    fireEvent.click(bucketLink, { preventDefault: jest.fn() })
    expect(selectBucket).toHaveBeenCalledWith("test")
  })

  it("should highlight the selected bucket", () => {
    render(
      <Provider store={store}>
        <Bucket bucket={"test"} isActive={true} />
      </Provider>
    )
    const bucket = screen.getByRole("link", { name: "test" }).parentElement
    expect(bucket.classList.contains("active")).toBeTruthy()
  })
})
