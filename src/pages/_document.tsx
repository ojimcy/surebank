import Document, { Head, Html, Main, NextScript } from 'next/document'
import ANALYTICS from 'config/analytics.config'
import PAGE from 'config/page.config'

export default class MyDocument extends Document {
	render() {
		return (
			<Html dir={PAGE.defaultDirection} lang="en">
				<Head>
					{/* Global Site Tag (gtag.js) - Google Analytics */}
					{ANALYTICS.enabledAnalytics && (
						<>
							<script async src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.googleAnalyticsId}`} />
							<script
								dangerouslySetInnerHTML={{
									__html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${ANALYTICS.googleAnalyticsId}', {
                      page_path: window.location.pathname,
                    });
                  `,
								}}
							/>
						</>
					)}
					<link rel="shortcut icon" type="image/x-icon" href={PAGE.favicon} />
					<link
						rel="stylesheet"
						href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600&family=Roboto+Mono&display=swap"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
