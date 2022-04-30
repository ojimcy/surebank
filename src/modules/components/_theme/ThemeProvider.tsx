import React from 'react'
import { COLOR_SCHEMES, disableAnimation, getSystemTheme, getTheme, MEDIA } from './helpers'
import { Theme, ThemeContext } from './ThemeContextHook'
import ThemeScript from './ThemeScript'

export interface ThemeProviderProps {
	/** List of all available theme names */
	themes?: Theme[]
	/** Forced theme name for the current page */
	forcedTheme?: Theme
	/** Whether to switch between dark and light themes based on prefers-color-scheme */
	enableSystem?: boolean
	/** Disable all CSS transitions when switching themes */
	disableTransitionOnChange?: boolean
	/** Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons */
	enableColorScheme?: boolean
	/** Key used to store theme setting in localStorage */
	storageKey?: string
	/** Default theme name (for v0.0.12 and lower the default was light). If `enableSystem` is false, the default theme is light */
	defaultTheme?: Theme
	/** HTML attribute modified based on the active theme. Accepts `class` and `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.) */
	attribute?: string | 'class'
	/** Mapping of theme name to HTML attribute value. Object where key is the theme name and value is the attribute value */
	value?: ThemeValue
}

export interface ThemeValue {
	[themeName: string]: string
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({
	forcedTheme,
	disableTransitionOnChange = false,
	enableSystem = true,
	enableColorScheme = true,
	storageKey = 'buc-theme',
	themes = ['light', 'dark'],
	defaultTheme = enableSystem ? 'system' : 'light',
	attribute = 'data-theme',
	value,
	children,
}) => {
	const [theme, setThemeState] = React.useState(() => getTheme(storageKey, defaultTheme))
	const [resolvedTheme, setResolvedTheme] = React.useState(() => getTheme(storageKey))
	const attrs = !value ? themes : Object.values(value)

	const handleMediaQuery = React.useCallback(
		(e?) => {
			const systemTheme = getSystemTheme(e)
			setResolvedTheme(systemTheme)
			if (theme === 'system' && !forcedTheme) changeTheme(systemTheme, false)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[theme, forcedTheme]
	)

	// Ref hack to avoid adding handleMediaQuery as a dep
	const mediaListener = React.useRef(handleMediaQuery)
	mediaListener.current = handleMediaQuery

	const changeTheme = React.useCallback(
		(theme, updateStorage = true, updateDOM = true) => {
			let name = value?.[theme] || theme

			const enable = disableTransitionOnChange && updateDOM ? disableAnimation() : null

			if (updateStorage) {
				try {
					localStorage.setItem(storageKey, theme)
				} catch (e) {
					// Unsupported
				}
			}

			if (theme === 'system' && enableSystem) {
				const resolved = getSystemTheme()
				name = value?.[resolved] || resolved
			}

			if (updateDOM) {
				const d = document.documentElement

				if (attribute === 'class') {
					d.classList.remove(...attrs)
					d.classList.add(name)
				} else {
					d.setAttribute(attribute, name)
				}
				enable?.()
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	)

	React.useEffect(() => {
		const handler = (...args: any) => mediaListener.current(...args)

		// Always listen to System preference
		const media = window.matchMedia(MEDIA)

		// Intentionally use deprecated listener methods to support iOS & old browsers
		media.addListener(handler)
		handler(media)

		return () => media.removeListener(handler)
	}, [])

	const setTheme = React.useCallback(
		(newTheme) => {
			if (forcedTheme) {
				changeTheme(newTheme, true, false)
			} else {
				changeTheme(newTheme)
			}
			setThemeState(newTheme)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[forcedTheme]
	)

	// localStorage event handling
	React.useEffect(() => {
		const handleStorage = (e: StorageEvent) => {
			if (e.key !== storageKey) {
				return
			}
			// If default theme set, use it if localstorage === null (happens on local storage manual deletion)
			const theme = e.newValue || defaultTheme
			setTheme(theme)
		}

		window.addEventListener('storage', handleStorage)
		return () => window.removeEventListener('storage', handleStorage)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setTheme])

	// color-scheme handling
	React.useEffect(() => {
		if (!enableColorScheme) return

		let colorScheme =
			// If theme is forced to light or dark, use that
			forcedTheme && COLOR_SCHEMES.includes(forcedTheme)
				? forcedTheme
				: // If regular theme is light or dark
				theme && COLOR_SCHEMES.includes(theme)
				? theme
				: // If theme is system, use the resolved version
				theme === 'system'
				? resolvedTheme || null
				: null

		// color-scheme tells browser how to render built-in elements like forms, scrollbars, etc.
		// if color-scheme is null, this will remove the property
		document.documentElement.style.setProperty('color-scheme', colorScheme)
	}, [enableColorScheme, theme, resolvedTheme, forcedTheme])

	return (
		<ThemeContext.Provider
			value={{
				theme,
				setTheme,
				forcedTheme,
				resolvedTheme: theme === 'system' ? resolvedTheme : theme,
				themes: enableSystem ? [...themes, 'system'] : themes,
				systemTheme: (enableSystem ? resolvedTheme : undefined) as 'light' | 'dark' | undefined,
			}}
		>
			<ThemeScript
				{...{
					forcedTheme,
					storageKey,
					attribute,
					value,
					enableSystem,
					defaultTheme,
					attrs,
				}}
			/>
			{children}
		</ThemeContext.Provider>
	)
}

export default ThemeProvider
