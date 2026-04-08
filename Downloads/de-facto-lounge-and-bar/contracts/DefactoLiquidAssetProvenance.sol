// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Ethereum smart contract for ultra-premium bottle provenance
contract DefactoLiquidAssetProvenance {
    struct BottleHistory {
        uint256 distillationYear;
        string caskNumber;
        string warehouseLocation;
        address[] previousOwners; // Anonymous but verifiable
        uint256 purchasePrice; // In ETH, for elite transparency
        string tastingNotes; // Encrypted, client-access only
    }
    
    mapping(uint256 => BottleHistory) public bottleProvenance;
    
    address public defactoSommelier;

    event BottleServed(uint256 bottleId, address client, uint256 timestamp);

    constructor() {
        defactoSommelier = msg.sender;
    }
    
    modifier onlySommelier() {
        require(msg.sender == defactoSommelier, "Only certified sommelier");
        _;
    }

    function registerBottle(
        uint256 bottleId, 
        uint256 year, 
        string memory cask, 
        string memory warehouse, 
        uint256 price
    ) public onlySommelier {
        BottleHistory storage history = bottleProvenance[bottleId];
        history.distillationYear = year;
        history.caskNumber = cask;
        history.warehouseLocation = warehouse;
        history.purchasePrice = price;
    }

    function serveBottle(uint256 bottleId, address client) public onlySommelier {
        emit BottleServed(bottleId, client, block.timestamp);
    }
}
