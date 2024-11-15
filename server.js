const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

const uri = 'mongodb://localhost:27017/';

mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const attendanceSchema = new mongoose.Schema({
    rollNo: Number,
    studentName: String,
    date: String,
    status: { type: String, default: 'Absent' } // Default status
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// API to fetch all student attendance data
app.get('/attendance', async (req, res) => {
    try {
        const students = await Attendance.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).send(error);
    }
});

// API to save attendance
app.post('/attendance', async (req, res) => {
    try {
        const attendance = new Attendance(req.body);
        await attendance.save();
        res.status(201).send(attendance);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
