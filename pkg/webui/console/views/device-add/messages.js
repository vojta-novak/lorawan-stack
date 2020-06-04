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

import { defineMessages } from 'react-intl'

const messages = defineMessages({
  basicTitle: 'Basic settings',
  basicDescription: 'General settings of the end device',
  basicDetails: 'Defines general settings of an end device',
  networkTitle: 'Network layer settings',
  networkDescription: 'Network server settings',
  networkDetails:
    'Handles the LoRaWAN network layer, including MAC commands, regional parameters and adaptive data rate (ADR).',
  appTitle: 'Application layer settings',
  appDescription: 'Application server settings',
  appDetails:
    'Handles the LoRaWAN application layer, including uplink data decryption and decoding, downlink queuing and downlink data encoding and encryption.',
  joinTitle: 'Join settings',
  joinDescription: 'Join server settings',
  joinDetails:
    'Handles the LoRaWAN join flow, including Network and Application Server authentication and session key generation.',
})

export default messages
