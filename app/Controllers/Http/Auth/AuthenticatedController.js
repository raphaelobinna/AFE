'use strict'

class AuthenticatedController {
    async logout ({ auth, response }) {
        await auth.logout()

        return response.json({ message: `Successfully logged out` })
    }
}

module.exports = AuthenticatedController
