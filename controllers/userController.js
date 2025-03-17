const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Group = require('../models/groupModel');
const Member = require('../models/memberModel')

const bcrypt = require('bcrypt');
const req = require('express/lib/request');



const registerLoad = async (req, res) => {

    try {
        res.render('register');
    } catch (error) {
        console.log(error.message)
    }
}

const register = async (req, res) => {

    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: 'images/' + req.file.filename,
            password: passwordHash
        });

        await user.save();

    } catch (error) {
        console.log(error.message)
    }
}

const loadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
const login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user = userData;
                res.cookie('user', JSON.stringify(userData));
                res.redirect('/dashboard');
            } else {
                res.render('login', { message: 'Email and password is incorrect!' });

            }
        } else {
            res.render('login', { message: 'Email and password is incorrect!' });
        }
    } catch (error) {
        console.log(error.message);
    }
}
const logout = async (req, res) => {
    try {
        res.clearCookie('user');
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}
const loadDashboard = async (req, res) => {
    try {
        var users = await User.find({ _id: { $nin: [req.session.user._id] } });
        res.render('dashboard', { user: req.session.user, users: users });
    } catch (error) {
        console.log(error.message);
    }
}

const saveChat = async (req, res) => {
    try {
        var chat = new Chat({
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message,
        });

        var newChat = await chat.save();
        res.status(200).send({ success: true, msg: 'Chat inserted', data: newChat });

    } catch (error) {
        console.error(error);
        res.status(400).send({ success: false, msg: error.message });
    }
}

const loadGroups = async (req, res) => {
    try {

        const groups = await Group.find({ creator_id: req.session.user._id });
        res.render('group', { groups: groups });
    } catch (error) {
        console.log(error.message);
    }
}
const createGroup = async (req, res) => {
    try {

        const group = new Group({
            creator_id: req.session.user._id,
            name: req.body.name,
            image: 'image/' + req.file.filename,
            limit: req.body.limit
        });
        await group.save();

        const groups = await Group.find({ creator_id: req.session.user._id });

        res.render('group', { message: req.body.name + 'Group created successfully', groups: groups });
    } catch (error) {
        console.log(error.message);
    }
}

const getMembers = async (req, res) => {
    try {

        var users = await User.find({ _id: { $nin: [req.session.user._id] } });
        res.status(200).send({ success: true, data: users });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
}


// const addMembers = async (req, res) => {
//     try {
//         if(!req.body.members) {
//             res.status(200).send({ success: false, msg: 'Please select any one Member' });
//         }
       
//         else if (req.body.members.length > parseInt(req.body.limit)) {
//             res.status(200).send({ success: false, msg: 'you can not seleect more than ' + req.body.limit + 'Members' });
//         }
//         else {
//             // console.log(req.body.members);
//             var data = [];
//             const members = req.body.members;
//             console.log(members)
//             console.log(members.length)
//             console.log(req.body.group_id)
//             for (let i = 0; i < members.length; i++) {
//                 console.log(members[i])
//                 data.push({
//                     group_id: req.body.group_id,
//                     user_id: members[i]
                    
                    
//                 });

//             }
//             // await Member.insertMany(data);
//             // res.status(200).send({ success: true, msg: 'Members added Successfully!' });
//             //debugging 
//             try {
//                 await Member.insertMany(data);
//                 res.status(200).send({ success: true, msg: 'Members added successfully!' });
//             } catch (error) {
//                 console.error('Error inserting members:', error);
//                 res.status(500).send({ success: false, msg: 'Failed to add members', error });
//             }
            
//         }

//     } catch (error) {
//         res.status(400).send({ success: false, msg: error.message })
//     }
// }

//newest newest debugging  ----- workeddddddd
const addMembers = async (req, res) => {
    try {
        if (!req.body.members) {
            return res.status(200).send({ success: false, msg: 'Please select at least one member' });
        }

        if (req.body.members.length > parseInt(req.body.limit)) {
            return res.status(200).send({ success: false, msg: `You cannot select more than ${req.body.limit} members` });
        }

        // Trim group_id to remove leading/trailing spaces
        const groupId = req.body.group_id.trim();

        const data = req.body.members.map(memberId => ({
            group_id: groupId,
            user_id: memberId.trim() // Just in case member IDs also have spaces
        }));

        try {
            await Member.insertMany(data);
            res.status(200).send({ success: true, msg: 'Members added successfully!' });
        } catch (error) {
            console.error('Error inserting members:', error);
            res.status(500).send({ success: false, msg: 'Failed to add members', error });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};




// newest debugging for addMembers with improved logic
// const addMembers = async (req, res) => {
//     try {
//         const { members, limit, group_id } = req.body;

//         if (!Array.isArray(members) || members.length === 0) {
//             return res.status(400).send({ success: false, msg: 'Please select at least one member' });
//         }

//         if (!group_id) {
//             return res.status(400).send({ success: false, msg: 'Group ID is required' });
//         }

//         const maxLimit = Number(limit);
//         if (members.length > maxLimit) {
//             return res.status(400).send({ success: false, msg: `You cannot select more than ${maxLimit} members` });
//         }

//         // Prepare data for bulk insert
//         const data = members.map(user_id => ({ group_id, user_id }));

//         try {
//             await Member.insertMany(data);
//             return res.status(200).send({ success: true, msg: 'Members added successfully!' });
//         } catch (error) {
//             console.error('Error inserting members:', error);
//             return res.status(500).send({ success: false, msg: 'Failed to add members', error: error.message });
//         }

//     } catch (error) {
//         console.error('Unexpected error:', error);
//         return res.status(500).send({ success: false, msg: 'Internal server error', error: error.message });
//     }
// };



// new debugging for addmembers with trim values 
// const addMembers = async (req, res) => {
//     try {
//         if (!req.body.members) {
//             return res.status(200).send({ success: false, msg: 'Please select at least one member' });
//         }

//         if (req.body.members.length > parseInt(req.body.limit)) {
//             return res.status(200).send({ success: false, msg: 'You cannot select more than ' + req.body.limit + ' members' });
//         }

//         var data = [];
//         const members = req.body.members;
//         const groupId = req.body.group_id.trim(); // Trim whitespace

//         console.log(members);
//         console.log(members.length);
//         console.log(groupId);

//         // Validate group_id
//         if (!mongoose.Types.ObjectId.isValid(groupId)) {
//             return res.status(400).send({ success: false, msg: "Invalid group_id" });
//         }

//         // Process members
//         for (let i = 0; i < members.length; i++) {
//             console.log(members[i]);
//             if (!mongoose.Types.ObjectId.isValid(members[i].trim())) {
//                 return res.status(400).send({ success: false, msg: `Invalid user_id: ${members[i]}` });
//             }
//             data.push({
//                 group_id: new mongoose.Types.ObjectId(groupId),
//                 user_id: new mongoose.Types.ObjectId(members[i].trim())
//             });
//         }

//         // Insert members
//         try {
//             await Member.insertMany(data);
//             res.status(200).send({ success: true, msg: 'Members added successfully!' });
//         } catch (error) {
//             console.error('Error inserting members:', error);
//             res.status(500).send({ success: false, msg: 'Failed to add members', error });
//         }

//     } catch (error) {
//         res.status(400).send({ success: false, msg: error.message });
//     }
// };



// debugging for addMembers
// const addMembers = async (req, res) => {
//     try {
//         console.log("Raw req.body:", req.body); // Debug: Log entire request body

//         if (!req.body.members || req.body.members.length === 0) {
//             return res.status(200).send({ success: false, msg: "Please select at least one member." });
//         }

//         let data = [];
//         const members = req.body.members;

//         for (let i = 0; i < members.length; i++) {
//             data.push({
//                 group_id: req.body.group_id,
//                 user_id: members[i]
//             });
//         }

//         await Member.insertMany(data);
//         res.status(200).send({ success: true, msg: "Members added Successfully!" });

//     } catch (error) {
//         console.error("Error adding members:", error);
//         res.status(400).send({ success: false, msg: error.message });
//     }
// };


module.exports = {
    registerLoad,
    register,
    loadLogin,
    login,
    logout,
    loadDashboard,
    saveChat,
    loadGroups,
    createGroup,
    getMembers,
    addMembers
}