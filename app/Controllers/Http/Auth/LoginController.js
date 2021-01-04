'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class LoginController {
    async login ({ request, auth, session, response }) {
        //get form data
        const { email, password, remember } = request.all()
        console.log(request.all())
        //retrieve user based on the form data
        const user = await User.query()
        .where('email', email)
        .where('is_active', true)
        .first()
        //verify user password
        if(user) {
            const passwordVerified = await Hash.verify(password, user.password)

             //login user
            if(passwordVerified) {
                await auth.remember(!!remember).login(user)
                //console.log(auth.user)
                return response.json({ message: `You have logged in` })
            }
        }
        //display error message
        session.flash({
            notification: {
                type: 'danger',
                message: `We couldn't verify your credentials. Make sure you have confirmed your email address`
            }
        })
       
        return response.json({ message: `We couldn't verify your credentials. Make sure you have confirmed your email address` })
    }
}

module.exports = LoginController
