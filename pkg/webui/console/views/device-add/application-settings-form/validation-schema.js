// Copyright © 2019 The Things Network Foundation, The Things Industries B.V.
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

import * as Yup from 'yup'

import randomByteString from '../../../lib/random-bytes'
import m from '../../../components/device-data-form/messages'

const random16BytesString = () => randomByteString(32)
const toUndefined = value => (!Boolean(value) ? undefined : value)

const validationSchema = Yup.object().shape({
  session: Yup.object().shape({
    keys: Yup.object().shape({
      app_s_key: Yup.object().shape({
        key: Yup.string()
          .emptyOrLength(16 * 2, m.validate32) // 16 Byte hex
          .transform(toUndefined)
          .default(random16BytesString),
      }),
    }),
  }),
})

export default validationSchema
