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

import { render, screen, fireEvent, within } from "@testing-library/react"
import { ObjectsBulkActions } from "../ObjectsBulkActions"

describe("ObjectsBulkActions", () => {
  it("should render without crashing", () => {
    render(<ObjectsBulkActions checkedObjects={[]} />)
  })

  it("should show actions when checkObjectsCount is more than 0", () => {
    render(<ObjectsBulkActions checkedObjects={["test"]} />)
    const label = screen.getByText(/Object selected/i)
    const root = label.closest('.list-actions')
    expect(root).toHaveClass('list-actions-toggled')
  })

  it("should call downloadObject when single object is selected and download button is clicked", () => {
    const downloadObject = jest.fn()
    const clearChecked = jest.fn()
    render(
      <ObjectsBulkActions
        checkedObjects={["test"]}
        downloadObject={downloadObject}
        clearChecked={clearChecked}
      />
    )
    const btn = screen.getByRole('button', { name: /download/i })
    fireEvent.click(btn)
    expect(downloadObject).toHaveBeenCalled()
  })

  it("should call downloadChecked when a folder is selected and download button is clicked", () => {
    const downloadChecked = jest.fn()
    render(
      <ObjectsBulkActions
        checkedObjects={["test/"]}
        downloadChecked={downloadChecked}
      />
    )
    const btn = screen.getByRole('button', { name: /download/i })
    fireEvent.click(btn)
    expect(downloadChecked).toHaveBeenCalled()
  })

  it("should call downloadChecked when multiple objects are selected and download button is clicked", () => {
    const downloadChecked = jest.fn()
    render(
      <ObjectsBulkActions
        checkedObjects={["test1", "test2"]}
        downloadChecked={downloadChecked}
      />
    )
    const btn = screen.getByRole('button', { name: /download/i })
    fireEvent.click(btn)
    expect(downloadChecked).toHaveBeenCalled()
  })

  it("should call clearChecked when close button is clicked", () => {
    const clearChecked = jest.fn()
    render(
      <ObjectsBulkActions checkedObjects={["test"]} clearChecked={clearChecked} />
    )
    const closeBtn = screen.getByRole('button', { name: /close selected/i })
    fireEvent.click(closeBtn)
    expect(clearChecked).toHaveBeenCalled()
  })

  it("shoud show DeleteObjectConfirmModal when delete-checked button is clicked", () => {
    render(<ObjectsBulkActions checkedObjects={["test"]} />)
    const btn = screen.getByRole('button', { name: /delete selected|delete/i })
    fireEvent.click(btn)
    // modal should be present in the DOM
    expect(screen.getByRole('dialog')).not.toBeNull()
  })

  it("shoud call deleteChecked when Delete is clicked on confirmation modal", () => {
    const deleteChecked = jest.fn()
    render(
      <ObjectsBulkActions
        checkedObjects={["test"]}
        deleteChecked={deleteChecked}
      />
    )
    const btn = screen.getByRole('button', { name: /delete selected/i })
    fireEvent.click(btn)
    // click the Delete button inside modal using within(dialog)
    const dialog = screen.getByRole('dialog')
    const delBtn = within(dialog).getByRole('button', { name: /delete/i })
    fireEvent.click(delBtn)
    expect(deleteChecked).toHaveBeenCalled()
    // modal should be closed
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
