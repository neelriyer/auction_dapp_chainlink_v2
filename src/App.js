import React, { Component } from "react";
// import AuctionContract from "./contracts/Auction.json";
import AuctionContract from "./contracts/SimpleAuction.json" ;
import getWeb3 from "./getWeb3";
import config from "./config/config.json"

import "./App.css";

class App extends Component {
  state = {
     web3: null,
     accounts: null,
     contract: null,
     auctionOwner: null,
     auctionId: 0,
     bidInput: "",
     highestBid: 0,
     highestBidder: null,
     userBalance: 0
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const instance = new web3.eth.Contract(
        AuctionContract, 
        config.network && config.contract_address, //address
      );
      const owner = await instance.methods.getAuctionOwner().call();
      const id = await instance.methods.getAuctionId().call();
      const highestBidder = await instance.methods.getHighestBidder().call();
      const highestBid = await instance.methods.getHighestBid().call();
      const userBalance = await instance.methods.getUserBalance().call({from: accounts[0]});

      console.log("accounts: " + accounts);
      console.log("auction owner: " + owner);
      console.log("auction id: " + id);
      console.log("highest bidder: " + highestBidder);
      console.log("highest bid: " + highestBid);
      console.log("user balance: " + userBalance);

      this.setState({
        web3: web3,
        accounts: accounts,
        contract: instance,
        auctionOwner: owner,
        auctionId: id,
        highestBid: web3.utils.fromWei(highestBid, 'ether'),
        highestBidder: highestBidder,
        userBalance: web3.utils.fromWei(userBalance, 'ether')});

      console.log(this.state);
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.log(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      
      console.error(error);
    }
  };

  bid = async () => {
    const { web3, accounts, contract } = this.state;
    const bidValue = web3.utils.toWei(this.state.bidInput, 'ether');
    console.log("New bid value: " + web3.utils.fromWei(bidValue, 'ether'));

    await contract.methods.bid().send({from: accounts[0], value: bidValue});
    const highestBidder = await contract.methods.getHighestBidder().call();
    const highestBid = await contract.methods.getHighestBid().call();
    const userBalance = await contract.methods.getUserBalance().call({from: accounts[0]});
    console.log("highest bidder: " + highestBidder);
    console.log("highest bid: " + web3.utils.fromWei(highestBid, 'ether'));
    console.log("user balance: " + userBalance);

    this.setState({
      highestBid: web3.utils.fromWei(highestBid, 'ether'),
      highestBidder: highestBidder,
      userBalance: web3.utils.fromWei(userBalance, 'ether')});
  };

  withdraw = async () => {
    const {web3, accounts, contract} = this.state;
    console.log("Withdraw bid from account: " + accounts[0]);

    await contract.methods.withdraw().send({from: accounts[0]});
    const highestBidder = await contract.methods.getHighestBidder().call();
    const highestBid = await contract.methods.getHighestBid().call();
    const userBalance = await contract.methods.getUserBalance().call({from: accounts[0]});
    console.log("highest bidder :" + highestBidder);
    console.log("highest bid :" + highestBid);
    console.log("user balance: " + userBalance);

    this.setState({
      highestBid: web3.utils.fromWei(highestBid, 'ether'),
      highestBidder: highestBidder,
      userBalance: web3.utils.fromWei(userBalance, 'ether')});
  }

  inputHandler = (event) => {
    this.setState({bidInput: event.target.value});
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="Auction App">
        <h1>Good to Go!</h1>
        <div>Auction owner address: <strong>{this.state.auctionOwner}</strong>
            <br/> Highest bidder: <strong>{(this.state.highestBidder == this.state.accounts[0]) ? "You are the highest bidder" : this.state.highestBidder}</strong>
            <br/> Highest bid: <strong>{this.state.highestBid} ether</strong>
        </div>
        <div>Auction ID: <strong>{this.state.auctionId}</strong>
          <br/>Your total bid: <strong>{this.state.userBalance} ether</strong>
        </div>
        <p>Enter your bid value in ether</p>
        <input
            type="text"
            onChange={this.inputHandler}
        />
        <button onClick={this.bid}>BID</button>
        <h2>Withdraw bid</h2>
        <button onClick={this.withdraw}>WITHDRAW</button>
      </div>
    );
  }
}

export default App;
