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
import Form from '../../../../components/form'

import PropTypes from '../../../../lib/prop-types'
import sharedMessages from '../../../../lib/shared-messages'
import m from '../../../components/device-data-form/messages'

import validationSchema from './validation-schema'

const ApplicationSettingsForm = React.memo(props => {
  const { onSubmit } = props

  const initialValues = React.useMemo(
    () => ({
      session: {
        keys: {},
      },
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
    <Form validationSchema={validationSchema} initialValues={initialValues} onSubmit={onFormSubmit}>
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

ApplicationSettingsForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

export default ApplicationSettingsForm
