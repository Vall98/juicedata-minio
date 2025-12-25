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
import { render, fireEvent, screen } from "@testing-library/react"
import { ShareObjectModal } from "../ShareObjectModal"
import {
  SHARE_OBJECT_EXPIRY_DAYS,
  SHARE_OBJECT_EXPIRY_HOURS,
  SHARE_OBJECT_EXPIRY_MINUTES
} from "../../constants"

jest.mock("../../web", () => ({
  LoggedIn: jest.fn(() => {
    return true
  })
}))

function setInitialExpiryState(days, hours, minutes) {
  const incDays = screen.getByLabelText("increase days")
  const incHours = screen.getByLabelText("increase hours")
  const incMinutes = screen.getByLabelText("increase minutes")
  const decDays = screen.getByLabelText("decrease days")
  const decHours = screen.getByLabelText("decrease hours")
  const decMinutes = screen.getByLabelText("decrease minutes")
  const inputs = screen.getAllByRole("spinbutton")
  expect(inputs.length).toBe(3)
  const [d, h, m] = inputs
  // minutes and hours are 0 initially.
  // setting day last, 0 days would otherwise be updated to 7 days.
  if (minutes < SHARE_OBJECT_EXPIRY_MINUTES) {
    for (let i = SHARE_OBJECT_EXPIRY_MINUTES; i > minutes; i--) {
      fireEvent.click(decMinutes)
    }
    expect(m.value).toBe(minutes >= 0 ? String(minutes) : "0")
  } else {
    for (let i = SHARE_OBJECT_EXPIRY_MINUTES; i < minutes; i++) {
      fireEvent.click(incMinutes)
    }
    expect(m.value).toBe(minutes <= 59 ? String(minutes) : "59")
  }
  if (hours < SHARE_OBJECT_EXPIRY_HOURS) {
    for (let i = SHARE_OBJECT_EXPIRY_HOURS; i > hours; i--) {
      fireEvent.click(decHours)
    }
    expect(h.value).toBe(hours >= 0 ? String(hours) : "0")
  } else {
    for (let i = SHARE_OBJECT_EXPIRY_HOURS; i < hours; i++) {
      fireEvent.click(incHours)
    }
    expect(h.value).toBe(hours <= 23 ? String(hours) : "23")
  }
  if (days < SHARE_OBJECT_EXPIRY_DAYS) {
    for (let i = SHARE_OBJECT_EXPIRY_DAYS; i > days; i--) {
      fireEvent.click(decDays)
    }
    if (d.value === "0" && h.value === "0" && m.value === "0") {
      // days would be set to max if all of them are 0
      expect(d.value).toBe("7")
      expect(h.value).toBe("0")
      expect(m.value).toBe("0")
    } else {
      expect(d.value).toBe(days >= 0 ? String(days) : "0")
    }
  } else {
    for (let i = SHARE_OBJECT_EXPIRY_DAYS; i < days; i++) {
      fireEvent.click(incDays)
    }
    expect(d.value).toBe(days <= 7 ? String(days) : "7")
    if (d.value === "7") {
      expect(h.value).toBe("0")
      expect(m.value).toBe("0")
    }
  }
}

