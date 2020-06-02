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

import React from 'react'

import SubmitButton from '../../../../components/submit-button'
import SubmitBar from '../../../../components/submit-bar'
import Input from '../../../../components/input'
import Checkbox from '../../../../components/checkbox'
import Form from '../../../../components/form'
import DevAddrInput from '../../../containers/dev-addr-input'

import sharedMessages from '../../../../lib/shared-messages'
import m from '../../../components/device-data-form/messages'
import PropTypes from '../../../../lib/prop-types'

import validationSchema from './validation-schema'

const NetworkSettingsForm = React.memo(props => {
  const { onSubmit, activationMode, lorawanVersion } = props

  const initialValues = React.useMemo(
    () =>
      validationSchema.cast({
        _lorawan_version: lorawanVersion,
        _activation_mode: activationMode,
        mac_settings: {},
        session: {},
      }),
    [activationMode, lorawanVersion],
  )

  const [resetsFrameCounters, setResetFrameCounters] = React.useState(false)

  const onFormSubmit = React.useCallback(
    values => {
      const { _activation_mode, _lorawan_version, ...rest } = validationSchema.cast(values)

      onSubmit(rest)
    },
    [onSubmit],
  )

  return (
    <Form validationSchema={validationSchema} initialValues={initialValues} onSubmit={onFormSubmit}>
      <DevAddrInput
        title={sharedMessages.devAddr}
        name="session.dev_addr"
        placeholder={m.leaveBlankPlaceholder}
        description={m.deviceAddrDescription}
        required
      />
      <Form.Field
        title={m.resetsFCnt}
        onChange={setResetFrameCounters}
        warning={resetsFrameCounters ? m.resetWarning : undefined}
        name="mac_settings.resets_f_cnt"
        component={Checkbox}
      />
      <Form.Field
        title={sharedMessages.nwkSKey}
        name="session.keys.f_nwk_s_int_key.key"
        type="byte"
        min={16}
        max={16}
        placeholder={m.leaveBlankPlaceholder}
        description={m.nwkSKeyDescription}
        component={Input}
      />
      <Form.Field
        title={sharedMessages.sNwkSIKey}
        name="session.keys.s_nwk_s_int_key.key"
        type="byte"
        min={16}
        max={16}
        placeholder={m.leaveBlankPlaceholder}
        description={m.sNwkSIKeyDescription}
        component={Input}
      />
      <Form.Field
        title={sharedMessages.nwkSEncKey}
        name="session.keys.nwk_s_enc_key.key"
        type="byte"
        min={16}
        max={16}
        placeholder={m.leaveBlankPlaceholder}
        description={m.nwkSEncKeyDescription}
        component={Input}
      />
      <Form.Field
        title={sharedMessages.appSKey}
        name="session.keys.app_s_key.key"
        type="byte"
        min={16}
        max={16}
        placeholder={m.leaveBlankPlaceholder}
        description={m.appSKeyDescription}
        component={Input}
      />
      <SubmitBar>
        <Form.Submit component={SubmitButton} message="Next" />
      </SubmitBar>
    </Form>
  )
})

NetworkSettingsForm.propTypes = {
  activationMode: PropTypes.string.isRequired,
  lorawanVersion: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default NetworkSettingsForm
