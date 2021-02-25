const db = require('../models')
const Category = db.Category
const adminService = require('../services/adminService.js')

let categoryController = {
    getCategories: (req, res) => {
        adminService.getCategories(req, res, (data) => {
            return res.render('admin/categories', data)
        })
    },
    postCategory: (req, res) => {
        adminService.postCategory(req, res, (data) => {
            return res.redirect('/admin/categories')
        })
    },
    putCategory: (req, res) => {
        adminService.putCategory(req, res, (data) => {
            return res.redirect('/admin/categories')
        })
    },
    deleteCategory: (req, res) => {
        adminService.deleteCategory(req, res, (data) => {
            return res.redirect('/admin/categories')
        })
    }
}
module.exports = categoryController