import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const _LSP4_TOKEN_NAME_KEY =
  "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1";

// keccak256('LSP4TokenSymbol')
const _LSP4_TOKEN_SYMBOL_KEY =
  "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756";

const LYX_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

describe("Wrapped LYX", function () {
  async function deployWrappedLYX() {
    const [owner, sender] = await ethers.getSigners();

    const WrappedLYX = await ethers.getContractFactory("WrappedLYX");
    const wrappedLYX = await WrappedLYX.deploy();

    return { wrappedLYX, owner, sender };
  }

  describe("Deployment", function () {
    it("Should be deployed with no problem", async function () {
      const { wrappedLYX } = await loadFixture(deployWrappedLYX);

      expect(
        ethers.toUtf8String(await wrappedLYX.getData(_LSP4_TOKEN_NAME_KEY))
      ).to.equal("Wrapped LYX");
      expect(
        ethers.toUtf8String(await wrappedLYX.getData(_LSP4_TOKEN_SYMBOL_KEY))
      ).to.equal("WLYX");
      expect(await wrappedLYX.owner()).to.equal(LYX_ADDRESS);
    });
  });

  describe("Deposit", function () {
    it("Balance should increase in deposit", async function () {
      const { wrappedLYX, sender } = await loadFixture(deployWrappedLYX);

      const provider = ethers.provider;

      const amountToDeposit = ethers.parseEther("1000");
      const senderBalance = await provider.getBalance(sender);

      expect(await wrappedLYX.balanceOf(sender)).to.equal(0);
      expect(await provider.getBalance(wrappedLYX)).to.equal(0);

      await expect(
        wrappedLYX.connect(sender).deposit({ value: amountToDeposit })
      )
        .to.emit(wrappedLYX, "Deposit")
        .withArgs(sender.address, amountToDeposit);

      expect(await provider.getBalance(sender)).to.lessThan(
        senderBalance - amountToDeposit
      );
      expect(await provider.getBalance(wrappedLYX)).to.equal(amountToDeposit);
      expect(await wrappedLYX.balanceOf(sender)).to.equal(amountToDeposit);
    });
  });

  describe("Withdraw", function () {
    it("Should not be able to withdraw without having token", async function () {
      const { wrappedLYX, sender } = await loadFixture(deployWrappedLYX);

      const amountToWithdraw = ethers.parseEther("1000");

      await expect(
        wrappedLYX.connect(sender).withdraw(amountToWithdraw)
      ).to.revertedWithCustomError(wrappedLYX, "LSP7AmountExceedsBalance");
    });

    it("Balance should decrease in withdraw", async function () {
      const { wrappedLYX, sender } = await loadFixture(deployWrappedLYX);

      const provider = ethers.provider;

      const amountToDeposit = ethers.parseEther("1000");

      await wrappedLYX.connect(sender).deposit({ value: amountToDeposit });

      expect(await provider.getBalance(wrappedLYX)).to.equal(amountToDeposit);
      expect(await wrappedLYX.balanceOf(sender)).to.equal(amountToDeposit);

      const senderBeforeWithdrawBalance = await provider.getBalance(sender);

      await expect(wrappedLYX.connect(sender).withdraw(amountToDeposit))
        .to.emit(wrappedLYX, "Withdrawal")
        .withArgs(sender.address, amountToDeposit);

      const senderAfterWithdrawBalance = await provider.getBalance(sender);

      expect(await wrappedLYX.balanceOf(sender)).to.equal(0);
      expect(await provider.getBalance(wrappedLYX)).to.equal(0);

      expect(senderAfterWithdrawBalance).to.be.greaterThan(
        senderBeforeWithdrawBalance
      );
    });
  });

  describe("Headless Deposit", function () {
    it("Balance should increase in headless deposit", async function () {
      const { wrappedLYX, sender } = await loadFixture(deployWrappedLYX);

      const provider = ethers.provider;

      const amountToDeposit = ethers.parseEther("1000");
      const senderBalance = await provider.getBalance(sender);

      expect(await wrappedLYX.balanceOf(sender)).to.equal(0);
      expect(await provider.getBalance(wrappedLYX)).to.equal(0);

      await sender.sendTransaction({
        to: wrappedLYX,
        value: amountToDeposit,
      });

      expect(await provider.getBalance(sender)).to.lessThan(
        senderBalance - amountToDeposit
      );
      expect(await provider.getBalance(wrappedLYX)).to.equal(amountToDeposit);
      expect(await wrappedLYX.balanceOf(sender)).to.equal(amountToDeposit);
    });
  });
});
