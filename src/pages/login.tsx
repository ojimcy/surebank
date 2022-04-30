import React from 'react'
import { Row, Col, Portlet, Form, Button, Spinner, Widget12 } from '@blueupcode/components'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { firebaseAuth } from 'components/firebase/firebaseClient'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { swal } from 'components/sweetalert2/instance'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserAlt } from '@fortawesome/free-solid-svg-icons'
import * as yup from 'yup'
import Router from 'next/router'
import Link from 'next/link'
import PAGE from 'config/page.config'
import withGuest from 'components/auth/withGuest'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const LoginPage: ExtendedNextPage = () => {
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
						<LoginForm />
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
})

const LoginForm: React.FC = () => {
	// Loading state
	const [isLoading, setIsLoading] = React.useState(false)

	// Initialize form validation with react-hook-form
	const { control, handleSubmit } = useForm<LoginFormInputs>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			email: 'admin@blueupcode.com',
			password: 'blueupcodeadmin',
		},
	})

	// Function to handle form submission
	const onSubmit = async (formData: LoginFormInputs) => {
		// Show loading indicator
		setIsLoading(true)

		try {
			// Try to login with email and password
			await signInWithEmailAndPassword(firebaseAuth, formData.email, formData.password)

			const redirectUrl = (Router.query.redirect as string) || PAGE.homePagePath

			// Redirect to home page or url from the query parameter
			Router.push(redirectUrl)
		} catch (error: any) {
			// Show alert message when error
			swal.fire({ text: error.message, icon: 'error' })
		}

		// Hide loading indicator
		setIsLoading(false)
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
				<span>
					Don&apos;t have an account? <Link href="/register">Register</Link>
				</span>
				<Button type="submit" variant="label-primary" size="lg" width="widest" disabled={isLoading}>
					{isLoading && <Spinner animation="border" size="sm" className="me-2" />}
					Login
				</Button>
			</div>
			{/* END Flex */}
		</Form>
	)
}

interface LoginFormInputs {
	email: string
	password: string
}

LoginPage.pageTitle = 'Login'
LoginPage.layoutName = 'blank'

export default withGuest(LoginPage)
