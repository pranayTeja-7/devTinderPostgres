const { Result } = require("pg");
const {pool} = require("../config/database");

const send_connection_request = async (req, res) => {
    try{
        const from_user = req.user;
        const validated_data = req.value
        const from_userid = from_user.id;
        const {status, to_userid} = validated_data;

        if(from_userid == to_userid){
            return res.status(400).json({message: "cannot send request to self"})
        }
        const to_user_result = await pool.query("select * from users where id = $1", [to_userid]);
        const to_user = to_user_result.rows[0];

        // console.log(to_userid, typeof(to_userid));
        // console.log(to_user_result);

        if(!to_user){
            return res.status(400).json({message : "to-user does not exist"});
        }

        const existing_connection_request_result = await pool.query(
            `select json_build_object(
                'id', user_connections.id,
                'status', status,
                'from_user', json_build_object(
                    'id', from_user.id,
                    'first_name', from_user.first_name,
                    'last_name', from_user.last_name
                ),
                'to_user', json_build_object(
                    'id', to_user.id,
                    'first_name', to_user.first_name,
                    'last_name', to_user.last_name
                )
            ) as connection_request
            from user_connections 
            join users as from_user 
                on from_userid = from_user.id
            join users as to_user
                on to_userid = to_user.id
            where (
                (from_userid = $1 and to_userid = $2) or
                (from_userid = $2 and to_userid = $1)
            );`,
            [from_user.id, to_userid]
        );

        const existing_connection_request = existing_connection_request_result.rows[0]?.connection_request;

        if(existing_connection_request){
            if(existing_connection_request.status === "interested" && status == "interested" && from_userid == existing_connection_request.to_user.id){
                await pool.query(
                    `update user_connections set status = $1, updated_at = now() where (from_userid = $2 and to_userid = $3)`,
                    ["accepted", to_userid, from_userid]
                )

                existing_connection_request.status = "accepted";
                return res.json({
                    message: `${to_user.first_name} ${to_user.last_name} is also interested in you. Connection request accepted`,
                    connection: existing_connection_request
                })
            }

            if(existing_connection_request.status === "interested" && status == "interested" && from_user.id == existing_connection_request.from_user.id){
                return res.status(409).json({message: "you already sent a connection request to this user"})
            }

            if(existing_connection_request.status === "interested" && status == "ignored" && from_user.id == existing_connection_request.to_user.id){
                const connection_request_result = await pool.query(
                    `update user_connections set status = $1 where, updated_at = now() (from_userid = $2 and to_userid = $3)`,
                    ["rejected", to_userid, from_userid]
                )

                existing_connection_request.status = "rejected";
                return res.json({
                    message: `${to_user.first_name} ${to_user.last_name} was interested in you. Connection request rejected`,
                    connection: existing_connection_request
                })
            }

            if(existing_connection_request.status === "interested" && status == "ignored" && from_userid == existing_connection_request.from_user.id){
                return res.status(409).json({message: "you already sent an 'interested' request to this user"});
            }
            

            if(((existing_connection_request.status === "ignored") || (existing_connection_request.status === "rejected")) && from_userid === existing_connection_request.to_user.id){
                return res.status(409).json({message: "you cannot send a connection request to this user"});
            }

            if(((existing_connection_request.status === "ignored") || (existing_connection_request.status === "rejected")) && from_userid === existing_connection_request.from_user.id){
                return res.status(409).json({message: `you have already ${existing_connection_request.status} this profile`});
            }

    
            if(existing_connection_request.status === "accepted"){
                return res.status(409).json({message: "you are already connected with this user"});
            }

        }

        const result = await pool.query(
            `with new_connection as (
                    insert into user_connections 
                    (from_userid, to_userid, status)
                    values ($1, $2, $3)
                    returning *
                )
                select json_build_object(
                    'id', new_connection.id,
                    'status', new_connection.status,
                    'from_user', json_build_object(
                        'id', from_user.id,
                        'first_name', from_user.first_name,
                        'last_name', from_user.last_name
                    ),
                    'to_user', json_build_object(
                        'id', to_user.id,
                        'first_name', to_user.first_name,
                        'last_name', to_user.last_name
                    )
                ) as connection_request
                from new_connection    
                join users as from_user
                    on new_connection.from_userid = from_user.id
                join users as to_user
                    on new_connection.to_userid = to_user.id;`,
            [from_user.id, to_userid, status]
        );

        const connection_request = result.rows[0].connection_request;

        // console.log(connection_request);

        res.json({
            message: "connection request sent successfully",
            connection_request,
        });
        
    }
    catch(err){
        console.log(err)
        res.status(400).json({error: err.message});
    }
}


const review_connection_request = async (req, res) => {
    try{
        const to_user = req.user;
        const to_userid = to_user.id;
        const validated_data = req.value;
        const {from_userid, status} = validated_data;
        const existing_connection_request_result = await pool.query(
            `select json_build_object(
                'id', user_connections.id,
                'status', status,
                'from_user', json_build_object(
                    'id', from_user.id,
                    'first_name', from_user.first_name,
                    'last_name', from_user.last_name
                ),
                'to_user', json_build_object(
                    'id', to_user.id,
                    'first_name', to_user.first_name,
                    'last_name', to_user.last_name
                )
            ) as existing_connection
            from user_connections
            join users as from_user
                on from_userid = from_user.id
            join users as to_user
                on to_userid = to_user.id
            where (from_userid = $1 and to_userid = $2 and status = 'interested');`,
            [from_userid, to_userid]
        );
        // console.log(existing_connection_request_result);
        const existing_connection = existing_connection_request_result.rows[0]?.existing_connection;


        if(!existing_connection){
            return res.status(400).json({message: "Request is not available for review"});
        }

        const result = await pool.query(
            `update user_connections
            set status = $1, updated_at = now()
            where (from_userid = $2 and to_userid = $3 and status = 'interested') returning * `,
            [status, from_userid, to_userid]
        )

        if(result.rows.length === 0){
            return res.status(400).json({message: "Request is not available for review"});
        }

        existing_connection.status = status;
        res.json({
            message: `you have ${status} this request`,
            connection : existing_connection,
        })
    }
    catch(err){
        console.log(err)
        res.status(400).json({error: err.message});        
    }

}




module.exports = {send_connection_request, review_connection_request};