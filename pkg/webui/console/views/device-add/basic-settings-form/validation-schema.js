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

import sharedMessages from '../../../../lib/shared-messages'
import { ACTIVATION_MODES } from '../../device-general-settings/utils'
import { id as deviceIdRegexp } from '../../../lib/regexp'

const validationSchema = Yup.object().shape({
  ids: Yup.object().shape({
    device_id: Yup.string()
      .matches(deviceIdRegexp, sharedMessages.validateAlphanum)
      .min(2, sharedMessages.validateTooShort)
      .max(36, sharedMessages.validateTooLong)
      .required(sharedMessages.validateRequired),
  }),
  name: Yup.string()
    .min(2, sharedMessages.validateTooShort)
    .max(50, sharedMessages.validateTooLong),
  description: Yup.string().max(2000, sharedMessages.validateTooLong),
  activation_mode: Yup.mixed().oneOf([
    ACTIVATION_MODES.OTAA,
    ACTIVATION_MODES.ABP,
    ACTIVATION_MODES.MULTICAST,
  ]),
})

export default validationSchema