describe("ShareObjectModal", () => {
  it("should render without crashing", () => {
    render(
      <ShareObjectModal
        object={{ name: "obj1" }}
        shareObjectDetails={{ show: true, object: "obj1", url: "test", showExpiryDate: true }}
      />
    )
  })

  it("shoud call hideShareObject when Cancel is clicked", () => {
    const hideShareObject = jest.fn()
    render(
      <ShareObjectModal
        object={{ name: "obj1" }}
        shareObjectDetails={{ show: true, object: "obj1", url: "test", showExpiryDate: true }}
        hideShareObject={hideShareObject}
      />
    )
    const button = screen.getByRole("button", { name: "Cancel" })
    fireEvent.click(button)
    expect(hideShareObject).toHaveBeenCalled()
  })

  it("should show the shareable link", () => {
    render(
      <ShareObjectModal
        object={{ name: "obj1" }}
        shareObjectDetails={{ show: true, object: "obj1", url: "test", showExpiryDate: true }}
      />
    )
    const input = screen.getByRole("textbox")
    expect(input.value).toBe(`${window.location.protocol}//test`)
  })

  it("should call showCopyAlert and hideShareObject when Copy button is clicked", () => {
    const hideShareObject = jest.fn()
    const showCopyAlert = jest.fn()
    render(
      <ShareObjectModal
        object={{ name: "obj1" }}
        shareObjectDetails={{ show: true, object: "obj1", url: "test", showExpiryDate: true }}
        hideShareObject={hideShareObject}
        showCopyAlert={showCopyAlert}
      />
    )
    const copyBtn = screen.getByRole("button", { name: "Copy Link" })
    fireEvent.click(copyBtn)
    expect(showCopyAlert).toHaveBeenCalledWith("Link copied to clipboard!")
    expect(hideShareObject).toHaveBeenCalled()
  })

  describe("Update expiry values", () => {
    const props = {
      object: { name: "obj1" },
      shareObjectDetails: { show: true, object: "obj1", url: "test", showExpiryDate: true }
    }

    it("should not show expiry values if shared with public link", () => {
      const shareObjectDetails = { show: true, object: "obj1", url: "test", showExpiryDate: false }
      render(<ShareObjectModal {...props} shareObjectDetails={shareObjectDetails} />)
      expect(screen.queryByRole("spinbutton")).toBeNull()
    })

    it("should have default expiry values", () => {
      render(<ShareObjectModal {...props} />)
      const inputs = screen.getAllByRole("spinbutton")
      expect(inputs.length).toBe(3)
      const [days, hours, minutes] = inputs
      expect(days.value).toBe(String(SHARE_OBJECT_EXPIRY_DAYS))
      expect(hours.value).toBe(String(SHARE_OBJECT_EXPIRY_HOURS))
      expect(minutes.value).toBe(String(SHARE_OBJECT_EXPIRY_MINUTES))
    })

    it("should not allow any increments when days is already max", () => {
      const shareObject = jest.fn()
      render(<ShareObjectModal {...props} shareObject={shareObject} />)
      setInitialExpiryState(7, 0, 0)
      shareObject.mockClear()
      const inputs = screen.getAllByRole("spinbutton")
      const [days, hours, minutes] = inputs
      const incHours = screen.getByLabelText("increase hours")
      fireEvent.click(incHours)
      expect(days.value).toBe("7")
      expect(hours.value).toBe("0")
      expect(minutes.value).toBe("0")
      expect(shareObject).not.toHaveBeenCalled()
    })

    it("should not allow expiry values less than minimum value", () => {
      const shareObject = jest.fn()
      render(<ShareObjectModal {...props} shareObject={shareObject} />)
      setInitialExpiryState(5, 0, 0)
      shareObject.mockClear()
      const inputs = screen.getAllByRole("spinbutton")
      const [days, hours, minutes] = inputs
      const decHours = screen.getByLabelText("decrease hours")
      const decMinutes = screen.getByLabelText("decrease minutes")
      fireEvent.click(decHours)
      fireEvent.click(decMinutes)
      expect(days.value).toBe("5")
      expect(hours.value).toBe("0")
      expect(minutes.value).toBe("0")
      expect(shareObject).not.toHaveBeenCalled()
    })

    it("should not allow expiry values more than maximum value", () => {
      const shareObject = jest.fn()
      render(<ShareObjectModal {...props} shareObject={shareObject} />)
      setInitialExpiryState(1, 23, 59)
      shareObject.mockClear()
      const inputs = screen.getAllByRole("spinbutton")
      const [days, hours, minutes] = inputs
      const incHours = screen.getByLabelText("increase hours")
      const incMinutes = screen.getByLabelText("increase minutes")
      fireEvent.click(incHours)
      fireEvent.click(incMinutes)
      expect(days.value).toBe("1")
      expect(hours.value).toBe("23")
      expect(minutes.value).toBe("59")
      expect(shareObject).not.toHaveBeenCalled()
    })

    it("should set hours and minutes to 0 when days reaches max", () => {
      const shareObject = jest.fn()
      render(<ShareObjectModal {...props} shareObject={shareObject} />)
      setInitialExpiryState(6, 5, 30)
      shareObject.mockClear()
      const inputs = screen.getAllByRole("spinbutton")
      const [days, hours, minutes] = inputs
      const incDays = screen.getByLabelText("increase days")
      fireEvent.click(incDays)
      expect(days.value).toBe("7")
      expect(hours.value).toBe("0")
      expect(minutes.value).toBe("0")
      expect(shareObject).toHaveBeenCalled()
    })

    it("should set days to MAX when all of them becomes 0", () => {
      const shareObject = jest.fn()
      render(<ShareObjectModal {...props} shareObject={shareObject} />)
      setInitialExpiryState(0, 1, 0)
      shareObject.mockClear()
      const inputs = screen.getAllByRole("spinbutton")
      const [days, hours, minutes] = inputs
      const decHours = screen.getByLabelText("decrease hours")
      fireEvent.click(decHours)
      expect(days.value).toBe("7")
      expect(hours.value).toBe("0")
      expect(minutes.value).toBe("0")
      expect(shareObject).toHaveBeenCalledWith("obj1", 7, 0, 0)
    })
  })
})
