const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Image, Caption, User } = require('./models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');




const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yml'));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));


const imageCache = new NodeCache({ stdTTL: 3600 })
const blacklistedTokens = [];

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ error: 'Access denied, token missing.' });
    }

    if(blacklistedTokens.includes(token)) {
        return res.status(403).json({ error: 'Invalid token, please log in again' });
    }

    jwt.verify(token, 'private_key', (err, user) => {
        if(err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    })
}


app.get('/images', async (req, res) => {
    const cachedImages = imageCache.get('all-images');
    if (cachedImages) {
        return res.status(200).json(cachedImages);
    }
    try {
        const images = await Image.findAll({
            include: [{ model: Caption, attributes: ['caption_text'] }]
        });

        imageCache.set('all-images', images);

        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving images.' });
    }
});

app.get('/images/:id', async (req, res) => {
    const { id } = req.params;
    const cachedImage = imageCache.get(`image_${id}`);
    if(cachedImage) {
        return res.status(200).json(cachedImage);
    }


    try {
        const image = await Image.findByPk(id, {
            include: [{ model: Caption, attributes: ['caption_text'] }]
        });

        if (!image) {
            return res.sendStatus(404).json({ error: 'Image not found' });
        }

        imageCache.set(`image_${id}`, image);

        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving the image.' });
    }
});

app.post('/images/:id/captions', authenticateToken, async (req, res) => {
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

        imageCache.del(`image_${id}`);
        imageCache.del('all_images');

        res.status(201).json(caption);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while adding the caption.' });
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if(existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error('Error registering user:', error)
        res.status(500).json({ error: 'An error occured during registration'});
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if(!user) {
            res.status(400).json({ error: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id }, 'private_key', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login Successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
})

app.post('/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if(token) {
        blacklistedTokens.push(token);
    }
    res.status(200).json({ message: 'Logout successful', redirectTo: '/login' });
});




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

