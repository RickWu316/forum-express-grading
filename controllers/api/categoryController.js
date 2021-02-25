const db = require('../../models')
const Category = db.Category
const adminService = require('../../services/adminService.js')

const categoryController = {
    getCategories: (req, res) => {
        adminService.getCategories(req, res, (data) => {
            return res.json(data)
        })
    },
    postCategory: (req, res) => {
        adminService.postCategory(req, res, (data) => {
            return res.json(data)
        })
    },
    putCategory: (req, res) => {
        adminService.putCategory(req, res, (data) => {
            return res.json(data)
        })
    },
    deleteCategory: (req, res) => {
        adminService.deleteCategory(req, res, (data) => {
            return res.json(data)
        })
    }

}
module.exports = categoryController
