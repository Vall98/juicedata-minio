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

import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { ObjectActions } from "../ObjectActions"
import store from "../../store/store"

describe("ObjectActions", () => {
  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <ObjectActions object={{ name: "obj1" }} currentPrefix={"pre1/"} />
      </Provider>
    )
  })

  it("should show DeleteObjectConfirmModal when delete action is clicked", () => {
    render(
      <Provider store={store}>
        <ObjectActions object={{ name: "obj1" }} currentPrefix={"pre1/"} />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const deleteLink = screen.getByRole("link", { name: /delete/i })
    fireEvent.click(deleteLink)
    expect(screen.getByRole("dialog")).not.toBeNull()
  })

  it("should hide DeleteObjectConfirmModal when Cancel button is clicked", () => {
    render(
      <Provider store={store}>
        <ObjectActions object={{ name: "obj1" }} currentPrefix={"pre1/"} />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const deleteLink = screen.getByRole("link", { name: /delete/i })
    fireEvent.click(deleteLink)
    const cancelBtn = screen.getByRole("button", { name: /cancel/i })
    fireEvent.click(cancelBtn)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("should call deleteObject with object name", () => {
    const deleteObject = jest.fn()
    render(
      <Provider store={store}>
        <ObjectActions
          object={{ name: "obj1" }}
          currentPrefix={"pre1/"}
          deleteObject={deleteObject}
        />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const deleteLink = screen.getByRole("link", { name: /delete/i })
    fireEvent.click(deleteLink)
    const delBtn = screen.getByRole("button", { name: /delete/i })
    fireEvent.click(delBtn)
    expect(deleteObject).toHaveBeenCalledWith("obj1")
  })


  it("should call downloadObject when single object is selected and download button is clicked", () => {
    const downloadObject = jest.fn()
    render(
      <Provider store={store}>
        <ObjectActions
          object={{ name: "obj1" }}
          currentPrefix={"pre1/"}
          downloadObject={downloadObject} />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const downloadLink = screen.getByRole("link", { name: /download/i })
    fireEvent.click(downloadLink)
    expect(downloadObject).toHaveBeenCalled()
  })


  it("should show PreviewObjectModal when preview action is clicked", () => {
    render(
      <Provider store={store}>
        <ObjectActions
          object={{ name: "obj1", contentType: "image/jpeg" }}
          currentPrefix={"pre1/"}
          getObjectURL={jest.fn()}
        />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const previewLink = screen.getByRole("link", { name: /preview/i })
    fireEvent.click(previewLink)
    expect(screen.getByRole("dialog")).not.toBeNull()
  })

  it("should hide PreviewObjectModal when cancel button is clicked", () => {
    render(
      <Provider store={store}>
        <ObjectActions
          object={{ name: "obj1", contentType: "image/jpeg" }}
          currentPrefix={"pre1/"}
          getObjectURL={jest.fn()}
        />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const previewLink = screen.getByRole("link", { name: /preview/i })
    fireEvent.click(previewLink)
    const cancelBtn = screen.getByRole("button", { name: /cancel/i })
    fireEvent.click(cancelBtn)
    expect(screen.queryByRole("dialog")).toBeNull()
  })
  it("should not show PreviewObjectModal when preview action is clicked if object is not an image", () => {
    render(
      <Provider store={store}>
        <ObjectActions
          object={{ name: "obj1" }}
          currentPrefix={"pre1/"} />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const links = screen.getAllByRole("link")
    expect(links.length).toBe(3) // find only the other 2
  })

  it("should call shareObject with object and expiry", () => {
    const shareObject = jest.fn()
    render(
      <Provider store={store}>
        <ObjectActions
          object={{ name: "obj1" }}
          currentPrefix={"pre1/"}
          shareObject={shareObject}
        />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const shareLink = screen.getByRole("link", { name: /share/i })
    fireEvent.click(shareLink)
    expect(shareObject).toHaveBeenCalledWith("obj1", 5, 0, 0)
  })

  it("should render ShareObjectModal when an object is shared", () => {
    render(
      <Provider store={store}>
        <ObjectActions
          object={{ name: "obj1" }}
          currentPrefix={"pre1/"}
          showShareObjectModal={true}
          shareObjectName={"obj1"}
        />
      </Provider>
    )
    expect(screen.queryByText(/Share Object/i)).not.toBeNull()
  })

  it("shouldn't render ShareObjectModal when the names of the objects don't match", () => {
    render(
      <Provider store={store}>
        <ObjectActions
          object={{ name: "obj1" }}
          currentPrefix={"pre1/"}
          showShareObjectModal={true}
          shareObjectName={"obj2"}
        />
      </Provider>
    )
    expect(screen.queryByText(/Share Object/i)).toBeNull()
  })
})
