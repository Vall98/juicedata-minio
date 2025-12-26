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
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { PolicyInput } from "../PolicyInput"
import { READ_ONLY } from "../../constants"
import web from "../../web"

jest.mock("../../web", () => ({
  SetBucketPolicy: jest.fn(() => {
    return Promise.resolve()
  })
}))

describe("PolicyInput", () => {
  it("should render without crashing", () => {
    const fetchPolicies = jest.fn()
    render(<PolicyInput currentBucket={"bucket"} fetchPolicies={fetchPolicies} setPolicies={jest.fn()} showAlert={jest.fn()} />)
  })

  it("should call fetchPolicies after the component has mounted", () => {
    const fetchPolicies = jest.fn()
    render(<PolicyInput currentBucket={"bucket"} fetchPolicies={fetchPolicies} setPolicies={jest.fn()} showAlert={jest.fn()} />)
    return waitFor(() => {
      expect(fetchPolicies).toHaveBeenCalled()
    })
  })

  it("should call web.setBucketPolicy and fetchPolicies on submit", () => {
    const fetchPolicies = jest.fn()
    render(
      <PolicyInput currentBucket={"bucket"} policies={[]} fetchPolicies={fetchPolicies} setPolicies={jest.fn()} showAlert={jest.fn()} />
    )
    const prefixInput = screen.getByPlaceholderText("Prefix")
    fireEvent.change(prefixInput, { target: { value: "baz" } })
    const policySelect = screen.getByRole("combobox")
    fireEvent.change(policySelect, { target: { value: READ_ONLY } })
    const submitButton = screen.getByRole("button")
    fireEvent.click(submitButton)

    expect(web.SetBucketPolicy).toHaveBeenCalledWith({
      bucketName: "bucket",
      prefix: "baz",
      policy: READ_ONLY
    })

    return waitFor(() => {
      expect(fetchPolicies).toHaveBeenCalledWith("bucket")
    })
  })

  it("should change the prefix '*' to an empty string", () => {
    const fetchPolicies = jest.fn()
    render(
      <PolicyInput currentBucket={"bucket"} policies={[]} fetchPolicies={fetchPolicies} setPolicies={jest.fn()} showAlert={jest.fn()} />
    )
    const prefixInput = screen.getByPlaceholderText("Prefix")
    fireEvent.change(prefixInput, { target: { value: "*" } })
    const btn = screen.getByRole("button")
    fireEvent.click(btn)
    return waitFor(() => {
      expect(prefixInput.value).toEqual("")
    })
  })
})
