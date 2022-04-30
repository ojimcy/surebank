import 'styles/core/index.scss'
import 'styles/vendor/simplebar/simplebar.scss'
import 'styles/vendor/apexcharts/apexcharts.scss'
import 'styles/vendor/slick/slick.scss'
import 'styles/vendor/quill/snow.scss'
import 'styles/vendor/quill/bubble.scss'
import 'styles/vendor/datetime/datetime.scss'
import 'styles/vendor/sweetalert2/sweetalert2.scss'

import { SSRProvider, DirectionProvider, ThemeProvider } from '@blueupcode/components'
import { AuthProvider } from 'components/auth/authContext'
import { wrapper } from 'store'
import Head from 'next/head'
import Progress from '@blueupcode/progress'
import getLayout, { LayoutNames } from 'components/layout/getLayout'
import PAGE from 'config/page.config'
import type { ExtendedAppProps } from '@blueupcode/components/types'

function MyApp({ Component, pageProps }: ExtendedAppProps) {
	const Layout = getLayout((Component.layoutName as LayoutNames) ?? PAGE.defaultLayoutName)

	return (
		<SSRProvider>
			<AuthProvider>
				<ThemeProvider forcedTheme={Component.theme}>
					<DirectionProvider defaultDirection={PAGE.defaultDirection}>
						<Head>
							<title>
								{Component.pageTitle ?? 'Untitled'} | {PAGE.appName}
							</title>
						</Head>
						<Layout activeLink={Component.activeLink} pageTitle={Component.pageTitle} breadcrumb={Component.breadcrumb}>
							<Progress />
							<Component {...pageProps} />
						</Layout>
					</DirectionProvider>
				</ThemeProvider>
			</AuthProvider>
		</SSRProvider>
	)
}

export default wrapper.withRedux(MyApp)
