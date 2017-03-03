var mysql = require("mysql");
require("console.table");
var prompt = require("prompt");


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

    displayData: function() {
        this.connection.query("SELECT * FROM products" , (err, res) => {
            if (err) throw err;
            console.table(res);
            prompt.start();
            this.productPrompt();
        });
    },

    productChoice: {
        properties: {
            productID: {
                message: 'Please enter the ID of the product you would like to buy',
                required: true
            },
            quantity: {
                message: 'Please enter the number of units you would like to purchase',
                required: true
            }
        }
    },

    productPrompt: function() {
        prompt.get(this.productChoice, (err, res) => {
            if (err) {
                throw err;
                console.log("We seem to have a problem here!");
            }

            this.productID = res.productID;
            this.quantity = res.quantity;
            this.inventoryCheck();
        });
    },

    productID: null,
    quantity: null,

    inventoryCheck: function() {
          this.connection.query("SELECT * FROM products WHERE ?" , {item_id: this.productID}, (err, res) => {
            if (err) throw err;

            if (res[0].stock_quantity >= this.quantity) {
                var newQuantity = res[0].stock_quantity -= this.quantity;
                var totalCost = this.quantity * res[0].price;
                var departmentName = res[0].department_name;
                this.connection.query(`UPDATE products SET stock_quantity = ${newQuantity}, product_sales = product_sales + ${totalCost} WHERE ?`, {item_id: this.productID}, (err, res) => {
                });
                this.connection.query(`SELECT * FROM departments WHERE ?`, {department_name: departmentName}, (err, res) => {
                    if(res.length > 0) {
                        this.connection.query(`UPDATE departments SET total_sales = total_sales + ${totalCost} WHERE ?`, {department_name: departmentName}, (err, res) => {
                        });   
                    } else {
                        this.connection.query(`INSERT INTO departments SET ?`, {department_name: departmentName, total_sales: totalCost}, (err, res) => {
                        });
                    }
                });
                

                console.log("remaining quantity: " + res[0].stock_quantity);
                console.log("Your bill is $" + totalCost);
                console.log(" ");
            } else {
                console.log("Insufficent product available!")
                console.log("There are only " + res[0].stock_quantity + " remaining of " + res[0].product_name + ".");
                console.log(" ");                
            }
            this.displayData();
        });
    }
};

bamazon.displayData();
