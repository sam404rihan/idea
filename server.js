const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

const uri = 'mongodb://localhost:27017/attendanceDB';

mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

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
        const date = new Date().toISOString().split('T')[0];
        const status = 'Absent';

        const newStudent = new Student({ rollNo, studentName, date, status });
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(400).json({ error: 'Error adding student' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
