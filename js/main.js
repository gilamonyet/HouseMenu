const numberFormatter = Intl.NumberFormat('en-US');
let confirmationModalInfo = {carName: '', carSellPrice: 0, carId: 0, spot: 0};
let selectedItem = -1;
let currentCarList = {};
let currentGarageList = {};
let currentGarageHash = "";
let carToTransfer = 0;

const containerContent = `<button onclick="LeaveMenu()" id="leave-menu-button"><i class="fa-solid fa-right-from-bracket"></i> Exit</button>
                            <div class="loading">
                                <h1 class="loading-text">Updating Garage ...</h1>
                                <h2 class="loading-sub-text">- Please wait -</h2>
                            </div>
                            <div id="main-menu-container">
                                <h1 class="garage-title"><i class="fa-solid fa-garage-open"></i> Vehicles in garage</h1>
                                <div id="car-list-container">
                                </div>
                            </div>
                            <div id="sell-confirmation-modal">
                                <h1 class="modal-title"><i class="fa-solid fa-sack-dollar"></i> Sell vehicle</h1>
                                <h2 class="confirmation-message">Are you sure you want to sell your <span id="car-name-in-modal"></span> for $<span id="sell-price"></span> ?</h2>
                                <div class="button-container">
                                    <button onclick="SellVehicle()" id="modal-confirm">Yes</button>
                                    <button onclick="CloseModal()" id="modal-cancel">Cancel</button>
                                </div>
                            </div>
                            <div id="info-modal">
                                <h1 class="info-modal-title"><i class="fa-solid fa-car"></i> Audi RS5</h1>
                                <img src="" width="50px" height="50px" class="car-class"/>
                                <div id="item-container">
                                    
                                </div>
                                <button onclick="CloseModal()" id="return-menu-button"><i class="fa-solid fa-arrow-left-long"></i></button>
                            </div>
                            <div id="transfer-modal">
                            
                            </div>
                            <div id="house-menu">
                                <h1 class="menu-title">House Menu</h1>
                                <div id="house-menu-content">
                                    
                                </div>
                            </div>
                            `;

const OpenConfirmationModal = (carName, carPrice, dbId, spot) => {
    confirmationModalInfo.carName = carName;
    confirmationModalInfo.carSellPrice = carPrice;
    confirmationModalInfo.carId = dbId;
    confirmationModalInfo.spot = spot;
    $('#car-name-in-modal').text(carName);
    $('#sell-price').text(numberFormatter.format(carPrice));
    $('#sell-confirmation-modal').show();
}

const OpenCarTransferHereModal = () => {
    $("#transfer-modal").html(`<h1 class="transfer-modal-title"><i class="fa-solid fa-arrow-down-to-line"></i> Transfer Vehicle to This Garage</h1>
                                <div id="cars-to-transfer-item-container">

                                </div>
                                <button onclick="CloseModal()" id="return-menu-button"><i class="fa-solid fa-arrow-left-long"></i></button>`);
    for (let i = 0; currentGarageList[i] !== undefined; i++) {
        if (currentGarageList[i].garage !== currentGarageHash) {
            for (let j = 0; currentGarageList[i].carsInGarage[j] !== undefined; j++) {
                $("#cars-to-transfer-item-container").append(`<div class="individual-car">
                                                                <h2 class="car-name">${currentGarageList[i].carsInGarage[j].fullName}</h2>
                                                                <h2 class="house-name-car">${currentGarageList[i].garageName}</h2>
                                                                <i class="fa-solid fa-arrow-down-to-line green-plus-in-modal" onclick="TransferCarHere(${currentGarageList[i].carsInGarage[j].carId}, '${currentGarageList[i].garage}')"></i>
                                                            </div>`);
            }
        }
    }
    $("#transfer-modal").show();
} 

const OpenInfoModal = (fullName, carId) => {
    let curCar = GetCarById(carId);
    let params = curCar.params;
    let categoryAsset = curCar.categoryAsset;

    $('.info-modal-title').html(`<i class="fa-solid fa-car"></i> ${fullName}`);
    $('.car-class').attr("src", categoryAsset);
    $("#item-container").html("");
    for (let i = 0; params[i] !== undefined; i++) {
        $("#item-container").append(`<div class="info-item">
                                        <h2 class="info-title">${params[i].name}</h2>
                                        <h2 class="info-value">${params[i].value}</h2>
                                    </div>`)
    }
    $('#info-modal').show();
}

