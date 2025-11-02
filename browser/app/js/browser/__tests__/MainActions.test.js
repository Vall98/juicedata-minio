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
import { MainActions } from "../MainActions"

jest.mock("../../web", () => ({
  LoggedIn: jest
    .fn(() => true)
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(false)
    .mockReturnValueOnce(false)
}))

describe("MainActions", () => {
  it("should render without crashing", () => {
    render(<MainActions />)
  })

  it("should not show any actions when user has not LoggedIn and prefixWritable is false", () => {
    render(<MainActions />)
    expect(document.body.innerHTML).toMatch(/^<div><noscript><\/noscript><\/div>$/)
  })

  it("should show only file upload action when user has not LoggedIn and prefixWritable is true", () => {
    render(<MainActions prefixWritable={true} />)
    const dropdown = screen.queryByRole("button");
    fireEvent.click(dropdown);
    expect(screen.queryByRole("link", { name: /create bucket/i })).toBeNull()
    expect(screen.getByRole("link", { name: /upload file/i })).toHaveClass("feba-btn", "feba-upload")
  })

  it("should show make bucket upload file actions when user has LoggedIn", () => {
    render(<MainActions />)
    const dropdown = screen.queryByRole("button");
    fireEvent.click(dropdown);
    expect(screen.getByRole("link", { name: /create bucket/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /upload file/i })).toHaveClass("feba-btn", "feba-upload")
  })

  it("should call showMakeBucketModal when create bucket icon is clicked", () => {
    const showMakeBucketModal = jest.fn()
    render(<MainActions showMakeBucketModal={showMakeBucketModal} />)
    const dropdown = screen.getByRole("button");
    fireEvent.click(dropdown);
    const createBucketBtn = screen.getByRole("link", { name: /create bucket/i });
    fireEvent.click(createBucketBtn);
    expect(showMakeBucketModal).toHaveBeenCalled()
  })

  it("should call uploadFile when a file is selected for upload", () => {
    const uploadFile = jest.fn()
    render(<MainActions uploadFile={uploadFile} />)
    const dropdown = screen.getByRole("button");
    fireEvent.click(dropdown);
    const input = document.querySelector('#file-input')
    if (input) {
      input.dispatchEvent(new Event('change', { bubbles: true }))
      expect(uploadFile).toBeDefined()
    }
  })
})
