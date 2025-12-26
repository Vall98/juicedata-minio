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
import { Provider } from "react-redux"
import { ObjectActions } from "../ObjectActions"
import configureStore from "../../store/configure-store"

describe("ObjectActions", () => {
  let store
  beforeEach(() => {
    store = configureStore()
  })

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
    const deleteLink = screen.getByRole("link", { name: "Delete" })
    fireEvent.click(deleteLink)
    expect(screen.getByText("Are you sure you want to delete?")).not.toBeNull()
  })

  it("should hide DeleteObjectConfirmModal when Cancel button is clicked", () => {
    render(
      <Provider store={store}>
        <ObjectActions object={{ name: "obj1" }} currentPrefix={"pre1/"} />
      </Provider>
    )
    const toggle = screen.getByRole("button")
    fireEvent.click(toggle)
    const deleteLink = screen.getByRole("link", { name: "Delete" })
    fireEvent.click(deleteLink)
    expect(screen.getByText("Are you sure you want to delete?")).not.toBeNull()
    const cancelBtn = screen.getByRole("button", { name: "Cancel" })
    fireEvent.click(cancelBtn)
    expect(screen.queryByText("Are you sure you want to delete?")).toBeNull()
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
    const deleteLink = screen.getByRole("link", { name: "Delete" })
    fireEvent.click(deleteLink)
    const delBtn = screen.getByRole("button", { name: "Delete" })
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
    const downloadLink = screen.getByRole("link", { name: "Download" })
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
    const previewLink = screen.getByRole("link", { name: "Preview" })
    fireEvent.click(previewLink)
    expect(screen.getByText("Preview")).not.toBeNull()
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
    const previewLink = screen.getByRole("link", { name: "Preview" })
    fireEvent.click(previewLink)
    expect(screen.getByText("Preview")).not.toBeNull()
    const cancelBtn = screen.getByRole("button", { name: "Cancel" })
    fireEvent.click(cancelBtn)
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.queryByText("Preview")).toBeNull()
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
    const shareLink = screen.getByRole("link", { name: "Share" })
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
    expect(screen.queryByText("Share Object")).not.toBeNull()
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
    expect(screen.queryByText("Share Object")).toBeNull()
  })
})
