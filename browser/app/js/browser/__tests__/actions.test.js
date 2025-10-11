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
import * as actionsCommon from "../actions"
import browserReducer from "../reducer"

jest.mock("../../web", () => ({
  StorageInfo: jest.fn(() => {
    return Promise.resolve({
      used: 60
    })
  }),
  ServerInfo: jest.fn(() => {
    return Promise.resolve({
      MinioVersion: "test",
      MinioPlatform: "test",
      MinioRuntime: "test",
      MinioGlobalInfo: "test"
    })
  })
}))

describe("Common actions", () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { browser: browserReducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  })

  it("creates common/SET_STORAGE_INFO after fetching the storage details ", () => {
    return store.dispatch(actionsCommon.fetchStorageInfo()).then(() => {
      const state = store.getState()
      expect(state.browser).toEqual({ serverInfo: {}, sidebarOpen: false, storageInfo: { used: 60 } })
    })
  })

  it("creates common/SET_SERVER_INFO after fetching the server details", () => {
    const expectedActions = [
      {
        type: "common/SET_SERVER_INFO",
        serverInfo: {
          version: "test",
          platform: "test",
          runtime: "test",
          info: "test"
        }
      }
    ]
    return store.dispatch(actionsCommon.fetchServerInfo()).then(() => {
      const state = store.getState()
      expect(state.browser).toEqual({
        serverInfo: {
          version: "test", platform: "test", runtime: "test", info: "test", userInfo: undefined
        },
        storageInfo: {
          used: 0,
        },
        sidebarOpen: false,
      })
    })
  })
})
