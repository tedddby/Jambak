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

let itemsData = {};

function getImageTypeFromRawBase64(base64String) {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
        return 'jpeg';
    } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        return 'png';
    } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        return 'gif';
    } else if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
        return 'bmp';
    }

    return 'unknown';
}

let loadDonations = async () => {
    let donations = await fetchData('./api/fetch/donation', {});
    let {data} = donations;
    if(data.length !== 0){
        let items = {
            Food: [],
            Clothing: [],
            Medicine: [],
            Jobs: [],
            Others: [],
            Housing: []
        }
        for(let i = 0; i < data.length; i++){
            let type = getImageTypeFromRawBase64(data[i].ItemImage);
            //alert(type)
            let img = `data:image/${type};base64,${data[i].ItemImage}`;
            items[data[i].ItemCategory].push({id: data[i].DonationID, title: data[i].ItemName, description: data[i].ItemDescription, location: data[i].ItemLocation, image: {type, img}, donorContact: data[i].DonorContactInfo});
            itemsData[data[i].ItemCategory] = items[data[i].ItemCategory];
        }
    }else{
        document.getElementById("cat_cards").innerHTML = "لا توجد تبرعات في الوقت الحالي...";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadDonations();
    console.log(itemsData)
});

let currentCategory = '';

function showCategories() {
    document.getElementById('categoryView').classList.add('active-view');
    document.getElementById('itemsView').classList.remove('active-view');
    document.getElementById('itemDetailView').classList.remove('active-view');
}

function showItems(category) {
    currentCategory = category;
    let obj = {
        Food: "الطعام",
        Housing: "السكن",
        Medicine: "العلاج",
        Jobs: "الوظيفة",
        Others: "اخرى",
        Clothing: "الملابس",
    }
    document.getElementById('categoryView').classList.remove('active-view');
    document.getElementById('itemsView').classList.add('active-view');
    document.getElementById('itemDetailView').classList.remove('active-view');

    document.getElementById('categoryTitle').textContent = `تبرعات ${obj[category]}`;
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';

    const items = itemsData[category] || [];

    if(items.length !== 0){
        document.getElementById("notFound").style.display = 'none';
        items.forEach((item) => {
            let img;
            if(item.image.type === "unknown"){
                img = `<p>NO IMAGE</p>`;
            }else{
                img = `<img src="${item.image.img}" alt="${item.name}">`;
            }
            itemsGrid.innerHTML += `
      <div class="item-card" onclick="showItemDetail(${item.id})">
        ${img}
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <p>الموقع: ${item.location}</p>
      </div>
    `;
        });
    }else{
        document.getElementById("notFound").style.display = '';
    }
}

function showItemDetail(itemId) {
    document.getElementById('categoryView').classList.remove('active-view');
    document.getElementById('itemsView').classList.remove('active-view');
    document.getElementById('itemDetailView').classList.add('active-view');

    const items = itemsData[currentCategory] || [];
    const item = items.find(i => i.id === itemId);

    let img;
    if(item.image.type === "unknown"){
        img = `<p>NO IMAGE</p>`;
    }else{
        img = `<img src="${item.image.img}" alt="${item.name}">`;
    }

    if (item) {
        document.getElementById('itemDetail').innerHTML = `
      ${img}
      <h2>${item.title}</h2>
      <p>${item.description}</p>
      <p dir="rtl"><strong>الموقع:</strong> ${item.location}</p>
      <p><strong>اتواصل مع المتبرع:</strong> ${item.donorContact}</p>
    `;
    }
}

showCategories();