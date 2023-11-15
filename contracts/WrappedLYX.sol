// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {LSP7DigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";

import {IWrappedLYX} from "./IWrappedLYX.sol";

contract WrappedLYX is LSP7DigitalAsset, IWrappedLYX {
    constructor()
        LSP7DigitalAsset(
            "Wrapped LYX",
            "WLYX",
            0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE,
            false
        )
    {}

    receive() external payable override {
        deposit();
    }

    function deposit() public payable {
        //balanceOf[msg.sender] += msg.value;
        _mint(msg.sender, msg.value, true, "");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        _burn(msg.sender, amount, "");
        //msg.sender.transfer(wad);
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed Withdrawal");
        emit Withdrawal(msg.sender, amount);
    }
}
