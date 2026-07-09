package com.restrobuild.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    private final JwtService jwtService = mock(JwtService.class);
    private final RestroBuildUserDetailsService userDetailsService = mock(RestroBuildUserDetailsService.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userDetailsService);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesEnabledUserWithValidAccessToken() throws Exception {
        String token = "valid-token";
        var userDetails = User
                .withUsername("owner@test.local")
                .password("password")
                .authorities("ROLE_OWNER")
                .build();
        when(jwtService.extractSubject(token)).thenReturn("owner@test.local");
        when(userDetailsService.loadUserByUsername("owner@test.local")).thenReturn(userDetails);
        when(jwtService.isAccessTokenValid(token, userDetails)).thenReturn(true);

        doFilterWithBearerToken(token);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertEquals("owner@test.local", authentication.getName());
        assertSame(userDetails, authentication.getPrincipal());
    }

    @Test
    void skipsDisabledUserWithoutValidatingToken() throws Exception {
        String token = "disabled-user-token";
        var userDetails = User
                .withUsername("owner@test.local")
                .password("password")
                .authorities("ROLE_OWNER")
                .disabled(true)
                .build();
        when(jwtService.extractSubject(token)).thenReturn("owner@test.local");
        when(userDetailsService.loadUserByUsername("owner@test.local")).thenReturn(userDetails);

        doFilterWithBearerToken(token);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtService, never()).isAccessTokenValid(eq(token), any());
    }

    @Test
    void skipsUnknownTokenUserWithoutFailingRequest() throws Exception {
        String token = "deleted-user-token";
        when(jwtService.extractSubject(token)).thenReturn("owner@test.local");
        when(userDetailsService.loadUserByUsername("owner@test.local"))
                .thenThrow(new UsernameNotFoundException("User not found."));

        MockHttpServletResponse response = doFilterWithBearerToken(token);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(200, response.getStatus());
    }

    private MockHttpServletResponse doFilterWithBearerToken(String token) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addHeader("Authorization", "Bearer " + token);

        filter.doFilter(request, response, new MockFilterChain());

        return response;
    }
}
