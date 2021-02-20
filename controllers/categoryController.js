const db = require('../models')
const Category = db.Category
let categoryController = {
    getCategories: (req, res) => {
        return Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            if (req.params.id) {
                Category.findByPk(req.params.id)
                    .then((category) => {
                        return res.render('admin/categories', {
                            categories: categories,
                            category: category.toJSON()
                        })
                    })
            } else {
                return res.render('admin/categories', { categories: categories })
            }
        }).catch(error => console.error(error))
    },
    postCategory: (req, res) => {
        if (!req.body.name) {
            req.flash('error_messages', 'name didn\'t exist')
            return res.redirect('back')
        } else {
            return Category.create({
                name: req.body.name
            })
                .then((category) => {
                    res.redirect('/admin/categories')
                })
                .catch(error => console.error(error))
        }
    },
    putCategory: (req, res) => {
        if (!req.body.name) {
            req.flash('error_messages', 'name didn\'t exist')
            return res.redirect('back')
        } else {
            return Category.findByPk(req.params.id)
                .then((category) => {
                    category.update(req.body)
                        .then((category) => {
                            res.redirect('/admin/categories')
                        })
                })
                .catch(error => console.error(error))
        }
    },
    deleteCategory: (req, res) => {
        return Category.findByPk(req.params.id)
            .then((category) => {
                category.destroy()
                    .then((category) => {
                        res.redirect('/admin/categories')
                    })
                    .catch(error => console.error(error))
            })
    }
}
module.exports = categoryController