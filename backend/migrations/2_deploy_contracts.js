var auction = artifacts.require("SimpleAuction");
var price = artifacts.require("PriceConsumerV3");
var limit = 1000000000;

module.exports = function(deployer) {
    deployer.deploy(auction, limit, "0xBea10eB56a156516998Ec233a1B48C9a7e30A22d");
    deployer.deploy(price);
}