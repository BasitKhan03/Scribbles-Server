const express = require('express');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/verification');
const Notes = require('../models/Notes');

const router = express.Router();


// Route for getting a user's details

router.get('/getnotes', verifyToken, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user });
        res.json(notes);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});


// Route for adding a note

router.post('/addnote', verifyToken, [
    body('title', 'Enter a valid Title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
    }

    try {
        const userID = req.user;
        const { title, description, tag } = req.body;

        const note = new Notes({
            user: userID,
            title,
            description,
            tag
        });

        const savedNote = await note.save();
        res.send(savedNote);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});


// Route for updating an existing note

router.put('/updatenote/:id', verifyToken, async (req, res) => {
    const { title, description, tag } = req.body;
    const newNote = {};

    if (title) {
        newNote.title = title;
    }
    if (description) {
        newNote.description = description;
    }
    if (tag) {
        newNote.tag = tag;
    }

    try {
        let note = await Notes.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ error: "Not Found!" });
        }

        if (note.user.toString() !== req.user) {
            return res.status(401).json({ error: "Unauthorized Access!" });
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.send(note);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }

});


// Route for deleting a note

router.delete('/deletenote/:id', verifyToken, async (req, res) => {
    try {
        let note = await Notes.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ error: "Not Found!" });
        }

        if (note.user.toString() !== req.user) {
            return res.status(401).json({ error: "Unauthorized Access!" });
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ message: "Note has been deleted successfully!" });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;