import React from 'react'

export type Theme = 'light' | 'dark' | string

export interface UseThemeProps {
	/** List of all available theme names */
	themes: Theme[]
	/** Forced theme name for the current page */
	forcedTheme?: Theme
	/** Update the theme */
	setTheme: (theme: Theme) => void
	/** Active theme name */
	theme?: Theme
	/** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
	resolvedTheme?: Theme
	/** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
	systemTheme?: Theme
}

export const ThemeContext = React.createContext<UseThemeProps>({
	setTheme: (_) => {},
	themes: [],
})

export const useTheme = () => React.useContext(ThemeContext)
