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

import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { ObjectsList } from "../ObjectsList"
import store from "../../store/store"

describe("ObjectsList", () => {
  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <ObjectsList objects={[]} />
      </Provider>
    )
  })

  it("should render ObjectContainer for every object", () => {
    render(
      <Provider store={store}>
        <ObjectsList objects={[{ name: "test1.jpg" }, { name: "test2.jpg" }]} />
      </Provider>
    )
    expect(screen.getByText("test1.jpg")).toBeInTheDocument()
    expect(screen.getByText("test2.jpg")).toBeInTheDocument()
  })

  it("should render PrefixContainer for every prefix", () => {
    render(
      <Provider store={store}>
        <ObjectsList objects={[{ name: "abc/" }, { name: "xyz/" }]} />
      </Provider>
    )
    expect(screen.getByText("abc/")).toBeInTheDocument()
    expect(screen.getByText("xyz/")).toBeInTheDocument()
  })
})
