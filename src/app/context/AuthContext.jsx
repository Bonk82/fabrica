'use client'
import {createContext, useContext} from 'react'

export const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}


// eslint-disable-next-line react/prop-types
export function AuthProvider({children}) {
  return (
      <AuthContext.Provider value={{
          user: 'bonk',
      }}>
          {children}
      </AuthContext.Provider>
  )
}