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

package webmiddleware

import (
	"net/http"

	"github.com/gorilla/csrf"
)

type skipCheckFunction func(*http.Request) bool

// CSRF returns a middleware that enables CSRF protection via a sync token. The
// skipCheck parameter can be used to skip CSRF protection based on the request
// interface.
func CSRF(skipCheck skipCheckFunction, authKey []byte, opts ...csrf.Option) MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		if skipCheck != nil {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				req := r
				if skipCheck(r) {
					r = csrf.UnsafeSkipCheck(r)
				}
				checkHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					next.ServeHTTP(w, req)
				})
				csrf.Protect(authKey, append(opts, csrf.Secure(r.TLS != nil))...)(checkHandler).ServeHTTP(w, r)
			})
		}
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			csrf.Protect(authKey, append(opts, csrf.Secure(r.TLS != nil))...)(next).ServeHTTP(w, r)
		})
	}
}
