const Joi = require("joi");


const connection_request_schema = Joi.object({
    from_userid : Joi.number().integer().positive().required().alter({
        send_request : schema => schema.forbidden(),
    }),
    to_userid : Joi.number().integer().positive().required().alter({
        review_request : schema => schema.forbidden(),
    }),
    status : Joi.string().trim().required().alter({
        send_request : schema => schema.valid("interested", "ignored"),
        review_request : schema => schema.valid("accepted", "rejected"),
    })
});

const send_connection_request_schema = connection_request_schema.tailor("send_request");
const review_connection_request_schema = connection_request_schema.tailor("review_request");

const send_connection_request_validation = (req, res, next) => {
    const {error, value} = send_connection_request_schema.validate(req.params);

    if(error){
        return res.status(400).json({error : error.details[0].message});
    }

    req.value = value;

    next();

}

const review_connection_request_validation = (req, res, next) => {
    const {error, value} = review_connection_request_schema.validate(req.params);

    if(error){
        return res.status(400).json({error : error.details[0].message});
    }

    req.value = value;

    next();

}


module.exports = {send_connection_request_validation, review_connection_request_validation};