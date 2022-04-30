import React from 'react'
import Head from 'next/head'
import { ThemeValue } from './ThemeProvider'
import { MEDIA } from './helpers'

const ThemeScript = React.memo(
	({
		forcedTheme,
		storageKey,
		attribute,
		enableSystem,
		defaultTheme,
		value,
		attrs,
	}: {
		forcedTheme?: string
		storageKey: string
		attribute?: string
		enableSystem?: boolean
		defaultTheme: string
		value?: ThemeValue
		attrs: any
	}) => {
		// Code-golfing the amount of characters in the script
		const optimization = (() => {
			if (attribute === 'class') {
				const removeClasses = `d.remove(${attrs.map((t: string) => `'${t}'`).join(',')})`

				return `var d=document.documentElement.classList;${removeClasses};`
			} else {
				return `var d=document.documentElement;`
			}
		})()

		const updateDOM = (name: string, literal?: boolean) => {
			name = value?.[name] || name
			const val = literal ? name : `'${name}'`

			if (attribute === 'class') {
				return `d.add(${val})`
			}

			return `d.setAttribute('${attribute}', ${val})`
		}

		const defaultSystem = defaultTheme === 'system'

		return (
			<Head>
				{forcedTheme ? (
					<script
						key="next-themes-script"
						dangerouslySetInnerHTML={{
							// These are minified via Terser and then updated by hand, don't recommend
							// prettier-ignore
							__html: `!function(){${optimization}${updateDOM(forcedTheme)}}()`,
						}}
					/>
				) : enableSystem ? (
					<script
						key="next-themes-script"
						dangerouslySetInnerHTML={{
							// prettier-ignore
							__html: `!function(){try {${optimization}var e=localStorage.getItem('${storageKey}');${!defaultSystem ? updateDOM(defaultTheme) + ';' : ''}if("system"===e||(!e&&${defaultSystem})){var t="${MEDIA}",m=window.matchMedia(t);m.media!==t||m.matches?${updateDOM('dark')}:${updateDOM('light')}}else if(e) ${value ? `var x=${JSON.stringify(value)};` : ''}${updateDOM(value ? 'x[e]' : 'e', true)}}catch(e){}}()`,
						}}
					/>
				) : (
					<script
						key="next-themes-script"
						dangerouslySetInnerHTML={{
							// prettier-ignore
							__html: `!function(){try{${optimization}var e=localStorage.getItem("${storageKey}");if(e){${value ? `var x=${JSON.stringify(value)};` : ''}${updateDOM(value ? 'x[e]' : 'e', true)}}else{${updateDOM(defaultTheme)};}}catch(t){}}();`,
						}}
					/>
				)}
			</Head>
		)
	},
	(prevProps, nextProps) => {
		// Only re-render when forcedTheme changes
		// the rest of the props should be completely stable
		if (prevProps.forcedTheme !== nextProps.forcedTheme) return false
		return true
	}
)

ThemeScript.displayName = 'ThemeScript'

export default ThemeScript
