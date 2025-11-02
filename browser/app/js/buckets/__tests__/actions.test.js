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
import * as actionsBuckets from "../actions"
import history from "../../history"
import alertReducer from "../../alert/reducer"
import bucketsReducer from "../reducer"

jest.mock("../../web", () => ({
  ListBuckets: jest.fn(() => {
    return Promise.resolve({ buckets: [{ name: "test1" }, { name: "test2" }] })
  }),
  MakeBucket: jest.fn(() => {
    return Promise.resolve()
  }),
  DeleteBucket: jest.fn(() => {
    return Promise.resolve()
  })
}))

jest.mock("../../objects/actions", () => ({
  selectPrefix: () => dispatch => { }
}))

describe("Buckets actions", () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { alert: alertReducer, buckets: bucketsReducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  })

  it("creates buckets/SET_LIST and buckets/SET_CURRENT_BUCKET with first bucket after fetching the buckets", () => {
    const expectedState = {
      currentBucket: "test1",
      filter: "",
      list: ["test1", "test2"],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    return store.dispatch(actionsBuckets.fetchBuckets()).then(() => {
      const state = store.getState()
      expect(state.buckets).toEqual(expectedState)
    })
  })

  it("creates buckets/SET_CURRENT_BUCKET with bucket name in the url after fetching buckets", () => {
    history.push("/test2")
    const expectedState = {
      currentBucket: "test2",
      filter: "",
      list: ["test1", "test2"],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    return store.dispatch(actionsBuckets.fetchBuckets()).then(() => {
      const state = store.getState()
      expect(state.buckets).toEqual(expectedState)
    })
  })

  it("creates buckets/SET_CURRENT_BUCKET with first bucket when the bucket in url is not exists after fetching buckets", () => {
    history.push("/test3")
    const expectedState = {
      currentBucket: "test1",
      filter: "",
      list: ["test1", "test2"],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    return store.dispatch(actionsBuckets.fetchBuckets()).then(() => {
      const state = store.getState()
      expect(state.buckets).toEqual(expectedState)
    })
  })

  it("creates buckets/SET_CURRENT_BUCKET action when selectBucket is called", () => {
    const expectedState = {
      currentBucket: "test1",
      filter: "",
      list: [],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    store.dispatch(actionsBuckets.selectBucket("test1"))
    const state = store.getState()
    expect(state.buckets).toEqual(expectedState)
  })

  it("creates buckets/SHOW_MAKE_BUCKET_MODAL for showMakeBucketModal", () => {
    const expectedState = {
      currentBucket: "",
      filter: "",
      list: [],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: true
    }
    store.dispatch(actionsBuckets.showMakeBucketModal())
    const state = store.getState()
    expect(state.buckets).toEqual(expectedState)
  })

  it("creates buckets/SHOW_MAKE_BUCKET_MODAL for hideMakeBucketModal", () => {
    const expectedState = {
      currentBucket: "",
      filter: "",
      list: [],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    store.dispatch(actionsBuckets.hideMakeBucketModal())
    const state = store.getState()
    expect(state.buckets).toEqual(expectedState)
  })

  it("creates buckets/SHOW_BUCKET_POLICY for showBucketPolicy", () => {
    const expectedState = {
      currentBucket: "",
      filter: "",
      list: [],
      policies: [],
      showBucketPolicy: true,
      showMakeBucketModal: false
    }
    store.dispatch(actionsBuckets.showBucketPolicy())
    const state = store.getState()
    expect(state.buckets).toEqual(expectedState)
  })

  it("creates buckets/SHOW_BUCKET_POLICY for hideBucketPolicy", () => {
    const expectedState = {
      currentBucket: "",
      filter: "",
      list: [],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    store.dispatch(actionsBuckets.hideBucketPolicy())
    const state = store.getState()
    expect(state.buckets).toEqual(expectedState)
  })

  it("creates buckets/SET_POLICIES action", () => {
    const expectedState = {
      currentBucket: "",
      filter: "",
      list: [],
      policies: ["test1", "test2"],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    store.dispatch(actionsBuckets.setPolicies(["test1", "test2"]))
    const state = store.getState()
    expect(state.buckets).toEqual(expectedState)
  })

  it("creates buckets/ADD action", () => {
    const expectedState = {
      currentBucket: "",
      filter: "",
      list: ["test"],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    store.dispatch(actionsBuckets.addBucket("test"))
    const state = store.getState()
    expect(state.buckets).toEqual(expectedState)
  })

  it("creates buckets/REMOVE action", () => {
    const expectedState = {
      currentBucket: "",
      filter: "",
      list: [],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    store.dispatch(actionsBuckets.removeBucket("test"))
    const state = store.getState()
    expect(state.buckets).toEqual(expectedState)
  })

  it("creates buckets/ADD and buckets/SET_CURRENT_BUCKET after creating the bucket", () => {
    const expectedState = {
      currentBucket: "test1",
      filter: "",
      list: ["test1"],
      policies: [],
      showBucketPolicy: false,
      showMakeBucketModal: false
    }
    return store.dispatch(actionsBuckets.makeBucket("test1")).then(() => {
      const state = store.getState()
      expect(state.buckets).toEqual(expectedState)
    })
  })

  it("creates alert/SET, buckets/REMOVE, buckets/SET_LIST and buckets/SET_CURRENT_BUCKET " +
    "after deleting the bucket", () => {
      const expectedState = {
        currentBucket: "test1",
        filter: "",
        list: ["test1", "test2"],
        policies: [],
        showBucketPolicy: false,
        showMakeBucketModal: false
      }
      return store.dispatch(actionsBuckets.deleteBucket("test3")).then(() => {
        const state = store.getState()
        expect(state.buckets).toEqual(expectedState)
        expect(state.alert).toEqual({
          id: 0,
          message: "Bucket 'test3' has been deleted.",
          show: true,
          type: "info"
        })
      })
    })
})