const GetCurrentCarGarageHash = (carId) => {
    for (let i = 0; currentGarageList[i] !== undefined; i++) {
        for (let j = 0; currentGarageList[i].carsInGarage[j] !== undefined; j++) {
            if (currentGarageList[i].carsInGarage[j].carId === carId) {
                return currentGarageList[i].garage;
            }
        }
    }
    return null
}

const TransferCarHere = (carId, garageHash) => {
    CloseModal();
    $.post("https://HouseScript/TransferCarFromGarageToGarage", JSON.stringify({ id: carId, from: garageHash, to: currentGarageHash }));
}

const ReplaceCarInGarageByOther = (secondCarId, garageToSend) => {
    CloseModal();
    $.post("https://HouseScript/ReplaceCarInGarageByOther", JSON.stringify({ firstCarId: carToTransfer, secondCarId: secondCarId, recieveHouse: currentGarageHash, sendHouse: garageToSend }));
}

const TransferCarToGarage = (carId, garageHash) => {
    CloseModal();
    $.post("https://HouseScript/TransferCarFromGarageToGarage", JSON.stringify({ id: carId, from: GetCurrentCarGarageHash(carId), to: garageHash }));
}

const OpenGarageVehiclesForSwitchModal = (garageHash, garageName) => {
    $("#transfer-modal").html(`<h1 class="transfer-modal-title"><i class="fa-solid fa-garage"></i> ${garageName}</h1>
                                <div id="cars-to-transfer-item-container">

                                </div>
                                <button onclick="CloseModal()" id="return-menu-button"><i class="fa-solid fa-arrow-left-long"></i></button>
                                `);
    for (let i = 0; currentGarageList[i] !== undefined; i++) {
        if (currentGarageList[i].garage === garageHash) {
            for (let j = 0; currentGarageList[i].carsInGarage[j] !== undefined; j++) {
                $("#cars-to-transfer-item-container").append(`<div class="individual-car">
                                                                <h2 class="car-name">${currentGarageList[i].carsInGarage[j].fullName}</h2>
                                                                <i class="fa-solid fa-arrow-up-arrow-down green-plus-in-modal" onclick="ReplaceCarInGarageByOther(${currentGarageList[i].carsInGarage[j].carId}, '${currentGarageList[i].garage}')"> <span class="force-font">Switch</span></i>
                                                            </div>`);
            }
            if (currentGarageList[i].carsInGarage.length < currentGarageList[i].maxSpace) {
                $('#cars-to-transfer-item-container').append(`<i class="fa-solid fa-arrow-down-to-line green-plus" onclick="TransferCarToGarage(${carToTransfer}, '${currentGarageList[i].garage}')"> <span class="force-font">Send</span></i>`)
            }
        }
    }
    $("#transfer-modal").show();
}

const OpenCarTransferSwitchModal = (carId) => {
    carToTransfer = carId;
    $("#transfer-modal").html(`<h1 class="transfer-modal-title"><i class="fa-solid fa-arrow-down-to-line"></i> Transfer Vehicle</h1>
                                <div id="cars-to-transfer-item-container">

                                </div>
                                <button onclick="CloseModal()" id="return-menu-button"><i class="fa-solid fa-arrow-left-long"></i></button>`);
    for (let i = 0; currentGarageList[i] !== undefined; i++) {
        if (currentGarageList[i].garage !== currentGarageHash) {
            $("#cars-to-transfer-item-container").append(`<div class="individual-car">
                                                            <h2 class="car-name">${currentGarageList[i].garageName}</h2>
                                                            <i class="fa-solid fa-garage-car green-plus-in-modal" onclick="OpenGarageVehiclesForSwitchModal('${currentGarageList[i].garage}', '${currentGarageList[i].garageName}')"> <span class="force-font">See Cars</span></i>
                                                        </div>`);
        }
    }
    $("#transfer-modal").show();
}

