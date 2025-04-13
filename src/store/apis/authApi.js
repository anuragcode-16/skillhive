import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8081/api',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation({
      query: (userData) => ({
        url: '/users/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    googleAuth: builder.mutation({
      query: (googleData) => ({
        url: '/users/google',
        method: 'POST',
        body: googleData,
      }),
    }),
    getUserProfile: builder.query({
      query: () => '/users/profile',
    }),
    getLoginHistory: builder.query({
      query: () => '/users/login-history',
    }),
  }),
});

export const { 
  useLoginMutation, 
  useSignupMutation,
  useGoogleAuthMutation,
  useGetUserProfileQuery,
  useGetLoginHistoryQuery,
} = authApi;
export { authApi };