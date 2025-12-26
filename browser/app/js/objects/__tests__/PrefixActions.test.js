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
import { render, fireEvent, screen, within } from "@testing-library/react"
import { PrefixActions } from "../PrefixActions"

describe("PrefixActions", () => {
  it("should render without crashing", () => {
    render(<PrefixActions object={{ name: "abc/" }} currentPrefix={"pre1/"} />)
  })

  it("should show DeleteObjectConfirmModal when delete action is clicked", () => {
    render(
      <PrefixActions object={{ name: "abc/" }} currentPrefix={"pre1/"} />
    )
    expect(screen.queryByRole("dialog")).toBeNull()
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const deleteLink = screen.getByRole("link", { name: "Delete" })
    fireEvent.click(deleteLink)
    expect(screen.getAllByRole("dialog")).toBeTruthy()
  })

  it("should hide DeleteObjectConfirmModal when Cancel button is clicked", () => {
    render(
      <PrefixActions object={{ name: "abc/" }} currentPrefix={"pre1/"} />
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const deleteLink = screen.getByRole("link", { name: "Delete" })
    fireEvent.click(deleteLink)
    const dialog = screen.getAllByRole("dialog")[0]
    const cancel = within(dialog).getByText("Cancel")
    fireEvent.click(cancel)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("should call deleteObject with object name", () => {
    const deleteObject = jest.fn()
    render(
      <PrefixActions
        object={{ name: "abc/" }}
        currentPrefix={"pre1/"}
        deleteObject={deleteObject}
      />
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const deleteLink = screen.getByRole("link", { name: "Delete" })
    fireEvent.click(deleteLink)
    const dialog = screen.getAllByRole("dialog")[0]
    const delBtn = within(dialog).getByRole("button", { name: "Delete" })
    fireEvent.click(delBtn)
    expect(deleteObject).toHaveBeenCalledWith("abc/")
  })


  it("should call downloadPrefix when single object is selected and download button is clicked", () => {
    const downloadPrefix = jest.fn()
    render(
      <PrefixActions
        object={{ name: "abc/" }}
        currentPrefix={"pre1/"}
        downloadPrefix={downloadPrefix} />
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const downloadLink = screen.getByRole("link", { name: "Download as zip" })
    fireEvent.click(downloadLink)
    expect(downloadPrefix).toHaveBeenCalled()
  })
})
