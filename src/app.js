const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Image, Caption, User } = require('./models');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));



app.get('/images', async (req, res) => {
    try {
        const images = await Image.findAll();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching images.' });
    }
});

app.get('/images/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const image = await Image.findByPk(id, {
            include: [{ model: Caption}]
        });

        if (!image) {
            return res.sendStatus(404).json({ error: 'Image not found' });
        }

        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the image.' });
    }
});

app.post('/images/:id/captions', async (req, res) => {
    const { id } = req.params;
    const { caption_text, userId } = req.body;

    try {
        const image = await Image.findByPk(id);

        if(!image) {
            return res.sendStatus(404).json({ error: 'Image not found' });
        }

        const caption = await Caption.create({
            caption_text,
            userId,
            imageId: id
        });

        res.status(201).json(caption);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while adding the caption.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

