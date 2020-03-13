const router = require('express').Router();
const multer = require('multer');

const dashPost = require('../models/dashPost');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }
        cb(error, 'backend/images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
});

router.post("/add", multer({ storage: storage }).array('image'),
    (req, res, next) => {
        const reqFiles = [];
        for (let i = 0; i < req.files.length; i++) {
            const url = req.protocol + "://" + req.get('host');
            reqFiles.push(url + "/images/" + req.files[i].filename)
        }
        const post = new dashPost({
            imagePath: reqFiles,
            title: req.body.title,
            description: req.body.description,
            rate: req.body.rate,
            price: req.body.price,
            quantity: req.body.quantity,
            color: req.body.color,
            size: req.body.size
        });
        post.save().then(createdPost => {
            res.status(201).json({
                message: "Post added successfully!",
                post: {
                    id: createdPost._id,
                    image: createdPost.image,
                    title: createdPost.title,
                    description: createdPost.description,
                    rate: createdPost.rate,
                    price: createdPost.price,
                    quantity: createdPost.quantity,
                    color: createdPost.color,
                    size: createdPost.size
                }
            });
        })
        .catch(error => {
            res.status(500).json({
                message: "Creating a post faield!"
            })
        });
});

router.get("", (req, res, next) => {
    const postQuery = dashPost.find();
    let feachedPosts;
    postQuery
        .then(documents => {
            res.status(200).json({
                message: "Posts featched successfully!",
                posts: documents
            });
        })
        .catch(error => {
            res.status(500).json({
                message: "Feaching posts failed!"
            });
        });
});

router.get("/:id", (req, res, next) => {
    dashPost.findById(req.params.id)
        .then(post => {
            if (post) {
                res.status(200).json({post});
            } else {
                res.status(404).json({ message: "Post not found!" });
            }
        })
        .catch(error => {
            res.status(500).json({message: "Feaching post failed!"})
        });
});

router.put("/update/:id/", multer({ storage: storage }).array('image'),
    (req, res, next) => {
        let imagePath = req.body.imagePath;
        // if (req.file) {
        //     const url = req.protocol + "://" + req.get("host");
        //     imagePath = url + "/images/" + req.file[0].filename;
        // }
        const reqFiles = [];
        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                const url = req.protocol + "://" + req.get('host');
                imagePath = reqFiles.pop(url + "/images/" + req.files[i].filename);
            }
        }

        // let imagePath = req.body.imagePath;
        // if (req.file) {
        //     const url = req.protocol + "://" + req.get("host");
        //     imagePath = url + "/images/" + req.files.filename;
        // }
        // if (req.file) {
        //     const url = req.protocol + "://" + req.get("host");
        //     imagePath = url + "/images/" + req.file.filename;
        // }
        const post = new dashPost({
            _id: req.body.id,
            imagePath: imagePath,
            title: req.body.title,
            description: req.body.description,
            rate: req.body.rate,
            price: req.body.price,
            quantity: req.body.quantity,
            color: req.body.color,
            size: req.body.size
        });
        dashPost.updateOne({ _id: req.params.id }, post)
            .then(result => {
                res.status(200).json({ message: "Update successfull!" });
                console.log(result)
            })
            .catch(error => {
                res.status(500).json({ message: "Couldn't updated post!" });
                console.log(error)
            });
});

module.exports = router;