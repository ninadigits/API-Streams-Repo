require('dotenv').config();
const express = require('express');
const models = require('../models');
const Sequelize = require('sequelize');
const { Op } = require("sequelize");
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

// --------------------------
// Start Of : Data cube scheduler 
// --------------------------
const deviceCountStart = require('node-cron');
deviceCountStart.schedule('00 00 * * *', () => {
    console.log('running a task every day 00:00');
    deviceCountFunc();
}, null, true, 'Asia/Jakarta');

const deviceCountFunc = async(req, res) => {
    const deviceType = 'manufacturer';
    const now = new Date();
    const getYearNow = now.getFullYear();
    const getMonthNow = now.getMonth() + 1;
    const tx = await dbConn.transaction();
    const dataLogStreams = await models.LogAttributeStreams.findAll({
        where: {
            [Op.and]: [
                { attribute_key: deviceType },
                { entry_year: getYearNow },
                { entry_month: getMonthNow }
            ]
        },
    });
    if(dataLogStreams.length > 0) {
        try {
            const logLength = dataLogStreams.length;
            let deviceArr = [];
            for (let i = 0; i < logLength; i++) {
                deviceArr[i] = {
                    'device_name' : dataLogStreams[i]['attribute_value'],
                    'date_updated' : dataLogStreams[i]['created_at'],
                    'entry_year' : dataLogStreams[i]['entry_year'],
                    'entry_month' : dataLogStreams[i]['entry_month'],
                    'device_count' : 0
                };
            }
            // ---------------------------------------------------------
            // Parsing to unique value from array objects = device_name
            // ---------------------------------------------------------
            const newArr = newArrDeviceCount(deviceArr);
            let response = [];
            for (let j = 0; j < newArr.length; j++) {
                for (let k = 0; k < deviceArr.length; k++) {
                    if(newArr[j]['device_name'] == deviceArr[k]['device_name']) {
                        response[j] = {
                            'device_name': newArr[j]['device_name'],
                            'entry_year' : newArr[j]['entry_year'],
                            'entry_month' : newArr[j]['entry_month'],
                            'device_count': newArr[j]['device_count']+=1
                        };
                    } 
                }
            }
            // console.log("Test Spam >> : ", JSON.parse(JSON.stringify(response)));
            const ModelDeviceCount = await models.DeviceCountEvent;
            const checkIfEmpty = await models.DeviceCountEvent.findAll({
                where: {
                    [Op.and]: [
                        { entry_year: getYearNow },
                        { entry_month: getMonthNow },
                    ]
                },
            });
            if(checkIfEmpty.length > 0) {
                // console.log("Update > : ", response);
                const delOldData = await ModelDeviceCount.destroy({
                    where: {
                        [Op.and]: [
                            { entry_year: getYearNow },
                            { entry_month: getMonthNow },
                        ]
                    },
                }, { transaction : tx }); 
                for (let n = 0; n < response.length; n++) {
                    const dataUpdateIns = await ModelDeviceCount.create({
                        device_name: response[n]['device_name'],
                        device_count: response[n]['device_count'],
                        entry_year: response[n]['entry_year'],
                        entry_month: response[n]['entry_month'],
                        last_update: new Date()
                    }, { transaction : tx });
                }
                tx.commit();
                console.log("Response arr >> : ", JSON.parse(JSON.stringify(response)));
                console.log("Updated Data");              
            } else {
                for (let n = 0; n < response.length; n++) {
                    const dataIns = await ModelDeviceCount.create({
                        device_name: response[n]['device_name'],
                        device_count: response[n]['device_count'],
                        entry_year: response[n]['entry_year'],
                        entry_month: response[n]['entry_month'],
                        last_update: new Date()
                    }, { transaction : tx });
                }
                tx.commit();
                console.log(JSON.parse(JSON.stringify(response)));
                console.log("Insert Data");
            }
        } catch (error) {
            tx.rollback();
            console.log(error);
        } 
    } else {
        tx.rollback();
        console.log("Data Not Found");
    }
}

function newArrDeviceCount(deviceArr) {
    const uniqueDevice = [];
    const unique = deviceArr.filter(element => {
        const isDuplicate = uniqueDevice.includes(element.device_name);
        if (!isDuplicate) {
            uniqueDevice.push(element.device_name, element.date_updated, element.entry_year, element.entry_month, element.device_count);
            return true;
        }
        return false;
    });
    return unique;
}
// --------------------------
// End Of : Data cube scheduler
// --------------------------

