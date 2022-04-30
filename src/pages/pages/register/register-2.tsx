import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Form, Button } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faGoogle, faPinterest } from '@fortawesome/free-brands-svg-icons'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const Register2Page: ExtendedNextPage = () => {
	return (
		<Row className="g-0 align-items-center justify-content-center h-100">
			<Col lg={8} xl={6}>
				{/* BEGIN Portlet */}
				<Portlet className="overflow-hidden">
					{/* BEGIN Row */}
					<Row className="g-0">
						<Col md={6}>
							<Portlet.Body className="d-flex flex-column justify-content-center align-items-start h-100 bg-primary text-white">
								<h2>Welcome back!</h2>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipisicing elit. Labore, temporibus, repudiandae. Voluptate
									tempore, expedita placeat rem labore iste eveniet ratione.
								</p>
								<Link href="/pages/login/login-2" passHref>
									<Button variant="outline-light" size="lg" width="widest" pill>
										Login
									</Button>
								</Link>
							</Portlet.Body>
						</Col>
						<Col md={6}>
							<Portlet.Body>
								{/* BEGIN Flex */}
								<div className="d-flex justify-content-center mb-4">
									<Button variant="label-primary" pill>
										<FontAwesomeIcon icon={faFacebook} className="me-2" />
										Facebook
									</Button>
									<Button variant="label-info" pill className="mx-2">
										<FontAwesomeIcon icon={faGoogle} className="me-2" />
										Google
									</Button>
									<Button variant="label-danger" pill>
										<FontAwesomeIcon icon={faPinterest} className="me-2" />
										Pinterest
									</Button>
								</div>
								{/* END Flex */}
								<Register2Form />
							</Portlet.Body>
						</Col>
					</Row>
					{/* END Row */}
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

const Register2Form = () => {
	// Initialize form validation with react-hook-form
	const { control, handleSubmit } = useForm<Register2FormInputs>({
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
	const onSubmit = (formData: Register2FormInputs) => {
		console.log(formData)
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
			{/* BEGIN Flex */}
			<div className="d-flex align-items-center justify-content-between">
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
				<Link href="#">Forgot password?</Link>
			</div>
			{/* END Flex */}
			{/* BEGIN Flex */}
			<Button type="submit" variant="label-primary" size="lg" width="widest" pill>
				Register
			</Button>
		</Form>
	)
}

interface Register2FormInputs {
	firstName: string
	lastName: string
	email: string
	password1: string
	password2: string
	agreement: boolean
}

Register2Page.pageTitle = 'Register 2'
Register2Page.layoutName = 'blank'

export default withAuth(Register2Page)
