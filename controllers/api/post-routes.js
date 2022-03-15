const router = require('express').Router();
const {Post, User, Vote, Comment} = require('../../models');
const sequelize = require('../../config/connection');
const withAuth = require('../../utils/auth');

// get all posts
router.get('/',(req,res)=>{
    Post.findAll({
        attributes:['id','post_url','title','created_at',
        [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']],
        order:[['created_at','DESC']],
        include:[
            {
                model: Comment,
                attributes:['id','comment_text','post_id','user_id','created_at'],
                include:{ 
                    model:User,
                    attributes:['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostData=>res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
})

// get single post
router.get('/:id',(req,res)=>{
    Post.findOne({
        where:{
            id: req.params.id
        },
        attributes:['id','post_url','title','created_at',
        [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']],
        include:[
            {
                model: User,
                attributes:['username']
            },
            {
                model: Comment,
                attributes:['id','comment_text','post_id','user_id','created_at'],
                include:{ 
                    model:User,
                    attributes:['username']
                }
            }
        ]
    })
    .then(dbPostData => {
        if(!dbPostData){
            res.status(404).json({message: 'No post found with this id'})
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
})

// create a post 
router.post('/',withAuth,(req,res)=>{
    Post.create({
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.session.user_id
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
})

// PUT /api/posts/upvote
router.put('/upvote',withAuth,(req,res)=>{
    // make sure the session exists first
    if(req.session){
        // pass session id along with all destructred properties
        Post.upvote({ ...req.body, user_id: req.session.user_id }, { Vote, Comment, User })
        .then(updatedPostData => res.json(updatedPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
    }
})

// update post title
router.put('/:id',withAuth,(req,res)=>{
    Post.update(
        {
            title:req.body.title
        },
        {
            where: {
                id: req.params.id
            }
        }
    )
    .then(dbPostData => {
        if(!dbPostData){
            res.status(404).json({message:'No post found with this id'})
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
})



// delete post
router.delete('/:id',withAuth,(req,res)=>{
    Post.destroy({
        where:{
            id: req.params.id
        }
    })
    .then(dbPostData => {
        if(!dbPostData){
            res.status(404).json({message:'No post found with this id'})
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
})

module.exports = router;
