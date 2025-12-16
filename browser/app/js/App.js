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

import { Routes, Route, useNavigate } from "react-router-dom"
import { useEffect, useState } from 'react'
import Browser from "./browser/Browser"
import Login from "./browser/Login"
import OpenIDLogin from "./browser/OpenIDLogin"
import { setNavigate } from "./navigation"
import hideLoader from "./loader"

export const App = () => {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setNavigate(navigate)
    setReady(true)
    hideLoader()
  }, [navigate])

  if (!ready) {
    return null
  }

  return (
    <Routes>
      <Route path={"/login/openid"} element={<OpenIDLogin />} />
      <Route path={"/login"} element={<Login />} />
      <Route path={"/:bucket?/*"} element={<Browser />} />
    </Routes>
  )
}

export default App
