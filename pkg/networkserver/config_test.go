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

package networkserver

import (
	"testing"

	"github.com/smartystreets/assertions"
	"go.thethings.network/lorawan-stack/v3/pkg/ttnpb"
	"go.thethings.network/lorawan-stack/v3/pkg/util/test/assertions/should"
)

func TestDefaultConfig(t *testing.T) {
	a := assertions.New(t)

	for _, tc := range []struct {
		Config   Config
		Validate func(c Config, a *assertions.Assertion)
	}{
		{
			Config: DefaultConfig,
			Validate: func(c Config, a *assertions.Assertion) {
				a.So(c.DefaultMACSettings.DesiredADRAckDelayExponent, should.BeNil)
				a.So(c.DefaultMACSettings.DesiredADRAckLimitExponent, should.BeNil)
				a.So(c.DefaultMACSettings.DesiredMaxDutyCycle, should.BeNil)
			},
		},
		{
			Config: Config{
				DefaultMACSettings: MACSettingConfig{
					DesiredADRAckDelayExponent: func(val ttnpb.ADRAckDelayExponent) *ttnpb.ADRAckDelayExponent {
						return &val
					}(1),
					DesiredMaxDutyCycle: func(val ttnpb.AggregatedDutyCycle) *ttnpb.AggregatedDutyCycle {
						return &val
					}(1),
					DesiredADRAckLimitExponent: func(val ttnpb.ADRAckLimitExponent) *ttnpb.ADRAckLimitExponent {
						return &val
					}(1),
				},
			},
			Validate: func(c Config, a *assertions.Assertion) {
				a.So(*c.DefaultMACSettings.DesiredADRAckDelayExponent, should.Equal, 1)
				a.So(*c.DefaultMACSettings.DesiredADRAckLimitExponent, should.Equal, 1)
				a.So(*c.DefaultMACSettings.DesiredMaxDutyCycle, should.Equal, 1)
			},
		},
	} {
		c := HandleDefaultConfigValues(tc.Config)
		tc.Validate(c, a)
	}
}
