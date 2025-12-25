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
import { render, fireEvent, screen } from "@testing-library/react"
import { Path } from "../Path"

describe("Path", () => {
  it("should render without crashing", () => {
    render(<Path currentBucket={"test1"} currentPrefix={"test2"} />)
  })

  it("should render only bucket if there is no prefix", () => {
    render(<Path currentBucket={"test1"} currentPrefix={""} />)
    const bucket = screen.getByRole("link", { name: "test1" })
    expect(bucket.parentElement.parentElement.children.length).toBe(2) // only one <span> in the <h2> title, + the edit link.
  })

  it("should render bucket and prefix", () => {
    render(
      <Path currentBucket={"test1"} currentPrefix={"a/b/"} />
    )
    const bucket = screen.getByRole("link", { name: "test1" })
    const prefix1 = screen.getByRole("link", { name: "a" })
    const prefix2 = screen.getByRole("link", { name: "b" })
    expect(bucket.parentElement.parentElement.children.length).toBe(4) // 3 <span> in the <h2> title, + the edit link.
    expect(prefix1).toBeTruthy()
    expect(prefix2).toBeTruthy()
  })

  it("should call selectPrefix when a prefix part is clicked", () => {
    const selectPrefix = jest.fn()
    render(
      <Path
        currentBucket={"test1"}
        currentPrefix={"a/b/"}
        selectPrefix={selectPrefix}
      />
    )
    const link = screen.getByRole("link", { name: "b" })
    fireEvent.click(link)
    expect(selectPrefix).toHaveBeenCalledWith("a/b/")
  })

  it("should switch to input mode when edit icon is clicked", () => {
    render(<Path currentBucket={"test1"} currentPrefix={""} />)
    const edit = screen.getByRole("link", { name: "" })
    fireEvent.click(edit)
    expect(screen.getByPlaceholderText('Choose or create new path')).toBeTruthy()
  })

  it("should navigate to prefix when user types path for existing bucket", () => {
    const selectBucket = jest.fn()
    const buckets = ["test1", "test2"]
    render(
      <Path
        buckets={buckets}
        currentBucket={"test1"}
        currentPrefix={""}
        selectBucket={selectBucket}
      />
    )
    const edit = screen.getByRole("link", { name: "" })
    fireEvent.click(edit)
    const input = screen.getByPlaceholderText('Choose or create new path')
    fireEvent.change(input, { target: { value: 'test2/dir1/' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    expect(selectBucket).toHaveBeenCalledWith("test2", "dir1/")
  })

  it("should create a new bucket if bucket typed in path doesn't exist", () => {
    const makeBucket = jest.fn()
    const buckets = ["test1", "test2"]
    render(
      <Path
        buckets={buckets}
        currentBucket={"test1"}
        currentPrefix={""}
        makeBucket={makeBucket}
      />
    )
    const edit = screen.getByRole("link", { name: "" })
    fireEvent.click(edit)
    const input = screen.getByPlaceholderText('Choose or create new path')
    fireEvent.change(input, { target: { value: 'test3/dir1/' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    expect(makeBucket).toHaveBeenCalledWith("test3")
  })

  it("should not make or select bucket if path doesn't point to bucket", () => {
    const makeBucket = jest.fn()
    const selectBucket = jest.fn()
    const buckets = ["test1", "test2"]
    render(
      <Path
        buckets={buckets}
        currentBucket={"test1"}
        currentPrefix={""}
        makeBucket={makeBucket}
        selectBucket={selectBucket}
      />
    )
    const edit = screen.getByRole("link", { name: "" })
    fireEvent.click(edit)
    const input = screen.getByPlaceholderText('Choose or create new path')
    fireEvent.change(input, { target: { value: '//dir1/dir2/' } })
    const form = input.closest('form')
    expect(form).not.toBeNull()
    fireEvent.submit(form)
    expect(makeBucket).not.toHaveBeenCalled()
    expect(selectBucket).not.toHaveBeenCalled()
  })
})
