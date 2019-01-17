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

package joinserver

import (
	"context"

	pbtypes "github.com/gogo/protobuf/types"
	"go.thethings.network/lorawan-stack/pkg/auth/rights"
	"go.thethings.network/lorawan-stack/pkg/ttnpb"
)

type jsEndDeviceRegistryServer struct {
	Registry DeviceRegistry
}

// Get implements ttnpb.JsEndDeviceRegistryServer.
func (s jsEndDeviceRegistryServer) Get(ctx context.Context, req *ttnpb.GetEndDeviceRequest) (*ttnpb.EndDevice, error) {
	if req.JoinEUI == nil || req.JoinEUI.IsZero() {
		return nil, errNoJoinEUI
	}
	if req.DevEUI == nil || req.DevEUI.IsZero() {
		return nil, errNoDevEUI
	}
	dev, err := s.Registry.GetByEUI(ctx, *req.JoinEUI, *req.DevEUI, req.FieldMask.Paths)
	if err != nil {
		return nil, err
	}
	if err := rights.RequireApplication(ctx, dev.EndDeviceIdentifiers.ApplicationIdentifiers, ttnpb.RIGHT_APPLICATION_DEVICES_READ); err != nil {
		return nil, err
	}
	if ttnpb.HasAnyField(req.FieldMask.Paths, "root_keys") {
		if err := rights.RequireApplication(ctx, dev.EndDeviceIdentifiers.ApplicationIdentifiers, ttnpb.RIGHT_APPLICATION_DEVICES_READ_KEYS); err != nil {
			return nil, err
		}
	}

	// TODO: Validate field mask (https://github.com/TheThingsIndustries/lorawan-stack/issues/1226)
	return dev, err
}

// Set implements ttnpb.AsEndDeviceRegistryServer.
func (s jsEndDeviceRegistryServer) Set(ctx context.Context, req *ttnpb.SetEndDeviceRequest) (*ttnpb.EndDevice, error) {
	if req.Device.JoinEUI == nil || req.Device.JoinEUI.IsZero() {
		return nil, errNoJoinEUI
	}
	if req.Device.DevEUI == nil || req.Device.DevEUI.IsZero() {
		return nil, errNoDevEUI
	}

	// TODO: Validate field mask (https://github.com/TheThingsIndustries/lorawan-stack/issues/1226)
	return s.Registry.SetByEUI(ctx, *req.Device.EndDeviceIdentifiers.JoinEUI, *req.Device.EndDeviceIdentifiers.DevEUI, req.FieldMask.Paths, func(dev *ttnpb.EndDevice) (*ttnpb.EndDevice, []string, error) {
		if err := rights.RequireApplication(ctx, dev.EndDeviceIdentifiers.ApplicationIdentifiers, ttnpb.RIGHT_APPLICATION_DEVICES_WRITE); err != nil {
			return nil, nil, err
		}
		if ttnpb.HasAnyField(req.FieldMask.Paths, "root_keys") {
			if err := rights.RequireApplication(ctx, dev.EndDeviceIdentifiers.ApplicationIdentifiers, ttnpb.RIGHT_APPLICATION_DEVICES_WRITE_KEYS); err != nil {
				return nil, nil, err
			}
		}

		return &req.Device, req.FieldMask.Paths, nil
	})
}

// Delete implements ttnpb.AsEndDeviceRegistryServer.
func (s jsEndDeviceRegistryServer) Delete(ctx context.Context, ids *ttnpb.EndDeviceIdentifiers) (*pbtypes.Empty, error) {
	if ids.JoinEUI == nil || ids.JoinEUI.IsZero() {
		return nil, errNoJoinEUI
	}
	if ids.DevEUI == nil || ids.DevEUI.IsZero() {
		return nil, errNoDevEUI
	}

	_, err := s.Registry.SetByEUI(ctx, *ids.JoinEUI, *ids.DevEUI, nil, func(dev *ttnpb.EndDevice) (*ttnpb.EndDevice, []string, error) {
		if err := rights.RequireApplication(ctx, dev.ApplicationIdentifiers, ttnpb.RIGHT_APPLICATION_DEVICES_WRITE); err != nil {
			return nil, nil, err
		}
		return nil, nil, nil
	})
	if err != nil {
		return nil, err
	}
	return ttnpb.Empty, err
}
