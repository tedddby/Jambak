const database = require("../lib/db");
const pw = require("../lib/pw");
const jwtService = require("../lib/jwt");
const Joi = require('joi');

const executeQuery = async (query, params) => {
    try {
        return await database.query(query, params);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const addRecord = async (req, res, tableName, fields) => {
    try {
        const { error } = Joi.object().keys(fields).validate(req.body);

        if (error) {
            if(!error.toString().includes("Image")){
                console.error("IF--------\n\n"+error);
                return res.status(400).json({ success: false, message: error.message });
            }
        }

        const { ...values } = req.body;
        if(values.password){
            values.password = await pw.hashPassword(values.password);
        }
        const placeholders = new Array(Object.keys(values).length).fill('?').join(',');
        const query = `INSERT INTO ${tableName} (${Object.keys(values).join(',')}) VALUES (${placeholders})`;

        await executeQuery(query, Object.values(values));
        return res.status(200).json({ success: true, message: `${tableName} added successfully.` });
    } catch (error) {
        console.error("CATCH--------\n\n"+error);
        return res.status(500).json({ success: false, message: 'An error occurred.' });
    }
};

const fetchRecords = async (req, res, tableName) => {
    try {
        let query;
        if(tableName === "users"){
            const { error } = Joi.object().keys(loginFields).validate(req.body);
            if(error){
                return res.status(400).json({ success: false, message: error.message });
            }else{
                const {...values } = req.body;
                query = `SELECT * FROM ${tableName} WHERE phoneNumber = ${values.phoneNumber}`;
            }
        }else{
            query = `SELECT * FROM ${tableName}`;
        }

        const result = await executeQuery(query);

        if (result) {
            if(tableName === "donations"){
                result.forEach(record => {
                    if(record.ItemImage !== null){
                        record.ItemImage = record.ItemImage.toString('base64');
                    }
                })
            }else if(tableName === "help_requests"){
                result.forEach(record => {
                    if(record.SupportingDocument !== null){
                        record.SupportingDocument = record.SupportingDocument.toString('base64');
                    }
                })
            }else if(tableName === "crowdfunding_campaigns"){
                result.forEach(record => {
                    if(record.CampaignImage !== null){
                        record.CampaignImage = record.CampaignImage.toString('base64');
                    }
                })
            }else if(tableName === 'users'){
                return loginUser(req, res, result);
            }
            return res.status(200).json({ success: true, data: result });
        } else {
            return res.status(500).json({ success: false, message: 'No records found.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'An error occurred.' });
    }
};

const updateCrowdfunding = async (req, res) => {
    try {
        const schema = Joi.object({
            raised: Joi.number().integer().required(),
            goal: Joi.number().integer().required(),
            id: Joi.number().integer().required(),
            amount: Joi.number().integer().required()
        });
        const { error } = schema.validate(req.body);

        if (error) {
            console.error(error);
            return res.status(400).json({ success: false, message: error.message });
        }
        const {goal, raised, id, amount} = req.body;
        const totalRaised = Number(raised)+Number(amount);

        if(goal - totalRaised > 0){
            await executeQuery(`UPDATE crowdfunding_campaigns SET RaisedAmount = ? WHERE CampaignID = ?`, [totalRaised, id]);
        }else{
            await executeQuery(`DELETE FROM  crowdfunding_campaigns WHERE CampaignID = ?`, [id]);
        }
        return res.status(200).json({ success: true, message: `updated successfully.` });
    } catch (error) {
        console.error("CATCH--------\n\n"+error);
        return res.status(500).json({ success: false, message: 'An error occurred.' });
    }
};


const loginUser = async (req, res, result) => {
    if(result.length === 0){
        return res.status(401).json({ success: false, message: 'No such username or password.' });
    }else{
        let {phoneNumber, password} = req.body;
        try{
            let verifyPassword = await pw.verifyPassword(password, result[0].password);
            if(verifyPassword){
                delete result[0].password;
                let token = await jwtService.encode(result[0]);
                res.cookie('authorization', token, {
                    httpOnly: true,
                    maxAge: 86400000
                });
                return res.status(200).json({ success: true, message: 'Logged in successfully.' });
            }else{
                return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
            }
        }catch(error){
            return res.status(500).json({ success: false, message: 'An error occurred.' });
        }
    }
}

const isLoggedIn = async (req, res, next) => {
    if(req.cookies.authorization){
        try{
            req.user = await jwtService.verify(req.cookies.authorization);
            return next();
        }catch (error){
            return next();
        }
    }else{
        return next();
    }
}

const announcementFields = {
    title: Joi.string().required(),
    description: Joi.string().required(),
};

const crowdfundingFields = {
    CampaignTitle: Joi.string().required(),
    Category: Joi.string().required(),
    Description: Joi.string().required(),
    GoalAmount: Joi.number().integer().required(),
    RaisedAmount: Joi.number().integer().required(),
    PaymentInformation: Joi.number().integer().required(),
    ContactInformation: Joi.number().integer().required(),
    Location: Joi.string().required(),
    CampaignImage: Joi.string(),
};

const donationFields = {
    ItemName: Joi.string().required(),
    ItemCategory: Joi.string().required(),
    ItemDescription: Joi.string().required(),
    DonorContactInfo: Joi.string().required(),
    ItemLocation: Joi.string().required(),
    ItemImage: Joi.string(),
};

const helpRequestFields = {
    HelpCategory: Joi.string().required(),
    HelpDescription: Joi.string().required(),
    ContactInfo: Joi.string().required(),
    HelpLocation: Joi.string().required(),
    UrgencyLevel: Joi.string().required(),
    SupportingDocument: Joi.string()
};

const registerFields = {
    name: Joi.string().required().messages({'any.required': 'Name is required'}),
    phoneNumber: Joi.number().integer().required().messages({'any.required': 'Phone Number is required'}),
    mBOK: Joi.number().integer().required().messages({'any.required': 'mBOK Account Number is required'}),
    location: Joi.string().required().messages({'any.required': 'Location is required'}),
    password: Joi.string().min(8)
        .max(30)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password cannot exceed 30 characters',
            'any.required': 'Password is required',
        })
}

const loginFields = {
    phoneNumber: Joi.number().integer().required().messages({'any.required': 'Phone Number is required'}),
    password: Joi.string().required().messages({'any.required': 'Password is required'}),
}

const addAnnouncement = (req, res) => addRecord(req, res, 'announcements', announcementFields);
const fetchAnnouncements = (req, res) => fetchRecords(req, res, 'announcements');

const addCrowdfunding = (req, res) => addRecord(req, res, 'crowdfunding_campaigns', crowdfundingFields);
const fetchCrowdfundings = (req, res) => fetchRecords(req, res, 'crowdfunding_campaigns');

const addDonation = (req, res) => addRecord(req, res, 'donations', donationFields);
const fetchDonations = (req, res) => fetchRecords(req, res, 'donations');

const addHelpRequest = (req, res) => addRecord(req, res, 'help_requests', helpRequestFields);
const fetchHelpRequests = (req, res) => fetchRecords(req, res, 'help_requests');

const register = (req, res) => addRecord(req, res, 'users', registerFields);
const login = (req, res) => fetchRecords(req, res, 'users', loginFields);

module.exports = {
    addAnnouncement,
    fetchAnnouncements,
    addCrowdfunding,
    fetchCrowdfundings,
    addDonation,
    fetchDonations,
    addHelpRequest,
    fetchHelpRequests,
    updateCrowdfunding,
    register,
    login,
    isLoggedIn
};