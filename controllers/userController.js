const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
// const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')
// const restaurant = require('../models/restaurant')
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const userController = {
    signUpPage: (req, res) => {
        return res.render('signup')
    },

    signUp: (req, res) => {
        // confirm password
        if (req.body.passwordCheck !== req.body.password) {
            req.flash('error_messages', '兩次密碼輸入不同！')
            return res.redirect('/signup')
        } else {
            // confirm unique user
            User.findOne({ where: { email: req.body.email } }).then(user => {
                if (user) {
                    req.flash('error_messages', '信箱重複！')
                    return res.redirect('/signup')
                } else {
                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
                    }).then(user => {
                        req.flash('success_messages', '成功註冊帳號！')
                        return res.redirect('/signin')
                    })
                }
            })
        }
    },
    signInPage: (req, res) => {
        return res.render('signin')
    },

    signIn: (req, res) => {
        req.flash('success_messages', '成功登入！')
        res.redirect('/restaurants')
    },

    logout: (req, res) => {
        req.flash('success_messages', '登出成功！')
        req.logout()
        res.redirect('/signin')
    },
    getUser: (req, res) => {
        const userId = helpers.getUser(req).id
        if (Number(req.params.id) === Number(userId)) {
            return User.findByPk(userId, {
                include: [
                    { model: Comment, include: [Restaurant] }
                ],
            })
                .then(user => {
                    return res.render('user', {
                        user: user.toJSON()
                    })
                })
        } else {
            req.flash('error_messages', '你無權限查看該使用者資料')
            res.redirect('/restaurants')
        }
    },
    editUser: (req, res) => {
        const userId = helpers.getUser(req).id
        if (Number(req.params.id) === Number(userId)) {
            User.findByPk(req.params.id)
                .then(user => {
                    return res.render('editUser', {
                        user: user.toJSON()
                    })
                })
        } else {
            req.flash('error_messages', '你無權限查看該使用者資料')
            res.redirect('/restaurants')
        }
    },

    putUser: (req, res) => {
        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return User.findByPk(req.params.id)
                    .then((user) => {
                        user.update({
                            name: req.body.name,
                            avatar: file ? img.data.link : user.image,
                        })
                    })
                    .then((user) => {
                        req.flash('success_messages', 'user was successfully to update')
                        res.redirect(`/users/${req.params.id}`)
                    })
                    .catch(error => console.error(error))
            })

        }
        else {
            return User.findByPk(req.params.id)
                .then((user) => {
                    user.update({
                        name: req.body.name,
                        avatar: user.image
                    })
                })
                .then((restaurant) => {
                    req.flash('success_messages', 'user was successfully to update')
                    res.redirect(`/users/${req.params.id}`)
                })
                .catch(error => console.error(error))
        }

    },
    addFavorite: (req, res) => {
        console.log('test')
        const userId = helpers.getUser(req).id
        return Favorite.create({
            UserId: userId,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return res.redirect('back')
            })
            .catch(error => console.error(error))
    },
    removeFavorite: (req, res) => {
        const userId = helpers.getUser(req).id
        return Favorite.findOne({
            where: {
                UserId: userId,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((favorite) => {
                favorite.destroy()
                    .then((restaurant) => {
                        return res.redirect('back')
                    })
            })
            .catch(error => console.error(error))
    },
    addLike: (req, res) => {
        const userId = helpers.getUser(req).id
        return Like.create({
            UserId: userId,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return res.redirect('back')
                // res.send(render('restaurants'))
            })
            .catch(error => console.error(error))
    },
    removeLike: (req, res) => {
        const userId = helpers.getUser(req).id
        return Like.findOne({
            where: {
                UserId: userId,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((like) => {
                like.destroy()
                    .then((restaurant) => {
                        return res.redirect('back')
                    })
            })
            .catch(error => console.error(error))
    },
    getTopUser: (req, res) => {
        // 撈出所有 User 與 followers 資料
        return User.findAll({
            include: [
                { model: User, as: 'Followers' }
            ]
        }).then(users => {
            // 整理 users 資料
            users = users.map(user => ({
                ...user.dataValues,
                // 計算追蹤者人數
                FollowerCount: user.Followers.length,
                // 判斷目前登入使用者是否已追蹤該 User 物件
                isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
            }))
            // 依追蹤者人數排序清單
            users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
            return res.render('topUser', { users: users })
        })
    },
    addFollowing: (req, res) => {
        return Followship.create({
            followerId: req.user.id,
            followingId: req.params.userId
        })
            .then((followship) => {
                return res.redirect('back')
            })
    },

    removeFollowing: (req, res) => {
        return Followship.findOne({
            where: {
                followerId: req.user.id,
                followingId: req.params.userId
            }
        })
            .then((followship) => {
                followship.destroy()
                    .then((followship) => {
                        return res.redirect('back')
                    })
            })
    }
}

module.exports = userController

