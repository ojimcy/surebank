import { Button, FloatingButton, useDirection, useTheme } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon, faSync } from '@fortawesome/free-solid-svg-icons'

const LayoutFloatingButton = () => {
	const { resolvedTheme: theme, setTheme } = useTheme()
	const { dir, setDir } = useDirection()

	const handleToggleTheme = () => {
		if (theme === 'dark') {
			setTheme('light')
		} else {
			setTheme('dark')
		}
	}

	const handleToggleDir = () => {
		if (dir === 'rtl') {
			setDir('ltr')
		} else {
			setDir('rtl')
		}
	}

	return (
		<FloatingButton align="end" className="d-grid gap-2">
			<Button icon variant="flat-primary" onClick={handleToggleTheme}>
				{theme && <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />}
			</Button>
			<Button icon variant="flat-primary" onClick={handleToggleDir}>
				<FontAwesomeIcon icon={faSync} />
			</Button>
		</FloatingButton>
	)
}

export default LayoutFloatingButton
