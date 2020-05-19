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

import '@ttn-lw/lib/yup-extensions'

import { ACTIVATION_MODES } from '@console/lib/device-utils'

import validationSchema from './validation-schema'

describe('<NetworkSettingsForm /> validation schema', () => {
  const createOTAASchema = baseSchema => ({
    ...baseSchema,
    multicast: false,
    supports_join: true,
  })

  const createABPSchema = baseSchema => ({
    ...baseSchema,
    multicast: false,
    supports_join: false,
  })

  const createMulticastSchema = baseSchema => ({
    ...baseSchema,
    multicast: true,
    supports_join: false,
  })

  const createNoneSchema = baseSchema => ({
    ...baseSchema,
    multicast: false,
    supports_join: false,
  })

  const validateOTAA = (baseSchema, mayEditKeys = false) =>
    validationSchema.validateSync(createOTAASchema(baseSchema), {
      context: {
        mayEditKeys,
        activationMode: ACTIVATION_MODES.OTAA,
      },
    })

  const validateABP = (baseSchema, mayEditKeys = false) =>
    validationSchema.validateSync(createABPSchema(baseSchema), {
      context: {
        mayEditKeys,
        activationMode: ACTIVATION_MODES.ABP,
      },
    })

  const validateMulticast = (baseSchema, mayEditKeys = false) =>
    validationSchema.validateSync(createMulticastSchema(baseSchema), {
      context: {
        mayEditKeys,
        activationMode: ACTIVATION_MODES.MULTICAST,
      },
    })

  const validateNone = (baseSchema, mayEditKeys = false) =>
    validationSchema.validateSync(createNoneSchema(baseSchema), {
      context: {
        mayEditKeys,
        activationMode: ACTIVATION_MODES.NONE,
      },
    })

  describe('is `ABP` activation mode', () => {
    it('should handle `mac_settings.resets_f_cnt`', () => {
      const schema = {
        lorawan_version: '1.0.0',
        lorawan_phy_version: '1.0.0',
        frequency_plan_id: 'test-freq-plan',
        mac_settings: {
          resets_f_cnt: true,
        },
        session: {
          dev_addr: '1'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
          },
        },
      }

      let validatedValue = validateABP(schema, true)

      expect(validatedValue).toBeDefined()
      expect(validatedValue.mac_settings).toBeDefined()
      expect(validatedValue.mac_settings.resets_f_cnt).toBe(true)

      schema.mac_settings.resets_f_cnt = false
      validatedValue = validateABP(schema, true)

      expect(validatedValue).toBeDefined()
      expect(validatedValue.mac_settings).toBeDefined()
      expect(validatedValue.mac_settings.resets_f_cnt).toBe(false)
    })

    it('should require `f_nwk_s_int_key`', done => {
      const schema = {
        lorawan_version: '1.0.0',
        lorawan_phy_version: '1.0.0',
        frequency_plan_id: 'test-freq-plan',
        mac_settings: {
          resets_f_cnt: true,
        },
        session: {
          dev_addr: '1'.repeat(8),
          keys: {
            f_nwk_s_int_key: {},
          },
        },
      }
      try {
        validateABP(schema, true)
        done.fail('should fail')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')
        expect(error.path).toBe('session.keys.f_nwk_s_int_key.key')
        done()
      }
    })
  })

  describe('is `lorawan_version `1.1.0', () => {
    it('should require `s_nwk_s_int_key` for `ABP` activation mode', done => {
      const schema = {
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '1'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
            nwk_s_enc_key: {
              key: '1'.repeat(32),
            },
          },
        },
      }

      try {
        validateABP(schema, true)
        done.fail('should fail')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')
        expect(error.path).toBe('session.keys.s_nwk_s_int_key.key')
        done()
      }
    })

    it('should require `nwk_s_enc_key` for `ABP` activation mode', done => {
      const schema = {
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '1'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
            s_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
          },
        },
      }

      try {
        validateABP(schema, true)

        done.fail('should fail')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')
        expect(error.path).toBe('session.keys.nwk_s_enc_key.key')
        done()
      }
    })

    it('should handle valid `session.keys` for `ABP` activation mode', () => {
      const fNwkSIntKey = '1'.repeat(32)
      const sNwkSIntKey = '2'.repeat(32)
      const nwkSEncKey = '3'.repeat(32)

      const schema = {
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '4'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: fNwkSIntKey,
            },
            s_nwk_s_int_key: {
              key: sNwkSIntKey,
            },
            nwk_s_enc_key: {
              key: nwkSEncKey,
            },
          },
        },
      }

      const validatedValue = validateABP(schema, true)

      expect(validatedValue).toBeDefined()
      expect(validatedValue.session).toBeDefined()

      const { session } = validatedValue
      expect(session.keys).toBeDefined()

      const { keys } = session
      expect(keys.f_nwk_s_int_key).toBeDefined()
      expect(keys.f_nwk_s_int_key.key).toBe(fNwkSIntKey)
      expect(keys.s_nwk_s_int_key).toBeDefined()
      expect(keys.s_nwk_s_int_key.key).toBe(sNwkSIntKey)
      expect(keys.nwk_s_enc_key).toBeDefined()
      expect(keys.nwk_s_enc_key.key).toBe(nwkSEncKey)
    })

    it('should require `s_nwk_s_int_key` for `multicast` activation mode', done => {
      const schema = {
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '1'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
            nwk_s_enc_key: {
              key: '1'.repeat(32),
            },
          },
        },
      }

      try {
        validateMulticast(schema, true)
        done.fail('should fail')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')
        expect(error.path).toBe('session.keys.s_nwk_s_int_key.key')
        done()
      }
    })

    it('should require `nwk_s_enc_key` for `multicast` activation mode', done => {
      const schema = {
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '1'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
            s_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
          },
        },
      }

      try {
        validateMulticast(schema, true)
        done.fail('should fail')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')
        expect(error.path).toBe('session.keys.nwk_s_enc_key.key')
        done()
      }
    })

    it('should handle valid `session.keys` for `multicast` activation mode', () => {
      const fNwkSIntKey = '1'.repeat(32)
      const sNwkSIntKey = '2'.repeat(32)
      const nwkSEncKey = '3'.repeat(32)

      const schema = {
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '4'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: fNwkSIntKey,
            },
            s_nwk_s_int_key: {
              key: sNwkSIntKey,
            },
            nwk_s_enc_key: {
              key: nwkSEncKey,
            },
          },
        },
      }

      const validatedValue = validateMulticast(schema, true)

      expect(validatedValue).toBeDefined()
      expect(validatedValue.session).toBeDefined()

      const { session } = validatedValue
      expect(session.keys).toBeDefined()

      const { keys } = session
      expect(keys.f_nwk_s_int_key).toBeDefined()
      expect(keys.f_nwk_s_int_key.key).toBe(fNwkSIntKey)
      expect(keys.s_nwk_s_int_key).toBeDefined()
      expect(keys.s_nwk_s_int_key.key).toBe(sNwkSIntKey)
      expect(keys.nwk_s_enc_key).toBeDefined()
      expect(keys.nwk_s_enc_key.key).toBe(nwkSEncKey)
    })

    it('should strip `session.keys` for `OTAA` activation mode', () => {
      const schema = {
        ids: {
          join_eui: '1'.repeat(16),
          dev_eui: '1'.repeat(16),
        },
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '4'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
            s_nwk_s_int_key: {
              key: '2'.repeat(32),
            },
            nwk_s_enc_key: {
              key: '3'.repeat(32),
            },
          },
        },
      }

      const validatedValue = validateOTAA(schema, true)

      expect(validatedValue).toBeDefined()
      expect(validatedValue.session).toBeUndefined()
    })

    it('should strip `session.keys` for `none` activation mode', () => {
      const schema = {
        ids: {
          join_eui: '1'.repeat(16),
          dev_eui: '1'.repeat(16),
        },
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '4'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
            s_nwk_s_int_key: {
              key: '2'.repeat(32),
            },
            nwk_s_enc_key: {
              key: '3'.repeat(32),
            },
          },
        },
      }

      const validatedValue = validateNone(schema, true)

      expect(validatedValue).toBeDefined()
      expect(validatedValue.session).toBeUndefined()
    })
  })

  describe('cannot edit keys', () => {
    const validate = (schema, activationMode) => {
      if (activationMode === ACTIVATION_MODES.OTAA) {
        return validateOTAA(schema, false)
      }

      if (activationMode === ACTIVATION_MODES.ABP) {
        return validateABP(schema, false)
      }

      if (activationMode === ACTIVATION_MODES.MULTICAST) {
        return validateMulticast(schema, false)
      }

      return validateNone(schema, false)
    }

    it('should strip `session` for `ABP` devices', () => {
      const schema = {
        ids: {
          join_eui: '1'.repeat(16),
          dev_eui: '1'.repeat(16),
        },
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '4'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
            s_nwk_s_int_key: {
              key: '2'.repeat(32),
            },
            nwk_s_enc_key: {
              key: '3'.repeat(32),
            },
          },
        },
      }

      const validatedValue = validate(schema, ACTIVATION_MODES.ABP)

      expect(validatedValue).toBeDefined()
      expect(validatedValue.session).toBeUndefined()
    })

    it('should strip `session` for `multicast` devices', () => {
      const schema = {
        ids: {
          join_eui: '1'.repeat(16),
          dev_eui: '1'.repeat(16),
        },
        lorawan_version: '1.1.0',
        lorawan_phy_version: '1.1.0-a',
        frequency_plan_id: 'test-freq-plan',
        session: {
          dev_addr: '4'.repeat(8),
          keys: {
            f_nwk_s_int_key: {
              key: '1'.repeat(32),
            },
            s_nwk_s_int_key: {
              key: '2'.repeat(32),
            },
            nwk_s_enc_key: {
              key: '3'.repeat(32),
            },
          },
        },
      }

      const validatedValue = validate(schema, ACTIVATION_MODES.MULTICAST)

      expect(validatedValue).toBeDefined()
      expect(validatedValue.session).toBeUndefined()
    })
  })
})
