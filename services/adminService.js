const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
    getRestaurants: (req, res, callback) => {
        return Restaurant.findAll({
            raw: true,
            nest: true,
            include: [Category]
        }).then(restaurants => {
            // console.log(restaurants) // 加入 console 觀察資料的變化
            callback({ restaurants: restaurants })
        })
    },
    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [Category]
        }).then(restaurant => {
            callback({ restaurant: restaurant.toJSON() })
        })
    },
    getCategories: (req, res, callback) => {
        return Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            if (req.params.id) {
                Category.findByPk(req.params.id)
                    .then((category) => {
                        return callback({
                            categories: categories,
                            category: category.toJSON()
                        })
                    })
            } else {
                return callback({ categories: categories })
            }
        }).catch(error => console.error(error))
    },
    deleteRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id)
            .then(async (restaurant) => {
                try {
                    await restaurant.destroy()
                    callback({ status: 'success', message: '' })
                    console.log('test')
                } catch (e) {
                    console.log(e)
                }
            })
    },
    postRestaurant: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }
        const { file } = req // equal to const file = req.file
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return Restaurant.create({
                    name: req.body.name,
                    tel: req.body.tel,
                    address: req.body.address,
                    opening_hours: req.body.opening_hours,
                    description: req.body.description,
                    image: file ? img.data.link : null,
                    CategoryId: req.body.categoryId
                }).then((restaurant) => {
                    callback({ status: 'success', message: 'restaurant was successfully created' })
                })
            })
        } else {
            return Restaurant.create({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                CategoryId: req.body.categoryId
            })
                .then((restaurant) => {
                    callback({ status: 'success', message: 'restaurant was successfully created' })
                })
        }
    },
}

module.exports = adminService

