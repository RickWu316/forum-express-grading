const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

// 定義路由
const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')

router.get('/admin/restaurants/:id', adminController.getRestaurant)
router.get('/admin/restaurants', adminController.getRestaurants)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', upload.single('image'), adminController.putRestaurant)

router.get('/admin/categories', categoryController.getCategories)
router.post('/admin/categories', categoryController.postCategory)
router.put('/admin/categories/:id', categoryController.putCategory)
router.delete('/admin/categories/:id', categoryController.deleteCategory)



module.exports = router