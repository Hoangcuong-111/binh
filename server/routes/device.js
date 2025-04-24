const express = require('express');
const router = express.Router();
const Device = require('../models/device');
const DeviceHistory = require('../models/deviceHistory');
const XLSX = require('xlsx');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

// Lấy danh sách thiết bị với tìm kiếm, lọc và phân trang
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/devices - Query params:', req.query);
    
    const { search, type, status, condition, page = 1, limit = 10 } = req.query;
    const query = {};

    // Tìm kiếm theo tên hoặc mô tả
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Lọc theo loại thiết bị
    if (type) {
      query.type = type;
    }

    // Lọc theo trạng thái
    if (status) {
      query.status = status;
    }

    // Lọc theo tình trạng
    if (condition) {
      query.condition = condition;
    }

    console.log('MongoDB query:', query);

    // Tính số lượng bản ghi để bỏ qua
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Đếm tổng số thiết bị thỏa mãn điều kiện
    const total = await Device.countDocuments(query);

    // Lấy danh sách thiết bị có phân trang
    const devices = await Device.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    console.log('Found devices:', devices.length);

    const response = {
      devices,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('Error in GET /api/devices:', err);
    res.status(500).json({ message: err.message });
  }
});

// Lấy lịch sử thay đổi của một thiết bị
router.get('/:id/history', async (req, res) => {
  try {
    const history = await DeviceHistory.find({ deviceId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm thiết bị mới
router.post('/', async (req, res) => {
  const device = new Device({
    name: req.body.name,
    type: req.body.type,
    status: req.body.status,
    condition: req.body.condition,
    description: req.body.description,
  });
  try {
    const newDevice = await device.save();
    
    // Lưu lịch sử tạo mới
    await new DeviceHistory({
      deviceId: newDevice._id,
      action: 'create',
      changes: newDevice.toObject()
    }).save();

    res.status(201).json(newDevice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật thiết bị
router.put('/:id', async (req, res) => {
  try {
    // Lấy dữ liệu thiết bị cũ trước khi cập nhật
    const oldDevice = await Device.findById(req.params.id);
    if (!oldDevice) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Cập nhật thiết bị
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Lưu lịch sử thay đổi
    const changes = {
      before: oldDevice.toObject(),
      after: device.toObject()
    };
    
    await new DeviceHistory({
      deviceId: device._id,
      action: 'update',
      changes: changes
    }).save();

    res.json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa thiết bị
router.delete('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Lưu lịch sử xóa
    await new DeviceHistory({
      deviceId: device._id,
      action: 'delete',
      changes: device.toObject()
    }).save();

    await Device.findByIdAndDelete(req.params.id);
    res.json({ message: 'Device deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xuất danh sách thiết bị ra Excel
router.get('/export/excel', async (req, res) => {
  try {
    const devices = await Device.find({});
    
    // Chuyển đổi dữ liệu thiết bị sang định dạng phù hợp cho Excel
    const excelData = devices.map(device => ({
      'Tên thiết bị': device.name,
      'Loại': device.type,
      'Trạng thái': device.status === 'active' ? 'Đang hoạt động' : 
                    device.status === 'inactive' ? 'Không hoạt động' : 'Đang bảo trì',
      'Tình trạng': device.condition,
      'Mô tả': device.description || '',
      'Ngày tạo': new Date(device.createdAt).toLocaleDateString('vi-VN')
    }));

    // Tạo workbook mới
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách thiết bị');

    // Tạo buffer để gửi file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Gửi file về client
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=devices.xlsx');
    res.send(excelBuffer);
  } catch (err) {
    console.error('Error exporting to Excel:', err);
    res.status(500).json({ message: err.message });
  }
});

// Xuất danh sách thiết bị ra PDF
router.get('/export/pdf', async (req, res) => {
  try {
    const devices = await Device.find({});

    // Định nghĩa fonts cho PDF
    const fonts = {
      Roboto: {
        normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
        bold: path.join(__dirname, '../fonts/Roboto-Bold.ttf'),
        italic: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
        bolditalic: path.join(__dirname, '../fonts/Roboto-BoldItalic.ttf')
      }
    };

    const printer = new PdfPrinter(fonts);

    // Tạo definition cho PDF
    const docDefinition = {
      content: [
        { text: 'Danh sách thiết bị', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              ['Tên thiết bị', 'Loại', 'Trạng thái', 'Tình trạng', 'Mô tả'],
              ...devices.map(device => [
                device.name,
                device.type,
                device.status === 'active' ? 'Đang hoạt động' : 
                device.status === 'inactive' ? 'Không hoạt động' : 'Đang bảo trì',
                device.condition,
                device.description || ''
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    // Tạo PDF document
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    
    // Gửi file về client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=devices.pdf');
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error('Error exporting to PDF:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
