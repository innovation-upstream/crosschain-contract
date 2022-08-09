// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakeContract is Ownable {
    using SafeERC20 for IERC20;

    address public TestToken;    
    address public HedgeBridge;

    mapping(address => uint) public UserStake;

    constructor(
        address _token
    ) {
        TestToken = _token;
    }

    modifier shouldMatchCaller(address _user) {
        require(_user == msg.sender || msg.sender == HedgeBridge, "Error: Caller is not matched");
        _;
    }

    function setBridge(address _bridge) external onlyOwner {
        HedgeBridge = _bridge;
    }

    function stake(
        uint amount,
        address user
    ) external shouldMatchCaller(user)  {
        IERC20(TestToken).safeTransferFrom(msg.sender, address(this), amount);
        UserStake[user] += amount;
    }
}
