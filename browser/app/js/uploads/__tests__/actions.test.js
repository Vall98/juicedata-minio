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

import { configureStore } from "@reduxjs/toolkit"
import * as bucketsActions from "../../buckets/actions"
import * as objectsActions from "../../objects/actions"
import * as uploadsActions from "../actions"
import alertReducer from "../../alert/reducer";
import bucketsReducer from "../../buckets/reducer"
import objectsReducer from "../../objects/reducer"
import uploadsReducer from "../reducer";

describe("Uploads actions", () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { alert: alertReducer, buckets: bucketsReducer, objects: objectsReducer, uploads: uploadsReducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  })

  it("creates uploads/ADD action", () => {
    store.dispatch(uploadsActions.add("a-b-c", 100, "test"))
    const state = store.getState()
    expect(state.uploads).toEqual({ files: { "a-b-c": { loaded: 0, name: "test", size: 100 } }, showAbortModal: false })
  })

  it("creates uploads/UPDATE_PROGRESS action", () => {
    store.dispatch(uploadsActions.updateProgress("a-b-c", 50))
    const state = store.getState()
    expect(state.uploads).toEqual({ files: { "a-b-c": { loaded: 50 } }, showAbortModal: false })
  })

  it("creates uploads/STOP action", () => {
    store.dispatch(uploadsActions.stop("a-b-c"))
    const state = store.getState()
    expect(state.uploads).toEqual({ files: {}, showAbortModal: false })
  })

  it("creates uploads/SHOW_ABORT_MODAL action", () => {
    store.dispatch(uploadsActions.showAbortModal())
    const state = store.getState()
    expect(state.uploads).toEqual({ files: {}, showAbortModal: true })
  })

  describe("uploadFile", () => {
    const file = new Blob(["file content"], {
      type: "text/plain"
    })
    file.name = "file1"

    it("creates alerts/SET action when currentBucket is not present", () => {
      store.dispatch(bucketsActions.setCurrentBucket())
      const file = new Blob(["file content"], { type: "text/plain" })
      store.dispatch(uploadsActions.uploadFile(file))
      const state = store.getState()
      expect(state.alert).toEqual({ id: 0, type: "danger", message: "Please choose a bucket before trying to upload files.", show: true })
      expect(state.uploads).toEqual({ files: {}, showAbortModal: false })
    })

    it("creates uploads/ADD action before uploading the file", () => {
      store.dispatch(bucketsActions.setCurrentBucket("test1"))
      store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
      store.dispatch(uploadsActions.uploadFile(file))
      const state = store.getState()
      expect(state.uploads).toEqual({ files: { "test1-pre1/-file1": { loaded: 0, name: "file1", size: 12 }}, showAbortModal: false })
    })

    it("should open and send XMLHttpRequest", () => {
      const open = jest.fn()
      const send = jest.fn()
      const xhrMockClass = () => ({
        open: open,
        send: send,
        setRequestHeader: jest.fn(),
        upload: {
          addEventListener: jest.fn()
        }
      })
      window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)
      store.dispatch(bucketsActions.setCurrentBucket("test1"))
      store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
      store.dispatch(uploadsActions.uploadFile(file))
      const objectPath = encodeURIComponent("pre1/file1")
      expect(open).toHaveBeenCalledWith(
        "PUT",
        "https://localhost:8080/upload/test1/" + objectPath,
        true
      )
      expect(send).toHaveBeenCalledWith(file)
    })
  })

  it("creates uploads/STOP and uploads/SHOW_ABORT_MODAL after abortUpload", () => {
    store.dispatch(uploadsActions.abortUpload("a-b/-c"))
    const state = store.getState()
    expect(state.uploads).toEqual({ files: {}, showAbortModal: false })
  })
})