const LeaveMenu = () => {
    $.post("https://HouseScript/LeaveVehMenu", JSON.stringify({  }));
}

const CloseModal = () => {
    $('#sell-confirmation-modal').hide();
    $('#info-modal').hide();
    $("#transfer-modal").hide();
    confirmationModalInfo = {carName: '', carSellPrice: 0, carId: 0, spot: 0};
}

const SellVehicle = () => {
    $('#sell-confirmation-modal').hide();
    $.post("https://HouseScript/SellVehicle", JSON.stringify(confirmationModalInfo));
    confirmationModalInfo = {carName: '', carSellPrice: 0, carId: 0, spot: 0};
}

const GetCarById = (id) => {
    for (let i = 0; currentCarList[i] !== undefined; i++) {
        if (currentCarList[i].carId === id) {
            return currentCarList[i]
        }
    }
    return {}
}

const SetupGarageCars = (list, currentGarage) => {
    currentGarageList = list;
    currentGarageHash = currentGarage;

    $('#car-list-container').html('');
    for (let i = 0; list[i] !== undefined; i++) {
        if (list[i].garage === currentGarage) {
            currentCarList = list[i].carsInGarage
            for (let j = 0; list[i].carsInGarage[j] !== undefined; j++) {
                $('#car-list-container').append(`<div class="individual-car">
                                                    <h2 class="car-name">${list[i].carsInGarage[j].fullName}</h2>
                                                    <div class="context-buttons-car">
                                                        <i onclick="OpenInfoModal('${list[i].carsInGarage[j].fullName}', ${list[i].carsInGarage[j].carId});" class="fa-solid fa-info info-car"></i>
                                                        <i onclick="OpenCarTransferSwitchModal(${list[i].carsInGarage[j].carId});" class="fa-solid fa-arrow-right-to-city transfer-car"></i>
                                                        <i onclick="OpenConfirmationModal('${list[i].carsInGarage[j].fullName}', ${list[i].carsInGarage[j].sellPrice}, ${list[i].carsInGarage[j].carId}, ${list[i].carsInGarage[j].spot});" class="fa-solid fa-sack-dollar sell-car"></i>
                                                    </div>
                                                </div>`)
            }
            if (list[i].maxSpace > list[i].carsInGarage.length) {
                $('#car-list-container').append(`<i class="fa-solid fa-arrow-down-to-line green-plus" onclick="OpenCarTransferHereModal()"></i>`)
            }
            return;
        }
    }
}

const SetupHouseMenu = (playerPos) => {
    if (playerPos === 'OutsideHouse') {
        $("#house-menu-content").html(`<div class="house-menu-option">
                                            <i class="fa-solid fa-house menu-icon"></i>
                                            <h2 class="house-menu-text">Enter House</h2>
                                        </div>
                                        <div class="house-menu-option">
                                            <i class="fa-solid fa-garage menu-icon"></i>
                                            <h2 class="house-menu-text">Enter Garage</h2>
                                        </div>`)
    } else if (playerPos === 'InHouse') {
        $("#house-menu-content").html(`<div class="house-menu-option">
                                            <i class="fa-solid fa-house menu-icon"></i>
                                            <h2 class="house-menu-text">Leave House</h2>
                                        </div>
                                        <div class="house-menu-option">
                                            <i class="fa-solid fa-garage menu-icon"></i>
                                            <h2 class="house-menu-text">Enter Garage</h2>
                                        </div>`)
    } else if (playerPos === 'InGarage') {
        $("#house-menu-content").html(`<div class="house-menu-option">
                                            <i class="fa-solid fa-house menu-icon"></i>
                                            <h2 class="house-menu-text">Enter House</h2>
                                        </div>
                                        <div class="house-menu-option">
                                            <i class="fa-solid fa-garage menu-icon"></i>
                                            <h2 class="house-menu-text">Leave Garage</h2>
                                        </div>`)
    } else if (playerPos === 'OutsideGarage') {
        $("#house-menu-content").html(`<div class="house-menu-option">
                                            <i class="fa-solid fa-garage menu-icon"></i>
                                            <h2 class="house-menu-text">Enter Garage</h2>
                                        </div>`)
    } else if (playerPos === 'InGarageCar') {
        $("#house-menu-content").html(`<div class="house-menu-option">
                                            <i class="fa-solid fa-garage menu-icon"></i>
                                            <h2 class="house-menu-text">Leave Garage</h2>
                                        </div>`)
    }
}

