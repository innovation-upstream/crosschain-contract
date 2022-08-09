// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IInvestor {
    function stake(uint amount, address user) external;
}

contract BridgeContract is Ownable {
    using SafeERC20 for IERC20;

    address public TestToken;
    address public Depositor;
    address public HedgeInvestor;
    
    event ReceivePayment(address user, uint amount);

    constructor(
        address _token,
        address _investor,
        address _depositor
    ) {
        HedgeInvestor = _investor;
        Depositor = _depositor;
        TestToken = _token;
    }

    modifier onlyDepositor() {
        require(msg.sender == Depositor, "Not depositor");
        _;
    }

    function setInfo(
        address _investor,
        address _depositor
    ) external onlyOwner {
        HedgeInvestor = _investor;
        Depositor = _depositor;
    }

    receive() external payable {
        emit ReceivePayment(msg.sender, msg.value);
    }

    function makeTx(address user, uint amount) external onlyDepositor {
        emit ReceivePayment(user, amount);
    }

    function makeDeposit(uint amount, address user) external onlyDepositor {
        IERC20(TestToken).approve(HedgeInvestor, amount);

        IInvestor(HedgeInvestor).stake(amount, user);
    }
}
