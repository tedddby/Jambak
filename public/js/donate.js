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

document.getElementById("donate-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    let itemName = document.getElementById("itemName").value;
    let itemCategory = document.getElementById("itemCategory").value;
    let itemLocation = document.getElementById("itemLocation").value;
    let itemImage = document.getElementById("itemImage").value;
    let donorContact = document.getElementById("donorContact").value;
    let itemDescription = document.getElementById("itemDescription").value;

    let dataPost = {
        ItemName: itemName,
        ItemCategory: itemCategory,
        ItemLocation: itemLocation,
        ItemImage: itemImage,
        DonorContactInfo: donorContact,
        ItemDescription: itemDescription
    }

    let req = await fetchData('./api/add/donation', dataPost);
    if (req.success){
        alert("تمت الاضافة");
        window.location.href = "./donation-category";
    }else{
        alert("Something went wrong");
    }
});