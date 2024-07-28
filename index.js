let balance = 0

function renderTransfer(transferData) {
    const transfer = document.createElement('article')
    transfer.classList.add('transfer')
    transfer.id = `transfer-${transferData.id}`

    const transferId = document.createElement('h3')
    transferId.classList.add('transferId')
    transferId.textContent = `ID: ${transferData.id}`

    const transferStatus = document.createElement('div')
    if (transferData.transfer === "received") {
        transferStatus.classList.add('transfer-received')
    } else if (transferData.transfer === "transferred") {
        transferStatus.classList.add('transfer-transferred')
    }
    transferStatus.textContent = `Transfer: ${transferData.transfer}`

    const transferPrice = document.createElement('div')
    transferPrice.classList.add('transfer-price')
    transferPrice.innerHTML = `Price: R$${transferData.price}`

    const transferBy = document.createElement('div')
    transferBy.classList.add('transfer-by')
    transferBy.textContent = `By: ${transferData.by}`

    transfer.append(transferId, transferStatus, transferPrice, transferBy);
    document.querySelector('#transfers').appendChild(transfer);

    calculateBalance(transferData)
}

async function fetchTransfers() {
    const transfers = await fetch("http://localhost:3000/finances");
    const transfersJson = await transfers.json();

    transfersJson.forEach(renderTransfer)
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTransfers()
});

const form = document.querySelector('#transfer-form')

form.addEventListener('submit', async (ev) => {
    ev.preventDefault()

    const transferData = {
        transfer: document.querySelector('#transfer').value,
        price: document.querySelector('#price').value,
        by: document.querySelector('#by').value
    }

    const response = await fetch("http://localhost:3000/finances", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transferData)
    })

    const savedTransfer = await response.json()
    form.reset()
    renderTransfer(savedTransfer)
});

const removeTransferForm = document.querySelector('#remove-transfer-form');

removeTransferForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const transferId = document.querySelector('#remove-transfer').value;
    await deleteTransfer(transferId);
    removeTransferForm.reset();
});

async function deleteTransfer(transferId) {
    const response = await fetch(`http://localhost:3000/finances/${transferId}`, {
        method: "DELETE"
    });

    if (response.ok) {
        const deletedTransfer = await response.json();
        const transferElement = document.getElementById(`transfer-${deletedTransfer.id}`);
        if (transferElement) {
            transferElement.remove();
        }
        // Atualizar o balanço, se necessário

        if (deletedTransfer.transfer === "received") {
            calculateBalance({ id: deletedTransfer.id, by: deletedTransfer.by, transfer: "transferred", price: deletedTransfer.price});
        } else if (deletedTransfer.transfer === "transferred") {
            calculateBalance({ id: deletedTransfer.id, by: deletedTransfer.by, transfer: "received", price: deletedTransfer.price});
        }
        
    } else {
        console.error("Failed to delete transfer");
    }
}


function calculateBalance(transferData) {
    const balanceElement = document.querySelector('#balance')
    
    if (transferData.transfer === "received") {
        balance += parseFloat(transferData.price)
    } else if (transferData.transfer === "transferred") {
        balance -= parseFloat(transferData.price)
    }

    balanceElement.innerHTML = `Balance: R$${balance.toFixed(2)}`   // "toFixed" é utilizado para colocar duas casas após a vírgula
}