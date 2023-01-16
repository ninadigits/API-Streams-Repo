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

// --------------------------------
// Start Of : API Streams Endpoint
// --------------------------------
function checkEvent(insEvent) {
    const uniqueEvnUuid = [];
    const unique = insEvent.filter(element => {
        const isDuplicate = uniqueEvnUuid.includes(element.event_uuid);
        if (!isDuplicate) {
            uniqueEvnUuid.push(element);
            return true;
        }
        return false;
    });
    return unique;
}

const storeStreams = async(req, res) => {
    const modelMoe = await models.Moengage;
    const mEvents = await models.Events;
    const mLogStreams = await models.LogAttributeStreams;
    let tx;
    try {
        tx = await dbConn.transaction();
        const dataBody = req.body;
        console.log("Data Body >> : ", dataBody);
        // -------------------------------
        // Start Of storing data moengage 
        // -------------------------------
        const insMoe = await modelMoe.create({
            app_name: dataBody.app_name,
            export_doc_id: dataBody.export_doc_id,
            created_at: new Date(),
        }, { tx });
        // ---------------------------------------
        // End Of storing data moengage 
        // ---------------------------------------
        if (insMoe) {
            const bodyEvent = dataBody.events;
            const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefghijklmnopqrstuvwxyz|0123456789';
            const charactersLength = characters.length;
            let maxLength = 80;
            if(bodyEvent.length > 0) {
                let eventID = [];
                for (let n = 0; n < bodyEvent.length; n++) {
                    for (let k = 0; k < maxLength; k++ ) {
                        eventID[n] += characters.charAt(Math.floor(Math.random() * charactersLength));
                    }
                    eventID[n] = eventID[n].replace('undefined','');
                }
                let insEvent = [];
                // ---------------------------------------
                // Start Of : Store Data Events
                // ---------------------------------------
                for (let i = 0; i < bodyEvent.length; i++) {
                    insEvent[i] = await mEvents.create({
                        id: eventID[i],
                        moe_id: insMoe.id,
                        event_type: bodyEvent[i].event_type,
                        event_code: bodyEvent[i].event_code,
                        event_name: bodyEvent[i].event_name,
                        event_source: bodyEvent[i].event_source,
                        event_uuid: bodyEvent[i].event_uuid,
                        event_time: bodyEvent[i].event_time,
                        created_at: insMoe.created_at
                    }, { tx });
                }
                // ---------------------------------------
                // End Of : Store Events
                // ---------------------------------------
                const newArr = [{insMoe}];
                newArr.forEach(object => {
                    object.events = insEvent;
                });
                let dataEvent = checkEvent(insEvent);
                if(dataEvent) {
                    // tx.commit();
                    const eventLength = dataBody.events.length;
                    const dateNow = new Date();
                    const getYearNow = dateNow.getFullYear();
                    const getMonthNow = dateNow.getMonth() + 1;
                    let logUserAttr = [];
                    let logEventAttr = [];
                    let logDeviceAttr = [];
                    for (let j = 0; j < eventLength; j++) {
                        // ---------------------------------------
                        // Start Of : Store User Attributes Events
                        // ---------------------------------------
                        if(bodyEvent[j].user_attributes['id'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'user_attributes',
                                attribute_key: 'id',
                                attribute_value: bodyEvent[j].user_attributes['id'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].user_attributes['mobile_number'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'user_attributes',
                                attribute_key: 'mobile_number',
                                attribute_value: bodyEvent[j].user_attributes['mobile_number'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].user_attributes['moengage_user_id'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'user_attributes',
                                attribute_key: 'moengage_user_id',
                                attribute_value: bodyEvent[j].user_attributes['moengage_user_id'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(dataBody.events[j].user_attributes['email'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: insEvent[j].id,
                                attribute_type: 'user_attributes',
                                attribute_key: 'email',
                                attribute_value: dataBody.events[j].user_attributes['email'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].user_attributes['no_of_conversions'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'user_attributes',
                                attribute_key: 'no_of_conversions',
                                attribute_value: bodyEvent[j].user_attributes['no_of_conversions'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].user_attributes['first_seen'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'user_attributes',
                                attribute_key: 'first_seen',
                                attribute_value: bodyEvent[j].user_attributes['first_seen'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].user_attributes['ltv'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'user_attributes',
                                attribute_key: 'first_seen',
                                attribute_value: bodyEvent[j].user_attributes['ltv'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        logUserAttr[j] = bodyEvent[j].user_attributes;
                        // ---------------------------------------
                        // End Of : Store User Attributes Events
                        // ---------------------------------------

                        // ---------------------------------------
                        // Start Of : Store Event Attributes
                        // ---------------------------------------
                        if(bodyEvent[j].event_attributes['appVersion'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'event_attributes',
                                attribute_key: 'appVersion',
                                attribute_value: bodyEvent[j].event_attributes['appVersion'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].event_attributes['sdkVersion'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'event_attributes',
                                attribute_key: 'sdkVersion',
                                attribute_value: bodyEvent[j].event_attributes['sdkVersion'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].event_attributes['price'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'event_attributes',
                                attribute_key: 'price',
                                attribute_value: bodyEvent[j].event_attributes['price'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].event_attributes['email'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'event_attributes',
                                attribute_key: 'email',
                                attribute_value: bodyEvent[j].event_attributes['email'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].event_attributes['name'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'event_attributes',
                                attribute_key: 'name',
                                attribute_value: bodyEvent[j].event_attributes['name'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].event_attributes['id'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'event_attributes',
                                attribute_key: 'id',
                                attribute_value: bodyEvent[j].event_attributes['id'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].event_attributes['type'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'event_attributes',
                                attribute_key: 'type',
                                attribute_value: bodyEvent[j].event_attributes['type'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        logEventAttr[j] = bodyEvent[j].event_attributes;
                        // ---------------------------------------
                        // End Of : Store Event Attributes 
                        // ---------------------------------------

                        // ---------------------------------------
                        // Start Of : Device Attributes
                        // ---------------------------------------
                        if(bodyEvent[j].device_attributes['product'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'device_attributes',
                                attribute_key: 'product',
                                attribute_value: bodyEvent[j].device_attributes['product'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].device_attributes['product'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'device_attributes',
                                attribute_key: 'os_api_level',
                                attribute_value: bodyEvent[j].device_attributes['os_api_level'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].device_attributes['os_version'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'device_attributes',
                                attribute_key: 'os_version',
                                attribute_value: bodyEvent[j].device_attributes['os_version'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].device_attributes['moengage_device_id'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'device_attributes',
                                attribute_key: 'moengage_device_id',
                                attribute_value: bodyEvent[j].device_attributes['moengage_device_id'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].device_attributes['MODEL'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'device_attributes',
                                attribute_key: 'MODEL',
                                attribute_value: bodyEvent[j].device_attributes['MODEL'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        if(bodyEvent[j].device_attributes['manufacturer'] != "") {
                            await mLogStreams.create({
                                moe_id: insMoe.id,
                                event_id: dataEvent[j].id,
                                attribute_type: 'device_attributes',
                                attribute_key: 'manufacturer',
                                attribute_value: bodyEvent[j].device_attributes['manufacturer'],
                                created_at: insMoe.created_at,
                                entry_year: getYearNow,
                                entry_month: getMonthNow
                            });
                        }
                        logDeviceAttr[j] = bodyEvent[j].device_attributes;
                        // ---------------------------------------
                        // End Of : Device Attributes 
                        // ---------------------------------------
                    }
                    await tx.commit();
                    newArr.forEach(object => {
                        object.user_attributes = logUserAttr;
                        object.event_attributes = logEventAttr;
                        object.device_attributes = logDeviceAttr;
                    });
                    res.status(200).send({
                        status: 200,
                        message: "success",
                        data: newArr
                    });
                } else {
                    if(tx) {
                        await tx.rollback();
                    }
                    res.status(400).send({
                        status: 400,
                        message: error
                    }); 
                }
            } else {
                if(tx) {
                    await tx.rollback();
                }
                res.status(400).send({
                    status: 400,
                    message: error
                }); 
            } 
        } else {
            if(tx) {
                await tx.rollback();
            }
            res.status(400).send({
                status: 400,
                message: error
            }); 
        }
    } catch (error) {
        res.status(400).send({
            status: 400,
            message: error
        }); 
        console.log(error);
    }
}
// --------------------------------
// End Of : API Streams Endpoint
// --------------------------------
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

module.exports = { getAllMoengage, storeStreams };