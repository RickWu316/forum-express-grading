const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10
const helpers = require('../_helpers')

const restController = {
    getRestaurants: (req, res) => {
        const user = helpers.getUser(req)
        let offset = 0
        const whereQuery = {}
        let categoryId = ''
        if (req.query.page) {
            offset = (req.query.page - 1) * pageLimit
        }
        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
            whereQuery.categoryId = categoryId
        }
        Restaurant.findAndCountAll({
            include: Category,
            where: whereQuery,
            offset: offset,
            limit: pageLimit
        }).then(result => {
            // data for pagination
            const page = Number(req.query.page) || 1
            const pages = Math.ceil(result.count / pageLimit)
            const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
            const prev = page - 1 < 1 ? 1 : page - 1
            const next = page + 1 > pages ? pages : page + 1
            // clean up restaurant data
            const data = result.rows.map(r => ({
                ...r.dataValues,
                description: r.dataValues.description.substring(0, 50),
                categoryName: r.dataValues.Category.name,
                isFavorited: user.FavoritedRestaurants.map(d => d.id).includes(r.id),
                isLiked: user.LikedRestaurants.map(d => d.id).includes(r.id)
            }))
            Category.findAll({
                raw: true,
                nest: true
            }).then(categories => {
                return res.render('restaurants', {
                    restaurants: data,
                    categories: categories,
                    categoryId: categoryId,
                    page: page,
                    totalPage: totalPage,
                    prev: prev,
                    next: next
                })
            })
                .catch(error => console.error(error))
        })
            .catch(error => console.error(error))
    },

    getRestaurant: (req, res) => {
        const user = helpers.getUser(req)
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category,
                { model: User, as: 'FavoritedUsers' },
                { model: User, as: 'LikedUsers' },
                { model: Comment, include: [User] }
            ]
        }).then(async (restaurant) => {
            const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(user.id) // 找出收藏此餐廳的 user
            const isLiked = restaurant.LikedUsers.map(d => d.id).includes(user.id)
            await restaurant.increment('viewCounts', { by: 1 })
            return res.render('restaurant', {
                restaurant: restaurant.toJSON(),
                isFavorited: isFavorited,
                isLiked: isLiked
            })
        }).catch(error => console.error(error))
    },
    getFeeds: (req, res) => {
        return Promise.all([
            Restaurant.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [Category]
            }),
            Comment.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [User, Restaurant]
            })
        ]).then(([restaurants, comments]) => {
            return res.render('feeds', {
                restaurants: restaurants,
                comments: comments
            })
        }).catch(error => console.error(error))
    },
    getDashboard: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category,
                { model: Comment, include: [User] }
            ]
        }).then(restaurant => {
            return res.render('dashboard', {
                restaurant: restaurant.toJSON(),
            })
        }).catch(error => console.error(error))
    },

    getTopRestaurant: (req, res) => {
        // 撈出所有 User 與 followers 資料
        return Restaurant.findAll({
            include: [
                { model: User, as: 'FavoritedUsers' },
            ],
            // limit: 10
        }).then(restaurant => {
            // 整理 users 資料
            restaurant = restaurant.map(restaurant => ({
                ...restaurant.dataValues,
                description: restaurant.dataValues.description.substring(0, 50),
                FavoritedCount: restaurant.FavoritedUsers.length,
                isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(restaurant.id)
            }))
            // 依追蹤者人數排序清單
            restaurant = restaurant.sort((a, b) => b.FavoritedCount - a.FavoritedCount)
            restaurant = restaurant.slice(0, 10)
            return res.render('topRestaurant', {
                restaurant: restaurant
            })
        })
    },

}

module.exports = restController
