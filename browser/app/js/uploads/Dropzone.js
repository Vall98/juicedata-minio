/*
 * MinIO Cloud Storage (C) 2016, 2018 MinIO, Inc.
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

import React, { useCallback } from "react"
import { connect } from "react-redux"
import { useDropzone } from "react-dropzone"
import * as actions from "./actions"

// Dropzone is a drag-and-drop element for uploading files. It will create a
// landing zone of sorts that automatically receives the files.
export function Dropzone(props) {
  const { uploadFile, children } = props

  const onDrop = useCallback(files => {
    // FIXME: Currently you can upload multiple files, but only one abort
    // modal will be shown, and progress updates will only occur for one
    // file at a time. See #171.
    files.forEach(file => {
      uploadFile(file)
    })
  })

  // noClick/noKeyboard mean that it won't trigger a file upload box when
  // the user clicks in the dropzone.
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: onDrop,
  });

  // Overwrite the default styling from react-dropzone; otherwise it
  // won't handle child elements correctly.
  const style = {
    flex: "1",
    borderWidth: "0",
    borderStyle: "dashed",
    borderColor: "#fff"
  }
  const activeStyle = {
    borderWidth: "2px",
    borderColor: "#777"
  }
  const rejectStyle = {
    backgroundColor: "#ffdddd"
  }
  const getStyle = (isDragActive, isDragReject) => ({
    ...style,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  })

  return (
    <div
      {...getRootProps()}
      style={getStyle(isDragActive, isDragReject)}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  )
}

const mapDispatchToProps = dispatch => {
  return {
    uploadFile: file => dispatch(actions.uploadFile(file))
  }
}

export default connect(undefined, mapDispatchToProps)(Dropzone)