const houseMenuGoDown = () => {
    if (selectedItem === -1 || $(".house-menu-option").length === 1) {
        selectedItem = 0;
    } else if (selectedItem < $(".house-menu-option").length - 1) {
        $(".house-menu-option").eq(selectedItem).removeClass("option-active");
        selectedItem += 1;
    }
    $(".house-menu-option").eq(selectedItem).addClass("option-active");
}

const houseMenuGoUp = () => {
    if ($(".house-menu-option").length === 1) {
        selectedItem = 0;
    } else if (selectedItem === -1) {
        selectedItem = $(".house-menu-option").length - 1;
    } else if (selectedItem > 0) {
        $(".house-menu-option").eq(selectedItem).removeClass("option-active");
        selectedItem -= 1;
    }
    $(".house-menu-option").eq(selectedItem).addClass("option-active");
}

const selectHouseOption = () => {
    var optionText = $(".option-active .house-menu-text").text();

    if (optionText === 'Enter House') {
        $.post("https://HouseScript/EnterHouse", JSON.stringify({  }));
    } else if (optionText === 'Enter Garage') {
        $.post("https://HouseScript/EnterGarage", JSON.stringify({  }));
    } else if (optionText === 'Leave House') {
        $.post("https://HouseScript/LeaveHouse", JSON.stringify({  }));
    } else if (optionText === 'Leave Garage') {
        $.post("https://HouseScript/LeaveGarage", JSON.stringify({  }));
    }
}

window.onload = function() {
    $("#container").hide();
    $("#container").html(containerContent);
    $('#sell-confirmation-modal').hide();
    $('#info-modal').hide();
    $('#leave-menu-button').hide();
    $("#transfer-modal").hide();
    $("#house-menu").hide();
    $(".loading").hide();
    window.addEventListener('message', (event) => {
        if (event.data.type === 'veh-menu') {
            if (event.data.status) {
                $("#container").show();
                $("#house-menu").hide();
                $('#sell-confirmation-modal').hide();
                $(".loading").hide();
                $('#leave-menu-button').show();
                $("#main-menu-container").show();
                SetupGarageCars(JSON.parse(event.data.garageList), event.data.currentGarageHash);
            } else {
                $('#info-modal').hide();
                $("#transfer-modal").hide();
                $('#leave-menu-button').hide();
                $(".loading").hide();
                $("#container").hide();
            }
        }
        if (event.data.type === 'update-cars') {
            SetupGarageCars(JSON.parse(event.data.garageList), event.data.currentGarageHash);
        }
        if (event.data.type === 'show-house-menu') {
            SetupHouseMenu(event.data.playerPos);
            $("#container").show();
            $(".loading").hide();
            $('#info-modal').hide();
            $("#transfer-modal").hide();
            $("#sell-confirmation-modal").hide();
            $("#main-menu-container").hide();
            $('#leave-menu-button').hide();
            $("#house-menu").show();
        }
        if (event.data.type === 'hide-house-menu') {
            $("#house-menu-content").html("");
            $("#sell-confirmation-modal").hide();
            $("#main-menu-container").hide();
            $(".loading").hide();
            $("#house-menu").hide();
            $('#info-modal').hide();
            $("#transfer-modal").hide();
            $('#leave-menu-button').hide();
            $("#container").hide();
            selectedItem = -1;
        }
        if (event.data.type === 'send-item-switch') {
            if (event.data.direction === 'up') {
                houseMenuGoUp();
            } else if (event.data.direction === 'down') {
                houseMenuGoDown();
            }
        }
        if (event.data.type === 'send-select-item') {
            selectHouseOption();
        }
        if (event.data.type === 'loading') {
            if (event.data.status === true) {
                $(".loading").show();
            } else {
                $(".loading").hide();
            }
        }
    });
}