const storeStreams = async(req, res) => {
    const modelMoe = await models.Moengage;
    const mEvents = await models.Events;
    const mLogStreams = await models.LogAttributeStreams;
    const tx = await dbConn.transaction();
    try {
        const { app_name, export_doc_id, event } = req.body;
        // const dataBody = req.body;
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
            let eventTypeVal = "";
            if(eventObj['event_type'] == null || 
                eventObj['event_type'] == "") {
                eventTypeVal = "NULL";
            } else {
                eventTypeVal = eventObj['event_type'];
            }
            const dateNow = new Date();
            const getYearNow = dateNow.getFullYear();
            const getMonthNow = dateNow.getMonth() + 1;
            const eventIns = await mEvents.create({
                id : eventID,
                moe_id: insMoe.id,
                event_type: eventTypeVal,
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
                const isEmpty = eventObj['uid'];
                if(isEmpty == null || isEmpty == "") {
                    await mLogStreams.create({
                        moe_id: insMoe.id,
                        event_id: eventIns.id,
                        attribute_type: 'user_attributes',
                        attribute_key: 'uid',
                        attribute_value: eventObj['uid'],
                        created_at: insMoe.created_at,
                        entry_year: getYearNow,
                        entry_month: getMonthNow
                    });
                }
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'no_of_conversions',
                    attribute_value: bodyUserAttr['no_of_conversions'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({ 
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'first_seen',
                    attribute_value: bodyUserAttr['first_seen'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'last_known_city',
                    attribute_value: bodyUserAttr['last_known_city'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'last_seen',
                    attribute_value: bodyUserAttr['last_seen'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'moengage_user_id',
                    attribute_value: bodyUserAttr['moengage_user_id'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'user_attributes',
                    attribute_key: 'ltv',
                    attribute_value: bodyUserAttr['ltv'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                // ------------------------------
                // End Of : User Attribute Insert
                // ------------------------------

                // ------------------------------
                // Start Of : Event Attribute Insert
                // ------------------------------
                const bodyEventAttr = req.body.event.event_attributes;
                if(isEmpty == null || isEmpty == "") {
                    await mLogStreams.create({
                        moe_id: insMoe.id,
                        event_id: eventIns.id,
                        attribute_type: 'event_attributes',
                        attribute_key: 'uid',
                        attribute_value: eventObj['uid'],
                        created_at: insMoe.created_at,
                        entry_year: getYearNow,
                        entry_month: getMonthNow
                    });
                }
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'event_attributes',
                    attribute_key: 'appVersion',
                    attribute_value: bodyEventAttr['appVersion'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'event_attributes',
                    attribute_key: 'language',
                    attribute_value: bodyEventAttr['language'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'event_attributes',
                    attribute_key: 'sdkVersion',
                    attribute_value: bodyEventAttr['sdkVersion'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                // ------------------------------
                // End Of : Event Attribute Insert
                // ------------------------------

                // ------------------------------
                // Start Of : Device Attribute Insert
                // ------------------------------
                const bodyDeviceAttr = req.body.event.device_attributes;
                if(isEmpty == null || isEmpty == "") {
                    await mLogStreams.create({
                        moe_id: insMoe.id,
                        event_id: eventIns.id,
                        attribute_type: 'device_attributes',
                        attribute_key: 'uid',
                        attribute_value: eventObj['uid'],
                        created_at: insMoe.created_at,
                        entry_year: getYearNow,
                        entry_month: getMonthNow
                    });
                }
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'product',
                    attribute_value: bodyDeviceAttr['product'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'os_api_level',
                    attribute_value: bodyDeviceAttr['os_api_level'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'os_version',
                    attribute_value: bodyDeviceAttr['os_version'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'moengage_device_id',
                    attribute_value: bodyDeviceAttr['moengage_device_id'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'MODEL',
                    attribute_value: bodyDeviceAttr['MODEL'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
                });
                await mLogStreams.create({
                    moe_id: insMoe.id,
                    event_id: eventIns.id,
                    attribute_type: 'device_attributes',
                    attribute_key: 'manufacturer',
                    attribute_value: bodyDeviceAttr['manufacturer'],
                    created_at: insMoe.created_at,
                    entry_year: getYearNow,
                    entry_month: getMonthNow
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
                // console.log(newArr);
            } else {
                tx.rollback();
                res.status(400).send({
                    status: 400,
                    message: 'Error Code'
                });
            }
        }
        // -------------------------------
        // End Of storing data moengage 
        // -------------------------------
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
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

module.exports = { getAllMoengage, storeStreams };