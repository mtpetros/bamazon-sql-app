var mysql = require("mysql");
require("console.table");
var inquirer = require("inquirer");



var bamazon = {
    connection: mysql.createConnection({
        host: "localhost",
        port: 3306,

        // Your username
        user: "root",

        // Your password
        password: "root",
        database: "Bamazon"
    }),

    menu: function() {
        inquirer.prompt([
            {
                type: 'list',
                name: 'menu',
                message: 'Please choose one of the following options:',
                choices: ['View Product Sales by Department', 'Create New Department', 'Exit']
            }
            ]).then((user) => {
                switch(user.menu) {
                    case 'View Product Sales by Department':
                        this.salesByDepartment();
                        break;
                    case 'Create New Department':
                        this.createDepartment();
                        break;
                    case 'Exit':
                        process.exit(0);
                        break;
                    default:
                        console.log("Invalid Choice!");
                    }
            });
    },

    salesByDepartment: function() {
        this.connection.query("SELECT * FROM department_table" , (err, res) => {
            if (err) throw err;
            console.table(res);
            console.log(" ");
            this.menu();
        });
    },

    createDepartment: function() {
        inquirer.prompt([
            {
                type: 'input',
                name: 'newDepartment',
                message: "Enter a new department name:"
            }
            ]).then((user) => {
                this.connection.query("INSERT INTO departments SET ?", {department_name: user.newDepartment}, (err, res) => {
                    console.log(user.newDepartment + " added!");
                    console.log(" ");
                    this.menu();
                });
            });
    }
};

bamazon.menu();