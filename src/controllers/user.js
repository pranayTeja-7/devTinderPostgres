const { pool } = require("../config/database");

const get_connections = async (req, res) => {
    try{
        const user = req.user;
        const userid = user.id

        const result = await pool.query(
            `select json_build_object(
                'id', user_connections.id,
                'status', status,
                'user', case 
                    when from_userid = $1 then json_build_object(
                        'id', to_user.id,
                        'first_name', to_user.first_name,
                        'last_name', to_user.last_name,
                        'age', to_user.age,
                        'gender', to_user.gender
                    ) when to_userid = $1 then json_build_object(
                        'id', from_user.id,
                        'first_name', from_user.first_name,
                        'last_name', from_user.last_name,
                        'age', from_user.age,
                        'gender', from_user.gender
                    )
                end,    
                'connected_at', updated_at
            ) as connection
            from user_connections
            join users as from_user
                on from_userid = from_user.id
            join users as to_user
                on to_userid = to_user.id
            where (status = 'accepted' and (from_userid = $1 or to_userid = $1));`,
            [userid]
        );

        const connections = result.rows.map((connection) => {
            return connection.connection;
        })

        res.json({
            message : "connections fetched successfully",
            connections,
        });

    }
    
    catch(err){
        console.log(err);
        res.status(400).json(({error : err.message}));;
    }
}


const get_connection_requests = async (req, res) => {
    
    try{
        const user = req.user;
        const userid = user.id;

        const result = await pool.query(
            `select json_build_object(
                'id', user_connections.id,
                'status', status,
                'user', json_build_object(
                    'id', from_user.id,
                    'first_name', from_user.first_name,
                    'last_name', from_user.last_name,
                    'age', from_user.age,
                    'gender', from_user.gender
                )
            ) as connection_request
            from user_connections
            join users as from_user
                on from_userid = from_user.id
            where to_userid = $1 and status = 'interested';`,

            [userid]
        );


        // console.log(result.rows);
        const connection_requests = result.rows.map((request) => {
            return request.connection_request;
        })

        res.json({
            message: "connection request fetched successfully",
            connection_requests,
        })
    }
    catch(err){
        console.log(err);
        res.status(400).json({error: err.message});
    }


}


const user_feed = async (req, res) => {
    try{
        const user = req.user;
        const userid = user.id;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = (limit > 50) ? 50 : limit;

        const skip = (page-1) * limit;


        const connections = await pool.query(
            `select case
                when from_userid = $1 then to_userid
                when to_userid = $1 then from_userid
            end as userid    
            from user_connections
            where (
                (from_userid = $1 or to_userid = $1) and 
                (
                    (status = 'rejected') or 
                    (status = 'ignored') or 
                    (status = 'accepted') or 
                    (
                        (status = 'interested') and (from_userid = $1)
                    )
                )
                
            );`,
            [userid] 
        )

        const hidden_users_ids =  connections.rows.map(connection => connection.userid);
        // console.log(hidden_users_ids);

        hidden_users_ids.push(user.id);

        const result = await pool.query(
            `select id, first_name, last_name, age, gender, about
            from users
            where id != all($1)
            order by id
            limit $2
            offset $3`,
            [hidden_users_ids, limit, skip]
        )
        
        const feed = result.rows;
        res.json({
            message: "feed fetched succesfully",
            feed,
        });
    }
    catch(err){
        console.log(err);
        res.json({error: err.message});
    }
}

module.exports = {get_connections, get_connection_requests, user_feed};