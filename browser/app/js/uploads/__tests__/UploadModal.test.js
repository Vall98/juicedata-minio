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

import { fireEvent, render, screen } from "@testing-library/react"
import { UploadModal } from "../UploadModal"
import { Provider } from "react-redux"
import store from "../../store/store"

describe("UploadModal", () => {
  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <UploadModal uploads={{}} />
      </Provider>
    )
  })

  it("should render AbortConfirmModal when showAbort is true", () => {
    render(
      <Provider store={store}>
        <UploadModal uploads={{}} showAbort={true} />
      </Provider>
    )
    const modal = screen.getByRole("dialog")
    const modalText = screen.getByText("Abort uploads in progress?")
    expect(modal).toBeInTheDocument()
    expect(modalText).toBeInTheDocument()
  })

  it("should render nothing when there are no files being uploaded", () => {
    render(
      <Provider store={store}>
        <UploadModal uploads={{}} />
      </Provider>
    )
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.queryByRole("progressbar")).toBeNull()
  })

  it("should show upload progress when one or more files are being uploaded", () => {
    render(
      <Provider store={store}>
        <UploadModal
          uploads={{ "a-b/-test": { size: 100, loaded: 50, name: "test" } }}
        />
      </Provider>
    )
    const progressbar = screen.getByRole("progressbar")
    expect(progressbar).toHaveAttribute("aria-valuenow", "50")
  })

  it("should call showAbortModal when close button is clicked", () => {
    const showAbortModal = jest.fn()
    render(
      <Provider store={store}>
        <UploadModal
          uploads={{ "a-b/-test": { size: 100, loaded: 50, name: "test" } }}
          showAbortModal={showAbortModal}
        />
      </Provider>
    )
    const btn = screen.getByRole("button", { name: "×" })
    fireEvent.click(btn)
    expect(showAbortModal).toHaveBeenCalled()
  })
})
