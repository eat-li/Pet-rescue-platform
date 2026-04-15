const express = require('express')
const router = express.Router()


// 路由导入
const adminRouter = require('./modules/AdminRoute')
const userRouter = require('./modules/UserRoute')
const articleRouter = require('./modules/ArticleRoute')
const adoptionRouter = require('./modules/AdoptionRoute')
const noticeRouter = require('./modules/NoticeRoute')
const petServiceOrderRouter = require('./modules/PetServiceOrderRoute')
const serviceBookingRouter = require('./modules/ServiceBookingRoute')
const petRouter = require('./modules/PetRoute')
const userBookingRouter = require('./modules/UserBookingRoute')



// 挂载
router.use("/admins", adminRouter)
router.use('/users', userRouter)
router.use('/articles', articleRouter)
router.use('/adoptions', adoptionRouter) 
router.use('/notices', noticeRouter)
router.use('/services', petServiceOrderRouter)
router.use('/bookings', serviceBookingRouter)
router.use('/pets', petRouter)
router.use('/user', userBookingRouter)



module.exports = router