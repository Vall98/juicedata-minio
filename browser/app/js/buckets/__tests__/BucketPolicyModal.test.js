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
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { BucketPolicyModal } from "../BucketPolicyModal"
import { READ_ONLY } from "../../constants"
import configureStore from "../../store/configure-store"

describe("BucketPolicyModal", () => {
  it("should render without crashing", () => {
    const store = configureStore()
    render(
      <Provider store={store}>
        <BucketPolicyModal policies={[]} />
      </Provider>
    )
  })

  it("should call hideBucketPolicy when close button is clicked", () => {
    const store = configureStore()
    const hideBucketPolicy = jest.fn()
    render(
      <Provider store={store}>
        <BucketPolicyModal showBucketPolicy={true} hideBucketPolicy={hideBucketPolicy} policies={[]} />
      </Provider>
    )
    const closeBtn = screen.getByText('×')
    fireEvent.click(closeBtn)
    expect(hideBucketPolicy).toHaveBeenCalled()
  })

  it("should include the PolicyInput and Policy components when there are any policies", () => {
    const store = configureStore()
    render(
      <Provider store={store}>
        <BucketPolicyModal showBucketPolicy={true} policies={[{ prefix: "test", policy: READ_ONLY }]} />
      </Provider>
    )
    return waitFor(() => {
      expect(screen.getByText("test")).toBeTruthy()
    })
  })
})
