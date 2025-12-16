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
import * as alertActions from "../../alert/actions"
import * as browserActions from "../../browser/actions"
import * as bucketsActions from "../../buckets/actions"
import * as objectsActions from "../actions"
import {
  minioBrowserPrefix,
  SORT_BY_NAME,
  SORT_ORDER_DESC
} from "../../constants"
import alertReducer from "../../alert/reducer"
import browserReducer from "../../browser/reducer"
import bucketsReducer from "../../buckets/reducer"
import objectsReducer from "../reducer"
import { navigate } from "../../navigation"

jest.mock("../../navigation", () => ({
  navigate: jest.fn()
}))

jest.mock("../../web", () => ({
  LoggedIn: jest
    .fn(() => true)
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(false)
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(false),
  ListObjects: jest.fn(({ bucketName }) => {
    if (bucketName === "test-deny") {
      return Promise.reject({
        message: "listobjects is denied"
      })
    } else {
      return Promise.resolve({
        objects: [{ name: "test1" }, { name: "test2" }],
        writable: false
      })
    }
  }),
  RemoveObject: jest.fn(({ bucketName, objects }) => {
    if (!bucketName) {
      return Promise.reject({ message: "Invalid bucket" })
    }
    return Promise.resolve({})
  }),
  PresignedGet: jest.fn(({ bucket, object }) => {
    if (!bucket) {
      return Promise.reject({ message: "Invalid bucket" })
    }
    return Promise.resolve({ url: "https://test.com/bk1/pre1/b.txt" })
  }),
  CreateURLToken: jest
    .fn()
    .mockImplementationOnce(() => {
      return Promise.resolve({ token: "test" })
    })
    .mockImplementationOnce(() => {
      return Promise.reject({ message: "Error in creating token" })
    })
    .mockImplementationOnce(() => {
      return Promise.resolve({ token: "test" })
    })
    .mockImplementationOnce(() => {
      return Promise.resolve({ token: "test" })
    }),
  GetBucketPolicy: jest.fn(({ bucketName, prefix }) => {
    if (!bucketName) {
      return Promise.reject({ message: "Invalid bucket" })
    }
    if (bucketName === 'test-public') return Promise.resolve({ policy: 'readonly' })
    return Promise.resolve({})
  })
}))

const setLocation = jest.fn()

