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
import { ObjectsHeader } from "../ObjectsHeader"
import { SORT_ORDER_ASC, SORT_ORDER_DESC } from "../../constants"

describe("ObjectsHeader", () => {
  it("should render without crashing", () => {
    const sortObjects = jest.fn()
    render(<ObjectsHeader sortObjects={sortObjects} />)
  })

  it("should render the name column with asc class when objects are sorted by name asc", () => {
    const sortObjects = jest.fn()
    render(
      <ObjectsHeader
        sortObjects={sortObjects}
        sortedByName={true}
        sortOrder={SORT_ORDER_ASC}
      />
    )
    const name = screen.getByText("Name")
    const sort = name.querySelector('#sort-by-name i')
    expect(sort).not.toBeNull()
    expect(sort).toHaveClass('fa-sort-alpha-down')
  })

  it("should render the name column with desc class when objects are sorted by name desc", () => {
    const sortObjects = jest.fn()
    render(
      <ObjectsHeader
        sortObjects={sortObjects}
        sortedByName={true}
        sortOrder={SORT_ORDER_DESC}
      />
    )
    const name = screen.getByText("Name")
    expect(name.querySelector('i')).toHaveClass('fa-sort-alpha-down-alt')
  })

  it("should render the size column with asc class when objects are sorted by size asc", () => {
    const sortObjects = jest.fn()
    render(
      <ObjectsHeader
        sortObjects={sortObjects}
        sortedBySize={true}
        sortOrder={SORT_ORDER_ASC}
      />
    )
    const size = screen.getByText("Size")
    expect(size.querySelector('i')).toHaveClass('fa-sort-amount-down-alt')
  })

  it("should render the size column with desc class when objects are sorted by size desc", () => {
    const sortObjects = jest.fn()
    render(
      <ObjectsHeader
        sortObjects={sortObjects}
        sortedBySize={true}
        sortOrder={SORT_ORDER_DESC}
      />
    )
    const size = screen.getByText("Size")
    expect(size.querySelector('i')).toHaveClass('fa-sort-amount-down')
  })

  it("should render the date column with asc class when objects are sorted by date asc", () => {
    const sortObjects = jest.fn()
    render(
      <ObjectsHeader
        sortObjects={sortObjects}
        sortedByLastModified={true}
        sortOrder={SORT_ORDER_ASC}
      />
    )
    const last = screen.getByText("Last Modified")
    expect(last.querySelector('i')).toHaveClass('fa-sort-numeric-down')
  })

  it("should render the date column with desc class when objects are sorted by date desc", () => {
    const sortObjects = jest.fn()
    render(
      <ObjectsHeader
        sortObjects={sortObjects}
        sortedByLastModified={true}
        sortOrder={SORT_ORDER_DESC}
      />
    )
    const last = screen.getByText("Last Modified")
    expect(last.querySelector('i')).toHaveClass('fa-sort-numeric-down-alt')
  })

  it("should call sortObjects when a column is clicked", () => {
    const sortObjects = jest.fn()
    render(<ObjectsHeader sortObjects={sortObjects} />)
    const name = screen.getByText("Name")
    const size = screen.getByText("Size")
    const last = screen.getByText("Last Modified")
    fireEvent.click(name)
    expect(sortObjects).toHaveBeenCalledWith("name")
    fireEvent.click(size)
    expect(sortObjects).toHaveBeenCalledWith("size")
    fireEvent.click(last)
    expect(sortObjects).toHaveBeenCalledWith("last-modified")
  })
})
