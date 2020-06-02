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

import { selectAsConfig, selectJsConfig, selectNsConfig } from '../../../../lib/selectors/env'
import sharedMessages from '../../../../lib/shared-messages'
import { address as addressRegexp } from '../../../lib/regexp'
import m from '../../../components/device-data-form/messages'

const { base_url: asBaseUrl = '' } = selectAsConfig()
const { base_url: jsBaseUrl = '' } = selectJsConfig()
const { base_url: nsBaseUrl = '' } = selectNsConfig()

const asHost = new URL(asBaseUrl).hostname || ''
const nsHost = new URL(nsBaseUrl).hostname || ''
const jsHost = new URL(jsBaseUrl).hostname || ''

const validationSchema = Yup.object({
  _activation_mode: Yup.string(),
  application_server_address: Yup.string()
    .matches(addressRegexp, sharedMessages.validateAddressFormat)
    .default(asHost),
  network_server_address: Yup.string()
    .matches(addressRegexp, sharedMessages.validateAddressFormat)
    .default(nsHost),
  join_server_address: Yup.string().when('_activation_mode', {
    is: 'otaa',
    then: schema =>
      schema.matches(addressRegexp, sharedMessages.validateAddressFormat).default(jsHost),
    otherwise: schema => schema.strip(),
  }),
  ids: Yup.object({
    dev_eui: Yup.string()
      .length(8 * 2, m.validate16) // 8 Byte hex
      .required(sharedMessages.validateRequired),
    join_eui: Yup.string().when('_activation_mode', {
      is: 'otaa',
      then: schema =>
        schema
          .length(8 * 2, m.validate16) // 8 Byte hex
          .required(sharedMessages.validateRequired),
      otherwise: schema => schema.strip(),
    }),
  }),
})

export default validationSchema
