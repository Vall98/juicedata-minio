// Minimal CommonJS mock of query-string used in tests
exports.parse = function (str) {
  if (!str) return {}

  // strip leading ?
  const s = str.charAt(0) === '?' ? str.slice(1) : str

  // normalize '+' to spaces (real query strings often use '+' for spaces)
  const normalized = s.replace(/\+/g, ' ')

  const params = new URLSearchParams(normalized)
  const obj = {}

  for (const [k, v] of params.entries()) {
    // if key already exists, convert to array
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      if (Array.isArray(obj[k])) obj[k].push(v)
      else obj[k] = [obj[k], v]
    } else {
      obj[k] = v
    }
  }

  return obj
}

exports.stringify = function (obj) {
  const params = new URLSearchParams()

  Object.keys(obj || {}).forEach(k => {
    const v = obj[k]
    if (Array.isArray(v)) v.forEach(x => params.append(k, x))
    else if (v !== undefined && v !== null) params.append(k, String(v))
  })

  // URLSearchParams automatically encodes spaces as '+'
  return params.toString()
}