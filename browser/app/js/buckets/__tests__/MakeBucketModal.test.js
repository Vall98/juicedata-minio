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
import { MakeBucketModal } from "../MakeBucketModal"

describe("MakeBucketModal", () => {
  it("should render without crashing", () => {
    render(<MakeBucketModal />)
  })

  it("should call hideMakeBucketModal when close button is clicked", () => {
    const hideMakeBucketModal = jest.fn()
    render(
    <MakeBucketModal hideMakeBucketModal={hideMakeBucketModal} showMakeBucketModal={true} />
    )
    const button = screen.getByRole("button")
    fireEvent.click(button)
    expect(hideMakeBucketModal).toHaveBeenCalled()
  })

  it("bucketName should be cleared before hiding the modal", () => {
    const hideMakeBucketModal = jest.fn()
    render(
      <MakeBucketModal hideMakeBucketModal={hideMakeBucketModal} showMakeBucketModal={true} />
    )
    const input = screen.getByRole("textbox")
    fireEvent.change(input, {
      target: { value: "test" }
    })
    expect(input.value).toBe("test")
    const button = screen.getByRole("button")
    fireEvent.click(button)
    expect(input.value).toBe("")
  })

  it("should call makeBucket when the form is submitted", () => {
    const makeBucket = jest.fn()
    const hideMakeBucketModal = jest.fn()
    render(
      <MakeBucketModal
        makeBucket={makeBucket}
        hideMakeBucketModal={hideMakeBucketModal}
        showMakeBucketModal={true}
      />
    )
    const input = screen.getByRole("textbox")
    fireEvent.change(input, {
      target: { value: "test" }
    })
    const form = input.closest('form')
    expect(form).not.toBeNull()
    if (form) fireEvent.submit(form, { preventDefault: jest.fn() })
    expect(makeBucket).toHaveBeenCalledWith("test")
  })

  it("should call hideMakeBucketModal and clear bucketName after the form is submited", () => {
    const makeBucket = jest.fn()
    const hideMakeBucketModal = jest.fn()
    render(
      <MakeBucketModal
        makeBucket={makeBucket}
        hideMakeBucketModal={hideMakeBucketModal}
        showMakeBucketModal={true}
      />
    )
    const input = screen.getByRole("textbox")
    fireEvent.change(input, {
      target: { value: "test" }
    })
    const form = input.closest('form')
    expect(form).not.toBeNull()
    if (form) fireEvent.submit(form, { preventDefault: jest.fn() })
    expect(hideMakeBucketModal).toHaveBeenCalled()
    expect(input.value).toBe("")
  })
})
