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
import { Policy } from "../Policy"
import { READ_ONLY, NONE } from "../../constants"
import web from "../../web"

jest.mock("../../web", () => ({
  SetBucketPolicy: jest.fn(() => {
    return Promise.resolve()
  })
}))

describe("Policy", () => {
  it("should render without crashing", () => {
    render(<Policy currentBucket={"bucket"} prefix={"foo"} policy={READ_ONLY} />)
  })

  it("should not render when policy is listed as 'none'", () => {
    render(<Policy currentBucket={"bucket"} prefix={"foo"} policy={NONE} />)
    expect(document.body.innerHTML).toBe("<div><noscript></noscript></div>")
  })

  it("should call web.setBucketPolicy and fetchPolicies on submit", () => {
    const fetchPolicies = jest.fn()
    render(
      <Policy
        currentBucket={"bucket"}
        prefix={"foo"}
        policy={READ_ONLY}
        fetchPolicies={fetchPolicies}
      />
    )
    const button = screen.getByRole("button")
    fireEvent.click(button, { preventDefault: jest.fn() })

    expect(web.SetBucketPolicy).toHaveBeenCalledWith({
      bucketName: "bucket",
      prefix: "foo",
      policy: "none"
    })

    return waitFor(() => {
      expect(fetchPolicies).toHaveBeenCalledWith("bucket")
    })
  })

  it("should change the empty string to '*' while displaying prefixes", () => {
    render(
      <Policy currentBucket={"bucket"} prefix={""} policy={READ_ONLY} />
    )
    const item = screen.getByText("*")
    expect(item.classList.contains("pmbl-item")).toBeTruthy()
  })
})
