// Copyright © 2018 The Things Network Foundation, The Things Industries B.V.
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

package oauth

import (
	"context"
	"net/http"
	"time"

	"github.com/RangelReale/osin"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"go.thethings.network/lorawan-stack/pkg/identityserver/store"
	"go.thethings.network/lorawan-stack/pkg/log"
	"go.thethings.network/lorawan-stack/pkg/web"
	"go.thethings.network/lorawan-stack/pkg/webui"
)

// Server is the interface for the OAuth server.
type Server interface {
	web.Registerer

	Login(c echo.Context) error
	CurrentUser(c echo.Context) error
	Logout(c echo.Context) error
	Authorize(authorizePage echo.HandlerFunc) echo.HandlerFunc
	Token(c echo.Context) error
}

type server struct {
	ctx        context.Context
	config     Config
	osinConfig *osin.ServerConfig
	store      Store
}

// Store used by the OAuth server.
type Store interface {
	// UserStore and UserSessionStore are needed for user login/logout.
	store.UserStore
	store.UserSessionStore
	// ClientStore is needed for getting the OAuth client.
	store.ClientStore
	// OAuth is needed for OAuth authorizations.
	store.OAuthStore
}

// UIConfig is the combined configuration for the OAuth UI.
type UIConfig struct {
	webui.TemplateData `name:",squash"`
	FrontendConfig     `name:",squash"`
}

// FrontendConfig is the configuration for the OAuth frontend.
type FrontendConfig struct {
	Language string `json:"language" name:"-"`
}

// Config is the configuration for the OAuth server.
type Config struct {
	Mount string   `name:"mount" description:"Path on the server where the OAuth server will be served"`
	UI    UIConfig `name:"ui"`
}

// NewServer returns a new OAuth server on top of the given store.
func NewServer(ctx context.Context, store Store, config Config) Server {
	s := &server{
		ctx:    ctx,
		config: config,
		store:  store,
	}

	if s.config.Mount == "" {
		s.config.Mount = s.config.UI.MountPath()
	}

	s.osinConfig = &osin.ServerConfig{
		AuthorizationExpiration: int32((5 * time.Minute).Seconds()), // TODO: Make configurable
		AccessExpiration:        int32(time.Hour.Seconds()),         // TODO: Make configurable
		TokenType:               "bearer",
		AllowedAuthorizeTypes: osin.AllowedAuthorizeType{
			osin.CODE,
		},
		AllowedAccessTypes: osin.AllowedAccessType{
			osin.AUTHORIZATION_CODE,
			osin.REFRESH_TOKEN,
			osin.PASSWORD,
		},
		ErrorStatusCode:           http.StatusBadRequest,
		AllowClientSecretInParams: true,
		RedirectUriSeparator:      redirectURISeparator,
		RetainTokenAfterRefresh:   false,
	}

	return s
}

func (s *server) now() time.Time { return time.Now().UTC() }

func (s *server) oauth2(ctx context.Context) *osin.Server {
	oauth2 := osin.NewServer(s.osinConfig, &storage{
		ctx:     ctx,
		clients: s.store,
		oauth:   s.store,
	})
	oauth2.AuthorizeTokenGen = s
	oauth2.AccessTokenGen = s
	oauth2.Now = s.now
	oauth2.Logger = s
	return oauth2
}

func (s *server) Printf(format string, v ...interface{}) {
	log.FromContext(s.ctx).Warnf(format, v...)
}

func (s *server) output(c echo.Context, resp *osin.Response) error {
	if resp.IsError && resp.InternalError != nil {
		return resp.InternalError
	}
	headers := c.Response().Header()
	for i, k := range resp.Headers {
		for _, v := range k {
			headers.Add(i, v)
		}
	}
	if resp.Type == osin.REDIRECT {
		location, err := resp.GetRedirectUrl()
		if err != nil {
			return err
		}
		return c.Redirect(http.StatusFound, location)
	}
	return c.JSON(resp.StatusCode, resp.Output)
}

func (s *server) RegisterRoutes(server *web.Server) {
	group := server.Group(s.config.Mount, webui.RenderErrors, func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("template_data", s.config.UI.TemplateData)
			frontendConfig := s.config.UI.FrontendConfig
			frontendConfig.Language = s.config.UI.TemplateData.Language
			c.Set("app_config", struct {
				OAuth bool `json:"oauth"`
				FrontendConfig
			}{
				OAuth:          true,
				FrontendConfig: frontendConfig,
			})
			return next(c)
		}
	})

	csrf := middleware.CSRF()

	group.GET("/login", webui.Render, csrf, s.redirectToNext)

	group.POST("/api/auth/login", s.Login, csrf)
	group.POST("/api/auth/logout", s.Logout, csrf, s.requireLogin)
	group.GET("/api/me", s.CurrentUser, csrf, s.requireLogin)

	group.Any("/authorize", s.Authorize(webui.Render), csrf, s.redirectToLogin)
	group.POST("/token", s.Token)

	if s.config.Mount != "" && s.config.Mount != "/" {
		group.GET("", webui.Render, csrf)
	}
	group.GET("/*", webui.Render, csrf)
}