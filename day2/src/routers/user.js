const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
var zipcodes = require('zipcodes');
const ExcelJs = require('exceljs');
const moment = require('moment')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if(!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch(e) {
        res.status(500).send()
    }
})

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age', 'address', 'company']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update' })
    }

    try {
        const user = await User.findById(req.params.id)

        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        if(!user) {
            return res.status(404).send()
        }
        res.send('updated successfully')
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if(!user) {
            return res.status(404).send()
        }
        res.send('user deleted successfully')
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/pincode/:zip', async (req, res) => {
    try {
        var hills = zipcodes.lookup(req.params.zip);
        res.send(hills)
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/user/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if(user.role === 'admin') {
            const users = await User.find({})
            res.send(users)
        }
        else{
            res.send(user)
        }
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/sheet', async (req, res, next) => {
    try {
        const users = await User.find({});
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('users');
        worksheet.columns = [
            {header: 'name', key: 'name', width: 10},
            {header: 'email', key: 'email', width: 10},
            {header: 'password', key: 'password', width: 10},
            {header: 'age', key: 'age', width: 10},
            {header: 'role', key: 'role', width: 10},
            {header: 'address', key: 'address', width: 10},
            {header: 'company', key: 'company', width: 10},
        ];
        let count = 1;
        users.forEach(user => {
            (user).s_no = count;
            worksheet.addRow(user);
            count += 1;
        });
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = {bold: true};
        });
        const data = await workbook.xlsx.writeFile('users.xlsx')
        res.send('excel sheet saved');
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router