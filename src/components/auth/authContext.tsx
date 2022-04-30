import React from 'react'
import nookies from 'nookies'
import { onIdTokenChanged, User } from 'firebase/auth'
import { firebaseAuth } from 'components/firebase/firebaseClient'

// Set timer constants
const cookieExpireIn = 30 * 24 * 60 * 60
const refreshTokenIn = 10 * 60 * 1000

// Set authentication context
const AuthContext = React.createContext<AuthContextProps>({
	userData: null,
	setUserData: () => {},
})

export type AuthUserData = User | null

export interface AuthContextProps {
	userData: AuthUserData
	setUserData: (dir: AuthUserData) => void
}

// Set authentication provider
export const AuthProvider: React.FC = ({ children }) => {
	const [userData, setUserData] = React.useState<AuthUserData>(null)

	React.useEffect(() => {
		// Firebase token observer
		return onIdTokenChanged(firebaseAuth, async (user) => {
			// Check wheter user has logged in
			if (user) {
				// Get user token
				const token = await user.getIdToken()

				// Store user data to the state
				setUserData(user)

				// Store user token to cookies
				nookies.set(null, 'buc_token', token, {
					maxAge: cookieExpireIn,
				})
			} else {
				// Reset user data from the state
				setUserData(null)

				// Remove user token from cookie
				nookies.destroy(null, 'buc_token')
			}
		})
	}, [])

	React.useEffect(() => {
		// Set timer for refreshing user token
		const interval = setInterval(async () => {
			const user = firebaseAuth.currentUser

			// Forced refresh user token
			if (user) await user.getIdToken(true)
		}, refreshTokenIn)

		// Clear timer
		return () => clearInterval(interval)
	}, [])

	return <AuthContext.Provider value={{ userData, setUserData }}>{children}</AuthContext.Provider>
}

// Set authentication hook
export const useAuth = () => {
	return React.useContext(AuthContext)
}
