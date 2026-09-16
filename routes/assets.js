const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');

// جلب كل العهد والأصول
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find().populate('assignedTo', 'name department');
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة عهدة جديدة وإرسال تنبيه فوري
router.post('/', async (req, res) => {
  try {
    const newAsset = new Asset(req.body);
    await newAsset.save();
    
    // إرسال إشعار فوري لكل المتصلين عبر Socket.io
    const io = req.app.get('socketio');
    io.emit('notification', {
      title: 'إدارة العهد والأصول',
      message: `تم إضافة أصل جديد: ${newAsset.assetName}`,
      type: 'success'
    });

    res.status(201).json(newAsset);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// تسليم عهدة لموظف
router.put('/:id/assign', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { assignedTo: employeeId, assignDate: new Date(), status: 'Assigned' },
      { new: true }
    );

    const io = req.app.get('socketio');
    io.emit('notification', {
      title: 'تحديث العهد',
      message: `تم تسليم الأصل (${asset.assetName}) للموظف بنجاح`,
      type: 'info'
    });

    res.json(asset);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;