# lunch-ordering-system
## A platform for teams to cordinate lunch orders 

The platform is a single page application from which members of a team can log on and order meals from a list of available restaurants. 
The list of restaurants is obtains from a backend rest service with data on restaurants. This includes the restaurant menu and prices. A sample of the json data is provided in restaurants.json.

orders.json is sample data for orders that have already been submitted. This data includes information on who placed the order, the details of the order, and whether or not the order has been delivered.

Tests for various controller methods are provided in the tests directory.

To test the current version of the application, download (or clone) and launch it locally. Do this on a wamp server. Be sure to install the necessary dependencies.

### list of required dependencies and their npm installation commands:

npm install angular

npm install angular-resource

npm install angular-animate

npm install angular-route

npm install angular-aria

npm install angular-messages 

npm install angular-material

### for unit testing;

npm install karma

npm install karma-jasmine


To test the application, you can include a user name parameter in the url to simulate a unique user. 
For example; localhost/lunch-ordering-system/index.html?user=tom
