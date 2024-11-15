const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/school_management', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

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

// Fetch all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students.' });
    }
});

// Add a new student
app.post('/students', async (req, res) => {
    try {
        const { rollNo, studentName } = req.body;
        const date = new Date().toISOString().split('T')[0];
        const newStudent = new Student({ rollNo, studentName, date });

        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (err) {
        res.status(400).json({ message: 'Error adding student.', error: err });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
