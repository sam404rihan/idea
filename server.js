const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/attendanceDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Schema and Model
const studentSchema = new mongoose.Schema({
    rollNo: { type: Number, required: true, unique: true },
    studentName: { type: String, required: true },
    date: { type: String, default: new Date().toISOString().split('T')[0] },
    status: { type: String, default: 'Absent' }
});

const Student = mongoose.model('Student', studentSchema);

// API Endpoints
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching students' });
    }
});

app.post('/students', async (req, res) => {
    try {
        const { rollNo, studentName } = req.body;
        if (!rollNo || !studentName) return res.status(400).json({ error: 'Roll No. and Student Name are required' });

        const newStudent = new Student({ rollNo, studentName });
        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: 'Roll No. already exists' });
        res.status(500).json({ error: 'Error adding student' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
