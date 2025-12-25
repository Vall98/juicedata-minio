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
import { ObjectItem } from "../ObjectItem"

describe("ObjectItem", () => {
  it("should render without crashing", () => {
    render(<ObjectItem name={"test"} />)
  })

  it("should render with content type", () => {
    render(<ObjectItem name={"test.jpg"} contentType={"image/jpeg"} />)
    const nameLink = screen.getByText("test.jpg")
    const row = nameLink.closest("[data-type]")
    expect(row && row.getAttribute("data-type")).toBe("image")
  })

  it("shouldn't call onClick when the object isclicked", () => {
    const onClick = jest.fn()
    const checkObject = jest.fn()
    render(<ObjectItem name={"test"} checkObject={checkObject} />)
    const a = screen.getByText("test")
    fireEvent.click(a)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("should call onClick when the folder isclicked", () => {
    const onClick = jest.fn()
    render(<ObjectItem name={"test/"} onClick={onClick} />)
    const a = screen.getByText("test/")
    fireEvent.click(a)
    expect(onClick).toHaveBeenCalled()
  })

  it("should call checkObject when the object/prefix is checked", () => {
    const checkObject = jest.fn()
    render(
      <ObjectItem name={"test"} checked={false} checkObject={checkObject} />
    )
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(checkObject).toHaveBeenCalledWith("test")
  })

  it("should render checked checkbox", () => {
    render(<ObjectItem name={"test"} checked={true} />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox && checkbox.checked).toBeTruthy()
  })

  it("should call uncheckObject when the object/prefix is unchecked", () => {
    const checkObject = jest.fn()
    const uncheckObject = jest.fn()
    render(
      <ObjectItem
        name={"test"}
        checked={true}
        checkObject={checkObject}
        uncheckObject={uncheckObject}
      />
    )
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(uncheckObject).toHaveBeenCalledWith("test")
  })
})