describe("Objects actions", () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { alert: alertReducer, browser: browserReducer, buckets: bucketsReducer, objects: objectsReducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  })

  it("creates objects/SET_LIST action", () => {
    store.dispatch(
      objectsActions.setList([{ name: "test1" }, { name: "test2" }])
    )
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [{ name: "test1" }, { name: "test2" }],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "asc"
    })
  })

  it("creates objects/SET_SORT_BY action", () => {
    store.dispatch(objectsActions.setSortBy(SORT_BY_NAME))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "name",
      sortOrder: "asc"
    })
  })

  it("creates objects/SET_SORT_ORDER action", () => {
    store.dispatch(objectsActions.setSortOrder(SORT_ORDER_DESC))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "desc"
    })
  })

  it("creates objects/SET_LIST after fetching the objects", () => {
    store.dispatch(bucketsActions.setCurrentBucket("bk1"))
    store.dispatch(objectsActions.setCurrentPrefix(""))
    return store.dispatch(objectsActions.fetchObjects()).then(() => {
      const state = store.getState()
      expect(state.objects).toEqual({
        checkedList: [],
        currentPrefix: "",
        filter: "",
        list: [{ name: "test2" }, { name: "test1" }],
        listLoading: false,
        prefixWritable: false,
        shareObject: {
          object: "",
          show: false,
          url: ""
        },
        sortBy: "last-modified",
        sortOrder: "desc"
      })
    })
  })

  it("creates objects/RESET_LIST after failing to fetch the objects from bucket with ListObjects denied for LoggedIn users", () => {
    store.dispatch(bucketsActions.setCurrentBucket("test-deny"))
    store.dispatch(objectsActions.setCurrentPrefix(""))
    return store.dispatch(objectsActions.fetchObjects()).then(() => {
      const state = store.getState()
      expect(state.objects).toEqual({
        checkedList: [],
        currentPrefix: "",
        filter: "",
        list: [],
        listLoading: false,
        prefixWritable: false,
        shareObject: {
          object: "",
          show: false,
          url: ""
        },
        sortBy: "",
        sortOrder: "asc"
      })
      expect(state.alert).toEqual({
        id: alertActions.alertId - 1,
        message: "listobjects is denied",
        show: true,
        type: "danger"
      })
    })
  })

  it("redirect to login after failing to fetch the objects from bucket for non-LoggedIn users", () => {
    store.dispatch(bucketsActions.setCurrentBucket("test-deny"))
    store.dispatch(objectsActions.setCurrentPrefix(""))
    return store.dispatch(objectsActions.fetchObjects()).then(() => {
      expect(navigate).toHaveBeenCalledWith("/login");
    })
  })

  it("creates objects/SET_SORT_BY and objects/SET_SORT_ORDER when sortObjects is called", () => {
    store.dispatch(objectsActions.setList([]))
    store.dispatch(objectsActions.setSortBy(""))
    store.dispatch(objectsActions.setSortOrder(SORT_ORDER_DESC))
    store.dispatch(objectsActions.sortObjects(SORT_BY_NAME))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "name",
      sortOrder: "asc" // sortObjects called with a new sortBy value, sortOrder should reset to ASC by default
    })
  })

  it("should update browser url and creates objects/SET_CURRENT_PREFIX and objects/CHECKED_LIST_RESET actions when selectPrefix is called", () => {
    store.dispatch(bucketsActions.setCurrentBucket("test"))
    store.dispatch(objectsActions.setCurrentPrefix(""))
    store.dispatch(objectsActions.selectPrefix("abc/"))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "abc/",
      filter: "",
      list: [],
      listLoading: true,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "asc"
    })
    expect(navigate).toHaveBeenCalledWith("/test/abc/", { replace: true });
  })

  it("create objects/SET_PREFIX_WRITABLE action", () => {
    store.dispatch(objectsActions.setPrefixWritable(true))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: true,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "asc"
    })
  })

  it("creates objects/REMOVE action", () => {
    store.dispatch(objectsActions.setList([{ name: "obj1", name: "obj2" }]))
    store.dispatch(objectsActions.removeObject("obj1"))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [{ name: "obj2" }],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "asc"
    })
  })

  it("creates objects/REMOVE action when object is deleted", () => {
    store.dispatch(bucketsActions.setCurrentBucket("test"))
    store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
    store.dispatch(objectsActions.setList([{ name: "obj1", name: "obj2" }]))
    store.dispatch(objectsActions.deleteObject("obj1")).then(() => {
      const state = store.getState()
      expect(state.objects).toEqual({
        checkedList: [],
        currentPrefix: "pre1/",
        filter: "",
        list: [{ name: "obj2" }],
        listLoading: false,
        prefixWritable: false,
        shareObject: {
          object: "",
          show: false,
          url: ""
        },
        sortBy: "",
        sortOrder: "asc"
      })
    })
  })

  it("creates alert/SET action when invalid bucket is provided", () => {
    store.dispatch(bucketsActions.setCurrentBucket(""))
    store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
    return store.dispatch(objectsActions.deleteObject("obj1")).then(() => {
      const state = store.getState()
      expect(state.objects).toEqual({
        checkedList: [],
        currentPrefix: "pre1/",
        filter: "",
        list: [],
        listLoading: false,
        prefixWritable: false,
        shareObject: {
          object: "",
          show: false,
          url: ""
        },
        sortBy: "",
        sortOrder: "asc"
      })
      expect(state.alert).toEqual({
        id: alertActions.alertId - 1,
        message: "Invalid bucket",
        show: true,
        type: "danger"
      })
    })
  })

  it("creates objects/SET_SHARE_OBJECT action for showShareObject", () => {
    store.dispatch(objectsActions.showShareObject("b.txt", "test"))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "b.txt",
        show: true,
        showExpiryDate: true,
        url: "test"
      },
      sortBy: "",
      sortOrder: "asc"
    })
  })

  it("creates objects/SET_SHARE_OBJECT action for hideShareObject", () => {
    store.dispatch(objectsActions.showShareObject("b.txt", "test"))
    store.dispatch(objectsActions.hideShareObject())
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "asc"
    })
  })

  it("creates objects/SET_SHARE_OBJECT when object is shared", () => {
    store.dispatch(bucketsActions.setCurrentBucket("bk1"))
    store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
    store.dispatch(browserActions.setServerInfo({}))
    return store
      .dispatch(objectsActions.shareObject("a.txt", 1, 0, 0))
      .then(() => {
        const state = store.getState()
        expect(state.objects).toEqual({
          checkedList: [],
          currentPrefix: "pre1/",
          filter: "",
          list: [],
          listLoading: false,
          prefixWritable: false,
          shareObject: {
            object: "a.txt",
            show: true,
            showExpiryDate: true,
            url: "https://test.com/bk1/pre1/b.txt"
          },
          sortBy: "",
          sortOrder: "asc"
        })
        expect(state.alert).toEqual({
          id: alertActions.alertId - 1,
          message: "Object shared. Expires in 1 days 0 hours 0 minutes",
          show: true,
          type: "success"
        })
      })
  })

  it("creates objects/SET_SHARE_OBJECT when object is shared with public link", () => {
    store.dispatch(bucketsActions.setCurrentBucket("test-public"))
    store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
    store.dispatch(browserActions.setServerInfo({ info: { domains: ['public.com'] } }))
    return store
      .dispatch(objectsActions.shareObject("a.txt", 1, 0, 0))
      .then(() => {
        const state = store.getState()
        expect(state.objects).toEqual({
          checkedList: [],
          currentPrefix: "pre1/",
          filter: "",
          list: [],
          listLoading: false,
          prefixWritable: false,
          shareObject: {
            object: "a.txt",
            show: true,
            showExpiryDate: false,
            url: "public.com/test-public/pre1/a.txt"
          },
          sortBy: "",
          sortOrder: "asc"
        })
        expect(state.alert).toEqual({
          id: alertActions.alertId - 1,
          message: "Object shared.",
          show: true,
          type: "success"
        })
      })
  })

  it("creates alert/SET when shareObject is failed", () => {
    store.dispatch(bucketsActions.setCurrentBucket(""))
    store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
    store.dispatch(browserActions.setServerInfo({}))
    return store
      .dispatch(objectsActions.shareObject("a.txt", 1, 0, 0))
      .then(() => {
        const state = store.getState()
        expect(state.objects).toEqual({
          checkedList: [],
          currentPrefix: "pre1/",
          filter: "",
          list: [],
          listLoading: false,
          prefixWritable: false,
          shareObject: {
            object: "",
            show: false,
            url: ""
          },
          sortBy: "",
          sortOrder: "asc"
        })
        expect(state.alert).toEqual({
          id: alertActions.alertId - 1,
          message: "Invalid bucket",
          show: true,
          type: "danger"
        })
      })
  })

  describe("Download object", () => {
    it("should download the object non-LoggedIn users", () => {
      store.dispatch(bucketsActions.setCurrentBucket("bk1"))
      store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
      const spy = jest.spyOn(objectsActions.navigation, 'navigateTo').mockImplementation((url) => setLocation(url))
      store.dispatch(objectsActions.downloadObject("obj1"))
      const url = `${window.location.origin}${minioBrowserPrefix}/download/bk1/${encodeURI("pre1/obj1")}?token=`
      expect(setLocation).toHaveBeenCalledWith(url)
      spy.mockRestore()
    })

    it("should download the object for LoggedIn users", () => {
      const spy = jest.spyOn(objectsActions.navigation, 'navigateTo').mockImplementation((url) => setLocation(url))
      store.dispatch(bucketsActions.setCurrentBucket("bk1"))
      store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
      return store.dispatch(objectsActions.downloadObject("obj1")).then(() => {
        const url = `${window.location.origin}${minioBrowserPrefix}/download/bk1/${encodeURI(
          "pre1/obj1"
        )}?token=test`
        expect(setLocation).toHaveBeenCalledWith(url)
        spy.mockRestore()
      })
    })

    it("create alert/SET action when CreateUrlToken fails", () => {
      store.dispatch(bucketsActions.setCurrentBucket("bk1"))
      store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
      return store.dispatch(objectsActions.downloadObject("obj1")).then(() => {
        const state = store.getState()
        expect(state.alert).toEqual({
          id: alertActions.alertId - 1,
          message: "Error in creating token",
          show: true,
          type: "danger"
        })
      })
    })
  })

  it("should download prefix", () => {
    const open = jest.fn()
    const send = jest.fn()
    const xhrMockClass = () => ({
      open: open,
      send: send
    })
    window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)


    store.dispatch(bucketsActions.setCurrentBucket("bk1"))
    store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
    return store.dispatch(objectsActions.downloadPrefix("pre2/")).then(() => {
      const requestUrl = `${location.origin}${minioBrowserPrefix}/zip?token=test`
      expect(open).toHaveBeenCalled()
      expect(open).toHaveBeenCalledWith("POST", requestUrl, true)
      expect(send).toHaveBeenCalledWith(
        JSON.stringify({
          bucketName: "bk1",
          prefix: "pre1/",
          objects: ["pre2/"]
        })
      )
    })
  })

  it("creates objects/CHECKED_LIST_ADD action", () => {
    store.dispatch(objectsActions.checkObject("obj1"))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: ["obj1"],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "asc"
    })
  })

  it("creates objects/CHECKED_LIST_REMOVE action", () => {
    store.dispatch(objectsActions.checkObject("obj1"))
    store.dispatch(objectsActions.uncheckObject("obj1"))
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "asc"
    })
  })

  it("creates objects/CHECKED_LIST_RESET action", () => {
    store.dispatch(objectsActions.checkObject("obj1"))
    store.dispatch(objectsActions.resetCheckedList())
    const state = store.getState()
    expect(state.objects).toEqual({
      checkedList: [],
      currentPrefix: "",
      filter: "",
      list: [],
      listLoading: false,
      prefixWritable: false,
      shareObject: {
        object: "",
        show: false,
        url: ""
      },
      sortBy: "",
      sortOrder: "asc"
    })
  })

  it("should download checked objects", () => {
    const open = jest.fn()
    const send = jest.fn()
    const xhrMockClass = () => ({
      open: open,
      send: send
    })
    window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)

    store.dispatch(bucketsActions.setCurrentBucket("bk1"))
    store.dispatch(objectsActions.setCurrentPrefix("pre1/"))
    store.dispatch(objectsActions.checkObject("obj1"))
    return store.dispatch(objectsActions.downloadCheckedObjects()).then(() => {
      const requestUrl = `${location.origin}${minioBrowserPrefix}/zip?token=test`
      expect(open).toHaveBeenCalledWith("POST", requestUrl, true)
      expect(send).toHaveBeenCalledWith(
        JSON.stringify({
          bucketName: "bk1",
          prefix: "pre1/",
          objects: ["obj1"]
        })
      )
    })
  })
})
