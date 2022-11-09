require('dotenv').config();
const express = require('express');
const { QueryTypes, json } = require('sequelize');
const { Sequelize } = require('../models');
const models = require('../models');
const { Op } = require("sequelize");
const mysql = require('mysql');
var bodyParser = require('body-parser')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
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
    const mEventAttr = await models.EventAttribute.findAll({});
    if (resMoengage.length > 0) {
        res.status(200).send({
            status: 200,
            message: "Success to fetch moengage events",
            data: resMoengage,
            dataEvents: mEvents,
            dataEventAttr: mEventAttr
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
    const mEventAttr = await models.EventAttribute;
    const mUserAttr = await models.UserAttribute;
    const mDeviceAttr = await models.DeviceAttribute;
    const mLogStreams = await models.LogAttributeStreams;
    const tx = await sequelize.transaction();
    try {
        const { appName, source, moeReqID, events } = req.body;
        let eventObj = req.body.events;
        // -------------------------------------
        // Start Of storing of moengage campaign 
        // -------------------------------------
        const insMoe = await modelMoe.create({
            app_name: req.body.appName,
            source: req.body.source,
            moe_req_id: req.body.moeReqID,
            created_at: new Date(),
        }, { transaction : tx });
        if (insMoe) {
            // -------------------------------------------------------
            // Start Of storing every each events of moengage campaign 
            // --------------------------------------------------------
            let eventLength = eventObj.length;
            for (let i = 0; i < eventLength; i++) {
                await mEvents.create({
                    moe_req_id: insMoe['moe_req_id'],
                    event_code: eventObj[i]['event_code'],
                    event_name: eventObj[i]['event_name'],
                    event_time: eventObj[i]['event_time'],
                    event_type: eventObj[i]['event_type'],
                    event_source: eventObj[i]['event_source'],
                    push_id: eventObj[i]['push_id'],
                    uid: eventObj[i]['uid'],
                    campaign_id: eventObj[i]['campaign_id'],
                    created_at: insMoe['created_at']
                }, { transaction : tx });
            }
            tx.commit();
            let recordOfEvent = [];
            const queryEvent = await models.Events.findAll({
                where: {
                    moe_req_id: insMoe.moe_req_id
                },
                order: [
                    ['event_uuid', 'ASC']
                ],
            }).then(function (record) {
                if(record.length > 0) {
                    for (let a = 0; a < record.length; a++) {
                        recordOfEvent[a] = record[a];
                    }
                    dataEvents = record;
                    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-0123456789';
                    const charactersLength = characters.length;
                    let maxLength = 25;
                    let arrIdEvnAttr = [];
                    let arrIdUsrAttr = [];
                    let arrIdDvcAttr = [];
                    for (let n = 0; n < eventLength; n++) {
                        for (let k = 0; k < maxLength; k++ ) {
                            arrIdEvnAttr[n] += characters.charAt(Math.floor(Math.random() * charactersLength));
                            arrIdUsrAttr[n] += characters.charAt(Math.floor(Math.random() * charactersLength));
                            arrIdDvcAttr[n] += characters.charAt(Math.floor(Math.random() * charactersLength));
                        }
                    }
                    for (let x = 0; x < arrIdEvnAttr.length; x++) {
                        arrIdEvnAttr[x] = {
                            'event_attr_id_insert': arrIdEvnAttr[x].replace('undefined','code'),
                        };
                        arrIdUsrAttr[x] = {
                            'user_attr_id_insert': arrIdUsrAttr[x].replace('undefined','code'),
                        };
                        arrIdDvcAttr[x] = {
                            'device_attr_id_insert': arrIdDvcAttr[x].replace('undefined','code'),
                        };
                    }
                    // -------------------------------------
                    // Start Of : Store every each attribute of events
                    // -------------------------------------
                    for (let j = 0; j < eventLength; j++) {
                        if(eventObj[j].event_attributes.length != 0) {
                            mEventAttr.create({
                                id: arrIdEvnAttr[j]['event_attr_id_insert'],
                                campaign_id: dataEvents[j]['campaign_id'],
                                event_uuid: dataEvents[j]['event_uuid'],
                                campaign_name: eventObj[j]['event_attributes']['campaign_name'],
                                campaign_type: eventObj[j]['event_attributes']['campaign_type'],
                                campaign_channel: eventObj[j]['event_attributes']['campaign_channel'],
                                created_at: insMoe['created_at'],
                            });
                        }

                        if(eventObj[j]['user_attributes'].length != 0) {
                            mUserAttr.create({
                                id: arrIdUsrAttr[j]['user_attr_id_insert'],
                                uid: dataEvents[j]['uid'],
                                event_uuid: dataEvents[j]['event_uuid'],
                                name: eventObj[j]['user_attributes']['name'],
                                email: eventObj[j]['user_attributes']['email'],
                                phone: eventObj[j]['event_attributes']['phone'],
                                created_at: insMoe['created_at'],
                            });
                        }

                        if(eventObj[j]['device_attributes'].length != 0) {
                            mDeviceAttr.create({
                                id: arrIdDvcAttr[j]['device_attr_id_insert'],
                                push_id: dataEvents[j]['push_id'],
                                event_uuid: dataEvents[j]['event_uuid'],
                                device_id: eventObj[j]['device_attributes']['device_id'],
                                device_name: eventObj[j]['device_attributes']['device_name'],
                                created_at: insMoe['created_at'],
                            });
                        }   
                        // -----------------------------
                        // Start Of Store In Log Streams
                        // -----------------------------
                        mLogStreams.create({
                            moe_id: insMoe.id,
                            event_uuid: dataEvents[j].event_uuid,
                            attribute_type: 'event_attributes',
                            attribite_key: 'campaign_id',
                            attribute_value: dataEvents[j]['event_uuid'],
                            created_at: insMoe['created_at']
                        });
                        mLogStreams.create({
                            moe_id: insMoe.id,
                            event_uuid: dataEvents[j].event_uuid,
                            attribute_type: 'event_attributes',
                            attribite_key: 'campaign_name',
                            attribute_value: eventObj[j]['event_attributes']['campaign_name'],
                            created_at: insMoe['created_at']
                        });
                        mLogStreams.create({
                            moe_id: insMoe.id,
                            event_uuid: dataEvents[j].event_uuid,
                            attribute_type: 'event_attributes',
                            attribite_key: 'campaign_type',
                            attribute_value: eventObj[j]['event_attributes']['campaign_type'],
                            created_at: insMoe['created_at']
                        });
                        mLogStreams.create({
                            moe_id: insMoe.id,
                            event_uuid: dataEvents[j].event_uuid,
                            attribute_type: 'event_attributes',
                            attribite_key: 'email',
                            attribute_value: eventObj[j]['user_attributes']['email'],
                            created_at: insMoe['created_at']
                        }).then(function (logStreams) {
                            // ----------
                            // User Attr
                            // ----------
                            mLogStreams.create({
                                moe_id: insMoe.id,
                                event_uuid: dataEvents[j].event_uuid,
                                attribute_type: 'user_attributes',
                                attribite_key: 'uid',
                                attribute_value: dataEvents[j]['uid'],
                                created_at: insMoe['created_at']
                            });
                            mLogStreams.create({
                                moe_id: insMoe.id,
                                event_uuid: dataEvents[j].event_uuid,
                                attribute_type: 'user_attributes',
                                attribite_key: 'campaign_id',
                                attribute_value: dataEvents[j]['campaign_id'],
                                created_at: insMoe['created_at']
                            });
                            mLogStreams.create({
                                moe_id: insMoe.id,
                                event_uuid: dataEvents[j].event_uuid,
                                attribute_type: 'user_attributes',
                                attribite_key: 'name',
                                attribute_value: eventObj[j]['user_attributes']['name'],
                                created_at: insMoe['created_at']
                            });
                            mLogStreams.create({
                                moe_id: insMoe.id,
                                event_uuid: dataEvents[j].event_uuid,
                                attribute_type: 'user_attributes',
                                attribite_key: 'email',
                                attribute_value: eventObj[j]['user_attributes']['email'],
                                created_at: insMoe['created_at']
                            });
                            mLogStreams.create({
                                moe_id: insMoe.id,
                                event_uuid: dataEvents[j].event_uuid,
                                attribute_type: 'user_attributes',
                                attribite_key: 'phone',
                                attribute_value: eventObj[j]['user_attributes']['phone'],
                                created_at: insMoe['created_at']
                            });
                            // ----------------------------------------
                            // Device Attribute
                            // -------------------------------------
                            mLogStreams.create({
                                moe_id: insMoe.id,
                                event_uuid: dataEvents[j].event_uuid,
                                attribute_type: 'device_attributes',
                                attribite_key: 'push_id',
                                attribute_value: dataEvents[j]['push_id'],
                                created_at: insMoe['created_at']
                            });
                            mLogStreams.create({
                                moe_id: insMoe.id,
                                event_uuid: dataEvents[j].event_uuid,
                                attribute_type: 'device_attributes',
                                attribite_key: 'device_id',
                                attribute_value: eventObj[j]['device_attributes']['device_id'],
                                created_at: insMoe['created_at']
                            });
                            mLogStreams.create({
                                moe_id: insMoe.id,
                                event_uuid: dataEvents[j].event_uuid,
                                attribute_type: 'device_attributes',
                                attribite_key: 'device_name',
                                attribute_value: eventObj[j]['device_attributes']['device_name'],
                                created_at: insMoe['created_at']
                            });
                            // -----------------------------
                            // End Of Store In Log Streams
                            // -----------------------------
                        });
                        // -----------------------------
                        // End Of Store In Log Streams
                        // -----------------------------
                    }
                    res.status(200).send({
                        message: "Success to store moengage events",
                        moeInsert: insMoe,
                        evnInsert: recordOfEvent,
                        event_attribute_id: arrIdEvnAttr, 
                        user_attribute_id: arrIdUsrAttr, 
                        device_attribute_id: arrIdDvcAttr
                    });
                } else {
                    tx.rollback();
                    res.status(400).send({
                        status: 400,
                        message: "Failed to fetch event"
                    });
                }
            });
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

// for (let k = 0; k < dataEvents.length; k++) {
//     const arrEventAttr = models.EventAttribute.findAll({
//         where: {
//             event_id: dataEvents[k]['event_id'],
//         },
//         order: [
//             ['id', 'ASC']
//         ]
//     }).then(function (arrEventAttr) {
//         if(arrEventAttr) {
//             const arrUserAttr = models.UserAttribute.findAll({
//                 where: {
//                     event_id: dataEvents[k]['event_id'],
//                 },
//                 order: [
//                     ['id', 'ASC']
//                 ]
//             }).then(function (arrUserAttr) {
//                 if(arrUserAttr) {
//                     const arrDeviceAttr = models.DeviceAttribute.findAll({
//                         where: {
//                             event_id: dataEvents[k]['event_id'],
//                         },
//                         order: [
//                             ['id', 'ASC']
//                         ]
//                     }).then(function (arrDeviceAttr) {
//                         if(arrDeviceAttr) {
//                             res.status(200).send({
//                                 status: 200,
//                                 message: "Success to store moengage events",
//                                 moeInsert: insMoe,
//                                 evnInsert: dataEvents,
//                                 evnAttrInsert: arrEventAttr,
//                                 userAttrInsert: arrUserAttr,
//                                 deviceAttrInsert: arrDeviceAttr,
//                             });
//                         } else {
//                             tx.rollback();
//                             res.status(400).send({
//                                 status: 400,
//                                 message: "Failed to fetch device attribute"
//                             });
//                         }
//                     });
//                 } 
//             })
//         } 
//     })
// }

// const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// const maxLength = 25;
// const charactersLength = characters.length;
// let ranCharEAttr = '';
// let ranChar = '';
// for ( let i = 0; i < maxLength; i++ ) {
//     ranCharEAttr += characters.charAt(Math.floor(Math.random() * charactersLength));
//     ranChar += characters.charAt(Math.floor(Math.random() * charactersLength));
// }

// ------------------
// -----------------
// let insCntEv = 0;
// let arrEvent = [];
// yourArray.forEach(function (arrayItem) {
//     var x = arrayItem.prop1 + 2;
//     console.log(x);
// });
// eventObj.forEach(element => {
//     arrEvent[element] = mEvents.create({
//         moe_req_id: req.body.moeReqID,
//         event_code: element['event_code'],
//         event_name: element['event_name'],
//         event_time: element['event_time'],
//         event_type: element['event_type'],
//         event_source: element['event_source'],
//         push_id: element['push_id'],
//         uid: element['uid'],
//         campaign_id: element['campaign_id'],
//         created_at: new Date(),
//     })
//     insEvInc++;
// });
// -------------------
// END
// -------------------

module.exports = { getAllMoengage, storeStreams};