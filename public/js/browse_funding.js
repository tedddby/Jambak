async function fetchData(url, requestData) {
    let dataReturn;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            console.log(response)
            alert("Internal Server Error");
            return null;
        }

        const responseData = await response.json();

        if (responseData.success) {
            dataReturn = responseData;
        } else {
            alert("Something went wrong");
            return null;
        }
    } catch (error) {
        alert("Something went wrong");
        console.error('Error:', error);
        return null;
    }
    return dataReturn;
}

let fundingRequests = [];
let data;
let loadRequests = async () => {
    let req = await fetchData('./api/fetch/crowdfunding');
    data = req.data;

    if(data.length > 0){
        for(let i = 0; i < data.length; i++){
            let obj = { id: data[i].CampaignID, title: data[i].CampaignTitle, description: data[i].Description, goal: data[i].GoalAmount, raised: data[i].RaisedAmount, payment: data[i].PaymentInformation, contact: data[i].ContactInformation };
            fundingRequests.push(obj);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadRequests();

    const grid = document.querySelector('.road');

    if(fundingRequests.length === 0){
        document.getElementById("notFound").style.display = '';
    }else{
        fundingRequests.forEach(request => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
      <div class="card-header">${request.title}</div>
      <div class="card-body">
        <p>${request.description}</p>
        <p><strong>Goal:</strong> $${request.raised > request.goal ? "Unexpected error" : request.goal-request.raised}</p>
      </div>
      <div class="card-footer">
        <button class="btn" onclick="showPopup(this)" data-id="${request.id}" data-title="${request.title}" data-content="${request.description}" data-raised="${request.raised}" data-goal="${request.goal}" data-contact="${request.contact}" data-payment="${request.payment}" ">ساهم</button>
      </div>
    `;

            grid.appendChild(card);
        });
    }
});

function showPopup(button) {
    const title = button.getAttribute('data-title');
    const content = button.getAttribute('data-content');
    const raised = button.getAttribute('data-raised');
    const goal = button.getAttribute('data-goal');
    const payment = button.getAttribute('data-payment');
    const contact = button.getAttribute('data-contact');
    const id = button.getAttribute('data-id');
    const amountInput = document.getElementById('amount-input');
    const fundBtn = document.getElementById('fund-btn');
    const note = document.getElementById('note');
    const amountLeft = goal-raised;

    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupContent').textContent = content;
    document.getElementById('raised').textContent = raised;
    document.getElementById('goal').textContent = goal;
    document.getElementById('payment').textContent = ` رقم حساب بنكك: ${payment}`
    document.getElementById('contact').textContent = `اتواصل مع صاحب الحملة: ${contact}`;
    note.textContent += ` ${contact}`;
    document.getElementById('popupOverlay').style.display = 'block';
    amountInput.max = amountLeft;
    document.body.style.overflow = 'hidden';

    const tip = note.textContent;

    amountInput.addEventListener('input', () => {
        if(amountInput.value > amountLeft){
            note.textContent = `* معليش, ما بتقدر تدعم بي اكتر من ${amountLeft}$ (المبلغ المتبقي)`;
            fundBtn.style.display = 'none';
        }else{
            note.textContent = tip;
            if(amountInput.value <= 0){
                fundBtn.style.display = 'none';
            }else{
                fundBtn.style.display = '';
            }
        }
    });

    fundBtn.addEventListener('click', async () => {
        let req = await fetchData('./api/fund/crowdfunding', {raised, goal, id, amount: amountInput.value});
        if(req.success){
            alert("شكراً ليك على التبرع!");
            window.location.reload();
        }else{
            alert("Something went wrong");
        }
    });

}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}