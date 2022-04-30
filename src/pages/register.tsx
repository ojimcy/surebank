import React from 'react'
import { Row, Col, Portlet, Widget12, Form, Button, Spinner } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { firebaseAuth } from 'components/firebase/firebaseClient'
import { swal } from 'components/sweetalert2/instance'
import * as yup from 'yup'
import Router from 'next/router'
import Link from 'next/link'
import PAGE from 'config/page.config'
import withGuest from 'components/auth/withGuest'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const RegisterPage: ExtendedNextPage = () => {
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
						<RegisterForm />
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

// Form validation schema
const validationSchema = yup.object().shape({
	firstName: yup.string().min(5, 'Please enter at least 5 characters').required('Please enter your firstname'),
	lastName: yup.string().min(5, 'Please enter at least 5 characters').required('Please enter your lastname'),
	email: yup.string().email('Your email is not valid').required('Please enter your email'),
	password1: yup.string().min(6, 'Please enter at least 6 characters').required('Please provide your password'),
	password2: yup
		.string()
		.min(6, 'Please enter at least 6 characters')
		.oneOf([yup.ref('password1')], 'Your password not match')
		.required('Please repeat your password'),
	agreement: yup.boolean().oneOf([true], 'You must accept the agreement'),
})

const RegisterForm: React.FC = () => {
	// Loading state
	const [isLoading, setIsLoading] = React.useState(false)

	// Initialize form validation with react-hook-form
	const { control, handleSubmit } = useForm<RegisterFormInputs>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password1: '',
			password2: '',
			agreement: false,
		},
	})

	// Function to handle form submission
	const onSubmit = async (formData: RegisterFormInputs) => {
		// Show loading indicator
		setIsLoading(true)

		try {
			// Try to create user with email and password
			const userCredential = await createUserWithEmailAndPassword(firebaseAuth, formData.email, formData.password1)

			// Update user profile
			await updateProfile(userCredential.user, {
				displayName: `${formData.firstName} ${formData.lastName}`,
			})

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
			<Row className="g-3">
				<Col sm={6}>
					{/* BEGIN Validation Controller */}
					<Controller
						name="firstName"
						control={control}
						render={({ field, fieldState: { invalid, error } }) => (
							<Form.Group controlId="firstName">
								<Form.Floating>
									<Form.Control
										type="text"
										size="lg"
										placeholder="Please insert your first name"
										isInvalid={invalid}
										{...field}
									/>
									<Form.Label>First name</Form.Label>
									{invalid && <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>}
								</Form.Floating>
							</Form.Group>
						)}
					/>
					{/* END Validation Controller */}
				</Col>
				<Col sm={6}>
					{/* BEGIN Validation Controller */}
					<Controller
						name="lastName"
						control={control}
						render={({ field, fieldState: { invalid, error } }) => (
							<Form.Group controlId="lastName">
								<Form.Floating>
									<Form.Control
										type="text"
										size="lg"
										placeholder="Please insert your last name"
										isInvalid={invalid}
										{...field}
									/>
									<Form.Label>Last name</Form.Label>
									{invalid && <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>}
								</Form.Floating>
							</Form.Group>
						)}
					/>
					{/* END Validation Controller */}
				</Col>
			</Row>
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
				name="password1"
				control={control}
				render={({ field, fieldState: { invalid, error } }) => (
					<Form.Group controlId="password1">
						<Form.Floating>
							<Form.Control
								type="password"
								size="lg"
								placeholder="Please provide your password"
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
			{/* BEGIN Validation Controller */}
			<Controller
				name="password2"
				control={control}
				render={({ field, fieldState: { invalid, error } }) => (
					<Form.Group controlId="password2">
						<Form.Floating>
							<Form.Control
								type="password"
								size="lg"
								placeholder="Repeat your password"
								isInvalid={invalid}
								{...field}
							/>
							<Form.Label>Confirm password</Form.Label>
							{invalid && <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>}
						</Form.Floating>
					</Form.Group>
				)}
			/>
			{/* END Validation Controller */}
			{/* BEGIN Validation Controller */}
			<Controller
				name="agreement"
				control={control}
				render={({ field: { value, ...field }, fieldState: { invalid } }) => (
					<Form.Check
						type="checkbox"
						id="agreement"
						label="Accept agreement"
						{...field}
						isInvalid={invalid}
						checked={value}
					/>
				)}
			/>
			{/* BEGIN Validation Controller */}
			{/* BEGIN Flex */}
			<div className="d-flex align-items-center justify-content-between">
				<span>
					Already have an account? <Link href="/login">Login</Link>
				</span>
				<Button type="submit" variant="label-primary" size="lg" width="widest" disabled={isLoading}>
					{isLoading && <Spinner animation="border" size="sm" className="me-2" />}
					Register
				</Button>
			</div>
			{/* END Flex */}
		</Form>
	)
}

interface RegisterFormInputs {
	firstName: string
	lastName: string
	email: string
	password1: string
	password2: string
	agreement: boolean
}

RegisterPage.pageTitle = 'Register'
RegisterPage.layoutName = 'blank'

export default withGuest(RegisterPage)
