
const signup_query_string = (validated_data) => {
    const validated_data_keys = Object.keys(validated_data);
    const validated_data_values = Object.values(validated_data);

    let query_values_array = [];

    for(let i = 0; i < validated_data_keys.length; i++){
        query_values_array.push("$" + (i + 1));
    }

    const query_string = `insert into users (${validated_data_keys.join(", ")}) values (${query_values_array.join(", ")}) returning *;`;
    console.log(query_string);

    return {query_string, validated_data_values};
}

const updateProfile_query_string = (validated_data) => {
    const validated_data_keys = Object.keys(validated_data);
    const validated_data_values = Object.values(validated_data);

    let i = 1;

    const query_keys_array = validated_data_keys.map((key) => {
        key = key + " = $" + i;
        i++;
        return key;
    });

    const query_string = `update users set ${query_keys_array.join(", ")} where id = $${i} returning *`;

    return {query_string, validated_data_values};
    
}

module.exports = {signup_query_string, updateProfile_query_string};