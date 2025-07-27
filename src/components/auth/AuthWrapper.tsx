import React, { useState, useEffect } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { SimpleLogin } from './SimpleLogin'
import { AuthService } from '../../lib/auth-service-mock'

interface AuthWrapperProps {
  children: React.ReactNode
}

interface User {
  id: string
  name: string
  email: string
  role: string
  teamId?: string
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Set to false for testing
  const [user, setUser] = useState<User | null>(null)
  const [showRegister, setShowRegister] = useState(false)

  // Simplified for testing - remove useEffect for now
  // useEffect(() => {
  //   checkAuthStatus()
  // }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('user')
      
      if (token && savedUser) {
        // Verify token is still valid
        const isValid = await AuthService.validateToken(token)
        if (isValid) {
          setUser(JSON.parse(savedUser))
          setIsAuthenticated(true)
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = (user: User, token: string) => {
    setUser(user)
    setIsAuthenticated(true)
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterForm
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      )
    } else {
      return (
        <SimpleLogin
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setShowRegister(true)}
        />
      )
    }
  }

  // Add user context to children
  return (
    <div className="min-h-screen">
      {React.cloneElement(children as React.ReactElement, { 
        user, 
        onLogout: handleLogout 
      })}
    </div>
  )
}
