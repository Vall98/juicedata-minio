/*
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
import { render, screen, fireEvent } from "@testing-library/react"
import ClickOutHandler from "../ClickOutHandler"

describe("ClickOutHandler", () => {
  it("should rendr without crashing", () => {
    render(
      <ClickOutHandler onClickOut={() => { }}>
        <div>Test Content</div>
      </ClickOutHandler>
    )
  })

  it("should call onClickOut when clicking outside", () => {
    const onClickOut = jest.fn()
    render(
      <ClickOutHandler onClickOut={onClickOut}>
        <div>Inside Content</div>
      </ClickOutHandler>
    )

    fireEvent.mouseDown(document.body)
    expect(onClickOut).toHaveBeenCalled()
  })

  it("should not call onClickOut when clicking inside", () => {
    const onClickOut = jest.fn()
    render(
      <ClickOutHandler onClickOut={onClickOut}>
        <div data-testid="inside">Inside Content</div>
      </ClickOutHandler>
    )

    fireEvent.mouseDown(screen.getByTestId("inside"))
    expect(onClickOut).not.toHaveBeenCalled()
  })
})