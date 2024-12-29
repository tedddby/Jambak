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
            console.log(response);
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

document.getElementById("funding-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let dataPost = {
        CampaignTitle: document.getElementById('campaign-title').value,
        Category: document.getElementById('category').value,
        Description: document.getElementById('description').value,
        GoalAmount: document.getElementById('goal-amount').value,
        RaisedAmount: 0,
        PaymentInformation: document.getElementById('payment-info').value,
        ContactInformation: document.getElementById('contact-info').value,
        Location: document.getElementById('location').value,
        CampaignImage: document.getElementById('campaign-image').value,
    };
    let req = await fetchData('./api/add/crowdfunding', dataPost);
    if(req.success){
        alert("تم عمل الحملة");
        window.location.href = "./browse_funding";
    }else{
        alert("Something went wrong");
    }
});