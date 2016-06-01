describe('Lunch ordering controller tests: ', function() {
	var $controller;
	beforeEach(module('lunchOrdering'));
	beforeEach(inject(function(_$controller_) {
		$controller = _$controller_;
	}));

	describe('RestaurantSelector Controller ->', function() {
		it('default user should be guest', function() {
			var $scope = {};
			var controller = $controller('RestaurantSelector', {
				$scope : $scope
			});
			expect(controller.user).toBe('guest');
		});
		
		it('hasPlaced order should be true for sam in test data', function() {
			var $scope = {};
			var controller = $controller('RestaurantSelector', {
				$scope : $scope
			});
			controller.activeOrders = [{user:"Sam", status:"finalized", order:{restaurant:"Cafe Deli", food:"rice, roast chicken"}}];
			var hasHe = controller.userPlacedOrder('sam');
			expect(hasHe).toBe(true);
		});

		it('capitalize should make first letter capital', function() {
			inject(function(_$filter_) {
				$filter = _$filter_;
			});
			var result = $filter('capitalize')('alphabet');
			expect(result).toBe('Alphabet');
		});

	});
});
