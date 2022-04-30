import React from 'react'
import Router from 'next/router'
import authVerifyCookie from './authVerifyCookie'
import PAGE from 'config/page.config'
import type { AdditionalNextPageProps, ExtendedNextPage } from '@blueupcode/components/types'
import type { NextPageContext } from 'next'

const withAuth = (PageComponent: ExtendedNextPage) => {
	// Initialize wrapper component
	const WrapperComponent: ExtendedNextPage = (props) => {
		return <PageComponent {...props} />
	}

	WrapperComponent.getInitialProps = async (ctx: NextPageContext) => {
		// Get initial properties from page component
		const initialProps = PageComponent.getInitialProps ? await PageComponent.getInitialProps(ctx) : {}

		// Verify user token from cookie
		const userData = await authVerifyCookie(ctx)

		// Check whether user token is not valid
		if (!userData) {
			// Redirect to login page
			if (ctx.res) {
				ctx.res.writeHead(302, { Location: PAGE.loginPagePath })
				ctx.res.end()
			} else {
				Router.push(PAGE.loginPagePath)
			}

			return {
				...initialProps,
				userData: null,
			}
		}

		return {
			...initialProps,
			userData,
		}
	}

	// Inject page component attributes to wrapper component
	return Object.assign(WrapperComponent, PageComponent)
}

export default withAuth
