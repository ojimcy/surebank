import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Widget12, Form, Button } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const Login1Page: ExtendedNextPage = () => {
	return (
		<Row className="g-0 align-items-center justify-content-center h-100">
			<Col sm={8} md={6} lg={4} xl={3}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Body>
						<div className="text-center mt-4 mb-5">
							{/* BEGIN Avatar */}
							<Widget12 circle display variant="label-primary">
								<FontAwesomeIcon icon={faUserAlt} />
							</Widget12>
							{/* END Avatar */}
						</div>
						<Login1Form />
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

// Form validation schema
const validationSchema = yup.object().shape({
	email: yup.string().email('Your email is not valid').required('Please enter your email'),
	password: yup.string().min(6, 'Please enter at least 6 characters').required('Please provide your password'),
	remember: yup.boolean(),
})

const Login1Form = () => {
	// Initialize form validation with react-hook-form
	const { control, handleSubmit } = useForm<Login1FormInputs>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			email: '',
			password: '',
			remember: false,
		},
	})

	// Function to handle form submission
	const onSubmit = (formData: Login1FormInputs) => {
		console.log(formData)
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="d-grid gap-3">
			{/* BEGIN Validation Controller */}
			<Controller
				name="email"
				control={control}
				render={({ field, fieldState: { invalid, error } }) => (
					<Form.Group controlId="email">
						<Form.Floating>
							<Form.Control
								type="email"
								size="lg"
								placeholder="Please insert your email"
								isInvalid={invalid}
								{...field}
							/>
							<Form.Label>Email</Form.Label>
							{invalid && <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>}
						</Form.Floating>
					</Form.Group>
				)}
			/>
			{/* END Validation Controller */}
			{/* BEGIN Validation Controller */}
			<Controller
				name="password"
				control={control}
				render={({ field, fieldState: { invalid, error } }) => (
					<Form.Group controlId="password">
						<Form.Floating>
							<Form.Control
								type="password"
								size="lg"
								placeholder="Please insert your password"
								isInvalid={invalid}
								{...field}
							/>
							<Form.Label>Password</Form.Label>
							{invalid && <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>}
						</Form.Floating>
					</Form.Group>
				)}
			/>
			{/* END Validation Controller */}
			{/* BEGIN Flex */}
			<div className="d-flex align-items-center justify-content-between">
				{/* BEGIN Validation Controller */}
				<Controller
					name="remember"
					control={control}
					render={({ field: { value, ...field }, fieldState: { invalid } }) => (
						<Form.Switch id="remember" label="Remember me" {...field} isInvalid={invalid} checked={value} />
					)}
				/>
				{/* BEGIN Validation Controller */}
				<Link href="#">Forgot password?</Link>
			</div>
			{/* END Flex */}
			{/* BEGIN Flex */}
			<div className="d-flex align-items-center justify-content-between">
				<span>
					Don&apos;t have an account? <Link href="/pages/register/register-1">Register</Link>
				</span>
				<Button type="submit" variant="label-primary" size="lg" width="widest">
					Login
				</Button>
			</div>
			{/* END Flex */}
		</Form>
	)
}

interface Login1FormInputs {
	email: string
	password: string
	remember: boolean
}

Login1Page.pageTitle = 'Login 1'
Login1Page.layoutName = 'blank'

export default withAuth(Login1Page)
