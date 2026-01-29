const ReportLog = require('../models/ReportLog');
const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize'); 
const { uploadToS3 } = require('../services/s3Service');

// 1. GET PREVIEW (Table Data dikhane ke liye)
exports.getReportPreview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate, page = 1, limit = 10 } = req.body; // Body se data lenge

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Dates required" });
        }

        const start = new Date(startDate); start.setHours(0,0,0,0);
        const end = new Date(endDate); end.setHours(23,59,59,999);
        const offset = (page - 1) * limit;

        // Query with Pagination
        const { count, rows } = await Transaction.findAndCountAll({
            where: {
                userId,
                date: { [Op.between]: [start, end] }
            },
            order: [['date', 'DESC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        res.status(200).json({
            success: true,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            data: rows
        });

    } catch (error) {
        console.error("Preview Error:", error);
        res.status(500).json({ success: false, message: "Error fetching data" });
    }
};

// 2. DOWNLOAD REPORT (Apka purana code, bas 'frequency' logic hata diya aur Custom Range fix kiya)
exports.downloadReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { reportType, startDate, endDate } = req.body; 

        const start = new Date(startDate); start.setHours(0,0,0,0);
        const end = new Date(endDate); end.setHours(23,59,59,999);

        const transactions = await Transaction.findAll({
            where: { 
                userId, 
                date: { [Op.between]: [start, end] }
            },
            raw: true,
            order: [['date', 'DESC']]
        });

        if (!transactions.length) {
            return res.status(404).json({ success: false, message: "No data found to download" });
        }

        let fileBuffer;
        let fileName;

        if (reportType === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Expenses');
            worksheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Category', key: 'category', width: 20 },
                { header: 'Amount', key: 'amount', width: 15 },
                { header: 'Description', key: 'description', width: 30 }
            ];
            worksheet.addRows(transactions);
            fileBuffer = await workbook.xlsx.writeBuffer();
            fileName = `Report_${userId}_${Date.now()}.xlsx`;
        } else {
            const fields = ['date', 'category', 'type', 'amount', 'description'];
            const parser = new Parser({ fields });
            const csv = parser.parse(transactions);
            fileBuffer = Buffer.from(csv);
            fileName = `Report_${userId}_${Date.now()}.csv`;
        }

        const fileUrl = await uploadToS3(fileBuffer, fileName);

        await ReportLog.create({
            userId,
            reportType: reportType || 'CSV',
            period: `${startDate} to ${endDate}`,
            fileUrl: fileUrl, 
            status: 'SUCCESS'
        });

        res.status(200).json({ success: true, fileUrl });

    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 3. GET HISTORY
exports.getReportLogs = async (req, res) => {
    try {
        const logs = await ReportLog.findAll({
            where: { userId: req.user.userId },
            order: [['createdAt', 'DESC']] 
        });
        res.status(200).json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};