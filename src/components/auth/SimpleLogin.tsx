import React from 'react'

interface SimpleLoginProps {
  onSuccess: (user: any, token: string) => void
  onSwitchToRegister: () => void
}

export function SimpleLogin({ onSuccess, onSwitchToRegister }: SimpleLoginProps) {
  const handleLogin = () => {
    // Simulate successful login
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'admin@nakuja.org',
      role: 'SUPER_ADMIN'
    }
    const mockToken = 'mock-token-123'
    onSuccess(mockUser, mockToken)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Nakuja Inventory</h1>
        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Login as Admin
          </button>
          <button 
            onClick={onSwitchToRegister}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Switch to Register
          </button>
        </div>
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Demo Accounts:</strong></p>
          <p>admin@nakuja.org / admin123</p>
          <p>alex.lead@nakuja.org / lead123</p>
        </div>
      </div>
    </div>
  )
}
