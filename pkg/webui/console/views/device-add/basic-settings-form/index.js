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
import Radio from '../../../../components/radio-button'
import Form from '../../../../components/form'

import PropTypes from '../../../../lib/prop-types'
import sharedMessages from '../../../../lib/shared-messages'
import m from '../../../components/device-data-form/messages'
import { ACTIVATION_MODES } from '../../device-general-settings/utils'

import validationSchema from './validation-schema'

const BasicForm = React.memo(props => {
  const { onSubmit, error } = props

  const initialValues = React.useMemo(
    () => ({
      ids: {
        device_id: '',
      },
      name: '',
      description: '',
      activation_mode: ACTIVATION_MODES.OTAA,
    }),
    [],
  )

  const onFormSubmit = React.useCallback(
    values => {
      onSubmit(validationSchema.cast(values))
    },
    [onSubmit],
  )

  return (
    <Form
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={onFormSubmit}
      error={error}
    >
      <Form.Field
        title={sharedMessages.devID}
        name="ids.device_id"
        placeholder={m.deviceIdPlaceholder}
        description={m.deviceIdDescription}
        required
        component={Input}
      />
      <Form.Field
        title={sharedMessages.devName}
        name="name"
        placeholder={m.deviceNamePlaceholder}
        description={m.deviceNameDescription}
        component={Input}
      />
      <Form.Field
        title={sharedMessages.devDesc}
        name="description"
        type="textarea"
        placeholder={m.deviceDescPlaceholder}
        description={m.deviceDescDescription}
        component={Input}
      />
      <Form.Field
        title={m.activationMode}
        name="activation_mode"
        component={Radio.Group}
        horizontal={false}
        required
      >
        <Radio label={m.otaa} value={ACTIVATION_MODES.OTAA} />
        <Radio label={m.abp} value={ACTIVATION_MODES.ABP} />
        <Radio label={m.multicast} value={ACTIVATION_MODES.MULTICAST} />
      </Form.Field>
      <SubmitBar>
        <Form.Submit component={SubmitButton} message="Next" />
      </SubmitBar>
    </Form>
  )
})

BasicForm.propTypes = {
  error: PropTypes.message,
  onSubmit: PropTypes.func.isRequired,
}

BasicForm.defaultProps = {
  error: '',
}

export default BasicForm
