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
import { defineMessages } from 'react-intl'
import { merge } from 'lodash'

import Form from '@ttn-lw/components/form'
import SubmitBar from '@ttn-lw/components/submit-bar'
import SubmitButton from '@ttn-lw/components/submit-button'
import Button from '@ttn-lw/components/button'
import { useWizardContext } from '@ttn-lw/components/wizard'

import Message from '@ttn-lw/lib/components/message'

import useCombinedRefs from '@ttn-lw/lib/hooks/use-combined-refs'
import PropTypes from '@ttn-lw/lib/prop-types'

const m = defineMessages({
  prev: 'Previous',
  next: 'Next',
  complete: 'Complete',
})

const WizardForm = React.forwardRef((props, ref) => {
  const { validationSchema, validationContext, onSubmit, children, initialValues, error } = props
  const context = useWizardContext()
  const { nextStep, prevStep, currentStep, steps, snapshot, onComplete, completeMessage } = context

  const formRef = React.useRef(null)
  const combinedRef = useCombinedRefs(ref, formRef)

  const stepsCount = steps.length
  const isFirstStep = stepsCount > 0 ? currentStep === 1 : false
  const isLastStep = stepsCount > 0 ? currentStep === stepsCount : false

  const handlePrevStep = React.useCallback(() => {
    const { values } = formRef.current

    prevStep(
      validationSchema.cast(values, {
        context: validationContext,
      }),
    )
  }, [prevStep, validationContext, validationSchema])

  const formInitialValues = React.useMemo(
    () => validationSchema.cast(merge({}, initialValues, snapshot), { context: validationContext }),
    [initialValues, snapshot, validationContext, validationSchema],
  )

  const handleSubmit = React.useCallback(
    async (values, formikBag) => {
      const castedValues = validationSchema.cast(values, {
        context: validationContext,
      })

      if (onSubmit) {
        await onSubmit(merge({}, snapshot, castedValues), formikBag)
      }

      if (isLastStep) {
        return onComplete(merge({}, snapshot, castedValues), formikBag)
      }

      formikBag.setSubmitting(false)
      formikBag.setTouched({})

      nextStep(
        validationSchema.cast(values, {
          context: validationContext,
        }),
      )
    },
    [isLastStep, nextStep, onComplete, onSubmit, snapshot, validationContext, validationSchema],
  )

  const { title: prevMessage } = steps.find(({ stepNumber }) => stepNumber === currentStep - 1) || {
    title: m.next,
  }
  const { title: nextStepTitle } = steps.find(
    ({ stepNumber }) => stepNumber === currentStep + 1,
  ) || { title: m.prev }

  const nextMessage = isLastStep
    ? Boolean(completeMessage)
      ? completeMessage
      : m.complete
    : nextStepTitle

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={formInitialValues}
      formikRef={combinedRef}
      validationSchema={validationSchema}
      validationContext={validationContext}
      error={error}
    >
      {children}
      <SubmitBar align={isFirstStep ? 'end' : 'between'}>
        {!isFirstStep && (
          <Button message={prevMessage} secondary onClick={handlePrevStep} type="button">
            <Button.Icon icon="keyboard_arrow_left" type="left" />
            <Message content={prevMessage} />
          </Button>
        )}
        <Form.Submit component={SubmitButton} message={nextMessage}>
          <Message content={nextMessage} />
          {!isLastStep && <Button.Icon icon="keyboard_arrow_right" type="right" />}
        </Form.Submit>
      </SubmitBar>
    </Form>
  )
})

WizardForm.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  error: PropTypes.error,
  initialValues: PropTypes.shape({}),
  onSubmit: PropTypes.func,
  validationContext: PropTypes.shape({}),
  validationSchema: PropTypes.shape({
    validate: PropTypes.func.isRequired,
    cast: PropTypes.func.isRequired,
  }).isRequired,
}

WizardForm.defaultProps = {
  onSubmit: undefined,
  validationContext: {},
  initialValues: {},
  error: undefined,
}

export default WizardForm
