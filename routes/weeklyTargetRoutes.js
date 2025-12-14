// routes/weeklyTargetRoutes.js
const express = require('express');
const controller = require('../controllers/weeklyTargetController');

const router = express.Router();

router.post('/targets', controller.createTarget);
router.get('/targets', controller.getTargets);
router.get('/targets/:id', controller.getTargetById);
router.put('/targets/:id', controller.updateTarget);
router.delete('/targets/:id', controller.deleteTarget);

module.exports = router;
