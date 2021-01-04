'use strict'

const { validate, validateAll } = use('Validator')
const User = use('App/Models/User')
const PasswordReset = use('App/Models/PasswordReset')
const randomString = require('random-string')
const Mail = use('Mail')
const Hash = use('Hash')

class PasswordResetController {
    async sendResetLinkEmail ({ request, session, response }) {
        // validate form input
        const validation = await validate(request.only('email'), {
            email: 'required|email'
        })

        if(validation.fails()) {
            session.withErrors(validation.messages()).flashAll()

            return validation.messages()
        }

        try {
            //get user
            const user = await User.findBy('email', request.input('email'))

            await PasswordReset.query().where('email', user.email).delete()

            const { token } = await PasswordReset.create({
                email: user.email,
                token: randomString({ length: 40 })
            })

            const mailData = {
                user: user.toJSON(),
                token
            }

            await Mail.send('auth.emails.password_reset', mailData, message => {
                message
                .to(user.email)
                .from('afe@adonisjs.com')
                .subject('Password reset link')
            })
            session.flash({
                type: 'success',
                message: 'A password reset link have been sent to your email address'
            })
            return response.json({ message: 'A password reset link have been sent to your email address' })
        } catch (error) {
            console.log(error)
            return  response.json({ message: 'Sorry there is no user with this email address' })
        }
    }
    

    async reset ({ request, params, session, response }) {
        // validate form inputs
        const validation = await validateAll(request.all(), {
            email: 'required',
            password: 'required|confirmed'
        })

        if(validation.fails()) {
            session.withErrors(validation.messages()).flashExcept(['password', 'password_confirmation'])

            return validation.messages
        }
       try {
            //get user by the provided email
        const user = await User.findBy('email', request.input('email'))
        //check if password reset token exists for the user
        const token = await PasswordReset.query()
        .where('email', user.email)
        .where('token', params.token)
        .first()

        if(!token) {
            return response.json({ message: `This password reset token does not exist` })
        }
       console.log(user.password)
        const newPassword = await Hash.make(request.input('password'))
        user.password = request.input('password')
        console.log(newPassword)
        await user.save()

        //delete password reset token
        await PasswordReset.query().where('email', user.email).delete()

        return response.json({ message: `Your password has been reset` })
       } catch (error) {
           return response.json({ message: `Sorrry, there is no user with this email address` })
       }
    }
}

module.exports = PasswordResetController
