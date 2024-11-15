const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/school_management', { })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Schema and Model
const studentSchema = new mongoose.Schema({
    rollNo: { type: Number, required: true, unique: true },
    studentName: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, default: 'Absent' }
});

const Student = mongoose.model('Student', studentSchema);

// Fetch all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students.', error: err });
    }
});

// Add a new student
app.post('/api/students', async (req, res) => {
    try {
        const { rollNo, studentName } = req.body;

        // Validate input
        if (!rollNo || !studentName) {
            return res.status(400).json({ message: 'Roll number and student name are required.' });
        }

        // Check if roll number is unique
        const existingStudent = await Student.findOne({ rollNo });
        if (existingStudent) {
            return res.status(400).json({ message: 'Roll number already exists.' });
        }

        const date = new Date().toISOString().split('T')[0];
        const newStudent = new Student({ rollNo, studentName, date });

        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (err) {
        res.status(500).json({ message: 'Error adding student.', error: err });
    }
});

// Update student attendance
app.put('/api/students/:rollNo', async (req, res) => {
    try {
        const { status } = req.body;  // Get the new attendance status from the request body
        const { rollNo } = req.params;  // Get the rollNo from the URL parameter

        // Validate status
        if (!status || !['Present', 'Absent'].includes(status)) {
            return res.status(400).json({ message: 'Invalid attendance status.' });
        }

        // Find the student by rollNo
        const student = await Student.findOne({ rollNo });
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Update the student's attendance status
        student.status = status;
        await student.save();  // Save the updated student record

        res.json({ message: 'Attendance updated successfully', student });
    } catch (err) {
        res.status(500).json({ message: 'Error updating attendance.', error: err });
    }
});

// Delete a student
app.delete('/api/students/:rollNo', async (req, res) => {
    try {
        const { rollNo } = req.params;

        // Find and delete the student by rollNo
        const student = await Student.findOneAndDelete({ rollNo });
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting student.', error: err });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
