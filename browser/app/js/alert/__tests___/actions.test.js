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
import * as actionsAlert from "../actions"
import alertReducer from "../reducer"

jest.useFakeTimers()

describe("Alert actions", () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { alert: alertReducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  })

  it("creates alert/SET action", () => {
    store.dispatch(actionsAlert.set({ message: "Test alert", type: "danger" }))
    const state = store.getState()
    expect(state.alert).toEqual({ show: true, id: 0, message: "Test alert", type: "danger" })
  })

  it("creates alert/CLEAR action for non danger alerts", () => {
    store.dispatch(actionsAlert.set({ message: "Test alert", type: "test" }))
    let state = store.getState()
    expect(state.alert).toEqual({ show: true, id: 1, message: "Test alert", type: "test" })
    jest.runAllTimers()
    state = store.getState()
    expect(state.alert).toEqual({"show": false, "type": "danger"})
  })

  it("creates alert/CLEAR action directly", () => {
    store.dispatch(actionsAlert.clear())
    const state = store.getState()
    expect(state.alert).toEqual({"show": false, "type": "danger"})
  })
})
