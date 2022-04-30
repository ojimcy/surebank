import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Form, Button } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'
import { faFacebook, faGoogle, faPinterest } from '@fortawesome/free-brands-svg-icons'

const Login2Page: ExtendedNextPage = () => {
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
								<Link href="/pages/register/register-2" passHref>
									<Button variant="outline-light" size="lg" width="widest" pill>
										Register
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
								<Login2Form />
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

const Login2Form = () => {
	// Initialize form validation with react-hook-form
	const { control, handleSubmit } = useForm<Login2FormInputs>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			email: '',
			password: '',
			remember: false,
		},
	})

	// Function to handle form submission
	const onSubmit = (formData: Login2FormInputs) => {
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
			<Button type="submit" variant="label-primary" size="lg" pill>
				Login
			</Button>
		</Form>
	)
}

interface Login2FormInputs {
	email: string
	password: string
	remember: boolean
}

Login2Page.pageTitle = 'Login 2'
Login2Page.layoutName = 'blank'

export default withAuth(Login2Page)
