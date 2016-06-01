(function() {
	'use strict';
	var myapp = angular
					.module('lunchOrdering', ['ngMaterial', 'ngResource'])
					.controller('RestaurantSelector', RestaurantSelector);

	/**
	 * Enable locationProvider html5Mode so that we can use $location
	 */
	myapp.config(function($locationProvider) {
		$locationProvider.html5Mode({
			enabled : true,
			requireBase : false
		});
	});

	/**
	 * A function to capitalize the first letters of words.
	 */
	myapp.filter('capitalize', function() {
		return function(input) {
			return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
		}
	});

	/**
	 *  A function to update the orders record through a Rest service.
	 */
	myapp.factory('Orders', ['$resource',
	function($resource) {
		return $resource('/orders/:id', null, {
			'update' : {
				method : 'PUT'
			}
		});
	}]);

	/**
	 * The lunchOrdering controller function
	 */
	function RestaurantSelector($timeout, $q, $log, $http, $location, $mdDialog, Orders) {
		var self = this;
		self.simulateQuery = false;
		self.isDisabled = false;

		/**
		 * Obtain the available restaurants and their menus
		 */
		$http.get("json/restaurants.json").then(function(response) {
			self.myRestaurantData = response.data.restaurants;
			// list of `restaurant` value/display objects
			self.restaurants = loadAll();
		});

		/**
		 * Obtain the orders that have already been placed
		 */
		$http.get("json/orders.json").then(function(response) {
			self.activeOrders = response.data.orders;
		});

		self.user = "guest";
		var searchObj = $location.search();
		if ( typeof searchObj.user !== 'undefined') {
			self.user = searchObj.user;
		}

		self.querySearch = querySearch;
		self.selectedItemChange = selectedItemChange;
		self.searchTextChange = searchTextChange;
		self.menuItemChange = menuItemChange;
		self.placeOrder = placeOrder;
		self.modifyOrder = modifyOrder;
		self.activeMenu = [];
		self.activeRestaurant = '';
		self.orderList = [];
		self.totalPrice = 0;
		self.userPlacedOrder = hasPlacedOrder;

		/**
		 * A function to calculate the total price of
		 *  selected items.
		 */
		function menuItemChange(menuItem) {
			if (menuItem.wanted) {
				self.totalPrice += menuItem.price;
			} else {
				self.totalPrice -= menuItem.price;
			}
		}

		/**
		 * A function to check if an object contains a specified user
		 */
		function hasPlacedOrder(user) {
			var activeOrds = self.activeOrders;
			for (var i = 0; i < activeOrds.length; i++) {
				if (activeOrds[i].user.toLowerCase() == user.toLowerCase()) {
					return true;
				}
			}
			return false;
		}

		/**
		 * A function to place an order in the system
		 * - submit order info to rest service or persistence layer
		 */
		function placeOrder(event) {
			if (hasPlacedOrder(self.user)) {
				//submit order to the system
				$mdDialog.show($mdDialog.alert()
					.title('Order Exists')
					.textContent('Seems you had placed an order before. Want to change it?')
					.ariaLabel('Order Exists')
					.ok('Yes').targetEvent(event));
			} else if (self.activeMenu.length > 0) {
				//get selected items in menu
				var user = self.user;
				var restaurant = self.activeRestaurant;
				var orderList = [];
				var orderCost = self.totalPrice;
				for (var i = 0; i < self.activeMenu.length; i++) {
					if (self.activeMenu.wanted) {
						orderList.push(self.activeMenu.item);
					}
				}
				//submit order to the system
				//updateOrder(self.user);
				$mdDialog.show($mdDialog.alert()
					.title('Order Confirmation')
					.textContent('Your order has been placed.')
					.ariaLabel('Order confirmation')
					.ok('Cool')
					.targetEvent(event));

			} else {
				$mdDialog.show($mdDialog.alert()
					.title('Place your order')
					.textContent('You have to place your order first')
					.ariaLabel('Place your order')
					.ok('oops!')
					.targetEvent(event));
			}
		}

		/**
		 * A function to modify the selected active order
		 */
		function modifyOrder(order, event) {
			if (self.user.toLowerCase() == order.user.toLowerCase()) {
				$mdDialog.show($mdDialog.alert()
					.title('Change your order?')
					.textContent('Proceed to change or add items to your order. This will clear your current order.')
					.ariaLabel('Change order')
					.ok('Okay')
					.targetEvent(event));
			} else {
				$mdDialog.show($mdDialog.alert()
					.title('Is this your order?')
					.textContent('This is not your order :)')
					.ariaLabel('Not your order')
					.ok('Okay')
					.targetEvent(event));
			}
		}

		/**
		 * A function to log the changes in text
		 *  being typed in the autocomplete field.
		 */
		function searchTextChange(text) {
			$log.info('Text changed to ' + text);
		}

		/**
		 * A function to detect changes in the restaurant
		 *  selected and update the selected items.
		 */
		function selectedItemChange(item) {
			if ( typeof item !== 'undefined') {
				self.totalPrice = 0;
				//Here we bring up the restaurant menu
				self.activeRestaurant = item.value;
				var menus = self.myRestaurantData[0];
				self.activeMenu = menus[item.display];
				for (var i = 0; i < self.activeMenu.length; i++) {
					if (self.activeMenu[i].wanted) {
						self.totalPrice += self.activeMenu[i].price;
					}
				}
			}
		}

		/**
		 * A function to build a restaurants list of key/value pairs
		 */
		function loadAll() {
			var allRestaurants = Object.keys(self.myRestaurantData[0]);
			return allRestaurants.map(function(restaurant) {
				return {
					value : restaurant.toLowerCase(),
					display : restaurant
				};
			});
		}

		/**
		 * A function to Search for restaurants
		 *  $timeout used to simulate remote dataservice call.
		 */
		function querySearch(query) {
			var results = query ? self.restaurants.filter(createFilterFor(query)) : self.restaurants,
			    deferred;
			if (self.simulateQuery) {
				deferred = $q.defer();
				$timeout(function() {
					deferred.resolve(results);
				}, Math.random() * 1000, false);
				return deferred.promise;
			} else {
				return results;
			}
		}

		/**
		 * Create filter function for a query string
		 */
		function createFilterFor(query) {
			var lowercaseQuery = angular.lowercase(query);
			return function filterFn(restaurant) {
				return (restaurant.value.indexOf(lowercaseQuery) === 0);
			};
		}

		/**
		 * A function to update place order in the backend
		 */
		function updateOrder(user) {
			//Use the user name and current date to generate a unique order_id
			//Assumption: user gets only one order per day, any order by same user
			// on same day overwrites previous order.
			var d = new Date();
            var order_id = user + d.getDate() + d.getMonth() + d.getYear();
			Orders.update({
				id : order_id
			}, order);
		}

	}

})();
