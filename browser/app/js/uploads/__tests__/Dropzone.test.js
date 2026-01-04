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
import { render } from "@testing-library/react"
import * as ReactDropzone from "react-dropzone";
import { Dropzone } from "../Dropzone"

describe("Dropzone", () => {
  it("should render without crashing", () => {
    render(<Dropzone />)
  })

  it("should call uploadFile with files", () => {
    const uploadFile = jest.fn()
    let onDropHandler
    jest.spyOn(ReactDropzone, "useDropzone").mockImplementation(({ onDrop }) => {
      onDropHandler = onDrop
      return {
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        isDragActive: false,
        isDragReject: false,
      };
    });
    render(<Dropzone uploadFile={uploadFile} />)
    expect(onDropHandler).toBeDefined();
    const file1 = new File(["file content1"], "file1.txt", { type: "text/plain" })
    const file2 = new File(["file content2"], "file2.txt", { type: "text/plain" })
    onDropHandler([file1, file2])
    expect(uploadFile).toHaveBeenCalledTimes(2)
    expect(uploadFile).toHaveBeenNthCalledWith(1, file1)
    expect(uploadFile).toHaveBeenNthCalledWith(2, file2)
  })
})
