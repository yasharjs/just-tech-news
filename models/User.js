const {Model, DataTypes} = require('sequelize');
const sequelize = require('../config/connection');
const bcrypt = require('bcrypt');

// create our User model
class User extends Model  {
    // set up method to run on instance data (per user) to check password
    checkPassword(loginPw){
        return bcrypt.compareSync(loginPw, this.password);
    }
}

// define table columns and configs
User.init(
    {
        // id column
        id: {
            type: DataTypes.INTEGER,
            allowNull : false,
            primaryKey: true,
            autoIncrement : true
        },

        // username column
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },

        // email column
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            // no duplicates 
            unique: true,
            validate: {
                isEmail: true
            }
        },

        // password column
        password:{
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
                // must be at least four characters long
                len: [4]
            }
        }
    },
    {
        hooks: {
            async beforeCreate(newUserData){
                newUserData.password = await bcrypt.hash(newUserData.password,10);
                return newUserData;
            },
            
            async beforeUpdate(updatedUserData){
                updatedUserData.password = await bcrypt.hash(updatedUserData.password,10);
                return updatedUserData;
            }
        },
        // TABLE CONFIGURATION OPTIONS GO HERE (https://sequelize.org/v5/manual/models-definition.html#configuration))
        // pass in our imported sequelize connection (the direct connection to our database)
        sequelize,
        // don't automatically create createdAt/updatedAt timestamp fields
        timestamps: false,
        // don't pluralize name of database table
        freezeTableName: true,
        // use underscores instead of camel-casing (i.e. `comment_text` and not `commentText`)
        underscored: true,
        // make it so our model name stays lowercase in the database
        modelName: 'user'
    }
);
module.exports = User;