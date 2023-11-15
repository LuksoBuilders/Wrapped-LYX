// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IWrappedLYX {
    event Deposit(address indexed destination, uint256 amount);
    event Withdrawal(address indexed src, uint256 amount);

    function deposit() external payable;

    function withdraw(uint256 amount) external;
}
