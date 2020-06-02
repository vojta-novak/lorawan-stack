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
import JoinEUIPrefixesInput from '../../../containers/join-eui-prefixes-input'
import Form from '../../../../components/form'

import PropTypes from '../../../../lib/prop-types'
import sharedMessages from '../../../../lib/shared-messages'
import m from '../../../components/device-data-form/messages'

import validationSchema from './validation-schema'

const ConnectionForm = React.memo(props => {
  const { onSubmit, activationMode } = props

  const initialValues = React.useMemo(
    () =>
      validationSchema.cast({
        _activation_mode: activationMode,
        application_server_address: undefined,
        network_server_address: undefined,
        join_server_address: undefined,
        ids: {
          dev_eui: undefined,
          join_eui: undefined,
        },
      }),
    [activationMode],
  )

  const onFormSubmit = React.useCallback(
    values => {
      const { _activation_mode, ...rest } = validationSchema.cast(values)

      onSubmit(rest)
    },
    [onSubmit],
  )

  return (
    <Form
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={onFormSubmit}
      // error={error}
    >
      <Form.Field
        title={sharedMessages.devEUI}
        name="ids.dev_eui"
        type="byte"
        min={8}
        max={8}
        description={m.deviceEUIDescription}
        required
        component={Input}
      />
      <Form.Field
        title={sharedMessages.applicationServerAddress}
        placeholder={sharedMessages.addressPlaceholder}
        name="application_server_address"
        component={Input}
      />
      <Form.Field
        title={sharedMessages.networkServerAddress}
        placeholder={sharedMessages.addressPlaceholder}
        name="network_server_address"
        component={Input}
      />
      {activationMode === 'otaa' && (
        <>
          <Form.Field
            title={sharedMessages.joinServerAddress}
            placeholder={sharedMessages.addressPlaceholder}
            name="join_server_address"
            component={Input}
          />
          <JoinEUIPrefixesInput
            title={sharedMessages.joinEUI}
            name="ids.join_eui"
            description={m.joinEUIDescription}
            required
          />
        </>
      )}
      <SubmitBar>
        <Form.Submit component={SubmitButton} message="Next" />
      </SubmitBar>
    </Form>
  )
})

ConnectionForm.propTypes = {
  activationMode: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default ConnectionForm
