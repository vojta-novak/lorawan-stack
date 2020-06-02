// Copyright © 2020 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react'

const useBeforeUnload = (handler = () => {}) => {
  const handlerRef = React.useRef(handler)

  React.useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  React.useEffect(() => {
    const handleBeforeunload = event => {
      let returnValue

      if (typeof handlerRef.current === 'function') {
        returnValue = handlerRef.current(event)
      }

      if (event.defaultPrevented) {
        event.returnValue = ''
      }

      if (typeof returnValue === 'string') {
        event.returnValue = returnValue
        return returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeunload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeunload)
    }
  }, [])
}

export default useBeforeUnload
