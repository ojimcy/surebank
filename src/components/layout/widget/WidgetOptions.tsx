import React from 'react'
import { Portlet, Form } from '@blueupcode/components'

const WidgetOptions: React.FC<WidgetOptionsProps> = ({ title, defaultSettings }) => {
	const [settings, setSettings] = React.useState<WidgetOptionsSettings>(defaultSettings)

	const handleChange = (settingKey: string, checked: boolean) => {
		setSettings((prevSettings) => ({
			...prevSettings,
			[settingKey]: {
				...prevSettings[settingKey],
				checked,
			},
		}))
	}

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Title>{title}</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				<div className="d-grid gap-1">
					{Object.keys(settings).map((settingKey) => {
						const setting = settings[settingKey]

						return (
							<Form.Group key={settingKey}>
								<Form.Check
									type="switch"
									label={setting.label}
									checked={setting.checked}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(settingKey, e.target.checked)}
								/>
							</Form.Group>
						)
					})}
				</div>
			</Portlet.Body>
		</Portlet>
	)
}

export interface WidgetOptionsProps {
	title: string
	defaultSettings: WidgetOptionsSettings
}

export interface WidgetOptionsSettings {
	[settingKey: string]: WidgetOptionsSetting
}

export interface WidgetOptionsSetting {
	label: string
	checked: boolean
}

export default WidgetOptions
