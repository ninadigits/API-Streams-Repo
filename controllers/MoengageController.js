require('dotenv').config();
const express = require('express');
const models = require('../models');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const dbConn = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: 3306,
    logging: false,
    dialectOptions: {
      requestTimeout: 30000,
      encrypt: true
    }
})

const getAllMoengage = async(req, res) => {
    const resMoengage = await models.Moengage.findAll({});
    const mEvents = await models.Events.findAll({});
    if (resMoengage.length > 0) {
        res.status(200).send({
            status: 200,
            message: "Success to fetch moengage events",
            data: resMoengage,
            dataEvents: mEvents
        });
    } else {
        res.status(404).send({
            status: 404,
            message: "Data Not Found"
        });
    }
}

const storeStreams = async(req, res) => {
    const modelMoe = await models.Moengage;
    const mEvents = await models.Events;
    const mLogStreams = await models.LogAttributeStreams;
    const tx = await dbConn.transaction();
    try {
        const { app_name, export_doc_id, event } = req.body;
        // -------------------------------
        // Start Of storing data moengage 
        // -------------------------------
        const insMoe = await modelMoe.create({
            app_name: req.body.app_name,
            export_doc_id: req.body.export_doc_id,
            created_at: new Date(),
        }, { transaction : tx });
        if (insMoe) {
            // ----------------------------
            // Start Of storing data events
            // ----------------------------
            let eventObj = req.body.event;
            const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefghijklmnopqrstuvwxyz|0123456789';
            const charactersLength = characters.length;
            let maxLength = 80;
            let eventID = '';
            for (let i = 0; i < maxLength; i++ ) {
                eventID += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            const eventIns = await mEvents.create({
                id : eventID,
                moe_id: insMoe.id,
                uid: eventObj['uid'],
                event_type: eventObj['event_type'],
                event_code: eventObj['event_code'],
                event_name: eventObj['event_name'],
                event_source: eventObj['event_source'],
                event_uuid: eventObj['event_uuid'],
                event_time: eventObj['event_time'],
                created_at: insMoe.created_at
            }, { transaction : tx });
            if(eventIns) {
                tx.commit();
                const newArr = [{insMoe}];
                newArr.forEach(object => {
                    object.event = eventIns;
                });
                // ------------------------------
                // Start Of : User Attribute Insert
                // ------------------------------
                const bodyUserAttr = req.body.event.user_attributes;
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'no_of_conversions',
                    attribute_value: bodyUserAttr['no_of_conversions'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({ 
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'first_seen',
                    attribute_value: bodyUserAttr['first_seen'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'last_known_city',
                    attribute_value: bodyUserAttr['last_known_city'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'last_seen',
                    attribute_value: bodyUserAttr['last_seen'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'moengage_user_id',
                    attribute_value: bodyUserAttr['moengage_user_id'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'ltv',
                    attribute_value: bodyUserAttr['ltv'],
                    created_at: insMoe.created_at
                });
                // ------------------------------
                // End Of : User Attribute Insert
                // ------------------------------

                // ------------------------------
                // Start Of : Event Attribute Insert
                // ------------------------------
                const bodyEventAttr = req.body.event.event_attributes;
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'event_attributes',
                    attribute_key: 'appVersion',
                    attribute_value: bodyEventAttr['appVersion'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'event_attributes',
                    attribute_key: 'language',
                    attribute_value: bodyEventAttr['language'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'event_attributes',
                    attribute_key: 'sdkVersion',
                    attribute_value: bodyEventAttr['sdkVersion'],
                    created_at: insMoe.created_at
                });
                // ------------------------------
                // End Of : Event Attribute Insert
                // ------------------------------

                // ------------------------------
                // Start Of : Device Attribute Insert
                // ------------------------------
                const bodyDeviceAttr = req.body.event.device_attributes;
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'product',
                    attribute_value: bodyDeviceAttr['product'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'os_api_level',
                    attribute_value: bodyDeviceAttr['os_api_level'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'os_version',
                    attribute_value: bodyDeviceAttr['os_version'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'moengage_device_id',
                    attribute_value: bodyDeviceAttr['moengage_device_id'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'MODEL',
                    attribute_value: bodyDeviceAttr['MODEL'],
                    created_at: insMoe.created_at
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'manufacturer',
                    attribute_value: bodyDeviceAttr['manufacturer'],
                    created_at: insMoe.created_at
                });
                // ------------------------------
                // End Of : Device Attribute Insert
                // ------------------------------
                const logDataStreams = await mLogStreams.findAll({
                    where: {
                        moe_id: insMoe.id,
                        event_id: eventIns.id
                    },
                    order: [
                        ['created_at', 'ASC']
                    ]
                })
                newArr.forEach(object => {
                    object.logStreams = logDataStreams;
                });
                res.status(200).send({
                    status: 200,
                    message: "Success to store moengage events",
                    data: newArr
                });
            } else {
                tx.rollback();
                res.status(400).send({
                    status: 400,
                    message: 'Error Code'
                });
            }
        }
    } catch (error) {
        tx.rollback();
        res.status(400).send({
            status: 400,
            message: error
        });
        console.log(error);
    }
}
// -------------------
// END
// -------------------

module.exports = { getAllMoengage, storeStreams };