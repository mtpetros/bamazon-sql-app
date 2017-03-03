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
                choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit']
            }
            ]).then((user) => {
                switch(user.menu) {
                    case 'View Products for Sale':
                        this.displayData();
                        break;
                    case 'View Low Inventory':
                        this.lowInventory();
                        break;
                    case 'Add to Inventory':
                        this.addInventory();
                        break;
                    case 'Add New Product':
                        this.addNewProduct();
                        break;
                    case 'Exit':
                        process.exit(0);
                        break;
                    default:
                        console.log("Invalid Choice!");
                }
            });
    },

    beginning: function() {
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'beginning',
                message: 'Return to main menu?'
            }
            ]).then((user) => {
                if (user.beginning) {
                    this.menu(); 
                } else {
                    console.log("You don't really have much of a choice...")
                    this.beginning();
                }
            });
    },

    displayData: function(prompt) {
        this.connection.query("SELECT * FROM products" , (err, res) => {
            if (err) throw err;
            console.table(res);
            this.beginning();
        });
    },

    lowInventory: function() {
        this.connection.query("SELECT * FROM products WHERE stock_quantity < 5", (err, res) => {
            if (err) throw err;
            console.table(res);
            this.beginning();
        });
    },

    addInventory: function() {
        this.connection.query("SELECT * FROM products" , (err, res) => {
            if (err) throw err;
            var productArr = [];
            for (key in res) {
                productArr.push(res[key].product_name);
            }
            //console.log(productArr);


        inquirer.prompt([
             {
                type: 'list',
                name: 'addInventory',
                message: 'For which item do you want to increase the amount?',
                choices: productArr
             }
                ]).then((user) => {
                    var itemID = productArr.indexOf(user.addInventory) + 1;

                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'chooseQuantity',
                            message: 'Enter the amount to increase by which to increase ' + user.addInventory
                        }
                        ]).then((userB) => {
                            var quantity = userB.chooseQuantity;

                            this.connection.query(`UPDATE products SET stock_quantity = stock_quantity + ${quantity} WHERE item_id = ${itemID}`, (error, results) => {
                                if (error) throw error;
                                console.log(user.addInventory + " increased by " + quantity + ".");
                                console.log(" ");
                                this.menu();
                                });

                        });
                });
        });
    },

    addNewProduct: function() {
        inquirer.prompt([
            {
                type: 'input',
                name: 'productName',
                message: 'Enter a name for your new product'
            },
            {
                type: 'input',
                name: 'departmentName',
                message: 'Enter a department name for your product'
            },
            {
                type: 'input',
                name: 'price',
                message: 'Enter a price for your product per unit'
            },
            {
                type: 'input',
                name: 'quantity',
                message: 'Enter the stock quantity for this product'
            }
            ]).then((user) => {
                var post = {product_name: user.productName, department_name: user.departmentName, price: user.price, stock_quantity: user.quantity};
                this.connection.query("INSERT INTO products SET ?", post, (err, res) => {
                    this.menu();
                });
            });
    }

};

bamazon.menu();
