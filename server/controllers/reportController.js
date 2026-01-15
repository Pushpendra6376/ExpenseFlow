const ReportLog = require('../models/ReportLog');
const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize'); 
const { uploadToS3 } = require('../services/s3Service');
// 1. REPORT DOWNLOAD

exports.downloadReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { reportType, frequency, startDate, endDate } = req.body; 

        // 1. DATE LOGIC (Wahi purana wala)
        let queryDate = {};
        const now = new Date();
        const getStartOfDay = (date) => new Date(date.setHours(0,0,0,0));
        
        // ... (Switch Case same rahega, copy from previous code) ...
        switch (frequency) {
            case 'today': queryDate = {[Op.gte]: getStartOfDay(new Date()), [Op.lte]: new Date()}; break;
            case 'week': 
                const startOfWeek = new Date(); startOfWeek.setDate(now.getDate() - 7);
                queryDate = {[Op.gte]: getStartOfDay(startOfWeek), [Op.lte]: now}; break;
            case 'month': 
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                queryDate = {[Op.gte]: startOfMonth, [Op.lte]: now}; break;
            case 'custom': if(startDate && endDate) queryDate = {[Op.between]: [new Date(startDate), new Date(endDate)]}; break;
            default: queryDate = null;
        }

        const whereCondition = { userId };
        if (queryDate) whereCondition.date = queryDate;

        const transactions = await Transaction.findAll({
            where: whereCondition,
            raw: true,
            order: [['date', 'DESC']]
        });

        if (!transactions.length) {
            return res.status(404).json({ success: false, message: "No data found" });
        }

        // 2. FILE GENERATION (Buffer banana padega S3 ke liye)
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
            
            // Excel Buffer generate karo
            fileBuffer = await workbook.xlsx.writeBuffer();
            fileName = `Report_${userId}_${Date.now()}.xlsx`;
        
        } else {
            // CSV Buffer generate karo
            const fields = ['date', 'category', 'type', 'amount', 'description'];
            const parser = new Parser({ fields });
            const csv = parser.parse(transactions);
            
            fileBuffer = Buffer.from(csv); // String ko Buffer banaya
            fileName = `Report_${userId}_${Date.now()}.csv`;
        }

        // 3. UPLOAD TO S3 ☁️
        console.log("Uploading to S3...");
        const fileUrl = await uploadToS3(fileBuffer, fileName);
        console.log("Uploaded URL:", fileUrl);

        // 4. SAVE TO DB (With URL) 📝
        await ReportLog.create({
            userId: userId,
            reportType: reportType || 'CSV',
            period: frequency || 'All Time',
            fileUrl: fileUrl, // ✅ URL save kiya
            status: 'SUCCESS'
        });

        // 5. SEND URL TO FRONTEND 🚀
        res.status(200).json({
            success: true,
            message: "Report generated successfully",
            fileUrl: fileUrl // Frontend is URL ko open karega download ke liye
        });

    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 2. GET HISTORY (Ye Function MISSING tha, isliye crash hua)
exports.getReportLogs = async (req, res) => {
    try {
        const logs = await ReportLog.findAll({
            where: { userId: req.user.userId },
            order: [['createdAt', 'DESC']] // Latest pehle
        });

        res.status(200).json({
            success: true,
            count: logs.length,
            logs
        });

    } catch (error) {
        console.error("Log Error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};