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

import PropTypes from '../../../../lib/prop-types'
import sharedMessages from '../../../../lib/shared-messages'
import m from '../../../components/device-data-form/messages'
import { parseLorawanMacVersion } from '../../device-general-settings/utils'

import validationSchema from './validation-schema'

const ApplicationSettingsForm = React.memo(props => {
  const { onSubmit, lorawanVersion } = props

  const initialValues = React.useMemo(
    () =>
      validationSchema.cast({
        _lorawan_version: lorawanVersion,
        root_keys: {},
        net_id: undefined,
        resets_join_nonces: false,
        application_server_id: undefined,
        application_server_kek_label: undefined,
        network_server_kek_label: undefined,
      }),
    [lorawanVersion],
  )

  const [resetsJoinNonces, setResetsJoinNonces] = React.useState(false)
  const handleResetsJoinNoncesChange = React.useCallback(
    evt => {
      setResetsJoinNonces(evt.target.checked)
    },
    [setResetsJoinNonces],
  )

  const onFormSubmit = React.useCallback(
    values => {
      onSubmit(validationSchema.cast(values))
    },
    [onSubmit],
  )

  const isNewLorawanVersion = parseLorawanMacVersion(lorawanVersion) >= 110

  return (
    <Form validationSchema={validationSchema} initialValues={initialValues} onSubmit={onFormSubmit}>
      <Form.Field
        title={sharedMessages.appKey}
        name="root_keys.app_key.key"
        type="byte"
        min={16}
        max={16}
        placeholder={m.leaveBlankPlaceholder}
        description={isNewLorawanVersion ? m.appKeyNewDescription : m.appKeyDescription}
        component={Input}
      />
      {isNewLorawanVersion && (
        <Form.Field
          title={sharedMessages.nwkKey}
          name="root_keys.nwk_key.key"
          type="byte"
          min={16}
          max={16}
          placeholder={m.leaveBlankPlaceholder}
          description={m.nwkKeyDescription}
          component={Input}
        />
      )}
      {isNewLorawanVersion && (
        <Form.Field
          title={m.resetsJoinNonces}
          onChange={handleResetsJoinNoncesChange}
          warning={resetsJoinNonces ? m.resetWarning : undefined}
          name="resets_join_nonces"
          component={Checkbox}
        />
      )}
      <Form.Field
        title={m.homeNetID}
        description={m.homeNetIDDescription}
        name="net_id"
        type="byte"
        min={3}
        max={3}
        component={Input}
      />
      <Form.Field
        title={m.asServerID}
        name="application_server_id"
        description={m.asServerIDDescription}
        component={Input}
      />
      <Form.Field
        title={m.asServerKekLabel}
        name="application_server_kek_label"
        description={m.asServerKekLabelDescription}
        component={Input}
      />
      <Form.Field
        title={m.nsServerKekLabel}
        name="network_server_kek_label"
        description={m.nsServerKekLabelDescription}
        component={Input}
      />
      <SubmitBar>
        <Form.Submit component={SubmitButton} message="Finish" />
      </SubmitBar>
    </Form>
  )
})

ApplicationSettingsForm.propTypes = {
  lorawanVersion: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default ApplicationSettingsForm
