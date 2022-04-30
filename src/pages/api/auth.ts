import firebaseAdmin from 'components/firebase/firebaseAdmin'
import type { NextApiRequest, NextApiResponse } from 'next'

async function authenticationHandler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		try {
			const userData = await firebaseAdmin.auth().verifyIdToken(req.body.token)

			res.status(200).json(userData)
		} catch (error) {
			res.status(401).send('Invalid credential')
		}
	}
}

export default authenticationHandler
